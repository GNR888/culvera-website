/**
 * Culvera AI — Hero / Header intro controller
 * ----------------------------------------------------------------------
 * Drives the intro purely by writing a stage name to `document.body`'s
 * `data-hero-stage` attribute; every visual is defined in css/hero.css as
 * a reaction to that attribute. This file only knows *when* to advance,
 * never *how* something looks — keep it that way so new stages/sections
 * can be added later without this controller needing to change shape.
 *
 * Timing is never hard-coded here: every duration is read from the CSS
 * custom properties in css/variables.css, so designers can retime the
 * whole sequence without touching JS.
 */

const STAGE_SEQUENCE = [
  "initial",
  "logo",
  "logo-out",
  "wordmark-gold",
  "wordmark-white",
  "tagline",
  "header",
  "done",
];

/** Read a CSS time value (e.g. "900ms" or "1.2s") off :root as milliseconds. */
function readCssDurationMs(varName, fallbackMs) {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  if (!raw) return fallbackMs;
  if (raw.endsWith("ms")) return parseFloat(raw);
  if (raw.endsWith("s")) return parseFloat(raw) * 1000;
  const n = parseFloat(raw);
  return Number.isNaN(n) ? fallbackMs : n;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class HeroIntro {
  /**
   * @param {Object} opts
   * @param {HTMLElement} opts.root - the .hero section
   * @param {HTMLVideoElement} opts.video
   * @param {HTMLElement} opts.scrollTarget - element to scroll to after the
   *   video's first complete playback
   */
  constructor({ root, video, scrollTarget }) {
    this.root = root;
    this.video = video;
    this.scrollTarget = scrollTarget;
    this.prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    this.hasAutoScrolled = false;
    this.hasPlayedOnce = false;
  }

  setStage(stage) {
    document.body.dataset.heroStage = stage;
  }

  /** Duration to *remain* on a stage before advancing to the next one. */
  getStageHoldDuration(stage) {
    switch (stage) {
      case "initial":
        return 0;
      case "logo":
        return (
          readCssDurationMs("--hero-logo-fade-in", 1400) +
          readCssDurationMs("--hero-logo-hold", 850)
        );
      case "logo-out":
        return readCssDurationMs("--hero-logo-fade-out", 900);
      case "wordmark-gold":
        return readCssDurationMs("--hero-wordmark-fade-in", 1100);
      case "wordmark-white":
        return (
          readCssDurationMs("--hero-wordmark-color-shift", 1300) +
          readCssDurationMs("--hero-wordmark-hold", 750)
        );
      case "tagline":
        return (
          readCssDurationMs("--hero-tagline-fade-in", 1000) +
          readCssDurationMs("--hero-tagline-hold", 900)
        );
      case "header":
        return readCssDurationMs("--hero-header-transition", 950);
      case "done":
      default:
        return 0;
    }
  }

  async runIntroSequence() {
    this.setStage("initial");
    for (const stage of STAGE_SEQUENCE) {
      this.setStage(stage);
      const hold = this.getStageHoldDuration(stage);
      if (hold > 0) await sleep(hold);
    }
  }

  scrollToNextSection() {
    if (!this.scrollTarget || this.hasAutoScrolled) return;

    // Don't yank the page around if the visitor has already scrolled away
    // from the hero on their own — only auto-advance while they're still
    // sitting at the top.
    const stillAtHero = window.scrollY < window.innerHeight * 0.5;
    if (!stillAtHero) return;

    this.hasAutoScrolled = true;
    this.scrollTarget.scrollIntoView({
      behavior: this.prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  /**
   * The `loop` attribute is deliberately left off the <video> element.
   * Looping is done by hand below so we get a reliable "first complete
   * playback" signal (native looping never fires `ended`).
   */
  bindVideoLoop() {
    this.video.loop = false;

    this.video.addEventListener("ended", () => {
      if (!this.hasPlayedOnce) {
        this.hasPlayedOnce = true;
        if (!this.prefersReducedMotion) {
          this.scrollToNextSection();
        }
      }
      this.video.currentTime = 0;
      this.video.play().catch(() => {
        /* autoplay can be rejected in some contexts; fail silently */
      });
    });

    this.video.play().catch(() => {
      /* ignore — muted+inline autoplay should succeed in all modern browsers */
    });
  }

  init() {
    this.bindVideoLoop();
    this.runIntroSequence();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-hero]");
  const video = document.querySelector("[data-hero-video]");
  const scrollTarget = document.querySelector("[data-hero-scroll-target]");
  if (!root || !video) return;

  const intro = new HeroIntro({ root, video, scrollTarget });
  intro.init();

  // Exposed for debugging / future section controllers.
  window.__culveraHeroIntro = intro;
});
