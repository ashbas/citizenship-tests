export interface PageMeta {
  title: string;
  description: string;
  canonicalUrl: string;
}

export function buildMeta(params: {
  siteName: string;
  domain: string;
  path: string;
  pageTitle: string;
  description: string;
}): PageMeta {
  const base = params.domain.replace(/\/$/, "");
  const path = params.path.startsWith("/") ? params.path : `/${params.path}`;
  return {
    title: `${params.pageTitle} | ${params.siteName}`,
    description: params.description,
    canonicalUrl: `${base}${path}`,
  };
}
