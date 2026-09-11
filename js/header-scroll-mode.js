/**
 * Homepage-only: swaps the permanent header from its "over dark video"
 * look (white mark, transparent background) to a light, solid-ivory look
 * once the visitor scrolls past the hero and onto the Warm Ivory content
 * below it — otherwise the white nav text would sit unreadably on a light
 * background. Purely a scroll-driven visual mode; it never touches the
 * intro sequence in hero.js.
 *
 * Toggles `data-header-mode="light" | "dark"` on <body> — see
 * css/about-sections.css for the corresponding styles.
 */

const LOGO_WHITE = "assets/images/logo-white.png";
const LOGO_GOLD = "assets/images/logo-gold.png";

function initHeaderScrollMode() {
  const hero = document.querySelector("[data-hero]");
  const logo = document.querySelector(".site-header__logo");
  if (!hero) return;

  let currentMode = "dark";

  function applyMode(mode) {
    if (mode === currentMode) return;
    currentMode = mode;
    document.body.dataset.headerMode = mode;
    if (logo) logo.src = mode === "light" ? LOGO_GOLD : LOGO_WHITE;
  }

  function updateMode() {
    const headerHeight = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--header-height")
    ) || 88;
    const threshold = hero.offsetHeight - headerHeight;
    applyMode(window.scrollY > threshold ? "light" : "dark");
  }

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateMode();
      ticking = false;
    });
  });

  updateMode();
}

document.addEventListener("DOMContentLoaded", initHeaderScrollMode);
