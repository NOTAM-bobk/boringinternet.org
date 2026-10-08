import { Link } from "react-router";
import { SiteSeo } from "../components/SeoHead";
import { siteDescription, siteName, siteUrl } from "../lib/siteData";
import { formatDate, posts, readingTime } from "../lib/posts";

export default function Blog() {
  return (
    <>
      <SiteSeo
        title="Blog"
        description={`Notes on launching, curating, and keeping ${siteName} small — ${posts.length} posts you can read in full.`}
        path="/blog"
        keywords={["indie web", "launch notes", "curation", "directory"]}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: `${siteName} blog`,
            description: siteDescription,
            url: `${siteUrl}/blog`,
            inLanguage: "en",
            blogPost: posts.map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              description: post.description,
              url: `${siteUrl}/blog/${post.slug}`,
              datePublished: post.date,
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
            ],
          },
        ]}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
        <header className="flex flex-col gap-3 border-b pb-6" style={{ borderColor: "var(--rule)" }}>
          <span className="accent-text text-[11px] font-bold tracking-[0.2em] uppercase">Blog</span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em]">
            Notes from the <span className="accent-text">directory</span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "var(--muted)" }}>
            Short posts on launching, curating, and keeping this list boring on purpose. Every post is
            meant to be read here, not skimmed.
          </p>
        </header>

        <ul className="flex flex-col gap-5">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link to={`/blog/${post.slug}`} className="card card-link p-5 sm:p-6 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <time className="text-[11px] font-mono accent-text" dateTime={post.date}>
                    {formatDate(post.date)}
                  </time>
                  <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
                    {readingTime(post)} min read
                  </span>
                </div>
                <h2 className="text-xl font-bold leading-snug">{post.title}</h2>
                <p className="text-[15px] leading-relaxed" style={{ color: "var(--muted)" }}>
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono border px-2 py-0.5"
                        style={{ color: "var(--muted)", borderColor: "var(--rule)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-[12px] font-bold uppercase tracking-[0.14em] accent-text">
                    Read the post →
                  </span>
                </div>
              </Link>
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
