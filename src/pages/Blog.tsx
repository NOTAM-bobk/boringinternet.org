import { Link } from "react-router";
import { SeoHead } from "../components/SeoHead";
import { siteName } from "../lib/siteData";
import { formatDate, posts } from "../lib/posts";

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
                {formatDate(post.date)}
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
