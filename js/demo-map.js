/**
 * Culvera AI — Demo: interactive Vietnam map + crop recommendation
 * ----------------------------------------------------------------------
 * Renders a Leaflet map into #culvera-demo-map. The recommendation data
 * is NOT a live backend call — it's real Agri-Sense model output,
 * precomputed once per supported province (top 3 candidate crops each)
 * and bundled as static JSON (data/demo-recommendations.json). A click
 * anywhere snaps to the nearest of those provinces (the same "nearest
 * province" resolution the live backend does internally) and renders
 * its top-3 recommendations, switchable via tabs.
 *
 * Why precomputed: the Agri-Sense FastAPI backend needs a paid host to
 * run continuously (Railway/Render free tiers hit billing or cold-start
 * issues for this project). Baking real model output into the static
 * site avoids hosting it at all. To go live-per-click again later,
 * deploy Agri-Sense and swap fetchRecommendation() back to a
 * POST /recommend call (see git history for the previous version).
 *
 * The "Farm allocation" stat reuses each crop's `probability` field —
 * at top_k=1 that number is normalised to a meaningless 100%, but at
 * top_k=3 (what this dataset uses) it's a genuine share across the
 * candidates, so it reads honestly as "how much of the land to put
 * toward this crop" rather than as a confidence score.
 */

const DATA_URL = "data/demo-recommendations.json";

const CROP_LABELS = {
  rice_paddy: "Paddy rice",
  coffee_green: "Robusta coffee",
  cashew_raw: "Cashew",
  pepper_black: "Black pepper",
  maize: "Maize",
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let map;
let selectedMarker = null;
let entries = []; // [{ province, recommendation }, ...]
let activeCropIndex = 0;
let activeLatLon = null;

function cropLabel(key) {
  return CROP_LABELS[key] || key.replace(/_/g, " ");
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

// Every panel update — loading, error, empty state, a tab switch, a new
// map click — goes through here so it fades/rises in fresh (see the
// .demo-fade CSS animation) instead of hard-cutting to new content.
function setPanelHtml(panel, html) {
  panel.innerHTML = `<div class="demo-fade">${html}</div>`;
}

// Compact number formatting for stat tiles: 1,284 / 12.9K / 4.2M
function fmtCompact(n) {
  const abs = Math.abs(n);
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(Math.round(n));
}

function fmtHarvestWindow(raw) {
  const [startRaw, endRaw] = raw.split(" to ");
  const parse = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return { y, m, d };
  };
  const start = parse(startRaw);
  const end = parse(endRaw);
  const startStr = `${MONTH_NAMES[start.m - 1]} ${start.d}`;
  const endStr =
    start.y === end.y
      ? `${MONTH_NAMES[end.m - 1]} ${end.d}, ${end.y}`
      : `${MONTH_NAMES[end.m - 1]} ${end.d}, ${end.y}`;
  return `${startStr} – ${endStr}`;
}

function riskPillClass(severity) {
  if (severity === "high") return "demo-pill--high";
  if (severity === "medium") return "demo-pill--medium";
  return "demo-pill--low";
}

// Tiny inline sparkline: 6 monthly points, auto-scaled to their own
// range (no axis — sparklines show shape, the two end labels ground it
// in real numbers).
// The line progressively reveals itself along its real trajectory,
// left to right (see .demo-price polyline's stroke-dash animation in
// site-sections.css) — the start dot is there from the first frame,
// the end dot fades in once the draw reaches it.
function buildSparkline(prices) {
  const w = 140;
  const h = 40;
  const pad = 4;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const step = (w - pad * 2) / (prices.length - 1);
  const points = prices
    .map((p, i) => {
      const x = pad + i * step;
      const y = pad + (1 - (p - min) / range) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const [firstX, firstY] = points.split(" ")[0].split(",");
  const [lastX, lastY] = points.split(" ").at(-1).split(",");

  return `
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <polyline points="${points}" fill="none" stroke="#c5a052" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${firstX}" cy="${firstY}" r="4" fill="#c5a052" stroke="#f5f1e8" stroke-width="2"/>
      <circle cx="${lastX}" cy="${lastY}" r="4" fill="#c5a052" stroke="#f5f1e8" stroke-width="2" class="demo-price__end-dot"/>
    </svg>
  `;
}

function buildPanelHtml(data, lat, lon) {
  const rec = data.recommendations[activeCropIndex];
  const soil = data.soil_data;
  const season = data.season_info;
  const fert = rec.fertiliser_recommendation;
  const prices = rec.price_forecast_vnd_per_tonne;
  const priceList = [prices.month_1, prices.month_2, prices.month_3, prices.month_4, prices.month_5, prices.month_6];

  const tabs = data.recommendations
    .map(
      (r, i) => `
      <button type="button" class="demo-crop-tab${i === activeCropIndex ? " is-active" : ""}" data-crop-index="${i}">
        ${cropLabel(r.crop)}
      </button>`
    )
    .join("");

  const timelineItems = fert.schedule
    ? fert.schedule.applications
        .map(
          (a) => `
      <div class="demo-timeline__item">
        <span class="demo-timeline__dot"></span>
        <p class="demo-timeline__timing">${a.timing}</p>
        <p class="demo-timeline__npk">${a.N_kg_per_ha}–${a.P2O5_kg_per_ha}–${a.K2O_kg_per_ha} kg/ha N–P&#8322;O&#8325;–K&#8322;O</p>
        <p class="demo-timeline__method">${a.method}</p>
      </div>`
        )
        .join("")
    : `<p class="demo-note">${fmtCompact(fert.N_kg_per_ha)}-${fmtCompact(fert.P2O5_kg_per_ha)}-${fmtCompact(fert.K2O_kg_per_ha)} kg/ha N-P&#8322;O&#8325;-K&#8322;O overall; no phased schedule for this crop.</p>`;

  const riskPills = rec.harvest_timing.climate_risks.length
    ? rec.harvest_timing.climate_risks
        .map(
          (r) => `
      <div>
        <span class="demo-pill ${riskPillClass(r.severity)}">${r.severity.toUpperCase()} · ${r.risk}</span>
        <p class="demo-risk-action">${r.action}</p>
      </div>`
        )
        .join("")
    : `<p class="demo-note">No significant weather risks flagged for this window.</p>`;

  const soilNote = soil.health.issues.length
    ? soil.health.issues.join("; ")
    : `Healthy ${soil.texture_class} soil — no major issues flagged.`;

  const trendClass = rec.price_trend === "falling" ? "demo-price__trend--falling" : "";

  return `
    <div class="demo-results__top">
      <div class="context-strip">
        <div class="app-preview__row"><span class="app-preview__row-label">Location</span><span>Nearest to ${data.location.nearest_province} (${lat.toFixed(3)}, ${lon.toFixed(3)})</span></div>
        <div class="app-preview__row"><span class="app-preview__row-label">Season</span><span>${season.season}${season.in_transition ? " (transitioning)" : ""}</span></div>
      </div>

      <div>
        <p class="app-preview__group-title">TOP ${data.recommendations.length} RECOMMENDATIONS</p>
        <div class="demo-crop-tabs" role="tablist" aria-label="Recommended crops">${tabs}</div>

        <div class="app-preview__recommendation">
          <h3 class="app-preview__recommendation-title">${cropLabel(rec.crop)}</h3>
          <p class="app-preview__recommendation-sub">Real Agri-Sense model output for this province — not illustrative.</p>

          <div class="demo-stat-row">
            <div class="demo-stat">
              <p class="demo-stat__label">Predicted yield</p>
              <p class="demo-stat__value">${rec.predicted_yield_t_ha.toFixed(2)} t/ha</p>
            </div>
            <div class="demo-stat">
              <p class="demo-stat__label">Expected revenue</p>
              <p class="demo-stat__value">${fmtCompact(rec.expected_revenue_vnd_per_ha)} VND/ha</p>
            </div>
            <div class="demo-stat">
              <p class="demo-stat__label">Farm allocation</p>
              <p class="demo-stat__value">${Math.round(rec.probability * 100)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-results__grid">
      <div>
        <p class="app-preview__group-title">PRICE FORECAST — 6 MONTHS</p>
        <div class="demo-price">
          ${buildSparkline(priceList)}
          <div class="demo-price__values">
            <span class="demo-price__value">${fmtCompact(priceList[0])} → ${fmtCompact(priceList.at(-1))}</span>
            <span class="demo-price__caption">VND / tonne</span>
            <span class="demo-price__trend ${trendClass}">${rec.price_trend}</span>
          </div>
        </div>
      </div>

      <div>
        <p class="app-preview__group-title">FERTILISER &amp; IRRIGATION</p>
        <div class="demo-timeline">${timelineItems}</div>
      </div>

      <div>
        <p class="app-preview__group-title">HARVEST WINDOW</p>
        <div class="demo-harvest__row">
          <span class="demo-harvest__date">${fmtHarvestWindow(rec.harvest_timing.optimal_harvest_window)}</span>
        </div>
        <div class="demo-risk-pills">${riskPills}</div>
      </div>
    </div>

    <div class="demo-notes">
      <p class="demo-note"><b>Soil —</b> ${soilNote}</p>
      <p class="demo-note"><b>Weather —</b> ${data.data_freshness.weather_forecast.note}</p>
    </div>
  `;
}

function wireTabs(panel) {
  panel.querySelectorAll("[data-crop-index]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCropIndex = Number(btn.dataset.cropIndex);
      renderActive();
    });
  });
}

function renderActive() {
  const entry = nearestEntry(activeLatLon[0], activeLatLon[1]);
  const panel = document.getElementById("culvera-demo-panel");
  setPanelHtml(panel, buildPanelHtml(entry.recommendation, activeLatLon[0], activeLatLon[1]));
  wireTabs(panel);
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
    setPanelHtml(
      document.getElementById("culvera-demo-panel"),
      panelErrorState("No demo data is loaded yet — please try again in a moment.")
    );
    return;
  }
  activeCropIndex = 0;
  activeLatLon = [lat, lon];
  renderActive();
}

async function loadDataset() {
  const panel = document.getElementById("culvera-demo-panel");
  setPanelHtml(panel, panelLoadingState());
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    entries = await res.json();
    setPanelHtml(
      panel,
      `
      <div class="demo-panel__state demo-panel__state--empty">
        <p class="app-preview__group-title">GET STARTED</p>
        <p>Click anywhere on the map — or one of the province markers — for real Agri-Sense
        crop recommendations at your nearest supported province.</p>
      </div>
    `
    );

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
    setPanelHtml(panel, panelErrorState("Could not load the demo dataset. Please refresh the page."));
  }
}

// Vietnam's bounding box (matches the Agri-Sense backend's own check) —
// frames the map tightly on the country instead of showing half of
// southern China and Cambodia at a loose default zoom.
const VN_BOUNDS = L.latLngBounds([8.5, 102.0], [23.5, 110.0]);
const VN_PAN_BOUNDS = VN_BOUNDS.pad(0.15); // a little slack for panning near the edges

function initMap() {
  const container = document.getElementById("culvera-demo-map");
  if (!container || typeof L === "undefined") return;

  map = L.map(container, {
    scrollWheelZoom: false,
    maxBounds: VN_PAN_BOUNDS,
    maxBoundsViscosity: 1.0,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  map.fitBounds(VN_BOUNDS, { padding: [12, 12] });
  map.setMinZoom(map.getZoom());

  map.on("click", (e) => onSelect(e.latlng.lat, e.latlng.lng));
  loadDataset();

  // Leaflet needs a final size check once the surrounding layout (fonts,
  // the [data-reveal] fade-in) has settled.
  window.setTimeout(() => {
    map.invalidateSize();
    map.fitBounds(VN_BOUNDS, { padding: [12, 12] });
  }, 300);
  window.addEventListener("resize", () => map.invalidateSize());
}

document.addEventListener("DOMContentLoaded", initMap);
