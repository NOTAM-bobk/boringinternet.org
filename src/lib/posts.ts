import blogJson from "../../config/blog.json";

export type PostBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] };

export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  excerpt: string;
  blocks: PostBlock[];
}

function normalizeBlocks(value: unknown): PostBlock[] {
  if (!Array.isArray(value)) return [];
  const blocks: PostBlock[] = [];
  for (const raw of value as Array<Record<string, unknown>>) {
    const type = raw?.type;
    if (type === "ul") {
      const items = Array.isArray(raw.items)
        ? (raw.items as unknown[]).filter((item): item is string => typeof item === "string")
        : [];
      if (items.length > 0) blocks.push({ type: "ul", items });
      continue;
    }
    if (typeof raw?.text !== "string") continue;
    if (type === "h2") blocks.push({ type: "h2", text: raw.text });
    else if (type === "quote") blocks.push({ type: "quote", text: raw.text });
    else blocks.push({ type: "p", text: raw.text });
  }
  return blocks;
}

function normalizePosts(value: unknown): Post[] {
  const parsed = value as { posts?: Array<Partial<Post> & { blocks?: unknown }> } | null | undefined;
  if (!Array.isArray(parsed?.posts)) return [];
  return parsed.posts.map((post) => ({
    slug: post.slug ?? "post",
    title: post.title ?? "Untitled",
    description: post.description ?? post.excerpt ?? "",
    date: post.date ?? "",
    author: post.author ?? "",
    tags: Array.isArray(post.tags) ? post.tags : [],
    excerpt: post.excerpt ?? post.description ?? "",
    blocks: normalizeBlocks(post.blocks),
  }));
}

/** Newest first. */
export const posts: Post[] = normalizePosts(blogJson).sort((a, b) =>
  b.date.localeCompare(a.date),
);

export function postBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

export function postNeighbours(slug: string): { previous?: Post; next?: Post } {
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return {};
  return {
    previous: posts[index + 1],
    next: posts[index - 1],
  };
}

/** Rough reading time from the body word count. */
export function readingTime(post: Post): number {
  const words = post.blocks.reduce((total, block) => {
    if (block.type === "ul") {
      return total + block.items.join(" ").split(/\s+/).filter(Boolean).length;
    }
    return total + block.text.split(/\s+/).filter(Boolean).length;
  }, 0);
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(date: string): string {
  if (!date) return "";
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
