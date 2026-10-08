import { Link, useParams } from "react-router";
import { BlogPostSeo, SiteSeo } from "../components/SeoHead";
import { formatDate, postBySlug, postNeighbours, readingTime, type PostBlock } from "../lib/posts";

function Block({ block }: { block: PostBlock }) {
  if (block.type === "h2") {
    return (
      <h2 className="mt-8 text-xl sm:text-2xl font-bold tracking-[-0.01em]">{block.text}</h2>
    );
  }
  if (block.type === "quote") {
    return (
      <blockquote
        className="mt-6 border-l-4 pl-5 text-lg italic leading-relaxed"
        style={{ borderColor: "var(--accent)", color: "var(--ink)" }}
      >
        {block.text}
      </blockquote>
    );
  }
  if (block.type === "ul") {
    return (
      <ul className="mt-4 flex flex-col gap-2">
        {block.items.map((item) => (
          <li key={item} className="flex gap-3 text-[16px] leading-relaxed">
            <span aria-hidden="true" className="accent-text">
              —
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  return <p className="mt-5 text-[16px] leading-[1.75]">{block.text}</p>;
}

export default function BlogPost() {
  const { slug = "" } = useParams();
  const post = postBySlug(slug);

  if (!post) {
    return (
      <>
        <SiteSeo
          title="Post not found"
          description="That post is not in the archive."
          path={`/blog/${slug}`}
          noindex
        />
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16 flex flex-col gap-4 text-center">
          <h1 className="text-3xl font-bold">Post not found</h1>
          <p className="text-base" style={{ color: "var(--muted)" }}>
            Nothing is published at <code className="font-mono text-[13px]">/blog/{slug}</code>.
          </p>
          <Link to="/blog" className="btn mx-auto">
            All posts
          </Link>
        </div>
      </>
    );
  }

  const { previous, next } = postNeighbours(post.slug);

  return (
    <>
      <BlogPostSeo
        title={post.title}
        description={post.description}
        slug={post.slug}
        date={post.date}
        author={post.author}
        tags={post.tags}
        excerpt={post.excerpt}
      />

      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12 flex flex-col">
        <nav aria-label="Breadcrumb" className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <Link to="/blog" className="hover:underline">
            Blog
          </Link>
          <span aria-hidden="true"> / </span>
          <span className="accent-text">{post.slug}</span>
        </nav>

        <header className="mt-5 flex flex-col gap-3 border-b pb-6" style={{ borderColor: "var(--rule)" }}>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-[12px] font-mono" style={{ color: "var(--muted)" }}>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{readingTime(post)} min read</span>
            {post.author && (
              <>
                <span aria-hidden="true">·</span>
                <span>{post.author}</span>
              </>
            )}
          </div>
        </header>

        <div className="mt-2 flex flex-col">
          {post.blocks.map((block, index) => (
            <Block key={index} block={block} />
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
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

        <div
          className="mt-10 grid gap-4 border-t pt-6 sm:grid-cols-2"
          style={{ borderColor: "var(--rule)" }}
        >
          {previous ? (
            <Link to={`/blog/${previous.slug}`} className="card card-link p-5">
              <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
                ← Older
              </span>
              <p className="mt-1 font-bold leading-snug">{previous.title}</p>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/blog/${next.slug}`} className="card card-link p-5 sm:text-right">
              <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
                Newer →
              </span>
              <p className="mt-1 font-bold leading-snug">{next.title}</p>
            </Link>
          )}
        </div>

        <p className="mt-8 text-center text-sm" style={{ color: "var(--muted)" }}>
          <Link to="/blog" className="accent-text font-bold underline underline-offset-4">
            All posts
          </Link>{" "}
          ·{" "}
          <Link to="/trending" className="accent-text font-bold underline underline-offset-4">
            See what is trending
          </Link>
        </p>
      </article>
    </>
  );
}
