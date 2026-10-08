import type { CSSProperties } from "react";

/** Brand-palette tiles for the generated site marks. */
const TILES: CSSProperties[] = [
  { backgroundColor: "var(--ink)", color: "var(--surface)", borderColor: "var(--ink)" },
  { backgroundColor: "var(--accent)", color: "var(--surface)", borderColor: "var(--ink)" },
  { backgroundColor: "var(--surface)", color: "var(--ink)", borderColor: "var(--ink)" },
  { backgroundColor: "var(--cream, #f7e0c6)", color: "var(--ink)", borderColor: "var(--ink)" },
];

/** First letters of up to two words: "One Line Diary" -> "OL". */
export function siteInitials(name: string): string {
  const words = name
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 2);
  if (words.length === 0) return "··";
  return words.map((word) => word[0]!.toUpperCase()).join("");
}

/** Deterministic tile per site, so the same site always looks the same. */
export function siteTileStyle(slug: string): CSSProperties {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 100000;
  }
  return TILES[hash % TILES.length]!;
}

export function siteDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
