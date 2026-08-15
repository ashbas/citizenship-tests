import type { APIRoute } from "astro";
import { buildRobotsTxt } from "@citizenship-tests/seo-utils";
import { siteData } from "../lib/siteData";

export const GET: APIRoute = () => {
  return new Response(buildRobotsTxt(siteData.config.domain), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
