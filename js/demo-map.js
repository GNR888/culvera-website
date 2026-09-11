/**
 * Culvera AI — Live demo: interactive Vietnam map + crop recommendation
 * ----------------------------------------------------------------------
 * Renders a Leaflet map into #culvera-demo-map. Clicking anywhere in
 * Vietnam (or a province marker) calls the Agri-Sense FastAPI backend's
 * POST /recommend and renders the single highest-confidence crop
 * recommendation into #culvera-demo-panel.
 *
 * API_BASE defaults to the local dev backend. Override before this script
 * runs with `<script>window.CULVERA_API_BASE = 'https://...';</script>`
 * once the Agri-Sense service is deployed (see Agri-Sense/CLAUDE.md —
 * Railway is the intended host) — and add the site's origin to that
 * service's CORS_ORIGINS env var.
 */

const API_BASE = window.CULVERA_API_BASE || "http://localhost:8000";

const VN_CENTER = [16, 107];
const VN_ZOOM = 6;

const CROP_LABELS = {
  rice_paddy: "Paddy rice",
  coffee_green: "Robusta coffee",
  cashew_raw: "Cashew",
  pepper_black: "Black pepper",
  maize: "Maize",
};

let map;
let selectedMarker = null;

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
      <p>Analysing soil, climate and season for this location&hellip;</p>
    </div>
  `;
}

function panelErrorState(message) {
  return `
    <div class="demo-panel__state demo-panel__state--error">
      <p class="app-preview__group-title">LIVE DEMO UNAVAILABLE</p>
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
      <div class="app-preview__row"><span class="app-preview__row-label">Location</span><span>${data.location.nearest_province} (${lat.toFixed(3)}, ${lon.toFixed(3)})</span></div>
      <div class="app-preview__row"><span class="app-preview__row-label">Season</span><span>${season.season}${season.in_transition ? " (transitioning)" : ""}</span></div>
      <div class="app-preview__row"><span class="app-preview__row-label">Soil summary</span><span>${soil.texture_class}, pH ${soil.ph ?? "—"}</span></div>
      <div class="app-preview__row"><span class="app-preview__row-label">Climate summary</span><span>${data.data_freshness.weather_forecast.note}</span></div>
    </div>

    <div class="app-preview__recommendation">
      <p class="app-preview__group-title">TOP RECOMMENDATION</p>
      <h3 class="app-preview__recommendation-title">${cropLabel(rec.crop)}</h3>
      <p class="app-preview__recommendation-sub">Live result from the Agri-Sense model — not illustrative.</p>
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

async function fetchRecommendation(lat, lon) {
  const panel = document.getElementById("culvera-demo-panel");
  panel.innerHTML = panelLoadingState();
  try {
    const res = await fetch(`${API_BASE}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon, mode: "today", top_k: 1 }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `Request failed (${res.status})`);
    }
    const data = await res.json();
    renderPanel(data, lat, lon);
  } catch (err) {
    console.error("Culvera demo: recommendation request failed", err);
    const reachable = err instanceof TypeError; // fetch network-level failure
    panel.innerHTML = panelErrorState(
      reachable
        ? "Could not reach the Agri-Sense backend. It may be offline right now — please try again shortly."
        : err.message
    );
  }
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
  fetchRecommendation(lat, lon);
}

async function loadProvinces() {
  try {
    const res = await fetch(`${API_BASE}/provinces`);
    if (!res.ok) return;
    const provinces = await res.json();
    provinces.forEach((p) => {
      const marker = L.circleMarker([p.lat, p.lon], {
        radius: 5,
        color: "#142e46",
        weight: 1,
        fillColor: "#59785a",
        fillOpacity: 0.85,
      }).addTo(map);
      marker.bindTooltip(`${p.name} — ${cropLabel(p.dominant_crop)}`);
      marker.on("click", () => onSelect(p.lat, p.lon));
    });
  } catch (err) {
    console.warn("Culvera demo: could not load provinces", err);
  }
}

function initMap() {
  const container = document.getElementById("culvera-demo-map");
  if (!container || typeof L === "undefined") return;

  map = L.map(container, { center: VN_CENTER, zoom: VN_ZOOM, scrollWheelZoom: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);

  map.on("click", (e) => onSelect(e.latlng.lat, e.latlng.lng));
  loadProvinces();

  // Leaflet needs a final size check once the surrounding layout (fonts,
  // the [data-reveal] fade-in) has settled.
  window.setTimeout(() => map.invalidateSize(), 300);
  window.addEventListener("resize", () => map.invalidateSize());
}

document.addEventListener("DOMContentLoaded", initMap);
