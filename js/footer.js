/**
 * Culvera AI — Global footer
 * ----------------------------------------------------------------------
 * Single source of the footer's markup. Every page includes this module
 * plus one empty mount point (`<footer id="site-footer"></footer>`) —
 * nothing else. That's the whole "component": one file to change the
 * footer everywhere it appears, content supplied by footer-data.js.
 */
import { footerData } from "./footer-data.js";

function renderLinkList(links) {
  return links
    .map(
      (link) => `<li><a href="${link.href}">${link.label}</a></li>`
    )
    .join("");
}

function renderColumn(column) {
  return `
    <nav class="site-footer__col" aria-label="${column.heading}">
      <h3 class="site-footer__heading">${column.heading}</h3>
      <ul class="site-footer__list">${renderLinkList(column.links)}</ul>
    </nav>
  `;
}

function renderContactColumn(contact) {
  return `
    <div class="site-footer__col site-footer__col--contact">
      <h3 class="site-footer__heading">${contact.heading}</h3>
      <ul class="site-footer__list">
        <li><a href="mailto:${contact.email}">${contact.email}</a></li>
        <li><a href="${contact.linkedin.href}" target="_blank" rel="noopener">${contact.linkedin.label}</a></li>
        <li><a href="${contact.instagram.href}" target="_blank" rel="noopener">${contact.instagram.label}</a></li>
      </ul>
    </div>
  `;
}

function renderFooter(data) {
  const year = new Date().getFullYear();

  return `
    <div class="site-footer__inner">
      <div class="site-footer__top">
        <div class="site-footer__col site-footer__col--brand">
          <a class="site-footer__brand" href="index.html">
            <img class="site-footer__logo" src="${data.brand.logoSrc}" alt="" aria-hidden="true" />
            <span class="site-footer__wordmark">${data.brand.name}</span>
          </a>
          <p class="site-footer__tagline">${data.brand.tagline}</p>
        </div>

        ${data.columns.map(renderColumn).join("")}
        ${renderContactColumn(data.contact)}
      </div>

      <div class="site-footer__divider" role="presentation"></div>

      <div class="site-footer__bottom">
        <p class="site-footer__copyright">&copy; ${year} ${data.legal.holder}. All rights reserved.</p>
        <nav class="site-footer__legal" aria-label="Legal">
          ${data.legal.links
            .map((link) => `<a href="${link.href}">${link.label}</a>`)
            .join("")}
        </nav>
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
