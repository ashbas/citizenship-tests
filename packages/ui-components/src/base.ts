// Astro/Vite normally supply this ambient type via each site's generated
// env.d.ts (which references "astro/client"), but this file is also
// type-checked directly from packages/site-generator's plain `tsc` run,
// outside any Astro project, so it needs its own declaration. Interface
// merging makes this safe to coexist with Astro's own declaration.
declare global {
  interface ImportMetaEnv {
    readonly BASE_URL: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

/**
 * Prefixes a root-absolute internal path (e.g. "/categories") with the
 * site's configured Astro `base` (e.g. "/citizenship-tests" when deployed
 * as a GitHub Pages project site, or "" for a custom domain at the root).
 * Every internal href, and every audioFile reference, must go through this
 * so a single site can be deployed either way without code changes — only
 * astro.config.mjs's `base` option changes.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL ?? "/";
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}` || "/";
}
