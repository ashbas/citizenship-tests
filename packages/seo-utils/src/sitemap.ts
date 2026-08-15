export interface SitemapUrl {
  path: string;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: number;
}

/**
 * Builds a standard XML sitemap string from a list of site-relative paths.
 * Called at build time by each site with its own domain + page list —
 * nothing here is country-specific.
 */
export function buildSitemap(domain: string, urls: SitemapUrl[]): string {
  const base = domain.replace(/\/$/, "");
  const entries = urls
    .map((u) => {
      const loc = `${base}${u.path.startsWith("/") ? u.path : `/${u.path}`}`;
      const changefreq = u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : "";
      const priority = u.priority !== undefined ? `<priority>${u.priority.toFixed(1)}</priority>` : "";
      return `  <url><loc>${loc}</loc>${changefreq}${priority}</url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}
