import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  categoryCount,
  categoryFilters,
  siteName,
  siteTagline,
  sites,
} from "../lib/siteData";
import { posts } from "../lib/posts";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return { categories: true };
    try {
      const raw = window.localStorage.getItem("bi:nav-groups");
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : { categories: true };
    } catch {
      return { categories: true };
    }
  });

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

  function runSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/?q=${encodeURIComponent(trimmed)}#explore` : "/");
    onNavigate?.();
  }

  function go(to: string) {
    navigate(to);
    onNavigate?.();
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
        <button type="button" className="sidenav-item active" onClick={() => go("/#explore")}>
          <span className="sidenav-icon" aria-hidden="true">
            ◎
          </span>
          Explore
        </button>
        <button type="button" className="sidenav-item" onClick={() => go("/blog")}>
          <span className="sidenav-icon" aria-hidden="true">
            ◫
          </span>
          Articles
          <span className="sidenav-badge">{posts.length}</span>
        </button>
        <button type="button" className="sidenav-item" onClick={() => go("/#collections")}>
          <span className="sidenav-icon" aria-hidden="true">
            ❐
          </span>
          Collections
        </button>
        <button type="button" className="sidenav-item" onClick={() => go("/trending")}>
          <span className="sidenav-icon" aria-hidden="true">
            ✦
          </span>
          Trending
        </button>
      </nav>

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
                  className="sidenav-subitem"
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
