import { Link } from "react-router";

export default function Auth() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 flex flex-col items-center gap-6 text-center">
      <span
        className="text-[11px] font-bold tracking-[0.2em] uppercase border px-3 py-2"
        style={{ borderColor: "var(--ink)" }}
      >
        Access
      </span>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em]">
        Sign in
      </h1>
      <p className="max-w-md text-lg" style={{ color: "var(--muted)" }}>
        Auth is a placeholder for now. This site is public; you don't need an
        account to browse launched sites.
      </p>

      <div className="card p-6 w-full max-w-sm space-y-3 text-left">
        <input
          type="email"
          placeholder="you@boringinternet.example"
          className="field"
          readOnly
          aria-label="Email"
        />
        <input
          type="password"
          placeholder="Password"
          className="field"
          readOnly
          aria-label="Password"
        />
        <button type="button" className="btn w-full" disabled>
          Continue
        </button>
      </div>

      <p className="text-sm" style={{ color: "var(--muted)" }}>
        No account yet?{" "}
        <Link
          to="/"
          className="accent-text font-bold underline underline-offset-4"
        >
          Back to the directory
        </Link>
      </p>
    </div>
  );
}
