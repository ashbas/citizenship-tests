import type { APIRoute } from "astro";
import { buildSitemap } from "@citizenship-tests/seo-utils";
import { siteData } from "../lib/siteData";

export const GET: APIRoute = () => {
  const staticPages = [
    { path: "/", changefreq: "monthly" as const, priority: 1.0 },
    { path: "/categories", changefreq: "weekly" as const, priority: 0.9 },
    { path: "/mock-exam", changefreq: "weekly" as const, priority: 0.9 },
    { path: "/how-it-works", changefreq: "monthly" as const, priority: 0.6 },
    { path: "/official-resources", changefreq: "monthly" as const, priority: 0.5 },
    { path: "/disclaimer", changefreq: "yearly" as const, priority: 0.2 },
    { path: "/privacy-policy", changefreq: "yearly" as const, priority: 0.2 },
  ];

  const categoryPages = siteData.categories.map((category) => ({
    path: `/categories/${category.slug}`,
    changefreq: "weekly" as const,
    priority: 0.8,
  }));

  const xml = buildSitemap(siteData.config.domain, [...staticPages, ...categoryPages]);

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
