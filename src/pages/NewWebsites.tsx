import { Link } from "react-router";
import { SiteSeo } from "../components/SeoHead";
import { SiteIcon } from "../components/SiteIcon";
import { newAdditions, siteName, siteUrl } from "../lib/siteData";
import { formatDate } from "../lib/posts";
import { siteDomain } from "../lib/siteTile";

export default function NewWebsites() {
  const latest = newAdditions(24);

  return (
    <>
      <SiteSeo
        title="New and upcoming websites"
        description={`Find new and upcoming websites from ${siteName}, including fresh launches and recently added discoveries.`}
        path="/new-websites"
        keywords={[
          "new and upcoming websites",
          "launch new websites",
          "find websites",
          "discover websites",
          "new website launches",
        ]}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `New and upcoming websites on ${siteName}`,
            url: `${siteUrl}/new-websites`,
            description: "Recently launched and newly discovered websites.",
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "New and upcoming websites list",
            url: `${siteUrl}/new-websites`,
            numberOfItems: latest.length,
            itemListElement: latest.map((site, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: { "@type": "WebSite", name: site.name, url: site.url, description: site.description },
            })),
          },
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
        <header className="flex flex-col gap-3 border-b pb-6" style={{ borderColor: "var(--rule)" }}>
          <span className="accent-text text-[11px] font-bold tracking-[0.2em] uppercase">
            New and upcoming websites
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em]">
            Find what just <span className="accent-text">launched</span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "var(--muted)" }}>
            Track recent launches, see what is newly added, and discover websites before they become
            crowded.
          </p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Prefer browsing by intent? Visit{" "}
            <Link to="/discover-websites" className="accent-text font-bold underline underline-offset-4">
              discover websites
            </Link>{" "}
            or open{" "}
            <Link to="/collections" className="accent-text font-bold underline underline-offset-4">
              curated collections
            </Link>
            .
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((site) => (
            <li key={site.id} className="card p-4 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <SiteIcon site={site} size={30} />
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold hover:underline underline-offset-4"
                  style={{ color: "var(--ink)" }}
                >
                  {site.name}
                </a>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                {site.description}
              </p>
              <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
                {site.launched ? formatDate(site.launched) : "Recently added"} · {siteDomain(site.url)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
