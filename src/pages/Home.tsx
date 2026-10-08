import { useMemo, useState } from "react";
import { Link } from "react-router";
import { HomepageSeo } from "../components/SeoHead";
import { SiteIcon } from "../components/SiteIcon";
import {
  categories,
  collectionSites,
  collections,
  newAdditions,
  searchSites,
  siteName,
  sites,
  sitesByCategory,
  trendingSites,
  type Site,
  type SiteCollection,
} from "../lib/siteData";
import { formatDate, posts } from "../lib/posts";
import { siteDomain, siteTileStyle } from "../lib/siteTile";

const ROWS_PER_PAGE = 10;

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) % 100000;
  return h;
}

/* ---------------- pieces ---------------- */

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3h12v18l-6-5-6 5z" />
    </svg>
  );
}

/** Generated cover art — geometric shapes instead of stock photos. */
function CoverArt({ site }: { site: Site }) {
  const variant = hash(site.slug) % 3;
  const tint = siteTileStyle(site.slug).backgroundColor as string;

  return (
    <div className="cover" style={{ backgroundColor: tint }}>
      <svg className="cover-art" viewBox="0 0 200 120" aria-hidden="true">
        {variant === 0 && (
          <>
            <rect x="-20" y="78" width="150" height="14" rx="7" fill="var(--surface)" opacity="0.9" />
            <rect x="26" y="52" width="120" height="14" rx="7" fill="rgba(255,255,255,0.65)" />
            <rect x="-10" y="26" width="170" height="14" rx="7" fill="rgba(255,255,255,0.35)" />
          </>
        )}
        {variant === 1 && (
          <>
            <circle cx="46" cy="60" r="34" fill="var(--surface)" opacity="0.85" />
            <circle cx="118" cy="44" r="18" fill="rgba(255,255,255,0.55)" />
            <circle cx="150" cy="86" r="12" fill="rgba(255,255,255,0.4)" />
          </>
        )}
        {variant === 2 && (
          <>
            <path d="M-10 110 L70 -10 L110 -10 L30 110 Z" fill="var(--surface)" opacity="0.85" />
            <path d="M60 110 L140 -10 L162 -10 L82 110 Z" fill="rgba(255,255,255,0.45)" />
          </>
        )}
      </svg>

      <div className="cover-copy">
        <span className="cover-domain">{siteDomain(site.url)}</span>
        <span className="cover-name">{site.name}</span>
        <span className="cover-line">{site.description}</span>
      </div>
    </div>
  );
}

function FeatureCard({ site }: { site: Site }) {
  return (
    <article className="feature-card">
      <a href={site.url} target="_blank" rel="noopener noreferrer" className="block">
        <CoverArt site={site} />
      </a>
      <div className="feature-foot">
        <SiteIcon site={site} size={32} />
        <div className="min-w-0">
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-bold hover:underline underline-offset-4"
            style={{ color: "var(--ink)" }}
          >
            <span className="truncate">{site.name}</span>
          </a>
          <p className="text-[12px] truncate" style={{ color: "var(--muted)" }}>
            {site.description}
          </p>
        </div>
      </div>
    </article>
  );
}

function SiteRow({ site }: { site: Site }) {
  return (
    <li className="site-row">
      <SiteIcon site={site} size={36} />
      <div className="min-w-0">
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[15px] font-bold truncate block hover:underline underline-offset-4"
          style={{ color: "var(--ink)" }}
        >
          {site.name}
        </a>
        <p className="text-[13px] truncate" style={{ color: "var(--muted)" }}>
          {site.description}
        </p>
      </div>
    </li>
  );
}

function SectionHead({
  title,
  note,
  page,
  pageCount,
  onPrev,
  onNext,
}: {
  title: string;
  note?: string;
  page: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b pb-3" style={{ borderColor: "var(--rule)" }}>
      <div className="flex items-baseline gap-3">
        <h2 className="text-xl font-bold tracking-[-0.01em]">{title}</h2>
        {note && (
          <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
            {note}
          </span>
        )}
      </div>
      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
            {page + 1}/{pageCount}
          </span>
          <button
            type="button"
            className="pager"
            onClick={onPrev}
            disabled={page === 0}
            aria-label={`Previous ${title}`}
          >
            ‹
          </button>
          <button
            type="button"
            className="pager"
            onClick={onNext}
            disabled={page >= pageCount - 1}
            aria-label={`More ${title}`}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

function PagedRows({ items, title, note }: { items: Site[]; title: string; note?: string }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(items.length / ROWS_PER_PAGE));
  const current = items.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE);

  return (
    <section className="space-y-4">
      <SectionHead
        title={title}
        note={note}
        page={page}
        pageCount={pageCount}
        onPrev={() => setPage((p) => Math.max(0, p - 1))}
        onNext={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
      />
      <ul className="grid gap-x-10 gap-y-1 sm:grid-cols-2">
        {current.map((site) => (
          <SiteRow key={site.id} site={site} />
        ))}
      </ul>
    </section>
  );
}

function CollectionCard({
  collection,
  saved,
  onToggle,
}: {
  collection: SiteCollection;
  saved: boolean;
  onToggle: () => void;
}) {
  const members = collectionSites(collection);

  return (
    <article className="collection-card">
      <div className="flex items-start justify-between gap-3">
        <div className="tile-cluster">
          {members.slice(0, 5).map((site) => (
            <SiteIcon key={site.id} site={site} size={30} label={false} />
          ))}
          {members.length > 5 && (
            <span className="site-tile" style={{ width: 30, height: 30, fontSize: 11 }} aria-hidden="true">
              +{members.length - 5}
            </span>
          )}
        </div>
        <button
          type="button"
          className="save-btn"
          onClick={onToggle}
          aria-pressed={saved}
          title={saved ? "Remove from saved" : "Save this collection"}
        >
          <BookmarkIcon filled={saved} />
        </button>
      </div>

      <h3 className="mt-4 text-lg font-bold leading-snug">{collection.title}</h3>
      <p className="mt-1 text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
        {collection.description}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
          {members.length} sites
        </span>
        <Link to="/trending" className="text-[11px] font-bold uppercase tracking-[0.14em] accent-text">
          See the ranking →
        </Link>
      </div>
    </article>
  );
}

function SiteCard({ site }: { site: Site }) {
  return (
    <article className="card p-5 flex flex-col gap-3 text-left">
      <div className="flex items-center gap-3">
        <SiteIcon site={site} size={34} />
        <div className="min-w-0">
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-bold block truncate hover:underline underline-offset-4"
            style={{ color: "var(--ink)" }}
          >
            {site.name}
          </a>
          <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
            {siteDomain(site.url)}
          </span>
        </div>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
        {site.description}
      </p>

      <div className="flex flex-wrap gap-2 mt-auto">
        {site.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[11px] font-mono border px-2 py-0.5"
            style={{ color: "var(--muted)", borderColor: "var(--rule)" }}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        {site.launched && (
          <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
            {formatDate(site.launched)}
          </span>
        )}
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-[11px] font-bold tracking-wider uppercase border px-3 py-1 transition-colors hover:bg-[#1a120b] hover:text-[#fff7ee]"
          style={{ color: "var(--ink)", borderColor: "var(--ink)" }}
        >
          Visit site <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}

function useSavedCollections(): [string[], (id: string) => void] {
  const [saved, setSaved] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("bi:collections");
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
    } catch {
      return [];
    }
  });

  function toggle(id: string) {
    setSaved((current) => {
      const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("bi:collections", JSON.stringify(next));
        } catch {
          /* private mode */
        }
      }
      return next;
    });
  }

  return [saved, toggle];
}

/* ---------------- page ---------------- */

export default function Home() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [savedCollections, toggleSaved] = useSavedCollections();

  const featured = useMemo(() => trendingSites(2), []);
  const additions = useMemo(() => newAdditions(40), []);
  const picks = useMemo(() => trendingSites(40, 2), []);

  const filtered = useMemo(() => {
    if (query.trim()) return searchSites(query);
    return sitesByCategory(selectedCategory);
  }, [query, selectedCategory]);

  const trending = trendingSites(3);
  const trendingAll = trendingSites(sites.length).length;

  return (
    <>
      <HomepageSeo />
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col gap-12">
        {/* Search + filters */}
        <section className="flex flex-col gap-4">
          <label htmlFor="site-search" className="sr-only">
            Search launched sites
          </label>
          <input
            id="site-search"
            type="search"
            placeholder={`Search ${sites.length} sites, tags, categories…`}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedCategory("all");
            }}
            className="field text-base"
            style={{ borderColor: "var(--ink)" }}
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className="border px-3 py-1.5 text-[13px] font-bold transition-colors hover:bg-[#1a120b] hover:text-[#fff7ee]"
                style={{
                  borderColor: "var(--ink)",
                  backgroundColor: selectedCategory === cat.id ? "var(--accent)" : "#ffffff",
                  color: selectedCategory === cat.id ? "var(--on-accent)" : "var(--ink)",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Featured band */}
        <section className="grid gap-5 sm:grid-cols-2">
          {featured.map((site) => (
            <FeatureCard key={site.id} site={site} />
          ))}
        </section>

        {/* Promo strip */}
        <section className="promo">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "var(--accent)" }}>
              The short version
            </p>
            <p className="mt-2 text-lg sm:text-xl font-bold leading-snug">
              {siteName} keeps a running top {trendingAll}. Vote on what should move up.
            </p>
            <p className="mt-1 text-[14px]" style={{ color: "var(--muted)" }}>
              One click per site, no accounts, no tracking pixels.
            </p>
          </div>
          <Link
            to="/trending"
            className="shrink-0 text-[12px] font-bold tracking-[0.14em] uppercase px-5 py-3 border transition-transform hover:-translate-y-px"
            style={{ backgroundColor: "var(--accent)", borderColor: "var(--ink)", color: "var(--on-accent)" }}
          >
            Trending 🔥
          </Link>
        </section>

        <PagedRows items={additions} title="New Additions" note="latest launches" />
        <PagedRows items={picks} title="Featured Sites" note="top ranked" />

        {/* Collections */}
        {collections.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4 border-b pb-3" style={{ borderColor: "var(--rule)" }}>
              <h2 className="text-xl font-bold tracking-[-0.01em]">Latest Collections</h2>
              <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
                {collections.length} collections
              </span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  saved={savedCollections.includes(collection.id)}
                  onToggle={() => toggleSaved(collection.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Blog */}
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4 border-b pb-3" style={{ borderColor: "var(--rule)" }}>
            <h2 className="text-xl font-bold tracking-[-0.01em]">Featured Articles</h2>
            <Link to="/blog" className="text-[11px] font-bold uppercase tracking-[0.14em] accent-text">
              All notes →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} to="/blog" className="card p-5 flex flex-col gap-2">
                <span className="text-[11px] font-mono" style={{ color: "var(--accent)" }}>
                  {formatDate(post.date)}
                </span>
                <h3 className="text-base font-bold leading-snug">{post.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending trio */}
        {trending.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4 border-b pb-3" style={{ borderColor: "var(--rule)" }}>
              <h2 className="text-xl font-bold tracking-[-0.01em]">
                Trending <span aria-hidden="true">🔥</span>
              </h2>
              <Link to="/trending" className="text-sm font-bold accent-text underline underline-offset-4">
                See all {trendingAll} →
              </Link>
            </div>
            <ol className="grid gap-5 sm:grid-cols-3">
              {trending.map((site, index) => (
                <li key={site.id} className="card p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono" style={{ color: "var(--accent)" }}>
                      #{index + 1}
                    </span>
                    <SiteIcon site={site} size={26} label={false} />
                  </div>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold hover:underline underline-offset-4"
                    style={{ color: "var(--ink)" }}
                  >
                    {site.name}
                  </a>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>
                    {site.description}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Full directory */}
        <section id="explore" className="space-y-4 scroll-mt-24">
          <div className="flex items-end justify-between gap-4 border-b pb-3" style={{ borderColor: "var(--rule)" }}>
            <h2 className="text-xl font-bold tracking-[-0.01em]">
              {query
                ? "Search results"
                : selectedCategory === "all"
                  ? "All sites"
                  : (categories.find((c) => c.id === selectedCategory)?.label ?? selectedCategory)}
            </h2>
            <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
              {filtered.length} site{filtered.length === 1 ? "" : "s"}
            </span>
          </div>

          {filtered.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((site) => (
                <SiteCard key={site.id} site={site} />
              ))}
            </div>
          ) : (
            <div
              className="border p-8 text-center text-sm"
              style={{ color: "var(--muted)", borderColor: "var(--rule)" }}
            >
              No sites match that search. Try a different term or clear the search box.
            </div>
          )}
        </section>

        {/* Edit hint */}
        <section
          className="border-t pt-8 text-sm text-center"
          style={{ color: "var(--muted)", borderColor: "var(--rule)" }}
        >
          Want to add a site? Edit{" "}
          <code
            className="border px-1.5 py-0.5 text-[13px] font-mono"
            style={{ borderColor: "var(--rule)", backgroundColor: "var(--surface)" }}
          >
            sites.json
          </code>{" "}
          and redeploy. Sites, categories, and collections all live there.
        </section>
      </div>
    </>
  );
}
