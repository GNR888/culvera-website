/**
 * Culvera AI — generic accessible modal
 * ----------------------------------------------------------------------
 * Any element with `data-modal-trigger="NAME"` opens the overlay marked
 * `data-modal="NAME"`. Inside that overlay, anything with `data-modal-close`
 * closes it, as does clicking the backdrop or pressing Escape.
 *
 * Handles: focus moving into the modal on open and back to the trigger on
 * close, a focus trap while open (Tab/Shift+Tab cycle within the modal),
 * Escape to close, and `aria-hidden`/inert-style handling for the trigger's
 * page while the modal is open is intentionally left alone — the overlay
 * itself is enough for this site's needs.
 */

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

class ModalController {
  constructor(overlay) {
    this.overlay = overlay;
    this.modal = overlay.querySelector(".modal");
    this.lastFocused = null;

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) this.close();
    });

    overlay.querySelectorAll("[data-modal-close]").forEach((btn) => {
      btn.addEventListener("click", () => this.close());
    });

    overlay.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        this.close();
      } else if (event.key === "Tab") {
        this.trapTab(event);
      }
    });
  }

  getFocusable() {
    return Array.from(this.modal.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      (el) => el.offsetParent !== null
    );
  }

  trapTab(event) {
    const focusable = this.getFocusable();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  open(trigger) {
    this.lastFocused = trigger || document.activeElement;
    this.overlay.dataset.open = "true";
    document.body.style.overflow = "hidden";
    // Prefer the first form field (so a form-first modal is immediately
    // typeable), falling back to whatever is first focusable otherwise.
    const firstField = this.modal.querySelector("input, textarea, select");
    const focusable = this.getFocusable();
    (firstField || focusable[0] || this.modal).focus();
  }

  close() {
    this.overlay.dataset.open = "false";
    document.body.style.overflow = "";
    if (this.lastFocused) this.lastFocused.focus();
  }
}

function initModals() {
  const controllers = new Map();

  document.querySelectorAll("[data-modal]").forEach((overlay) => {
    controllers.set(overlay.dataset.modal, new ModalController(overlay));
  });

  document.querySelectorAll("[data-modal-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const controller = controllers.get(trigger.dataset.modalTrigger);
      if (controller) controller.open(trigger);
    });
  });

  window.__culveraModals = controllers;
}

document.addEventListener("DOMContentLoaded", initModals);
