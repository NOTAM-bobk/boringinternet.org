import { Link } from "react-router";
import { FeatureBadges } from "./FeatureBadges";

/** Link columns, kept apart from the markup so the footer stays readable. */
const DIRECTORY_LINKS: { to: string; label: string }[] = [
  { to: "/", label: "Home" },
  { to: "/blog", label: "Blog" },
  { to: "/collections", label: "Collections" },
  { to: "/trending", label: "Trending 🔥" },
  { to: "/submit", label: "Submit your site" },
];

const CONNECT_LINKS: { href: string; label: string }[] = [
  { href: "mailto:hello@boringinternet.example", label: "Contact" },
  { href: "https://github.com/NOTAM-bobk/boringinternet.org", label: "GitHub" },
];

export function Footer() {
  return (
    <footer
      className="footer w-full border-t mt-auto"
      style={{ backgroundColor: "#ffffff", borderColor: "var(--ink)" }}
    >
      <div className="w-full px-5 sm:px-8 lg:px-12 py-10 sm:py-12 flex flex-col gap-10 text-sm">
        <div className="grid gap-9 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] md:gap-12">
          <div className="flex flex-col gap-3">
            <span
              className="text-[11px] font-bold tracking-[0.2em] uppercase"
              style={{ color: "var(--ink)" }}
            >
              Boring Internet
            </span>
            <p className="max-w-md leading-relaxed" style={{ color: "var(--muted)" }}>
              A small directory of launched sites. Edited by hand, kept minimal on purpose.
            </p>
            <FeatureBadges />
          </div>

          <div>
            <p
              className="text-[11px] font-bold tracking-[0.2em] uppercase"
              style={{ color: "var(--ink)" }}
            >
              Directory
            </p>
            <ul className="mt-3 space-y-2">
              {DIRECTORY_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p
              className="text-[11px] font-bold tracking-[0.2em] uppercase"
              style={{ color: "var(--ink)" }}
            >
              Connect
            </p>
            <ul className="mt-3 space-y-2">
              {CONNECT_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    {...(link.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="nav-link"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="flex flex-col gap-2 text-[11px] border-t pt-6"
          style={{ color: "var(--muted)", borderColor: "var(--rule)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} Boring Internet.</p>
            <Link
              to="/admin"
              className="nav-link text-[10px] font-bold tracking-[0.16em] uppercase"
            >
              Admin panel
            </Link>
          </div>
          <p>
            Sites are curated by their creators. This directory links out; it does not host them.
          </p>
        </div>
      </div>
    </footer>
  );
}
