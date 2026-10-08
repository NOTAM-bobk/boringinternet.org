import sitesJson from "../../sites.json";

export interface SiteCategory {
  id: string;
  label: string;
}

export interface Site {
  id: string;
  name: string;
  slug: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  trending?: number;
  launched?: string;
}

export interface SitesConfig {
  site?: string;
  tagline?: string;
  categories: SiteCategory[];
  sites: Site[];
}

function normalizeConfig(config: unknown): SitesConfig {
  const parsed = config as Partial<SitesConfig> | null | undefined;
  return {
    site: parsed?.site ?? "Launched Sites",
    tagline: parsed?.tagline ?? "A small list of launched sites.",
    categories: Array.isArray(parsed?.categories)
      ? parsed.categories
      : [{ id: "all", label: "All" }],
    sites: Array.isArray(parsed?.sites)
      ? parsed.sites.map((site) => ({
          id: site.id ?? crypto.randomUUID(),
          name: site.name ?? "Untitled",
          slug: site.slug ?? site.id,
          url: site.url ?? "#",
          description: site.description ?? "No description yet.",
          category: site.category ?? "uncategorized",
          tags: Array.isArray(site.tags) ? site.tags : [],
          trending: site.trending,
          launched: site.launched,
        }))
      : [],
  };
}

const config = normalizeConfig(sitesJson);

export const siteName = config.site;
export const siteTagline = config.tagline;
export const categories = config.categories;
export const sites = config.sites;

export function sitesByCategory(categoryId: string): Site[] {
  if (categoryId === "all") {
    return sites;
  }
  return sites.filter((site) => site.category === categoryId);
}

export function trendingSites(count = 6): Site[] {
  return [...sites]
    .sort((a, b) => {
      const at = a.trending ?? 0;
      const bt = b.trending ?? 0;
      if (bt !== at) return bt - at;
      return (a.launched ?? "").localeCompare(b.launched ?? "");
    })
    .slice(0, count);
}

export function searchSites(query: string): Site[] {
  const q = query.trim().toLowerCase();
  if (!q) return sites;
  return sites.filter(
    (site) =>
      site.name.toLowerCase().includes(q) ||
      site.description.toLowerCase().includes(q) ||
      site.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      site.category.toLowerCase().includes(q),
  );
}
