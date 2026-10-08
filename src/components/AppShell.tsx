import { useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { AccountMenu } from "./AccountMenu";
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

/** Left-to-right order of the top-level tabs, so we can slide in the right direction. */
const TAB_ORDER = ["/", "/trending", "/blog", "/collections", "/submit", "/admin", "/auth"];

/** Only the main screens keep the full footer; utility pages end with the page. */
const FOOTER_ROUTES = new Set(["/", "/trending", "/blog"]);

function tabIndex(pathname: string): number {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return 0;
  const index = TAB_ORDER.findIndex(
    (tab) => tab !== "/" && (path === tab || path.startsWith(`${tab}/`)),
  );
  return index === -1 ? TAB_ORDER.length : index;
}

/** Remember the tab we came from so the new pane slides the right way. */
function useSlideDirection(pathname: string): "left" | "right" {
  const previous = useRef({ path: pathname, direction: "right" as "left" | "right" });
  if (previous.current.path !== pathname) {
    const direction =
      tabIndex(pathname) >= tabIndex(previous.current.path) ? "right" : "left";
    previous.current = { path: pathname, direction };
  }
  return previous.current.direction;
}

export function AppShell() {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  const direction = useSlideDirection(location.pathname);
  const path = location.pathname.replace(/\/+$/, "") || "/";

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
            <AccountMenu />
            <HamburgerButton open={navOpen} onClick={() => setNavOpen(true)} />
          </div>
        </div>
      </header>

      <SideNav />
      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="flex-1 flex flex-col lg:pl-[19rem]">
        <main className="flex-1">
          <div key={location.pathname} className={`route-pane slide-${direction}`}>
            <Outlet />
          </div>
        </main>
        {FOOTER_ROUTES.has(path) && <Footer />}
      </div>
    </div>
  );
}
