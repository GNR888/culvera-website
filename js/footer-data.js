/**
 * Culvera AI — Footer content
 * ----------------------------------------------------------------------
 * Every editable string/link the footer renders lives here. Update this
 * file to change footer copy, links, or contact details anywhere on the
 * site — js/footer.js only knows how to *render* this shape, never
 * hardcodes any of the content itself.
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
        { label: "Research", href: "about.html" },
        { label: "Contact", href: "contact.html" },
      ],
    },
    {
      heading: "Research",
      links: [
        { label: "Vietnam Pilot", href: "about.html" },
        { label: "Research Partnerships", href: "contact.html" },
        { label: "Technology", href: "demo.html" },
      ],
    },
  ],

  contact: {
    heading: "Contact",
    email: "culveraai@gmail.com",
    linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/company/culveraai" },
    instagram: { label: "Instagram", href: "https://www.instagram.com/culveraai" },
  },

  legal: {
    holder: "Culvera AI",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
};
