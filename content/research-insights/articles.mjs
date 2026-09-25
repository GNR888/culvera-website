/**
 * Culvera AI — Research & Insights articles
 * ----------------------------------------------------------------------
 * The single list every Research & Insights page is generated from.
 *
 * To publish a new article:
 *   1. Write its body as HTML in content/research-insights/<slug>.html
 *      (start at <h2>; the page supplies the <h1>, image and sources).
 *   2. Add an entry below. Order doesn't matter: pages sort newest first.
 *   3. Run `node scripts/build-research.mjs` and commit the output.
 *
 * Inside a body file, two tokens keep links working from the nested
 * article URL:
 *   {{root}}          → path to the site root, e.g. {{root}}about.html
 *   {{article:slug}}  → link to another article by its slug
 * Cite a source as <sup class="cite"><a href="#source-2">2</a></sup>;
 * numbers follow the order of the `sources` array.
 *
 * Fields:
 *   slug         URL segment: /research-insights/<slug>/ (lowercase, hyphens)
 *   title        Headline, also the <title> and og:title
 *   seoTitle     Optional shorter <title> if the headline is long
 *   description  Meta description (~150–160 characters)
 *   excerpt      1–2 sentences shown on cards and under the headline
 *   topics       Filter/related-article topics from TOPICS; the first one
 *                is the category label shown on the card
 *   date         Publication date, YYYY-MM-DD
 *   updated      Optional last-updated date, YYYY-MM-DD
 *   image        Featured image path from the site root
 *   imageAlt     Descriptive alt text for the featured image
 *   readingTime  Optional minutes; estimated from the body if omitted
 *   sources      [{ title, publisher, url }] citations, numbered in order
 */

/** Topics available for filtering, in the order the filter chips appear. */
export const TOPICS = [
  "Vietnam Agriculture",
  "Climate Resilience",
  "Agricultural Technology",
  "Rice & Methane",
  "Smallholder Farming",
  "Data & Decision Intelligence",
];

export const articles = [
  {
    slug: "rice-methane-emissions-vietnam",
    title: "Rice, methane and Vietnam’s shift to low-emission rice",
    seoTitle: "Rice Methane Emissions in Vietnam",
    description:
      "Why flooded rice paddies emit methane, what alternate wetting and drying can change, and why Vietnam’s low-emission rice transition depends on better field data.",
    excerpt:
      "Flooded paddies are one of agriculture’s largest methane sources. Vietnam’s push toward low-emission rice shows why water management has become a data problem as much as an agronomic one.",
    topics: ["Rice & Methane", "Vietnam Agriculture", "Climate Resilience"],
    date: "2026-09-24",
    image: "assets/images/photography/rice-paddy-wide.jpg",
    imageAlt: "A wide view of green rice paddies in Vietnam divided by narrow earth banks",
    sources: [
      {
        title: "Climate Change 2021: The Physical Science Basis (Working Group I, Sixth Assessment Report)",
        publisher: "Intergovernmental Panel on Climate Change (IPCC)",
        url: "https://www.ipcc.ch/report/ar6/wg1/",
      },
      {
        title: "Global Methane Pledge",
        publisher: "Global Methane Pledge",
        url: "https://www.globalmethanepledge.org/",
      },
      {
        title: "Research on rice water management and alternate wetting and drying",
        publisher: "International Rice Research Institute (IRRI)",
        url: "https://www.irri.org/",
      },
      {
        title: "Agriculture and methane mitigation",
        publisher: "Climate and Clean Air Coalition",
        url: "https://www.ccacoalition.org/",
      },
    ],
  },
  {
    slug: "mekong-delta-saltwater-intrusion",
    title: "Saltwater intrusion in the Mekong Delta: when timing becomes a farming decision",
    seoTitle: "Saltwater Intrusion in the Mekong Delta",
    description:
      "How dry-season salinity is reshaping planting calendars in Vietnam’s Mekong Delta, and why earlier, location-specific risk information matters for farmers.",
    excerpt:
      "In the Mekong Delta, the most important input in a dry season can be a date. Rising salinity risk is turning planting and irrigation timing into high-stakes decisions.",
    topics: ["Climate Resilience", "Vietnam Agriculture", "Smallholder Farming"],
    date: "2026-09-17",
    image: "assets/images/photography/village-farm.jpg",
    imageAlt: "A small village farm with crops and houses beside the water in rural Vietnam",
    sources: [
      {
        title: "Mekong River Commission: basin monitoring, drought and flow reports",
        publisher: "Mekong River Commission",
        url: "https://www.mrcmekong.org/",
      },
      {
        title: "Climate Change 2022: Impacts, Adaptation and Vulnerability (Working Group II, Sixth Assessment Report)",
        publisher: "Intergovernmental Panel on Climate Change (IPCC)",
        url: "https://www.ipcc.ch/report/ar6/wg2/",
      },
      {
        title: "Vietnam country overview and Mekong Delta climate resilience work",
        publisher: "World Bank",
        url: "https://www.worldbank.org/en/country/vietnam",
      },
    ],
  },
  {
    slug: "satellite-weather-soil-data-farm-decisions",
    title: "What satellite, weather and soil data can (and can’t) tell a farmer",
    seoTitle: "Satellite, Weather and Soil Data for Farm Decisions",
    description:
      "Public satellite, weather and soil datasets are powerful but coarse. What each layer really measures, where it falls short on smallholder farms, and why field data still matters.",
    excerpt:
      "Free global datasets have transformed what can be known about a field from a distance. Knowing their limits is what turns them into useful farm-level decisions.",
    topics: ["Data & Decision Intelligence", "Agricultural Technology", "Smallholder Farming"],
    date: "2026-09-10",
    image: "assets/images/photography/lettuce-rows.jpg",
    imageAlt: "Neat rows of young lettuce growing in dark soil on a smallholder plot",
    sources: [
      {
        title: "Sentinel-2 mission overview",
        publisher: "European Space Agency (ESA)",
        url: "https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-2",
      },
      {
        title: "NASA POWER: Prediction Of Worldwide Energy Resources",
        publisher: "NASA Langley Research Center",
        url: "https://power.larc.nasa.gov/",
      },
      {
        title: "SoilGrids: global gridded soil information",
        publisher: "ISRIC — World Soil Information",
        url: "https://www.isric.org/explore/soilgrids",
      },
    ],
  },
];
