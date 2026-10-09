import { useState } from "react";
import { Link } from "react-router";
import { SiteSeo } from "../components/SeoHead";
import { SiteIcon } from "../components/SiteIcon";
import { sites, type Site } from "../lib/siteData";
import { siteDomain } from "../lib/siteTile";
import { castVote, markVoted, readLocalCounts, writeLocalCount } from "../lib/votes";

function pickOne<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]!;
}

/** Two listed sites, never the same one twice, and ideally from different corners. */
function drawPair(exclude: string[] = []): [Site, Site] {
  const pool = sites.filter((site) => !exclude.includes(site.slug));
  const first = pickOne(pool);
  const rest = pool.filter((site) => site.slug !== first.slug);
  const elsewhere = rest.filter((site) => site.category !== first.category);
  return [first, pickOne(elsewhere.length > 0 ? elsewhere : rest)];
}

/**
 * "This or that": two sites framed side by side, one vote for whichever is
 * better. The winner gets the same vote the trending list counts, and once a
 * vote is in the page offers a fresh pair.
 */
export default function ThisOrThat() {
  const [pair, setPair] = useState<[Site, Site]>(() => drawPair());
  const [winner, setWinner] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>(() => readLocalCounts());

  const [left, right] = pair;
  const enoughSites = sites.length >= 2;

  function voteFor(site: Site) {
    if (winner) return;
    setWinner(site.slug);

    // Count it the way the trending list does: shared when the Worker is
    // configured, kept in this browser otherwise.
    const base = counts[site.slug] ?? site.trending ?? 0;
    const optimistic = base + 1;
    setCounts((current) => ({ ...current, [site.slug]: optimistic }));
    markVoted(site.slug);
    writeLocalCount(site.slug, optimistic);
    void castVote(site.slug, "up").then((shared) => {
      if (shared == null) return;
      writeLocalCount(site.slug, shared);
      setCounts((current) => ({ ...current, [site.slug]: shared }));
    });
  }

  function newPair() {
    setPair(drawPair([left.slug, right.slug]));
    setWinner(null);
  }

  function countFor(site: Site): number {
    return counts[site.slug] ?? site.trending ?? 0;
  }

  const winnerSite = winner === left.slug ? left : winner === right.slug ? right : null;

  return (
    <>
      <SiteSeo
        title="This or that"
        description="Two quiet sites side by side. Open both, vote for the better one, and get a fresh pair — every vote feeds the trending list."
        path="/this-or-that"
        keywords={["this or that", "vote on websites", "compare websites", "site battle"]}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-6">
        <header className="flex flex-col gap-3 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em]">
            This <span className="accent-text">or</span> that
          </h1>
          <p className="text-base" style={{ color: "var(--muted)" }}>
            Two sites, side by side and framed right here. Vote for the better one — the winner
            gets a point on the{" "}
            <Link to="/trending" className="accent-text font-bold underline underline-offset-4">
              trending list
            </Link>
            .
          </p>
        </header>

        {!enoughSites ? (
          <p className="text-center" style={{ color: "var(--muted)" }}>
            There are not enough listed sites for a match-up yet.
          </p>
        ) : (
          <>
            <div className="compare-pair">
              {[left, right].map((site) => {
                const isWinner = winner === site.slug;
                return (
                  <article
                    key={site.slug}
                    className={`compare-side${isWinner ? " compare-side-winner" : ""}`}
                  >
                    <div className="compare-head">
                      <SiteIcon site={site} size={32} label={false} />
                      <div className="min-w-0 flex flex-col">
                        <Link
                          to={`/sites/${site.slug}`}
                          className="text-[15px] font-bold truncate hover:underline underline-offset-4"
                          style={{ color: "var(--ink)" }}
                        >
                          {site.name}
                        </Link>
                        <span className="text-[11px] font-mono truncate" style={{ color: "var(--muted)" }}>
                          {siteDomain(site.url)} · {countFor(site)} votes
                        </span>
                      </div>
                      {isWinner && (
                        <span className="compare-flag" aria-hidden="true">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="compare-frame">
                      <iframe
                        src={site.url}
                        title={`${site.name} preview`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="compare-foot">
                      <button
                        type="button"
                        className="btn accent"
                        onClick={() => voteFor(site)}
                        disabled={winner !== null}
                      >
                        {isWinner ? "You picked this" : "This one’s better"}
                      </button>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="compare-open"
                      >
                        Open {siteDomain(site.url)} in a new tab <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>

            <p className="text-[12px] text-center" style={{ color: "var(--muted)" }}>
              Some sites refuse to be framed, so a panel can come up empty — the link under each
              one always works.
            </p>

            <div className="compare-actions">
              {winnerSite ? (
                <>
                  <p className="compare-result">
                    You picked <strong>{winnerSite.name}</strong>. That is one more vote for it.
                  </p>
                  <button type="button" className="btn accent" onClick={newPair}>
                    Get new sites <span aria-hidden="true">→</span>
                  </button>
                </>
              ) : (
                <>
                  <p className="compare-result" style={{ color: "var(--muted)" }}>
                    Vote for one, or skip to a different pair.
                  </p>
                  <button type="button" className="btn ghost" onClick={newPair}>
                    Skip these
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
