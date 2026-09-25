/**
 * Culvera AI — Footer content
 * ----------------------------------------------------------------------
 * Every editable string/link the footer renders lives here. Update this
 * file to change footer copy, links, or contact details anywhere on the
 * site — js/footer.js only knows how to *render* this shape, never
 * hardcodes any of the content itself.
 *
 * Internal hrefs are written relative to the site root (no leading "/");
 * footer.js resolves them against the root, so they work the same from
 * top-level pages and from nested ones like research-insights/<slug>/.
 * Set `external: true` on links that should open in a new tab.
 */
export const footerData = {
  brand: {
    name: "CULVERA AI",
    tagline: "Decision intelligence for more resilient agriculture.",
    logoSrc: "assets/images/logo-white.png",
  },

  columns: [
    {
      heading: "Explore",
      links: [
        { label: "Demo", href: "demo.html" },
        { label: "About", href: "about.html" },
      ],
    },
    {
      heading: "Research",
      links: [
        { label: "Vietnam Pilot", href: "about.html" },
        { label: "Research Partnerships", href: "contact.html" },
        { label: "Technology", href: "demo.html" },
        { label: "Research & Insights", href: "research-insights/" },
      ],
    },
    {
      heading: "Connect",
      modifier: "contact",
      links: [
        { label: "Contact Us", href: "contact.html" },
        { label: "culveraai@gmail.com", href: "mailto:culveraai@gmail.com" },
        { label: "LinkedIn", href: "https://www.linkedin.com/company/culveraai", external: true },
        { label: "Instagram", href: "https://www.instagram.com/culveraai", external: true },
      ],
    },
  ],

  legal: {
    holder: "Culvera AI",
    // Bottom-bar links (e.g. Privacy, Terms). Left empty until reviewed
    // legal pages exist; the footer omits the links row while it's empty.
    links: [],
  },
};
