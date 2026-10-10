import { useEffect, useState } from "react";
import { Link } from "react-router";
import { SiteVoteRow } from "./SiteVoteRow";
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

const SITE_POOL = rankedSites();
const STARTING_COUNTS = Object.fromEntries(
  SITE_POOL.map((site) => [site.slug, site.trending ?? 0]),
);

/** The scores as they stand on arrival: configured, then this browser's votes. */
function startingCounts(): Record<string, number> {
  return { ...STARTING_COUNTS, ...readLocalCounts() };
}

/**
 * The three listings at the very bottom of the live ranking, weakest first, each
 * with the position it holds so a row can show it like the trending list does.
 */
function weakestThree(counts: Record<string, number>) {
  const order = [...SITE_POOL].sort((a, b) => (counts[b.slug] ?? 0) - (counts[a.slug] ?? 0));
  return order
    .slice(-3)
    .reverse()
    .map((site) => ({ site, rank: order.indexOf(site) + 1 }));
}

export function NeedsSomeVotes() {
  const [counts, setCounts] = useState<Record<string, number>>(startingCounts);
  /*
    Picked once, when the strip mounts. Choosing the weakest three again on every
    vote would swap the site you just voted for out of the strip mid-session.
  */
  const [sitesNeedingVotes] = useState(() => weakestThree(startingCounts()));
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

      <ol className="vote-rows">
        {sitesNeedingVotes.map(({ site, rank }) => (
          <SiteVoteRow
            key={site.id}
            site={site}
            rank={rank}
            count={counts[site.slug] ?? site.trending ?? 0}
            voted={voted.includes(site.slug)}
            pending={pending.includes(site.slug)}
            onVote={() => void vote(site)}
          />
        ))}
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
