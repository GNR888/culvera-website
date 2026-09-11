/**
 * Culvera AI — Scroll reveal
 * ----------------------------------------------------------------------
 * Generic, sitewide progressive-enhancement: any element marked
 * `data-reveal` fades/rises into place the first time it enters the
 * viewport. A `data-reveal-group` wrapper staggers its direct children
 * automatically (each child's delay = index * --reveal-stagger-step, read
 * from css/variables.css) instead of needing a hand-set delay per item.
 *
 * Pure opacity/transform, one-shot (unobserves after revealing), and a
 * no-op under prefers-reduced-motion — content is simply shown, since the
 * CSS side already collapses distance/duration to ~0 in that case, but
 * skipping the observer entirely avoids any layout thrash for those users.
 */

const REVEAL_SELECTOR = "[data-reveal]";
const GROUP_SELECTOR = "[data-reveal-group]";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function applyGroupStagger(root) {
  root.querySelectorAll(GROUP_SELECTOR).forEach((group) => {
    Array.from(group.children).forEach((child, index) => {
      if (!child.hasAttribute("data-reveal")) {
        child.setAttribute("data-reveal", "");
      }
      child.style.setProperty("--reveal-index", index);
    });
  });
}

function initScrollReveal() {
  const root = document;
  applyGroupStagger(root);

  const targets = Array.from(root.querySelectorAll(REVEAL_SELECTOR));
  if (targets.length === 0) return;

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", initScrollReveal);
