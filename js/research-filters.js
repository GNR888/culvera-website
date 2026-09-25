/**
 * Culvera AI — Research & Insights topic filters
 * ----------------------------------------------------------------------
 * Progressive enhancement for research-insights/index.html. The article
 * grid is static, crawlable HTML; without JS every article is shown and
 * the filter bar stays hidden. With JS, one topic can be selected at a
 * time, matching cards on each card's `data-topics` list.
 */

function initFilters() {
  const bar = document.querySelector("[data-insights-filters]");
  const grid = document.querySelector("[data-insights-grid]");
  if (!bar || !grid) return;

  const buttons = Array.from(bar.querySelectorAll("[data-topic]"));
  const cards = Array.from(grid.querySelectorAll("[data-topics]"));
  const emptyMessage = document.querySelector("[data-insights-empty]");

  function applyFilter(topic) {
    let visibleCount = 0;
    cards.forEach((card) => {
      const matches = topic === "all" || card.dataset.topics.split(" ").includes(topic);
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.topic === topic));
    });
    if (emptyMessage) emptyMessage.hidden = visibleCount > 0;
  }

  bar.addEventListener("click", (event) => {
    const button = event.target.closest("[data-topic]");
    if (!button) return;
    applyFilter(button.dataset.topic);
  });

  bar.hidden = false;
}

document.addEventListener("DOMContentLoaded", initFilters);
