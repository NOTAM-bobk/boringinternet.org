export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

export const posts: Post[] = [
  {
    slug: "what-counts-as-launched",
    title: "What counts as launched?",
    date: "2026-10-04",
    excerpt:
      "A live URL, a working sign-in, and nothing else half-finished. That is the bar this directory uses before a site goes up.",
  },
  {
    slug: "why-the-list-stays-small",
    title: "Why the list stays small",
    date: "2026-09-28",
    excerpt:
      "Directories get worse as they get bigger. The index is capped on purpose, and older entries drop off rather than pile up.",
  },
  {
    slug: "editing-the-directory-by-hand",
    title: "Editing the directory by hand",
    date: "2026-09-20",
    excerpt:
      "Every entry lives in one plain JSON file, reviewed before it ships. No submissions queue, no scraping, no autopilot.",
  },
];

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
