/**
 * Culvera AI — founder profiles
 * ----------------------------------------------------------------------
 * `image: null` renders the muted warm-neutral placeholder block used by
 * components/founder-grid.js. Once real portraits exist, set each `image`
 * to its path (e.g. "assets/images/founders/kaya.jpg") and the placeholder
 * disappears automatically — no other change needed.
 *
 * `photoScale` (optional, default 1) rescales a portrait within its card
 * so the subject reads at roughly the same size as the other founders.
 * Below 1 zooms out (freed space fills with the card's ivory background);
 * above 1 zooms in (crops in further, clipped by the card frame).
 */
export const foundersSectionContent = {
  eyebrow: "THE PEOPLE BUILDING CULVERA",
  heading: "Meet our founders",
  intro:
    "Culvera began as a university research project and is now being developed by a multidisciplinary founding team focused on applying AI to real agricultural challenges.",
};

export const founders = [
  {
    name: "Giulio Robilliard",
    image: "assets/images/founders/giulio-robilliard.jpg",
    bio: "Giulio is completing a Bachelor of Commerce at the University of Sydney, majoring in finance and entrepreneurship. During his year exchange at Università Bocconi, he met Kaya and Otis and built the algorithm that became the foundation of Culvera. He now works on product development and strategy, driven by building tangible solutions that have a positive impact on the world.",
  },
  {
    name: "Kaya Andrée",
    image: "assets/images/founders/kaya-andree.jpg",
    photoScale: 1.3,
    bio: "Currently completing a BBA at TBS Education in Barcelona, Kaya works on Culvera's research, partnerships, and product development. She is especially interested in sustainability and in making the platform practical, accessible, and useful for the farmers and communities it is designed to support.",
  },
  {
    name: "Otis Springer",
    image: "assets/images/founders/otis-springer.jpg",
    bio: "Otis is studying International Politics and Government at Università Bocconi, where he mapped an oral history archive into a public geospatial dataset. He grew up on a protected Tuscan estate and working vineyard, where he now helps run operations and manage staff throughout the season, giving him first-hand insight into the challenges farmers face. At Culvera, he works on institutional access, partnerships, and the project's overall direction.",
  },
];
