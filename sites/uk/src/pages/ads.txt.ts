import type { APIRoute } from "astro";
import { buildAdsTxt } from "@citizenship-tests/seo-utils";
import { siteData } from "../lib/siteData";

export const GET: APIRoute = () => {
  const publisherId = siteData.config.adsensePublisherId ?? "pub-0000000000000000";
  return new Response(buildAdsTxt(publisherId), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
