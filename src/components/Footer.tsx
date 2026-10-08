import { Link } from "react-router";

export function Footer() {
  return (
    <footer
      className="border-t mt-auto"
      style={{ backgroundColor: "#ffffff", borderColor: "var(--ink)" }}
    >
      <div
        className="mx-auto max-w-5xl px-6 py-10 flex flex-col gap-8 text-sm"
        style={{ color: "var(--muted)" }}
      >
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <span
            className="text-[11px] font-bold tracking-[0.2em] uppercase"
            style={{ color: "var(--ink)" }}
          >
            Boring Internet
          </span>
          <p className="max-w-xl leading-relaxed">
            A small directory of launched sites. Edited by hand, kept
            minimal on purpose.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-left">
          <div>
            <p
              className="text-[11px] font-bold tracking-[0.2em] uppercase"
              style={{ color: "var(--ink)" }}
            >
              Directory
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  to="/"
                  className="nav-link"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="nav-link"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/trending"
                  className="nav-link"
                >
                  Trending <span aria-hidden="true">🔥</span>
                </Link>
              </li>
              <li>
                <Link to="/submit" className="nav-link">
                  Submit your site
                </Link>
              </li>
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
              <li>
                <a
                  href="mailto:hello@boringinternet.example"
                  className="nav-link"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/NOTAM-bobk/boringinternet.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link"
                >
                  GitHub
                </a>
              </li>
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
            Sites are curated by their creators. This directory links out;
            it does not host them.
          </p>
        </div>
      </div>
    </footer>
  );
}
