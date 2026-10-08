import { Link, Outlet } from "react-router";
import { Footer } from "./Footer";

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-[#0b0b0b] bg-[#fafafa]">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span
              className="text-[11px] font-bold tracking-[0.2em] uppercase border border-[#0b0b0b] px-2 py-1"
              style={{ color: "#0b0b0b" }}
            >
              Boring Internet
            </span>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-bold">
            <Link
              to="/"
              className="text-[#0b0b0b] hover:opacity-70 transition-opacity"
            >
              Home
            </Link>
            <Link
              to="/auth"
              className="text-[#0b0b0b] hover:opacity-70 transition-opacity"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
