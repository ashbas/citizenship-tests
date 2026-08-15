import { defineConfig } from "astro/config";
import siteConfig from "./config.json" with { type: "json" };

export default defineConfig({
  site: siteConfig.domain,
  outDir: "./dist",
  build: {
    format: "directory",
  },
});
