import { Link } from "react-router";

export function Footer() {
  return (
    <footer
      className="border-t border-[#0b0b0b] mt-auto"
      style={{ backgroundColor: "#fafafa" }}
    >
      <div
        className="mx-auto max-w-5xl px-6 py-10 flex flex-col gap-8 text-sm"
        style={{ color: "#5b5b5b" }}
      >
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <span
            className="text-[11px] font-bold tracking-[0.2em] uppercase"
            style={{ color: "#0b0b0b" }}
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
              style={{ color: "#0b0b0b" }}
            >
              Directory
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-[#0b0b0b] hover:underline underline-offset-4"
                >
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="/archive"
                  className="text-[#0b0b0b] hover:underline underline-offset-4"
                >
                  Archive
                </a>
              </li>
              <li>
                <a
                  href="/submit"
                  className="text-[#0b0b0b] hover:underline underline-offset-4"
                >
                  Submit a site
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p
              className="text-[11px] font-bold tracking-[0.2em] uppercase"
              style={{ color: "#0b0b0b" }}
            >
              Connect
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="mailto:hello@boringinternet.example"
                  className="text-[#0b0b0b] hover:underline underline-offset-4"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/updates"
                  className="text-[#0b0b0b] hover:underline underline-offset-4"
                >
                  Updates
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-[11px] text-[#5b5b5b] border-t border-[#d8d8d8] pt-6">
          <p>© {new Date().getFullYear()} Boring Internet.</p>
          <p>
            Sites are curated by their creators. This directory links out;
            it does not host them.
          </p>
        </div>
      </div>
    </footer>
  );
}
