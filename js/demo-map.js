/**
 * Culvera AI — Demo: interactive Vietnam map + crop recommendation
 * ----------------------------------------------------------------------
 * Renders a Leaflet map into #culvera-demo-map. The recommendation data
 * is NOT a live backend call — it's real Agri-Sense model output,
 * precomputed once per supported province and bundled as static JSON
 * (data/demo-recommendations.json). A click anywhere snaps to the
 * nearest of those provinces (the same "nearest province" resolution
 * the live backend does internally) and renders its recommendation.
 *
 * Why precomputed: the Agri-Sense FastAPI backend needs a paid host to
 * run continuously (Railway/Render free tiers hit billing or cold-start
 * issues for this project). Baking real model output into the static
 * site avoids hosting it at all. To go live-per-click again later,
 * deploy Agri-Sense and swap fetchRecommendation() back to a
 * POST /recommend call (see git history for the previous version).
 */

const DATA_URL = "data/demo-recommendations.json";

const CROP_LABELS = {
  rice_paddy: "Paddy rice",
  coffee_green: "Robusta coffee",
  cashew_raw: "Cashew",
  pepper_black: "Black pepper",
  maize: "Maize",
};

let map;
let selectedMarker = null;
let entries = []; // [{ province, recommendation }, ...]

function cropLabel(key) {
  return CROP_LABELS[key] || key.replace(/_/g, " ");
}

function fmtPct(p) {
  return `${Math.round(p * 100)}%`;
}

function panelLoadingState() {
  return `
    <div class="demo-panel__state demo-panel__state--loading">
      <span class="demo-panel__spinner" aria-hidden="true"></span>
      <p>Loading the demo dataset&hellip;</p>
    </div>
  `;
}

function panelErrorState(message) {
  return `
    <div class="demo-panel__state demo-panel__state--error">
      <p class="app-preview__group-title">DEMO UNAVAILABLE</p>
      <p>${message}</p>
    </div>
  `;
}

function buildPanelHtml(data, lat, lon) {
  const rec = data.recommendations[0]; // backend returns recommendations sorted by confidence, descending
  const soil = data.soil_data;
  const season = data.season_info;

  const soilNote = soil.health.issues.length
    ? soil.health.issues.join("; ")
    : `Healthy ${soil.texture_class} soil — no major issues flagged.`;

  const weatherRisk = rec.harvest_timing.climate_risks[0];
  const weatherNote = weatherRisk
    ? `${weatherRisk.risk} (${weatherRisk.severity}) — ${weatherRisk.action}`
    : "No significant weather risks flagged for this window.";

  const nextStep =
    rec.harvest_timing.harvest_tips[0] ||
    rec.fertiliser_recommendation.notes[0] ||
    "Review the full fertiliser and irrigation schedule before planting.";

  const fert = rec.fertiliser_recommendation;
  const inputGuidance = `${fert.N_kg_per_ha} kg/ha N &middot; ${fert.P2O5_kg_per_ha} kg/ha P&#8322;O&#8325; &middot; ${fert.K2O_kg_per_ha} kg/ha K&#8322;O`;

  return `
    <div>
      <p class="app-preview__group-title">SELECTED LOCATION</p>
      <div class="app-preview__row"><span class="app-preview__row-label">Location</span><span>Nearest to ${data.location.nearest_province} (${lat.toFixed(3)}, ${lon.toFixed(3)})</span></div>
      <div class="app-preview__row"><span class="app-preview__row-label">Season</span><span>${season.season}${season.in_transition ? " (transitioning)" : ""}</span></div>
      <div class="app-preview__row"><span class="app-preview__row-label">Soil summary</span><span>${soil.texture_class}, pH ${soil.ph ?? "—"}</span></div>
      <div class="app-preview__row"><span class="app-preview__row-label">Climate summary</span><span>${data.data_freshness.weather_forecast.note}</span></div>
    </div>

    <div class="app-preview__recommendation">
      <p class="app-preview__group-title">TOP RECOMMENDATION</p>
      <h3 class="app-preview__recommendation-title">${cropLabel(rec.crop)}</h3>
      <p class="app-preview__recommendation-sub">Real Agri-Sense model output for this province — not illustrative.</p>
      <div class="app-preview__row"><span class="app-preview__row-label">Suitability</span><span>${fmtPct(rec.probability)} model confidence</span></div>
      <div class="app-preview__row"><span class="app-preview__row-label">Expected yield</span><span>${rec.predicted_yield_t_ha.toFixed(2)} t/ha</span></div>
      <div class="app-preview__row"><span class="app-preview__row-label">Confidence / risk</span><span>${rec.confidence}${data.is_high_risk ? " · high risk flagged" : ""}</span></div>
      <div class="app-preview__row"><span class="app-preview__row-label">Soil considerations</span><span>${soilNote}</span></div>
      <div class="app-preview__row"><span class="app-preview__row-label">Weather considerations</span><span>${weatherNote}</span></div>
      <div class="app-preview__row"><span class="app-preview__row-label">Suggested next step</span><span>${nextStep}</span></div>
    </div>

    <div>
      <p class="app-preview__group-title">ALSO INCLUDED</p>
      <div class="app-preview__row"><span class="app-preview__row-label">Market context</span><span>Price trend: ${rec.price_trend}</span></div>
      <div class="app-preview__row"><span class="app-preview__row-label">Harvest window</span><span>${rec.harvest_timing.optimal_harvest_window}</span></div>
      <div class="app-preview__row"><span class="app-preview__row-label">Input guidance</span><span>${inputGuidance}</span></div>
    </div>

    ${data.warnings.length ? `<p class="demo-panel__warning">${data.warnings.join(" ")}</p>` : ""}
  `;
}

function renderPanel(data, lat, lon) {
  const panel = document.getElementById("culvera-demo-panel");
  panel.innerHTML = buildPanelHtml(data, lat, lon);
}

// Equirectangular approximation — plenty accurate for ranking nearby
// points within Vietnam's latitude span.
function distanceSq(lat1, lon1, lat2, lon2) {
  const dLat = lat1 - lat2;
  const dLon = (lon1 - lon2) * Math.cos((lat1 * Math.PI) / 180);
  return dLat * dLat + dLon * dLon;
}

function nearestEntry(lat, lon) {
  let best = null;
  let bestDist = Infinity;
  for (const entry of entries) {
    const d = distanceSq(lat, lon, entry.province.farm_lat, entry.province.farm_lon);
    if (d < bestDist) {
      bestDist = d;
      best = entry;
    }
  }
  return best;
}

function placeMarker(lat, lon) {
  if (selectedMarker) {
    selectedMarker.setLatLng([lat, lon]);
  } else {
    selectedMarker = L.circleMarker([lat, lon], {
      radius: 8,
      color: "#ffffff",
      weight: 2,
      fillColor: "#c5a052",
      fillOpacity: 1,
    }).addTo(map);
  }
}

function onSelect(lat, lon) {
  placeMarker(lat, lon);
  const entry = nearestEntry(lat, lon);
  if (!entry) {
    document.getElementById("culvera-demo-panel").innerHTML = panelErrorState(
      "No demo data is loaded yet — please try again in a moment."
    );
    return;
  }
  renderPanel(entry.recommendation, lat, lon);
}

async function loadDataset() {
  const panel = document.getElementById("culvera-demo-panel");
  panel.innerHTML = panelLoadingState();
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    entries = await res.json();
    panel.innerHTML = `
      <div class="demo-panel__state demo-panel__state--empty">
        <p class="app-preview__group-title">GET STARTED</p>
        <p>Click anywhere on the map — or one of the province markers — for a real Agri-Sense
        crop recommendation at your nearest supported province.</p>
      </div>
    `;

    entries.forEach(({ province }) => {
      const marker = L.circleMarker([province.farm_lat, province.farm_lon], {
        radius: 5,
        color: "#142e46",
        weight: 1,
        fillColor: "#59785a",
        fillOpacity: 0.85,
      }).addTo(map);
      marker.bindTooltip(`${province.name} — ${cropLabel(province.dominant_crop)}`);
      marker.on("click", () => onSelect(province.farm_lat, province.farm_lon));
    });
  } catch (err) {
    console.error("Culvera demo: could not load demo dataset", err);
    panel.innerHTML = panelErrorState("Could not load the demo dataset. Please refresh the page.");
  }
}

function initMap() {
  const container = document.getElementById("culvera-demo-map");
  if (!container || typeof L === "undefined") return;

  map = L.map(container, { center: [16, 107], zoom: 6, scrollWheelZoom: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);

  map.on("click", (e) => onSelect(e.latlng.lat, e.latlng.lng));
  loadDataset();

  // Leaflet needs a final size check once the surrounding layout (fonts,
  // the [data-reveal] fade-in) has settled.
  window.setTimeout(() => map.invalidateSize(), 300);
  window.addEventListener("resize", () => map.invalidateSize());
}

document.addEventListener("DOMContentLoaded", initMap);
