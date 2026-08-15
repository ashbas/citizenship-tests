import { loadSiteData } from "@citizenship-tests/site-generator/data";

// `astro dev`/`astro build` are always invoked with the site's own root
// (sites/uk) as the working directory — unlike import.meta.url, this stays
// correct even after Vite relocates the bundled server chunk that imports
// this module during prerendering.
export const siteData = loadSiteData(process.cwd());
