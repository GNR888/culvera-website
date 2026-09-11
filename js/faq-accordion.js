/**
 * Culvera AI — FAQ accordion (progressive enhancement)
 * ----------------------------------------------------------------------
 * The FAQ questions/answers in contact.html are plain, static
 * <details>/<summary> markup — fully readable by search engines and
 * screen readers, and fully functional with zero JavaScript (native
 * details/summary toggling).
 *
 * This script only adds the smooth open/close animation and the
 * one-open-at-a-time behaviour on top of that native functionality. If it
 * fails to load, visitors just get the browser's default (instant)
 * details toggle instead of a broken page.
 */

const TRANSITION_MS = 320;

class FAQAccordion {
  constructor(container) {
    this.items = Array.from(container.querySelectorAll(".faq-item"));
    this.items.forEach((item) => this.enhance(item));
  }

  enhance(item) {
    const summary = item.querySelector("summary");
    const panel = item.querySelector(".faq-item__answer");
    if (!summary || !panel) return;

    panel.style.overflow = "hidden";
    panel.style.transition = `max-height ${TRANSITION_MS}ms var(--ease-in-out-cinematic, ease)`;
    panel.style.maxHeight = item.open ? `${panel.scrollHeight}px` : "0px";

    summary.addEventListener("click", (event) => {
      event.preventDefault();
      if (item.open) {
        this.close(item, panel);
      } else {
        this.closeOthers(item);
        this.open(item, panel);
      }
    });
  }

  open(item, panel) {
    item.open = true;
    // Let the browser paint the now-in-flow content once before measuring.
    requestAnimationFrame(() => {
      panel.style.maxHeight = `${panel.scrollHeight}px`;
    });
  }

  close(item, panel) {
    panel.style.maxHeight = `${panel.scrollHeight}px`;
    requestAnimationFrame(() => {
      panel.style.maxHeight = "0px";
    });
    window.setTimeout(() => {
      item.open = false;
    }, TRANSITION_MS);
  }

  closeOthers(current) {
    this.items
      .filter((item) => item !== current && item.open)
      .forEach((item) => {
        const panel = item.querySelector(".faq-item__answer");
        if (panel) this.close(item, panel);
      });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("[data-faq-accordion]");
  if (container) new FAQAccordion(container);
});
