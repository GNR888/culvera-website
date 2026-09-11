/**
 * Culvera AI — Demo access form (email gate)
 * ----------------------------------------------------------------------
 * Lives inside the "Access Demo" modal (see index... actually demo.html,
 * css/modal.css, js/modal.js). Validates the email, prevents duplicate
 * submits, and shows loading/success/error states, mirroring the pattern
 * in js/contact-form.js.
 *
 * TODO(backend): there is no lead-capture endpoint configured yet.
 * `submitDemoAccessRequest()` below is the one place to wire up when one
 * exists, either your own API route or a form service.
 *
 * TODO(product): once the live prototype has a real URL, set
 * DEMO_APP_URL below and this will redirect there automatically on
 * success. Until then, success just shows the confirmation message.
 */

const DEMO_APP_URL = ""; // e.g. "https://app.culvera.ai" — leave empty until known

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Placeholder submit — see TODO above. */
async function submitDemoAccessRequest(email) {
  // TODO: replace with e.g.
  //   const res = await fetch("/api/demo-access", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ email }),
  //   });
  //   if (!res.ok) throw new Error("Request failed");
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { ok: true };
}

class DemoAccessForm {
  constructor(form) {
    this.form = form;
    this.modal = form.closest(".modal");
    this.emailField = form.elements.email;
    this.errorEl = form.querySelector("[data-error-for='email']");
    // Status text lives outside the <form> (as a sibling inside .modal) so
    // it stays visible after success hides the form itself.
    this.statusEl = this.modal.querySelector("[data-form-status]");
    this.submitButton = form.querySelector("[data-submit-button]");
    this.submitLabel = this.submitButton.querySelector("[data-submit-label]");
    this.defaultLabel = this.submitLabel.textContent;
    this.isSubmitting = false;

    this.form.addEventListener("submit", (event) => this.handleSubmit(event));
    this.emailField.addEventListener("input", () => this.clearError());

    const overlay = form.closest("[data-modal]");
    if (overlay) {
      overlay.addEventListener("click", (event) => {
        if (event.target.closest("[data-modal-close]") || event.target === overlay) {
          this.reset();
        }
      });
    }
  }

  clearError() {
    this.emailField.removeAttribute("aria-invalid");
    if (this.errorEl) this.errorEl.textContent = "";
  }

  setStatus(message, tone) {
    this.statusEl.textContent = message;
    this.statusEl.dataset.tone = tone || "";
  }

  setLoading(isLoading) {
    this.submitButton.disabled = isLoading;
    this.submitButton.setAttribute("aria-busy", String(isLoading));
    this.submitLabel.textContent = isLoading ? "Checking..." : this.defaultLabel;
  }

  reset() {
    if (this.isSubmitting) return;
    this.form.reset();
    this.clearError();
    this.setStatus("", "");
    this.modal.dataset.state = "idle";
  }

  async handleSubmit(event) {
    event.preventDefault();
    if (this.isSubmitting) return;

    const email = this.emailField.value.trim();
    if (!isValidEmail(email)) {
      this.emailField.setAttribute("aria-invalid", "true");
      if (this.errorEl) this.errorEl.textContent = "Enter a valid email address.";
      this.emailField.focus();
      return;
    }

    this.isSubmitting = true;
    this.setLoading(true);
    this.setStatus("", "");

    try {
      await submitDemoAccessRequest(email);
      this.modal.dataset.state = "success";
      this.setStatus("You're in. Opening the Culvera prototype...", "success");
      if (DEMO_APP_URL) {
        window.setTimeout(() => {
          window.location.href = DEMO_APP_URL;
        }, 900);
      }
    } catch (error) {
      this.setStatus("Something went wrong. Please try again.", "error");
    } finally {
      this.isSubmitting = false;
      this.setLoading(false);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-demo-access-form]");
  if (form) new DemoAccessForm(form);
});
