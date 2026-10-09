import { Link, useParams } from "react-router";
import { ReportProblem } from "../components/ReportProblem";
import { SiteIcon } from "../components/SiteIcon";
import { SiteSeo } from "../components/SeoHead";
import { useAuth } from "../lib/auth";
import {
  categoryLabel,
  collections,
  humanizeKey,
  rankedSites,
  siteBySlug,
  siteName,
  siteUrl,
  sites,
  sitesByCategory,
} from "../lib/siteData";
import { formatDate } from "../lib/posts";
import { siteDomain } from "../lib/siteTile";

/** Keep longer submitted details in a predictable, readable order. */
const DETAIL_ORDER = [
  "tagline",
  "launchDate",
  "targetAudience",
  "problem",
  "features",
  "useCases",
  "alternatives",
  "pricing",
  "openSource",
  "socialLinks",
  "faq",
];

export default function SiteDetail() {
  const { slug = "" } = useParams();
  const { user, toggleSaved } = useAuth();
  const site = siteBySlug(slug);

  if (!site) {
    return (
      <>
        <SiteSeo title="Site not found" path={`/sites/${slug}`} noindex />
        <main className="site-not-found mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16">
          <span className="site-detail-kicker">404 · Not in the directory</span>
          <h1>That site is not listed</h1>
          <p>“{slug}” is not one of the {sites.length} sites on {siteName}.</p>
          <Link to="/" className="btn accent">Browse the list</Link>
        </main>
      </>
    );
  }

  const rank = rankedSites().findIndex((entry) => entry.slug === site.slug) + 1;
  const lists = collections.filter((collection) => collection.siteSlugs.includes(site.slug));
  const neighbours = sitesByCategory(site.category)
    .filter((entry) => entry.slug !== site.slug)
    .slice(0, 6);
  const domain = siteDomain(site.url);
  const extras = Object.entries(site.extras ?? {}).sort(([left], [right]) => {
    const leftOrder = DETAIL_ORDER.indexOf(left);
    const rightOrder = DETAIL_ORDER.indexOf(right);
    if (leftOrder === -1 && rightOrder === -1) return left.localeCompare(right);
    if (leftOrder === -1) return 1;
    if (rightOrder === -1) return -1;
    return leftOrder - rightOrder;
  });
  const visibleExtras = extras.filter(([key]) => key !== "tagline");
  const pageUrl = `${siteUrl}/sites/${site.slug}`;
  const launched = site.launched ? formatDate(site.launched) : "Not listed";

  return (
    <>
      <SiteSeo
        title={site.name}
        description={`${site.description} Listed on ${siteName} — open ${domain}, see its details, and find similar sites.`}
        path={`/sites/${site.slug}`}
        keywords={[
          site.name,
          domain,
          ...site.tags,
          categoryLabel(site.category).toLowerCase(),
          "quiet websites",
        ]}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: site.name,
            url: site.url,
            description: site.description,
            inLanguage: "en",
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
              { "@type": "ListItem", position: 2, name: site.name, item: pageUrl },
            ],
          },
        ]}
      />

      <main className="site-detail-page mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
        <Link to="/" className="site-detail-back">
          <span aria-hidden="true">←</span> All {sites.length} sites
        </Link>

        <article className="site-detail-hero">
          <div className="site-detail-hero-top">
            <span className="site-detail-kicker">{categoryLabel(site.category)} · Small web directory</span>
            <span className="site-detail-rank">#{rank || "—"} in the directory</span>
          </div>

          <div className="site-detail-identity">
            <SiteIcon site={site} size={68} label={false} />
            <div className="site-detail-title-block">
              <h1>{site.name}</h1>
              <a href={site.url} target="_blank" rel="noopener noreferrer" className="site-detail-domain">
                {domain} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <p className="site-detail-tagline">
            {site.extras?.tagline || `A quiet corner of the web, filed under ${categoryLabel(site.category)}.`}
          </p>

          {site.tags.length > 0 && (
            <ul className="site-detail-tags" aria-label="Site tags">
              {site.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          )}

          <div className="site-detail-actions">
            <a href={site.url} target="_blank" rel="noopener noreferrer" className="btn accent">
              Visit {domain} <span aria-hidden="true">→</span>
            </a>
            <Link to={`/?category=${site.category}#explore`} className="btn ghost">
              More {categoryLabel(site.category)}
            </Link>
            {user ? (
              <button type="button" className="btn ghost" onClick={() => void toggleSaved(site.slug)}>
                {user.saved.includes(site.slug) ? "Saved ✓" : "Save site"}
              </button>
            ) : (
              <Link to="/auth" className="btn ghost">Sign in to save</Link>
            )}
            <ReportProblem siteName={site.name} siteUrl={site.url} slug={site.slug} />
          </div>
        </article>

        <section className="site-detail-facts" aria-label="Listing facts">
          <div><span>Category</span><strong>{categoryLabel(site.category)}</strong></div>
          <div><span>Launched</span><strong>{launched}</strong></div>
          <div><span>Community votes</span><strong>{site.trending ?? 0}</strong></div>
          <div><span>Directory rank</span><strong>{rank > 0 ? `#${rank} of ${sites.length}` : "—"}</strong></div>
        </section>

        <div className="site-detail-content">
          <section className="site-detail-section site-detail-about">
            <span className="section-eyebrow">A little context</span>
            <h2>About {site.name}</h2>
            <p>{site.description}</p>
            <a href={site.url} target="_blank" rel="noopener noreferrer" className="site-detail-canonical">
              {site.url}
            </a>
          </section>

          <section className="site-detail-section">
            <div className="site-detail-section-heading">
              <span className="section-eyebrow">The listing</span>
              <h2>More to know</h2>
            </div>
            {visibleExtras.length > 0 ? (
              <dl className="site-detail-extra-grid">
                {visibleExtras.map(([key, value]) => (
                  <div className="site-detail-extra" key={key}>
                    <dt>{humanizeKey(key)}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="site-detail-empty-note">
                This listing has the essentials for now. We add details like pricing, features, and FAQs as they come in.
              </p>
            )}
          </section>

          {lists.length > 0 && (
            <section className="site-detail-section">
              <div className="site-detail-section-heading">
                <span className="section-eyebrow">Hand-picked paths</span>
                <h2>In these collections</h2>
              </div>
              <ul className="site-detail-collection-list">
                {lists.map((collection) => (
                  <li key={collection.id}>
                    <Link to={`/collections/${collection.id}`}>
                      <span>{collection.title}</span>
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {neighbours.length > 0 && (
            <section className="site-detail-section site-detail-related">
              <div className="site-detail-section-heading">
                <span className="section-eyebrow">Keep wandering</span>
                <h2>More in {categoryLabel(site.category)}</h2>
              </div>
              <ul className="site-detail-related-grid">
                {neighbours.map((entry) => (
                  <li key={entry.id}>
                    <Link to={`/sites/${entry.slug}`} className="site-detail-related-card">
                      <SiteIcon site={entry} size={36} label={false} />
                      <span>
                        <strong>{entry.name}</strong>
                        <small>{siteDomain(entry.url)}</small>
                      </span>
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
