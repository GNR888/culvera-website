/**
 * Culvera AI — Contact form
 * ----------------------------------------------------------------------
 * Handles client-side validation, submit lifecycle (idle -> loading ->
 * success / error), and accessibility wiring (aria-invalid, field-level
 * error text, a live region for the overall submit status, focus
 * management).
 *
 * No backend is configured yet. `submitInquiry()` is the single seam to
 * change when one exists — swap its body for a real `fetch(...)` call to
 * an API route or a form service (Formspree, Netlify Forms, etc.). Every
 * other piece of this file is written to not care how submission actually
 * happens.
 */

const REQUIRED_FIELDS = ["firstName", "lastName", "email", "reason", "message"];

function getFieldErrorMessage(field) {
  if (field.validity.valueMissing) {
    return "This field is required.";
  }
  if (field.validity.typeMismatch && field.type === "email") {
    return "Enter a valid email address.";
  }
  return "Please check this field.";
}

/** Placeholder submit — replace with a real network call when a backend exists. */
async function submitInquiry(payload) {
  // TODO: replace with e.g.
  //   const res = await fetch("/api/contact", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(payload),
  //   });
  //   if (!res.ok) throw new Error("Request failed");
  //   return res.json();
  await new Promise((resolve) => setTimeout(resolve, 900));
  return { ok: true };
}

class ContactForm {
  constructor(form) {
    this.form = form;
    this.submitButton = form.querySelector("[data-submit-button]");
    this.submitButtonLabel = this.submitButton.querySelector("[data-submit-label]");
    this.statusRegion = form.querySelector("[data-form-status]");
    this.defaultButtonText = this.submitButtonLabel.textContent;

    this.form.addEventListener("submit", (event) => this.handleSubmit(event));
    this.form.querySelectorAll("input, select, textarea").forEach((field) => {
      field.addEventListener("blur", () => this.validateField(field));
      field.addEventListener("input", () => this.clearFieldError(field));
    });
  }

  fieldsInDomOrder() {
    return REQUIRED_FIELDS.map((name) => this.form.elements[name]).filter(Boolean);
  }

  validateField(field) {
    if (field.disabled) return true;
    const errorEl = this.form.querySelector(`[data-error-for="${field.name}"]`);
    if (field.checkValidity()) {
      this.clearFieldError(field);
      return true;
    }
    field.setAttribute("aria-invalid", "true");
    if (errorEl) {
      errorEl.textContent = getFieldErrorMessage(field);
    }
    return false;
  }

  clearFieldError(field) {
    field.removeAttribute("aria-invalid");
    const errorEl = this.form.querySelector(`[data-error-for="${field.name}"]`);
    if (errorEl) errorEl.textContent = "";
  }

  validateAll() {
    const fields = this.fieldsInDomOrder();
    let firstInvalid = null;
    let allValid = true;

    fields.forEach((field) => {
      const valid = this.validateField(field);
      if (!valid) {
        allValid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (firstInvalid) firstInvalid.focus();
    return allValid;
  }

  setStatus(message, tone) {
    this.statusRegion.textContent = message;
    this.statusRegion.dataset.tone = tone || "";
  }

  setLoading(isLoading) {
    this.submitButton.disabled = isLoading;
    this.submitButton.setAttribute("aria-busy", String(isLoading));
    this.submitButtonLabel.textContent = isLoading
      ? "Sending…"
      : this.defaultButtonText;
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setStatus("", "");

    if (!this.validateAll()) {
      this.setStatus("Please fix the highlighted fields and try again.", "error");
      return;
    }

    const data = Object.fromEntries(new FormData(this.form).entries());
    this.setLoading(true);

    try {
      await submitInquiry(data);
      this.setStatus(
        "Thank you — your inquiry has been received. We'll be in touch soon.",
        "success"
      );
      this.form.reset();
      this.form.querySelectorAll("[aria-invalid]").forEach((field) =>
        field.removeAttribute("aria-invalid")
      );
    } catch (error) {
      this.setStatus(
        "Something went wrong sending your message. Please try again, or email us directly.",
        "error"
      );
    } finally {
      this.setLoading(false);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-contact-form]");
  if (form) new ContactForm(form);
});
