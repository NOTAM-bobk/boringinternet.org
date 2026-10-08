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
      style={{ borderColor: "#0b0b0b" }}
    >
      <footer className="flex items-center justify-between gap-3">
        <Link
          to={`/site/${site.slug}`}
          className="text-base font-bold hover:underline underline-offset-4"
          style={{ color: "#0b0b0b" }}
        >
          {site.name}
        </Link>
        <span className="text-[11px] font-mono" style={{ color: "#5b5b5b" }}>
          {domain}
        </span>
      </footer>
      <p className="text-sm leading-relaxed" style={{ color: "#5b5b5b" }}>
        {site.description}
      </p>
      <div className="flex flex-wrap gap-2 mt-1">
        {site.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[11px] font-mono border border-[#d8d8d8] px-2 py-0.5"
            style={{ color: "#5b5b5b" }}
          >
            {tag}
          </span>
        ))}
      </div>
      {site.launched && (
        <p className="text-[11px] font-mono mt-1" style={{ color: "#5b5b5b" }}>
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
        className="mt-1 inline-flex text-[11px] font-bold tracking-wider uppercase border border-[#0b0b0b] px-3 py-1 hover:bg-[#0b0b0b] hover:text-white transition-colors"
        style={{ color: "#0b0b0b" }}
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
        {/* Hero */}
        <section className="border-b border-[#d8d8d8] pb-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] uppercase border border-[#0b0b0b] px-3 py-2">
              <span className="w-2 h-2 bg-[#0b0b0b]" />
              <span>Directory — live</span>
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl font-bold leading-[0.95] tracking-[-0.02em]">
              Launched sites, kept flat.
            </h1>
            <p className="mt-4 text-lg leading-relaxed" style={{ color: "#5b5b5b" }}>
              A small list of sites people are launching now. Edit{" "}
              <code className="border border-[#d8d8d8] bg-white px-1.5 py-0.5 text-[13px] font-mono">
                sites.json
              </code>{" "}
              to add your own.
            </p>
          </div>
        </section>

        {/* Search */}
        <section className="space-y-4">
          <label
            htmlFor="site-search"
            className="sr-only"
          >
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
            style={{ borderColor: "#0b0b0b" }}
          />
          {query && (
            <p className="text-sm" style={{ color: "#5b5b5b" }}>
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
                className="border border-[#0b0b0b] px-3 py-1.5 text-sm font-bold transition-colors hover:bg-[#0b0b0b] hover:text-white"
                style={{
                  backgroundColor:
                    selectedCategory === cat.id ? "#0b0b0b" : "#fff",
                  color:
                    selectedCategory === cat.id ? "#fff" : "#0b0b0b",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Site grid */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold">
              {selectedCategory === "all"
                ? "All sites"
                : categories.find((c) => c.id === selectedCategory)?.label ??
                  selectedCategory}
            </h2>
            <span className="text-sm" style={{ color: "#5b5b5b" }}>
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
              className="border border-[#d8d8d8] p-8 text-center text-sm"
              style={{ color: "#5b5b5b" }}
            >
              No sites match that search. Try a different term or clear the
              search box.
            </div>
          )}
        </section>

        {/* Trending */}
        {trending.length > 0 && (
          <section className="border-t border-[#d8d8d8] pt-10 space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-bold">Trending</h2>
              <span className="text-sm" style={{ color: "#5b5b5b" }}>
                Most active this week
              </span>
            </div>
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trending.map((site, index) => (
                <li
                  key={site.id}
                  className="card p-5 flex flex-col gap-2 text-left"
                  style={{ borderColor: "#0b0b0b" }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] font-mono"
                      style={{ color: "#5b5b5b" }}
                    >
                      #{index + 1}
                    </span>
                    {site.trending != null && (
                      <span className="text-[11px] font-mono" style={{ color: "#5b5b5b" }}>
                        {site.trending}
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/site/${site.slug}`}
                    className="text-base font-bold hover:underline underline-offset-4"
                    style={{ color: "#0b0b0b" }}
                  >
                    {site.name}
                  </Link>
                  <p className="text-sm leading-relaxed" style={{ color: "#5b5b5b" }}>
                    {site.description}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Edit hint */}
        <section className="border-t border-[#d8d8d8] pt-8 text-sm text-center" style={{ color: "#5b5b5b" }}>
          Want to add a site? Edit{" "}
          <code className="border border-[#d8d8d8] bg-white px-1.5 py-0.5 text-[13px] font-mono">
            sites.json
          </code>{" "}
          and redeploy. Categories, tags, and trending scores all live there.
        </section>
      </div>
    </>
  );
}
