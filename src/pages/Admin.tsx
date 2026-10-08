import { useEffect, useState, type FormEvent } from "react";
import { SiteSeo } from "../components/SeoHead";
import {
  fetchSubmissions,
  reviewSubmission,
  submissionsConnected,
  type Submission,
  type SubmissionStatus,
} from "../lib/submissions";

const FILTERS: Array<{ id: SubmissionStatus | "all"; label: string }> = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

function StatusChip({ status }: { status: SubmissionStatus }) {
  const tone =
    status === "approved"
      ? { backgroundColor: "var(--ink)", color: "var(--surface)" }
      : status === "rejected"
        ? { backgroundColor: "transparent", color: "var(--muted)" }
        : { backgroundColor: "var(--accent)", color: "var(--on-accent)" };
  return (
    <span
      className="text-[10px] font-bold tracking-[0.14em] uppercase border px-2 py-0.5"
      style={{ ...tone, borderColor: "var(--ink)" }}
    >
      {status}
    </span>
  );
}

function SubmissionCard({
  submission,
  onReview,
  busy,
}: {
  submission: Submission;
  onReview: (id: string, status: SubmissionStatus) => void;
  busy: boolean;
}) {
  const rows: Array<[string, string]> = [
    ["Tagline", submission.tagline],
    ["Description", submission.description],
    ["Use cases", submission.useCases],
    ["Alternatives", submission.alternatives],
    ["Pricing", submission.pricing],
    ["FAQ", submission.faq],
  ].filter(([, value]) => value.length > 0) as Array<[string, string]>;

  return (
    <article className="card p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{submission.name}</h2>
            <StatusChip status={submission.status} />
            {submission.openSource && (
              <span className="text-[10px] font-mono border px-2 py-0.5" style={{ borderColor: "var(--rule)", color: "var(--muted)" }}>
                open source
              </span>
            )}
          </div>
          <a
            href={submission.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-mono accent-text underline underline-offset-4 break-all"
          >
            {submission.url}
          </a>
        </div>
        <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
          {new Date(submission.createdAt).toLocaleString("en-US")}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {submission.categories.map((category) => (
          <span
            key={category}
            className="text-[11px] font-mono border px-2 py-0.5"
            style={{ borderColor: "var(--rule)", color: "var(--muted)" }}
          >
            {category}
          </span>
        ))}
      </div>

      <dl className="flex flex-col gap-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--muted)" }}>
              {label}
            </dt>
            <dd className="text-[14px] leading-relaxed whitespace-pre-line">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center gap-3 border-t pt-4" style={{ borderColor: "var(--rule)" }}>
        <button
          type="button"
          className="btn"
          disabled={busy || submission.status === "approved"}
          onClick={() => onReview(submission.id, "approved")}
        >
          Approve
        </button>
        <button
          type="button"
          className="btn ghost"
          disabled={busy || submission.status === "rejected"}
          onClick={() => onReview(submission.id, "rejected")}
        >
          Reject
        </button>
        <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
          {submission.id}
        </span>
      </div>
    </article>
  );
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<SubmissionStatus | "all">("pending");

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await fetchSubmissions(password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error === "wrong password" ? "Wrong password." : result.error);
      return;
    }
    setSubmissions(result.value.submissions);
    setUnlocked(true);
  }

  // KV reads can lag a write by up to a minute, so poll while unlocked.
  useEffect(() => {
    if (!unlocked) return;
    let active = true;
    const timer = setInterval(() => {
      void fetchSubmissions(password).then((result) => {
        if (active && result.ok) setSubmissions(result.value.submissions);
      });
    }, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [unlocked, password]);

  async function refresh(currentPassword: string) {
    const result = await fetchSubmissions(currentPassword);
    if (result.ok) setSubmissions(result.value.submissions);
  }

  async function review(id: string, status: SubmissionStatus) {
    setBusy(true);
    const result = await reviewSubmission(password, id, status);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSubmissions((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }

  const visible =
    filter === "all" ? submissions : submissions.filter((item) => item.status === filter);
  const pendingCount = submissions.filter((item) => item.status === "pending").length;

  return (
    <>
      <SiteSeo
        title="Admin"
        description="Review submitted sites."
        path="/admin"
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
        <header className="flex flex-col gap-3 border-b pb-6" style={{ borderColor: "var(--rule)" }}>
          <span className="accent-text text-[11px] font-bold tracking-[0.2em] uppercase">Admin</span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em]">Submitted sites</h1>
          <p className="text-base" style={{ color: "var(--muted)" }}>
            Password is checked on the Worker, never in this page. Submissions live in Workers KV.
          </p>
        </header>

        {!unlocked ? (
          <form className="card p-5 sm:p-6 flex flex-col gap-4" onSubmit={unlock}>
            <label htmlFor="admin-password" className="text-[12px] font-bold tracking-[0.12em] uppercase">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field"
              placeholder="••••"
              style={{ borderColor: "var(--ink)" }}
            />
            {!submissionsConnected && (
              <p className="text-[13px]" style={{ color: "var(--accent)" }}>
                The Worker is not connected, so there is nothing to load yet.
              </p>
            )}
            {error && (
              <p className="text-[13px]" style={{ color: "var(--accent)" }}>
                {error}
              </p>
            )}
            <button type="submit" className="btn" disabled={busy || !submissionsConnected}>
              {busy ? "Checking…" : "Unlock review queue"}
            </button>
          </form>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFilter(option.id)}
                    className="border px-3 py-1.5 text-[13px] font-bold transition-colors hover:bg-[#1a120b] hover:text-[#fff7ee]"
                    style={{
                      borderColor: "var(--ink)",
                      backgroundColor: filter === option.id ? "var(--accent)" : "#ffffff",
                      color: filter === option.id ? "var(--on-accent)" : "var(--ink)",
                    }}
                  >
                    {option.label}
                    {option.id === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="pager"
                  onClick={() => void refresh(password)}
                  title="Refresh"
                  aria-label="Refresh submissions"
                >
                  ↻
                </button>
                <button
                  type="button"
                  className="text-[12px] font-bold uppercase tracking-[0.12em] accent-text"
                  onClick={() => {
                    setUnlocked(false);
                    setPassword("");
                    setSubmissions([]);
                  }}
                >
                  Lock
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[13px]" style={{ color: "var(--accent)" }}>
                {error}
              </p>
            )}

            {visible.length === 0 ? (
              <p className="border p-8 text-center text-sm" style={{ borderColor: "var(--rule)", color: "var(--muted)" }}>
                Nothing here yet. New submissions land in Pending.
              </p>
            ) : (
              <div className="flex flex-col gap-5">
                {visible.map((submission) => (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    busy={busy}
                    onReview={(id, status) => void review(id, status)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
