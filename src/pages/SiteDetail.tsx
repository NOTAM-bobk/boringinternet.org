import { Link, useParams } from "react-router";
import { SiteIcon } from "../components/SiteIcon";
import { SiteSeo } from "../components/SeoHead";
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

/** Where a value first appears, so the listing reads in a sensible order. */
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
  const site = siteBySlug(slug);

  if (!site) {
    return (
      <>
        <SiteSeo title="Site not found" path={`/sites/${slug}`} noindex />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center gap-4 text-center">
          <span
            className="text-[11px] font-bold tracking-[0.2em] uppercase border px-3 py-2"
            style={{ borderColor: "var(--ink)" }}
          >
            404
          </span>
          <h1 className="text-3xl font-bold tracking-[-0.02em]">That site is not listed</h1>
          <p className="max-w-md" style={{ color: "var(--muted)" }}>
            “{slug}” is not one of the {sites.length} sites on {siteName}.
          </p>
          <Link to="/" className="nav-cta">
            Browse the list
          </Link>
        </div>
      </>
    );
  }

  const rank = rankedSites().findIndex((entry) => entry.slug === site.slug) + 1;
  const lists = collections.filter((collection) => collection.siteSlugs.includes(site.slug));
  const neighbours = sitesByCategory(site.category)
    .filter((entry) => entry.slug !== site.slug)
    .slice(0, 6);
  const domain = siteDomain(site.url);

  const rows: Array<[string, string]> = [
    ["Category", categoryLabel(site.category)],
    ["Tags", site.tags.length > 0 ? site.tags.join(", ") : "—"],
    ["Launched", site.launched ? formatDate(site.launched) : "—"],
    ["Votes", String(site.trending ?? 0)],
    ["Directory rank", rank > 0 ? `#${rank} of ${sites.length}` : "—"],
    ["Domain", domain],
    ["Slug", site.slug],
  ];

  const extras = Object.entries(site.extras ?? {}).sort(([a], [b]) => {
    const rankA = DETAIL_ORDER.indexOf(a);
    const rankB = DETAIL_ORDER.indexOf(b);
    if (rankA === -1 && rankB === -1) return a.localeCompare(b);
    if (rankA === -1) return 1;
    if (rankB === -1) return -1;
    return rankA - rankB;
  });
  const pageUrl = `${siteUrl}/sites/${site.slug}`;

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

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
        <header className="flex flex-col gap-4 border-b pb-6" style={{ borderColor: "var(--rule)" }}>
          <Link to="/" className="text-[11px] font-bold tracking-[0.2em] uppercase accent-text">
            ← All {sites.length} sites
          </Link>

          <div className="flex items-center gap-4">
            <SiteIcon site={site} size={56} label={false} />
            <div className="min-w-0 flex flex-col gap-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em]">{site.name}</h1>
              <span className="text-[12px] font-mono" style={{ color: "var(--muted)" }}>
                {domain}
              </span>
            </div>
          </div>

          <p className="text-base leading-relaxed" style={{ color: "var(--muted)" }}>
            {site.description}
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn accent"
            >
              Open {domain} <span aria-hidden="true">→</span>
            </a>
            <Link to={`/?category=${site.category}#explore`} className="btn ghost">
              More {categoryLabel(site.category)}
            </Link>
          </div>

          <p className="text-[12px] font-mono break-all" style={{ color: "var(--muted)" }}>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              {site.url}
            </a>
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-[-0.01em]">Details</h2>
          <dl className="detail-list">
            {rows.map(([key, value]) => (
              <div className="detail-row" key={key}>
                <dt className="detail-key">{key}</dt>
                <dd className="detail-value">{value}</dd>
              </div>
            ))}
            {extras.map(([key, value]) => (
              <div className="detail-row" key={key}>
                <dt className="detail-key">{humanizeKey(key)}</dt>
                <dd className="detail-value">{value}</dd>
              </div>
            ))}
          </dl>
          {extras.length === 0 && (
            <p className="text-[12px]" style={{ color: "var(--muted)" }}>
              This listing came with the fields above. Anything submitted with a site — tagline,
              pricing, FAQ, and so on — is printed here the moment it is added to the listing.
            </p>
          )}
        </section>

        {lists.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-bold tracking-[-0.01em]">In these collections</h2>
            <ul className="flex flex-col gap-2">
              {lists.map((collection) => (
                <li key={collection.id}>
                  <Link
                    to={`/collections/${collection.id}`}
                    className="text-sm font-bold accent-text underline underline-offset-4"
                  >
                    {collection.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {neighbours.length > 0 && (
          <section className="space-y-3 border-t pt-6" style={{ borderColor: "var(--rule)" }}>
            <h2 className="text-xl font-bold tracking-[-0.01em]">
              More in {categoryLabel(site.category)}
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {neighbours.map((entry) => (
                <li key={entry.id}>
                  <Link
                    to={`/sites/${entry.slug}`}
                    className="card card-link p-3 flex items-center gap-3"
                  >
                    <SiteIcon site={entry} size={30} label={false} />
                    <span className="min-w-0 flex flex-col">
                      <span className="text-sm font-bold truncate" style={{ color: "var(--ink)" }}>
                        {entry.name}
                      </span>
                      <span className="text-[11px] font-mono truncate" style={{ color: "var(--muted)" }}>
                        {siteDomain(entry.url)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
