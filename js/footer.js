/**
 * Culvera AI — Global footer
 * ----------------------------------------------------------------------
 * Single source of the footer's markup. Every page includes this module
 * plus one empty mount point (`<footer id="site-footer"></footer>`) —
 * nothing else. That's the whole "component": one file to change the
 * footer everywhere it appears, content supplied by footer-data.js.
 */
import { footerData } from "./footer-data.js";

// This module lives in js/, so the site root is one level up. Resolving
// hrefs against it (rather than against the current page) keeps footer
// links correct on nested pages such as research-insights/<slug>/.
// Absolute URLs (mailto:, https:) pass through new URL() unchanged.
const SITE_ROOT = new URL("../", import.meta.url);

function resolveHref(href) {
  return new URL(href, SITE_ROOT).href;
}

function renderLink(link) {
  const target = link.external ? ` target="_blank" rel="noopener"` : "";
  return `<a href="${resolveHref(link.href)}"${target}>${link.label}</a>`;
}

function renderColumn(column) {
  const modifier = column.modifier ? ` site-footer__col--${column.modifier}` : "";
  return `
    <nav class="site-footer__col${modifier}" aria-label="${column.heading}">
      <h3 class="site-footer__heading">${column.heading}</h3>
      <ul class="site-footer__list">${column.links.map((link) => `<li>${renderLink(link)}</li>`).join("")}</ul>
    </nav>
  `;
}

function renderFooter(data) {
  const year = new Date().getFullYear();

  return `
    <div class="site-footer__inner">
      <div class="site-footer__top">
        <div class="site-footer__col site-footer__col--brand">
          <a class="site-footer__brand" href="${resolveHref("index.html")}">
            <img class="site-footer__logo" src="${resolveHref(data.brand.logoSrc)}" alt="" aria-hidden="true" />
            <span class="site-footer__wordmark">${data.brand.name}</span>
          </a>
          <p class="site-footer__tagline">${data.brand.tagline}</p>
        </div>

        ${data.columns.map(renderColumn).join("")}
      </div>

      <div class="site-footer__divider" role="presentation"></div>

      <div class="site-footer__bottom">
        <p class="site-footer__copyright">&copy; ${year} ${data.legal.holder}. All rights reserved.</p>
        ${
          data.legal.links.length
            ? `<nav class="site-footer__legal" aria-label="Legal">${data.legal.links.map(renderLink).join("")}</nav>`
            : ""
        }
      </div>
    </div>
  `;
}

function mountFooter() {
  const mount = document.getElementById("site-footer");
  if (!mount) return;
  mount.classList.add("site-footer");
  mount.innerHTML = renderFooter(footerData);
}

document.addEventListener("DOMContentLoaded", mountFooter);
