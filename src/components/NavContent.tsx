import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  categoryCount,
  categoryFilters,
  siteName,
  siteTagline,
  sites,
} from "../lib/siteData";
import { posts } from "../lib/posts";

/** The four top-level places in the site. */
const SECTIONS = [
  { id: "explore", to: "/#explore", icon: "◎", label: "Explore" },
  { id: "articles", to: "/blog", icon: "◫", label: "Articles" },
  { id: "collections", to: "/#collections", icon: "❐", label: "Collections" },
  { id: "trending", to: "/trending", icon: "✦", label: "Trending" },
] as const;

const SECTION_LABELS: Record<string, string> = {
  explore: "Explore",
  articles: "Articles",
  collections: "Collections",
  trending: "Trending",
  submit: "Submit your site",
};

function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SectionToggle({
  label,
  open,
  onToggle,
  badge,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  badge?: string;
}) {
  return (
    <button
      type="button"
      className="sidenav-toggle"
      onClick={onToggle}
      aria-expanded={open}
    >
      <span>{label}</span>
      <span className="flex items-center gap-2">
        {badge && <span className="sidenav-badge">{badge}</span>}
        <span className={`chev${open ? " chev-open" : ""}`} aria-hidden="true">
          ⌄
        </span>
      </span>
    </button>
  );
}

/**
 * The navigation itself — rendered inside the floating desktop panel and
 * inside the mobile drawer so both stay in sync.
 */
export function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingSection = useRef<string | null>(null);
  const [query, setQuery] = useState("");
  const [hash, setHash] = useState(() =>
    typeof window === "undefined" ? "" : window.location.hash,
  );
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return { categories: true };
    try {
      const raw = window.localStorage.getItem("bi:nav-groups");
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : { categories: true };
    } catch {
      return { categories: true };
    }
  });

  // Keep the fragment in sync: the router changes it on navigation, and plain
  // in-page anchors fire `hashchange` without the router noticing.
  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [location.key, location.pathname, location.search, location.hash]);

  // After a jump like /#collections, scroll the section into view once it exists.
  useEffect(() => {
    const id = pendingSection.current;
    if (!id) return;
    pendingSection.current = null;
    const frame = requestAnimationFrame(() => scrollToSection(id));
    const timer = window.setTimeout(() => scrollToSection(id), 160);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [location.key, location.pathname, location.search, location.hash]);

  // ⌘K / Ctrl+K focuses the search field.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /** Where the visitor actually is right now. */
  const activeSection = useMemo(() => {
    const path = location.pathname.replace(/\/+$/, "") || "/";
    if (path === "/blog" || path.startsWith("/blog/")) return "articles";
    if (path === "/trending") return "trending";
    if (path === "/submit") return "submit";
    if (path === "/") return hash.includes("collections") ? "collections" : "explore";
    return "";
  }, [location.pathname, hash]);

  const activeCategory = useMemo(() => {
    if (location.pathname !== "/") return "";
    return new URLSearchParams(location.search).get("category") ?? "";
  }, [location.pathname, location.search]);

  function toggleGroup(id: string) {
    setOpenGroups((current) => {
      const next = { ...current, [id]: !current[id] };
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("bi:nav-groups", JSON.stringify(next));
        } catch {
          /* private mode */
        }
      }
      return next;
    });
  }

  /** Navigate, and make in-page jumps land on the right section every time. */
  function go(to: string) {
    onNavigate?.();
    const hashIndex = to.indexOf("#");
    const id = hashIndex === -1 ? "" : to.slice(hashIndex + 1);
    const href = hashIndex === -1 ? to : `${to.slice(0, hashIndex)}#${id}`;
    const current = `${location.pathname}${location.search}${location.hash}`;

    if (href === current) {
      if (id) scrollToSection(id);
      return;
    }
    if (!id) {
      navigate(to);
      return;
    }
    pendingSection.current = id;
    navigate(href);
  }

  function runSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    go(trimmed ? `/?q=${encodeURIComponent(trimmed)}#explore` : "/#explore");
  }

  return (
    <div className="sidenav-body">
      <div className="sidenav-brand">
        <Link to="/" className="sidenav-brandmark" onClick={() => onNavigate?.()}>
          {siteName}
        </Link>
        <p className="sidenav-tagline">{siteTagline}</p>
      </div>

      <form className="sidenav-search" onSubmit={runSearch} role="search">
        <span aria-hidden="true" className="sidenav-search-icon">
          ⌕
        </span>
        <label htmlFor="nav-search" className="sr-only">
          Search sites
        </label>
        <input
          id="nav-search"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${sites.length} sites`}
        />
        <span className="keycap" aria-hidden="true">
          ⌘K
        </span>
      </form>

      <nav aria-label="Site" className="sidenav-links">
        {SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              className={`sidenav-item${isActive ? " active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => go(section.to)}
            >
              <span className="sidenav-icon" aria-hidden="true">
                {section.icon}
              </span>
              <span>{section.label}</span>
              {section.id === "articles" && (
                <span className="sidenav-badge">{posts.length}</span>
              )}
            </button>
          );
        })}
      </nav>

      <p className="sidenav-now" aria-live="polite">
        <span className="sidenav-now-dot" aria-hidden="true" />
        <span>
          Viewing <strong>{SECTION_LABELS[activeSection] ?? siteName}</strong>
        </span>
        {activeSection !== "explore" && (
          <button
            type="button"
            className="sidenav-now-back"
            onClick={() => go("/#explore")}
          >
            Back to Explore
          </button>
        )}
      </p>

      <div className="sidenav-divider" />

      <div className="sidenav-group">
        <SectionToggle
          label="Libraries"
          open={Boolean(openGroups.libraries)}
          onToggle={() => toggleGroup("libraries")}
        />
        {openGroups.libraries && (
          <div className="sidenav-sub">
            <button type="button" className="sidenav-subitem" onClick={() => go("/#explore")}>
              All sites <span className="sidenav-badge">{sites.length}</span>
            </button>
            <button type="button" className="sidenav-subitem" onClick={() => go("/trending")}>
              Top {sites.length} ranking
            </button>
            <button type="button" className="sidenav-subitem" onClick={() => go("/submit")}>
              Submit your site
            </button>
          </div>
        )}
      </div>

      <div className="sidenav-group">
        <SectionToggle
          label="Categories"
          open={openGroups.categories !== false}
          onToggle={() => toggleGroup("categories")}
        />
        {openGroups.categories !== false && (
          <div className="sidenav-sub">
            {categoryFilters
              .filter((category) => category.id !== "all")
              .map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`sidenav-subitem${
                    activeCategory === category.id ? " active-sub" : ""
                  }`}
                  aria-current={activeCategory === category.id ? "true" : undefined}
                  onClick={() => go(`/?category=${category.id}#explore`)}
                >
                  {category.label}
                  <span className="sidenav-badge">{categoryCount(category.id)}</span>
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="sidenav-foot">
        <Link to="/submit" className="sidenav-cta" onClick={() => onNavigate?.()}>
          Submit your site
        </Link>
        <Link to="/auth" className="sidenav-foot-link" onClick={() => onNavigate?.()}>
          Sign in
        </Link>
      </div>
    </div>
  );
}
