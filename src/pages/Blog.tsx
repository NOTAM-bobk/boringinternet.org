import { Link } from "react-router";
import { SeoHead } from "../components/SeoHead";
import { siteName } from "../lib/siteData";

const posts = [
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
      "Directories get worse as they get bigger. We cap the index on purpose and let old entries drop off rather than pile up.",
  },
  {
    slug: "editing-the-directory-by-hand",
    title: "Editing the directory by hand",
    date: "2026-09-20",
    excerpt:
      "Every entry lives in one plain JSON file, reviewed before it ships. No submissions queue, no scraping, no autopilot.",
  },
];

export default function Blog() {
  return (
    <>
      <SeoHead
        title="Blog"
        description={`Notes on launching, curating, and keeping ${siteName} small.`}
      />
      <div className="mx-auto max-w-3xl px-6 py-14 flex flex-col gap-10">
        <header
          className="border-b pb-8 text-center"
          style={{ borderColor: "var(--rule)" }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em]">
            Notes from the <span className="accent-text">directory</span>
          </h1>
          <p className="mt-4 text-lg" style={{ color: "var(--muted)" }}>
            Short posts on launching, curating, and keeping this list boring on
            purpose.
          </p>
        </header>

        <ul className="flex flex-col gap-4">
          {posts.map((post) => (
            <li
              key={post.slug}
              className="card p-6 flex flex-col gap-2"
              style={{ borderColor: "var(--ink)" }}
            >
              <span className="text-[11px] font-mono" style={{ color: "var(--accent)" }}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <h2 className="text-xl font-bold">{post.title}</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                {post.excerpt}
              </p>
            </li>
          ))}
        </ul>

        <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
          Looking for sites instead?{" "}
          <Link to="/" className="accent-text font-bold underline underline-offset-4">
            Browse the directory
          </Link>
        </p>
      </div>
    </>
  );
}
