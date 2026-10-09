import launchesJson from "../../config/launches.json";

/**
 * A launch is a site that went live this week. It is deliberately independent
 * of `config/sites.json`: add it here first and it shows up in the home page
 * ticker the next time the site is built.
 */
export interface Launch {
  id: string;
  name: string;
  /** Drives the monogram tile and the icon lookup, like a site slug. */
  slug: string;
  url: string;
  description: string;
}

type LaunchesConfig = { title?: string; items?: Partial<Launch>[] };

const config = launchesJson as LaunchesConfig;

/** "One Line Diary!" -> "one-line-diary"; used for stable keys and tiles. */
function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "launch";
}

function normalizeLaunches(value: unknown): Launch[] {
  if (!Array.isArray(value)) return [];
  return (value as Partial<Launch>[]).map((item) => {
    const name = item.name ?? item.url ?? "Untitled";
    return {
      id: item.id ?? item.slug ?? slugify(name),
      name,
      slug: item.slug ?? slugify(name),
      url: item.url ?? "#",
      description: item.description ?? "",
    };
  });
}

/** Heading over the ticker; rename it in config/launches.json. */
export const launchesTitle = config.title ?? "Launches this week";

export const launches: Launch[] = normalizeLaunches(config.items);
