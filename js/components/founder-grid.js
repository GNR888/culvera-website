/**
 * "Meet our founders" section — mounts into `<section data-founders></section>`.
 * Founder details live in js/data/founders.js; add/remove an entry and the
 * grid follows automatically. Two small render functions here play the
 * role of FounderGrid (the row) and FounderCard (one profile).
 */
import { foundersSectionContent, founders } from "../data/founders.js";

function renderFounderCard(founder, index) {
  const frameNumber = String(index + 1).padStart(2, "0");
  const photo = founder.image
    ? `<img class="founder-card__photo" src="${founder.image}" alt="Portrait of ${founder.name}" loading="lazy" />`
    : `<div class="founder-card__photo founder-card__photo--placeholder media-frame" role="img" aria-label="Photo ${frameNumber}, ${founder.name}, portrait to be added">
         <span class="media-frame__number">${frameNumber}</span>
         <span class="media-frame__label">Photo ${frameNumber}<br />${founder.name} portrait</span>
       </div>`;

  return `
    <article class="founder-card" data-reveal>
      <div class="founder-card__photo-frame">${photo}</div>
      <h3 class="founder-card__name">${founder.name}</h3>
      <p class="founder-card__bio">${founder.bio}</p>
    </article>
  `;
}

function renderFounderGrid(members) {
  return `<div class="founders__grid" data-reveal-group>${members.map(renderFounderCard).join("")}</div>`;
}

/* Frame numbers here are Photo 01, 02, 03 (founder portraits). See
   README.md for the full numbered list of every image placeholder on the
   site and where each one goes. */

function render(content, members) {
  return `
    <div class="section-inner founders__intro">
      <p class="eyebrow">${content.eyebrow}</p>
      <h2 class="founders__heading">${content.heading}</h2>
      <p class="founders__lede">${content.intro}</p>
    </div>
    ${renderFounderGrid(members)}
  `;
}

function mount() {
  const el = document.querySelector("[data-founders]");
  if (!el) return;
  el.classList.add("founders-section");
  el.innerHTML = render(foundersSectionContent, founders);
}

document.addEventListener("DOMContentLoaded", mount);
