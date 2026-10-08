import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { SiteSeo } from "../components/SeoHead";
import { categoryFilters, siteName } from "../lib/siteData";
import { submissionsConnected, submitSite, type SubmissionDraft } from "../lib/submissions";

type TextFieldKey =
  | "url"
  | "name"
  | "tagline"
  | "description"
  | "useCases"
  | "alternatives"
  | "pricing"
  | "faq";

const EMPTY_DRAFT: SubmissionDraft = {
  name: "",
  url: "",
  tagline: "",
  description: "",
  useCases: "",
  alternatives: "",
  pricing: "",
  faq: "",
  categories: [],
  openSource: false,
};

const FIELDS: Array<{
  key: TextFieldKey;
  label: string;
  placeholder?: string;
  hint?: string;
  rows?: number;
  required?: boolean;
}> = [
  { key: "url", label: "URL", placeholder: "https://your-site.com", required: true },
  { key: "name", label: "Product name", placeholder: "My new site", required: true },
  {
    key: "tagline",
    label: "One line tagline",
    hint: "one sentence, no full stop needed",
    placeholder: "A quiet list of launched sites",
    required: true,
  },
  {
    key: "description",
    label: "Long description",
    rows: 5,
    hint: "what it does and who it is for",
    required: true,
  },
  { key: "useCases", label: "Use cases", rows: 3, placeholder: "One per line" },
  { key: "alternatives", label: "Alternatives", rows: 3, placeholder: "One per line" },
  { key: "pricing", label: "Pricing", placeholder: "Free · $5/mo · one-time $20" },
  { key: "faq", label: "FAQ", rows: 4, placeholder: "Question? Answer. (one per line)" },
];

export default function Submit() {
  const [draft, setDraft] = useState<SubmissionDraft>(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [badFields, setBadFields] = useState<string[]>([]);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const openCategories = categoryFilters.filter((category) => category.id !== "all");

  function update<K extends keyof SubmissionDraft>(key: K, value: SubmissionDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function toggleCategory(id: string) {
    setDraft((current) => ({
      ...current,
      categories: current.categories.includes(id)
        ? current.categories.filter((c) => c !== id)
        : [...current.categories, id],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setBadFields([]);

    const result = await submitSite(draft);
    setBusy(false);

    if (!result.ok) {
      setError(result.error);
      setBadFields(result.fields ?? []);
      return;
    }
    setSubmittedId(result.value.id);
    setDraft(EMPTY_DRAFT);
  }

  if (submittedId) {
    return (
      <>
        <SiteSeo
          title="Submitted"
          description={`Your site was submitted to ${siteName} for review.`}
          path="/submit"
        />
        <div className="mx-auto max-w-2xl px-6 py-16 flex flex-col gap-5 text-center">
          <span className="accent-text text-[11px] font-bold tracking-[0.2em] uppercase">
            Submission received
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em]">Sent for review</h1>
          <p className="text-base" style={{ color: "var(--muted)" }}>
            Your site is queued for a human check before it appears in the directory.
          </p>
          <p className="text-[12px] font-mono" style={{ color: "var(--muted)" }}>
            reference {submittedId}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <button type="button" className="btn" onClick={() => setSubmittedId(null)}>
              Submit another
            </button>
            <Link to="/" className="btn ghost">
              Back to the directory
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteSeo
        title="Submit your site"
        description={`Add your launched site to ${siteName}. Every submission is reviewed by hand.`}
        path="/submit"
      />
      <div className="mx-auto max-w-3xl px-6 py-12 flex flex-col gap-8">
        <header className="flex flex-col gap-3 border-b pb-6" style={{ borderColor: "var(--rule)" }}>
          <span className="accent-text text-[11px] font-bold tracking-[0.2em] uppercase">
            Submit your site
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em]">
            Tell us what you launched
          </h1>
          <p className="text-base" style={{ color: "var(--muted)" }}>
            Everything here goes into the review queue. If it fits the list, it ships in the next
            update.
          </p>
        </header>

        {!submissionsConnected && (
          <p
            className="border px-4 py-3 text-[13px] leading-relaxed"
            style={{
              borderColor: "var(--rule)",
              backgroundColor: "var(--surface)",
              color: "var(--muted)",
            }}
          >
            The submission service is not connected yet, so this form cannot send anything. Set{" "}
            <code className="font-mono text-[12px]">VITE_VOTES_API_URL</code> to the deployed Worker
            URL.
          </p>
        )}

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {FIELDS.map((field) => {
            const invalid = badFields.includes(field.key);
            const borderColor = invalid ? "var(--accent)" : "var(--ink)";
            return (
              <div key={field.key} className="flex flex-col gap-2">
                <label
                  htmlFor={field.key}
                  className="text-[12px] font-bold tracking-[0.12em] uppercase"
                >
                  {field.label}
                  {field.required && <span className="accent-text"> *</span>}
                  {field.hint && (
                    <span
                      className="ml-2 text-[11px] font-normal tracking-normal normal-case"
                      style={{ color: "var(--muted)" }}
                    >
                      {field.hint}
                    </span>
                  )}
                </label>
                {field.rows ? (
                  <textarea
                    id={field.key}
                    rows={field.rows}
                    placeholder={field.placeholder}
                    value={draft[field.key]}
                    onChange={(event) => update(field.key, event.target.value)}
                    className="field"
                    style={{ borderColor }}
                  />
                ) : (
                  <input
                    id={field.key}
                    type={field.key === "url" ? "url" : "text"}
                    placeholder={field.placeholder}
                    value={draft[field.key]}
                    onChange={(event) => update(field.key, event.target.value)}
                    className="field"
                    style={{ borderColor }}
                  />
                )}
              </div>
            );
          })}

          <fieldset className="flex flex-col gap-3">
            <legend className="text-[12px] font-bold tracking-[0.12em] uppercase">
              Categories <span className="accent-text">*</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {openCategories.map((category) => {
                const active = draft.categories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleCategory(category.id)}
                    className="border px-3 py-1.5 text-[13px] font-bold transition-colors hover:bg-[#1a120b] hover:text-[#fff7ee]"
                    style={{
                      borderColor: "var(--ink)",
                      backgroundColor: active ? "var(--accent)" : "#ffffff",
                      color: active ? "var(--on-accent)" : "var(--ink)",
                    }}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div
            className="flex items-center justify-between gap-4 border p-4"
            style={{ borderColor: "var(--rule)", backgroundColor: "var(--surface)" }}
          >
            <div>
              <p className="text-[12px] font-bold tracking-[0.12em] uppercase">Open source</p>
              <p className="text-[13px]" style={{ color: "var(--muted)" }}>
                Turn this on if the source is public.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={draft.openSource}
              aria-label="Open source"
              className="switch"
              onClick={() => update("openSource", !draft.openSource)}
            >
              <span className="switch-knob" />
            </button>
          </div>

          {error && (
            <p
              className="text-[13px] border px-4 py-3"
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              {error}
              {badFields.length > 0 && ` (check: ${badFields.join(", ")})`}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              className="btn"
              disabled={busy || !submissionsConnected}
            >
              {busy ? "Sending…" : "Submit for review"}
            </button>
            <span className="text-[12px]" style={{ color: "var(--muted)" }}>
              No account needed. Only what you type here is stored.
            </span>
          </div>
        </form>
      </div>
    </>
  );
}
