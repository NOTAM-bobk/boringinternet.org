import exploreJson from "../../config/explore.json";
import categoriesJson from "../../config/categories.json";
import sitesJson from "../../config/sites.json";
import siteJson from "../../config/site.json";
import trendingJson from "../../config/trending.json";

export interface SiteCategory {
  id: string;
  label: string;
  blurb?: string;
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

export interface SiteCollection {
  id: string;
  title: string;
  description: string;
  siteSlugs: string[];
}

export interface TrendingConfig {
  topLimit: number;
  title: string;
  tagline: string;
  boost: Record<string, number>;
  exclude: string[];
}

export interface ExploreConfig {
  featuredSlugs: string[];
  featuredCount: number;
  rowsPerPage: number;
  newAdditionsLimit: number;
  featuredSitesLimit: number;
  trendingPreviewCount: number;
  collections: SiteCollection[];
}

/* ---------------- normalising the config files ---------------- */

function normalizeSites(value: unknown): Site[] {
  const parsed = value as { sites?: Partial<Site>[] } | null | undefined;
  if (!Array.isArray(parsed?.sites)) return [];
  return parsed.sites.map((site) => ({
    id: site.id ?? site.slug ?? crypto.randomUUID(),
    name: site.name ?? "Untitled",
    slug: site.slug ?? site.id ?? "untitled",
    url: site.url ?? "#",
    description: site.description ?? "No description yet.",
    category: site.category ?? "uncategorized",
    tags: Array.isArray(site.tags) ? site.tags : [],
    trending: typeof site.trending === "number" ? site.trending : undefined,
    launched: site.launched,
  }));
}

function normalizeCategories(value: unknown): SiteCategory[] {
  const parsed = value as { categories?: Partial<SiteCategory>[] } | null | undefined;
  if (!Array.isArray(parsed?.categories)) return [];
  return parsed.categories.map((category) => ({
    id: category.id ?? "uncategorized",
    label: category.label ?? category.id ?? "Uncategorized",
    blurb: category.blurb,
  }));
}

function normalizeCollections(value: unknown): SiteCollection[] {
  if (!Array.isArray(value)) return [];
  return (value as Partial<SiteCollection>[]).map((collection) => ({
    id: collection.id ?? crypto.randomUUID(),
    title: collection.title ?? "Collection",
    description: collection.description ?? "",
    siteSlugs: Array.isArray(collection.siteSlugs) ? collection.siteSlugs : [],
  }));
}

const site = siteJson as {
  name?: string;
  tagline?: string;
  description?: string;
  url?: string;
  keywords?: string[];
  author?: string;
  links?: { github?: string; contact?: string };
};

const trending = trendingJson as Partial<TrendingConfig> & {
  boost?: Record<string, number>;
  exclude?: string[];
};

const explore = exploreJson as Partial<ExploreConfig> & { collections?: unknown };

/* ---------------- exports ---------------- */

export const siteName = site.name ?? "Launched Sites";
export const siteTagline = site.tagline ?? "A small list of launched sites.";
export const siteDescription = site.description ?? siteTagline;
export const siteUrl = (site.url ?? "https://example.com").replace(/\/+$/, "");
export const siteKeywords = site.keywords ?? [];
export const siteAuthor = site.author ?? siteName;
export const siteLinks = site.links ?? {};

export const sites = normalizeSites(sitesJson);
export const categories = normalizeCategories(categoriesJson);
export const collections = normalizeCollections(explore.collections);

export const trendingConfig: TrendingConfig = {
  topLimit: trending.topLimit ?? sites.length,
  title: trending.title ?? "Trending",
  tagline: trending.tagline ?? "Most active this week.",
  boost: trending.boost ?? {},
  exclude: trending.exclude ?? [],
};

export const exploreConfig: ExploreConfig = {
  featuredSlugs: explore.featuredSlugs ?? [],
  featuredCount: explore.featuredCount ?? 2,
  rowsPerPage: explore.rowsPerPage ?? 10,
  newAdditionsLimit: explore.newAdditionsLimit ?? 40,
  featuredSitesLimit: explore.featuredSitesLimit ?? 40,
  trendingPreviewCount: explore.trendingPreviewCount ?? 3,
  collections,
};

/** "All" first, then the categories from config/categories.json. */
export const categoryFilters: SiteCategory[] = [
  { id: "all", label: "All" },
  ...categories,
];

export function categoryById(id: string): SiteCategory | undefined {
  return categories.find((category) => category.id === id);
}

export function categoryLabel(id: string): string {
  if (id === "all") return "All";
  return categoryById(id)?.label ?? id;
}

export function sitesByCategory(categoryId: string): Site[] {
  if (categoryId === "all") return sites;
  return sites.filter((site) => site.category === categoryId);
}

export function categoryCount(categoryId: string): number {
  return sitesByCategory(categoryId).length;
}

export function siteBySlug(slug: string): Site | undefined {
  return sites.find((site) => site.slug === slug);
}

export function sitesBySlugs(slugs: string[]): Site[] {
  return slugs
    .map((slug) => siteBySlug(slug))
    .filter((site): site is Site => Boolean(site));
}

export function collectionSites(collection: SiteCollection): Site[] {
  return sitesBySlugs(collection.siteSlugs);
}

/** Effective ranking score: stored score + any editorial boost. */
export function rankScore(site: Site): number {
  return (site.trending ?? 0) + (trendingConfig.boost[site.slug] ?? 0);
}

/** Highest score first, newest launch as the tie-breaker. */
function byRank(a: Site, b: Site): number {
  const diff = rankScore(b) - rankScore(a);
  if (diff !== 0) return diff;
  return (b.launched ?? "").localeCompare(a.launched ?? "");
}

export function rankedSites(): Site[] {
  const excluded = new Set(trendingConfig.exclude);
  return sites.filter((site) => !excluded.has(site.slug)).sort(byRank);
}

export function trendingSites(count = 6, offset = 0): Site[] {
  return rankedSites().slice(offset, offset + count);
}

/** Newest launch date first. */
export function newAdditions(count = 10, offset = 0): Site[] {
  return [...sites]
    .sort((a, b) => (b.launched ?? "").localeCompare(a.launched ?? ""))
    .slice(offset, offset + count);
}

/** The home hero picks, falling back to the top ranked sites. */
export function featuredSites(): Site[] {
  const picked = sitesBySlugs(exploreConfig.featuredSlugs);
  if (picked.length >= exploreConfig.featuredCount) {
    return picked.slice(0, exploreConfig.featuredCount);
  }
  const filler = rankedSites().filter((site) => !picked.includes(site));
  return [...picked, ...filler].slice(0, exploreConfig.featuredCount);
}

/** Ranked sites with the featured picks removed. */
export function featuredSiteRows(count = 40): Site[] {
  const featured = new Set(featuredSites().map((site) => site.slug));
  return rankedSites()
    .filter((site) => !featured.has(site.slug))
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
