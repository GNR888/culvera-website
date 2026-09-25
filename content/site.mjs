/**
 * Culvera AI — site-wide settings used by scripts/build-research.mjs.
 */
export const site = {
  name: "Culvera AI",

  // Public address of the live site, no trailing slash
  // (e.g. "https://www.yourdomain.com"). While empty, canonical links are
  // root-relative and Open Graph image/url tags plus sitemap.xml are
  // skipped, because those require absolute URLs. Set it, then re-run
  // `node scripts/build-research.mjs`.
  url: "",
};
