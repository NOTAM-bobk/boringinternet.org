import { useSearchParams } from "react-router";
import { siteName } from "../lib/siteData";

function safeHttpUrl(value: string | null): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

/** A lightweight, standalone badge intended to be displayed inside a partner site's iframe. */
export default function EmbedBadge() {
  const [params] = useSearchParams();
  const name = params.get("name")?.trim().slice(0, 100) || "A website";
  const submittedUrl = safeHttpUrl(params.get("url"));
  const displayHost = submittedUrl?.hostname.replace(/^www\./, "") ?? "";
  const isListed = params.get("status") === "listed";
  const label = isListed ? "As seen on" : "Submitted to";

  return (
    <main className="embed-root">
      <a
        href="https://boringinternet.org/"
        target="_top"
        rel="noopener noreferrer"
        className="embed-badge"
        aria-label={`${name}, ${label} ${siteName}`}
      >
        <span className="embed-badge-mark" aria-hidden="true">b.</span>
        <span className="embed-badge-copy">
          <span className="embed-badge-kicker">{label}</span>
          <span className="embed-badge-title">{siteName}</span>
          <span className="embed-badge-site">{displayHost || name}</span>
        </span>
        <span className="embed-badge-arrow" aria-hidden="true">↗</span>
      </a>
    </main>
  );
}
