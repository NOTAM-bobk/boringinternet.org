import { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  categories,
  searchSites,
  sitesByCategory,
  trendingSites,
  type Site,
} from "../lib/siteData";
import { HomepageSeo } from "../components/SeoHead";

function SiteCard({ site }: { site: Site }) {
  const domain = (() => {
    try {
      return new URL(site.url).hostname;
    } catch {
      return site.url;
    }
  })();

  return (
    <article
      className="card p-5 flex flex-col gap-2 text-left"
      style={{ borderColor: "var(--ink)" }}
    >
      <footer className="flex items-center justify-between gap-3">
        <Link
          to={`/site/${site.slug}`}
          className="text-base font-bold hover:underline underline-offset-4"
          style={{ color: "var(--ink)" }}
        >
          {site.name}
        </Link>
        <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
          {domain}
        </span>
      </footer>
      <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
        {site.description}
      </p>
      <div className="flex flex-wrap gap-2 mt-1">
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
      {site.launched && (
        <p className="text-[11px] font-mono mt-1" style={{ color: "var(--muted)" }}>
          Launched {new Date(site.launched).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      )}
      <a
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex text-[11px] font-bold tracking-wider uppercase border px-3 py-1 transition-colors hover:bg-[#1a120b] hover:text-[#fff7ee]"
        style={{ color: "var(--ink)", borderColor: "var(--ink)" }}
      >
        Visit site
        <span aria-hidden="true"> →</span>
      </a>
    </article>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filtered = useMemo(() => {
    if (query.trim()) {
      return searchSites(query);
    }
    return sitesByCategory(selectedCategory);
  }, [query, selectedCategory]);

  const trending = trendingSites(6);
  const hasResults = filtered.length > 0;

  return (
    <>
      <HomepageSeo />
      <div className="mx-auto max-w-5xl px-6 py-12 flex flex-col gap-10">
        {/* Quick actions */}
        <section
          className="border-b pb-8 flex flex-wrap items-center justify-center gap-3"
          style={{ borderColor: "var(--rule)" }}
        >
          <a
            href="/#explore"
            className="text-[12px] font-bold tracking-[0.14em] uppercase px-5 py-3 border transition-transform hover:-translate-y-px"
            style={{
              backgroundColor: "var(--accent)",
              borderColor: "var(--ink)",
              color: "var(--on-accent)",
            }}
          >
            Browse the directory
          </a>
          <Link
            to="/trending"
            className="text-[12px] font-bold tracking-[0.14em] uppercase px-5 py-3 border transition-colors hover:bg-[#1a120b] hover:text-[#fff7ee]"
            style={{ color: "var(--ink)", borderColor: "var(--ink)" }}
          >
            Top 51 trending <span aria-hidden="true">🔥</span>
          </Link>
        </section>

        {/* Search */}
        <section className="space-y-4">
          <label htmlFor="site-search" className="sr-only">
            Search launched sites
          </label>
          <input
            id="site-search"
            type="search"
            placeholder="Search sites, tags, categories…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedCategory("all");
            }}
            className="field text-base"
            style={{ borderColor: "var(--ink)" }}
          />
          {query && (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
              {query.trim() ? ` for “${query}”` : ""}
            </p>
          )}
        </section>

        {/* Categories */}
        <section className="space-y-3">
          <h2 className="text-[11px] font-bold tracking-[0.2em] uppercase">
            Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className="border px-3 py-1.5 text-sm font-bold transition-colors hover:bg-[#1a120b] hover:text-[#fff7ee]"
                style={{
                  borderColor: "var(--ink)",
                  backgroundColor:
                    selectedCategory === cat.id ? "var(--accent)" : "#ffffff",
                  color:
                    selectedCategory === cat.id
                      ? "var(--on-accent)"
                      : "var(--ink)",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Site grid */}
        <section id="explore" className="space-y-4 scroll-mt-24">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold">
              {selectedCategory === "all"
                ? "All sites"
                : categories.find((c) => c.id === selectedCategory)?.label ??
                  selectedCategory}
            </h2>
            <span className="text-sm" style={{ color: "var(--muted)" }}>
              {filtered.length} site{filtered.length === 1 ? "" : "s"}
            </span>
          </div>

          {hasResults ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((site) => (
                <SiteCard key={site.id} site={site} />
              ))}
            </div>
          ) : (
            <div
              className="border p-8 text-center text-sm"
              style={{ color: "var(--muted)", borderColor: "var(--rule)" }}
            >
              No sites match that search. Try a different term or clear the
              search box.
            </div>
          )}
        </section>

        {/* Trending */}
        {trending.length > 0 && (
          <section
            id="trending"
            className="border-t pt-10 space-y-4 scroll-mt-24"
            style={{ borderColor: "var(--rule)" }}
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-bold">
                Trending <span aria-hidden="true">🔥</span>
              </h2>
              <Link
                to="/trending"
                className="text-sm font-bold accent-text underline underline-offset-4"
              >
                See all 51 →
              </Link>
            </div>
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trending.map((site, index) => (
                <li
                  key={site.id}
                  className="card p-5 flex flex-col gap-2 text-left"
                  style={{ borderColor: "var(--ink)" }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] font-mono"
                      style={{ color: "var(--accent)" }}
                    >
                      #{index + 1}
                    </span>
                    {site.trending != null && (
                      <span
                        className="text-[11px] font-mono"
                        style={{ color: "var(--muted)" }}
                      >
                        {site.trending}
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/site/${site.slug}`}
                    className="text-base font-bold hover:underline underline-offset-4"
                    style={{ color: "var(--ink)" }}
                  >
                    {site.name}
                  </Link>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--muted)" }}
                  >
                    {site.description}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Edit hint */}
        <section
          className="border-t pt-8 text-sm text-center"
          style={{ color: "var(--muted)", borderColor: "var(--rule)" }}
        >
          Want to add a site? Edit{" "}
          <code
            className="border px-1.5 py-0.5 text-[13px] font-mono"
            style={{
              borderColor: "var(--rule)",
              backgroundColor: "var(--surface)",
            }}
          >
            sites.json
          </code>{" "}
          and redeploy. Categories, tags, and trending scores all live there.
        </section>
      </div>
    </>
  );
}
