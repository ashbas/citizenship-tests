/**
 * Every site gets its own robots.txt pointing only at its own sitemap —
 * never a shared/cross-site file, to avoid canonical confusion between
 * sibling sites (Section 7).
 */
export function buildRobotsTxt(domain: string): string {
  const base = domain.replace(/\/$/, "");
  return `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
}

/**
 * Minimal ads.txt stub. Each site must replace the placeholder publisher ID
 * with its own AdSense property's ID before going live (Section 9).
 */
export function buildAdsTxt(adsensePublisherId: string): string {
  return `google.com, ${adsensePublisherId}, DIRECT, f08c47fec0942fa0\n`;
}
