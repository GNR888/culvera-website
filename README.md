# Culvera AI — Website

Static HTML/CSS/JS — no build step, no framework. This is deliberate so it's
trivial for Giulio to drop into whatever he's already set up on GitHub
(GitHub Pages, a framework's `public/`, etc.) — every file here is plain and
self-contained.

## Pages

- **Homepage** (`index.html`) — hero/header intro, then: hero support copy +
  a data-convergence visualization, The Problem (4 cards), What Culvera Does
  (5 capabilities), How Culvera Works (4-step pipeline, `#how-it-works`),
  Current Field Focus / Vietnam cadmium work (Field Green band + abstract
  risk map), Built for more than one user (4 audience cards), a women/
  accessibility teaser, a final CTA band, then the footer.
- **About page** (`about.html`) — hero (the page's `<h1>`), Our Story, Our
  Mission (5 principle cards), Why Vietnam, Current Research Focus, Women in
  Agriculture (`#women-in-agriculture`, with a network diagram) directly
  before the **existing founders section** (kept, bios untouched), then a
  closing "Vietnam first, global by design" CTA band.
- **Contact page** (`contact.html`) — editorial intro, contact info + form,
  and a crawlable FAQ accordion with matching FAQPage JSON-LD.
- **Demo page** (`demo.html`) — new. Explains the product (hero, 4-step
  workflow, example questions, an illustrative product-preview mock) before
  asking for anything, then an "Access Demo" button that opens an email-gate
  modal. Does **not** embed the real prototype — that lives elsewhere; this
  is the marketing/access page only.
- **Global footer** — one component (`js/footer.js` + `js/footer-data.js`),
  rendered into every page via a `<footer id="site-footer"></footer>` mount
  point.

**Homepage hero sequence:** full-bleed looping video → centered gold flower
logo fades/scales in (0.28 → 0.8), holds, grows further while fading out
(→ 1.1) → "CULVERA AI" wordmark fades in gold, shifts to white, holds → the
tagline ("Farming intelligence for the decisions that matter.") fades in
in its place → dissolves into the permanent transparent header (white logo +
wordmark top-left, DEMO / ABOUT / CONTACT top-right) → on the video's first
complete playthrough only, the page auto-scrolls to the support copy below
the hero.

Once scrolled past the hero onto the Warm Ivory content below, the header
switches from "white on video" to "navy on ivory" (`js/header-scroll-mode.js`)
— otherwise the white nav text would be unreadable over a light background.
This only recolours the header; visibility/timing is still entirely owned by
the `[data-hero-stage]` state machine in `hero.js`/`hero.css`.

## Running it locally

Open any page directly with `file://` will **not** work — several scripts
are ES modules, and browsers block module scripts from the `file://` origin.
Serve the folder instead:

```bash
cd ~/Downloads/culvera-ai
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## File structure

```
index.html              Homepage
about.html              About page (story, mission, Vietnam, women, founders)
contact.html            Contact page (info + form, FAQ)
demo.html               Demo marketing page (workflow, preview, access modal)
css/
  variables.css           Design tokens (colour + type) + all animation timing
  base.css                Reset/base styles
  hero.css                Hero + header (structure, intro animation)
  footer.css              Global footer
  contact.css             Static/light header variant, editorial intro
                          block, contact form, FAQ — shared by contact.html,
                          about.html and demo.html
  about-sections.css      Founders grid + shared `.eyebrow`/`.section-inner`
  site-sections.css       Every other new marketing pattern: media-frame,
                          problem/capability/audience/principle grids, the
                          step pipeline, the field-focus band + risk map,
                          the network diagram, CTA bands, buttons, prompt
                          chips, the app preview mock, disclaimer note
  modal.css               Generic accessible modal (used by the demo's
                          email gate)
js/
  hero.js                 Homepage intro sequencing + video-loop/auto-scroll
  header-scroll-mode.js   Homepage-only header recolour on scroll
  footer.js               Renders the footer into #site-footer on every page
  footer-data.js          All editable footer copy/links
  contact-form.js         Contact form validation + submit lifecycle
  faq-accordion.js        Progressive-enhancement smooth accordion for FAQ
  modal.js                Generic modal controller (open/close/focus trap/Escape)
  demo-access.js          The demo's email-gate form logic (see below)
  prompt-chips.js         Demo page's example-question chip interaction
  data/
    founders.js             Founder names/photos/bios
  components/
    founder-grid.js         Renders founders.js into `<section data-founders>`
assets/
  images/logo-gold.png     Durian-flower mark, background removed
  images/logo-white.png    Same mark recolored white, for dark backgrounds
  video/hero-banner.mp4    Hero background video
```

## Typography and colour (sitewide)

- **Headings** (including the "CULVERA AI" wordmark everywhere it appears —
  hero, header, footer): Montserrat Light, via `--font-heading` in
  `variables.css`. Every heading-level CSS rule sets `font-weight: 300`.
- **Body/UI text**: Inter, via `--font-nav` (unchanged from before).
- **Palette**: `--color-gold` (#C5A052), `--color-turquoise` (#48C6C2),
  `--color-navy` (#142E46), `--color-field-green` (#59785A),
  `--color-ivory` (#F5F1E8), `--color-sand` (#DED5C4), `--color-charcoal`
  (#263238) — all in `variables.css`.

## Image placeholders — numbered, to fill in later

Every spot expecting a real photo uses the shared `.media-frame` pattern (a
bordered box with a number and a short label) so they're easy to find. All
diagrams (the hero data-convergence visual, the cadmium risk map, the women's
network diagram, the demo's app-preview mock) are built directly in HTML/CSS
and don't need an image — only these need real photography:

| # | Where | What goes there |
|---|-------|------------------|
| 01–03 | About page, founders section | Kaya, Giulio and Otis's portraits (`js/data/founders.js`, set `image` to a path) |
| Map preview | Demo page, product preview | A real screenshot/interactive map of the prototype, once available |

If you want additional photography elsewhere (About hero, Our Story, Why
Vietnam), say where and I'll add numbered `.media-frame` placeholders there
too — I kept the initial pass to founders since that's where a photo is
clearly expected; the rest of the page currently relies on typography and
the built diagrams per the "restrained, not stock-photo-heavy" direction.

## The Demo page's email gate

`js/modal.js` is a small generic, accessible modal controller (focus moves
in on open and back to the trigger on close, Tab/Shift+Tab is trapped
inside it, Escape closes it). `js/demo-access.js` is the form logic specific
to the "Access Demo" modal: email-format validation, inline errors,
duplicate-submit prevention, and loading/success/error states.

**Two things still need your input:**

1. **No backend is wired up.** `submitDemoAccessRequest()` in
   `demo-access.js` is a placeholder that waits ~700ms and always succeeds —
   there's a `TODO(backend)` comment marking exactly where to add a real
   `fetch()` call once there's an endpoint (your own API route, or a form
   service).
2. **No live prototype URL is set.** `DEMO_APP_URL` at the top of
   `demo-access.js` is empty. Once the real prototype has a URL, set it
   there and a successful email submission will redirect to it
   automatically after the success message; until then it just shows "You're
   in. Opening the Culvera prototype..." without navigating anywhere.

The "Questions Culvera is designed to help answer" chips (`js/prompt-chips.js`)
are explanatory only — there's no conversational/chat interface in the
current product, so clicking a chip just updates a preview line under it,
it does not simulate an AI answering.

## Editing content

- **Footer** — `js/footer-data.js`.
- **Founders** — `js/data/founders.js`. Set `image` to a real path to
  replace a placeholder photo; add/remove array entries to add/remove a
  founder.
- **FAQ** (`contact.html`) — plain HTML on purpose, so it's guaranteed
  crawlable/accessible with zero JS. If you change an answer, update the
  matching entry in the `FAQPage` JSON-LD `<script>` in `contact.html`'s
  `<head>` too; the two must stay word-for-word identical.
- **Everything else** (Home/About/Demo section copy) is authored directly
  as static HTML in each page, since it's no longer shared between pages
  the way it was in an earlier draft — search the page for the text you
  want to change.

## Wiring up the contact form to a real backend

Same pattern as the demo form: `js/contact-form.js` has one function,
`submitInquiry(payload)`, that currently just waits and resolves. Replace
its body with a real `fetch()` call — the loading/success/error UI around
it doesn't need to change.

## Retiming or restyling the hero intro

Every duration, easing curve, and colour lives in `css/variables.css` as a
CSS custom property — nothing is hard-coded in `hero.js`. The whole
animation is a state machine: `hero.js` writes a stage name to
`document.body.dataset.heroStage`, and every visual reacts to that attribute
in `hero.css`. Stages, in order: `initial → logo → logo-out → wordmark-gold
→ wordmark-white → tagline → header → done`.

`prefers-reduced-motion: reduce` is handled by overriding the same CSS
variables (shorter durations, no scaling) plus a check in `hero.js` that
skips the forced auto-scroll.

## Known follow-ups / things I couldn't finish for you

- **No backend for either form** (contact and demo access) — see above.
- **No live demo URL** — `DEMO_APP_URL` in `demo-access.js` is empty.
- **`assets/video/hero-banner.mp4` is ~40 MB.** Fine for local testing,
  worth compressing before this goes to GitHub:
  `ffmpeg -i hero-banner.mp4 -vcodec h264 -crf 23 -vf scale=1920:-2 hero-banner-compressed.mp4`.
- **Footer "Vietnam Pilot" and "Research Partnerships" links** point to
  About and Contact respectively (the closest existing relevant page) since
  there's no dedicated page for either yet — swap in `js/footer-data.js`
  once those pages exist.
- **Founder photos and bios are placeholders** (`js/data/founders.js`).
- **Footer/contact "Location" and "LinkedIn" fields** are still bracketed
  placeholders.
- **One remaining bare `#` link**: the "[LinkedIn Placeholder]" text in the
  contact page's info list, matching the same bracket-placeholder pattern
  used everywhere else on the site for not-yet-real info.
- Field Green body text on Warm Ivory (and vice versa) measures ~4.4:1
  contrast, just under strict 4.5:1 AA for small text — both are your exact
  brand colours so I kept them; worth a look if a formal accessibility audit
  is planned.
- I did not build any part of the actual interactive prototype/demo tool
  itself, per your instruction — `demo.html` is the marketing/access page
  only.
