import { useState, type ReactNode } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { Footer } from "./Footer";
import { MobileNav, HamburgerButton } from "./MobileNav";
import { SideNav } from "./SideNav";
import { siteName } from "../lib/siteData";

function NavItem({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
    >
      {children}
    </NavLink>
  );
}

export function AppShell() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="site-header">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center gap-3">
          <Link to="/" className="justify-self-start">
            <span className="brand-mark">{siteName}</span>
          </Link>

          <nav
            className="hidden lg:flex justify-self-center items-center gap-7 text-[14px] font-bold"
            aria-label="Main"
          >
            <a href="/#explore" className="nav-link">
              Explore
            </a>
            <NavItem to="/trending">
              <span className="whitespace-nowrap">
                Trending <span aria-hidden="true">🔥</span>
              </span>
            </NavItem>
            <NavItem to="/blog">Blog</NavItem>
          </nav>

          <div className="justify-self-end flex items-center gap-2">
            <Link to="/submit" className="nav-cta">
              <span className="hidden sm:inline">Submit your site</span>
              <span className="sm:hidden">Submit</span>
            </Link>
            <Link to="/auth" className="nav-btn">
              Sign in
            </Link>
            <HamburgerButton open={navOpen} onClick={() => setNavOpen(true)} />
          </div>
        </div>
      </header>

      <SideNav />
      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="flex-1 flex flex-col lg:pl-[19rem]">
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
