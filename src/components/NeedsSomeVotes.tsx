import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { SiteIcon } from "./SiteIcon";
import { rankedSites, type Site } from "../lib/siteData";
import {
  castVote,
  fetchSharedCounts,
  markVoted,
  readLocalCounts,
  readVotedSlugs,
  votesConnected,
  writeLocalCount,
} from "../lib/votes";
import { siteDomain } from "../lib/siteTile";

const SITE_POOL = rankedSites();
const STARTING_COUNTS = Object.fromEntries(
  SITE_POOL.map((site) => [site.slug, site.trending ?? 0]),
);

export function NeedsSomeVotes() {
  const [counts, setCounts] = useState<Record<string, number>>(() => ({
    ...STARTING_COUNTS,
    ...readLocalCounts(),
  }));
  const [voted, setVoted] = useState<string[]>(() => readVotedSlugs());
  const [pending, setPending] = useState<string[]>([]);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    let active = true;
    fetchSharedCounts().then((remote) => {
      if (!active || !remote) return;
      setShared(true);
      setCounts((current) => ({ ...current, ...remote }));
    });
    return () => {
      active = false;
    };
  }, []);

  const sitesNeedingVotes = useMemo(() => {
    const originalPosition = new Map(SITE_POOL.map((site, index) => [site.slug, index]));
    return [...SITE_POOL]
      .sort((a, b) => {
        const difference = (counts[a.slug] ?? 0) - (counts[b.slug] ?? 0);
        if (difference !== 0) return difference;
        return (originalPosition.get(b.slug) ?? 0) - (originalPosition.get(a.slug) ?? 0);
      })
      .slice(0, 3);
  }, [counts]);

  async function vote(site: Site) {
    if (voted.includes(site.slug) || pending.includes(site.slug)) return;

    const nextCount = (counts[site.slug] ?? site.trending ?? 0) + 1;
    setCounts((current) => ({ ...current, [site.slug]: nextCount }));
    setVoted((current) => [...current, site.slug]);
    setPending((current) => [...current, site.slug]);
    markVoted(site.slug);
    writeLocalCount(site.slug, nextCount);

    const sharedCount = await castVote(site.slug, "up");
    if (sharedCount !== null) {
      setShared(true);
      setCounts((current) => ({ ...current, [site.slug]: sharedCount }));
      writeLocalCount(site.slug, sharedCount);
    }
    setPending((current) => current.filter((slug) => slug !== site.slug));
  }

  if (sitesNeedingVotes.length === 0) return null;

  return (
    <section className="needs-votes-section" aria-labelledby="needs-votes-heading">
      <header className="needs-votes-heading">
        <div>
          <span className="section-eyebrow">A small nudge goes a long way</span>
          <h2 id="needs-votes-heading">Needs some votes <span aria-hidden="true">🙏</span></h2>
          <p>Find a good little corner of the web and help it move up the list.</p>
        </div>
        <Link to="/trending" className="needs-votes-all">Full rankings →</Link>
      </header>

      <ol className="needs-votes-grid">
        {sitesNeedingVotes.map((site, index) => {
          const hasVoted = voted.includes(site.slug);
          const isPending = pending.includes(site.slug);
          const count = counts[site.slug] ?? site.trending ?? 0;
          return (
            <li key={site.id} className="needs-votes-card">
              <div className="needs-votes-card-top">
                <span className="needs-votes-rank">#{SITE_POOL.length - index}</span>
                <SiteIcon site={site} size={40} label={false} />
              </div>
              <Link to={`/sites/${site.slug}`} className="needs-votes-site-name">
                {site.name}
              </Link>
              <span className="needs-votes-domain">{siteDomain(site.url)}</span>
              <p className="needs-votes-description">{site.description}</p>
              <button
                type="button"
                className="needs-votes-button"
                onClick={() => void vote(site)}
                disabled={hasVoted || isPending}
                aria-label={hasVoted ? `You voted for ${site.name}, ${count} votes` : `Vote for ${site.name}, ${count} votes`}
              >
                <span aria-hidden="true">{hasVoted ? "✓" : "▲"}</span>
                {isPending ? "Counting…" : hasVoted ? `Voted · ${count}` : `Vote for it · ${count}`}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="needs-votes-note" role="status">
        {shared
          ? "Votes update the shared ranking. One vote per site, per visitor."
          : votesConnected
            ? "Showing the latest available scores; votes will sync with the shared ranking when it responds."
            : "Votes are saved in this browser only until a shared vote counter is connected."}
      </p>
    </section>
  );
}
