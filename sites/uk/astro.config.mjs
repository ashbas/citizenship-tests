import { defineConfig } from "astro/config";
import siteConfig from "./config.json" with { type: "json" };

// GitHub Pages project sites are served under /<repo-name>/, not at the
// domain root, so every internal link/asset needs that prefix. Custom-domain
// deploys (Cloudflare Pages, Netlify, Vercel — see root README) serve at the
// root and must NOT set this, so it's gated behind an env var the GitHub
// Pages workflow sets, rather than being a permanent config change.
const isGithubPagesBuild = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  site: siteConfig.domain,
  base: isGithubPagesBuild ? "/citizenship-tests" : "/",
  outDir: "./dist",
  build: {
    format: "directory",
  },
});
