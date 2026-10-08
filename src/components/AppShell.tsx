import { Link, NavLink, Outlet } from "react-router";
import { Footer } from "./Footer";

function BlogLink() {
  return (
    <NavLink
      to="/blog"
      className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
    >
      Blog
    </NavLink>
  );
}

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="sticky top-0 z-20 border-b"
        style={{ backgroundColor: "var(--bg)", borderColor: "var(--ink)" }}
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
          {/* Left: brand */}
          <Link to="/" className="justify-self-start flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 shrink-0"
              style={{ backgroundColor: "var(--accent)" }}
            />
            <span
              className="text-[11px] sm:text-[13px] font-bold tracking-[0.16em] sm:tracking-[0.2em] uppercase whitespace-nowrap border px-2 py-1"
              style={{ color: "var(--ink)", borderColor: "var(--ink)" }}
            >
              Boring Internet
            </span>
          </Link>

          {/* Middle: section links */}
          <nav
            className="justify-self-center flex items-center gap-3 sm:gap-7 text-[12px] sm:text-sm font-bold"
            aria-label="Main"
          >
            <a href="/#explore" className="nav-link">
              Explore
            </a>
            <a href="/#trending" className="nav-link whitespace-nowrap">
              Trending <span aria-hidden="true">🔥</span>
            </a>
            <BlogLink />
          </nav>

          {/* Right: account */}
          <Link
            to="/auth"
            className="justify-self-end text-[10px] sm:text-[11px] font-bold tracking-[0.14em] uppercase border px-2 py-1.5 transition-colors hover:bg-[#1a120b] hover:text-[#fff7ee]"
            style={{ color: "var(--ink)", borderColor: "var(--ink)" }}
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
