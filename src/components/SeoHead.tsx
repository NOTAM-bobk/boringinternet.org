import { siteName, siteTagline, sites } from "../lib/siteData";

export function SeoHead({
  title,
  description,
  canonical,
}: {
  title?: string;
  description?: string;
  canonical?: string;
}) {
  const siteTitle = title
    ? `${title} — ${siteName}`
    : siteName;
  const siteDescription =
    description ?? siteTagline ?? "A small list of launched sites.";

  const homepageUrl =
    typeof window !== "undefined"
      ? window.location.origin + "/"
      : "https://example.com/";

  const pageUrl = canonical ??
    (typeof window !== "undefined"
      ? window.location.href
      : homepageUrl);

  const ogImage = `${homepageUrl}og.png`;

  return (
    <>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={pageUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:alt" content={`${siteName} — a quiet list of launched sites`} />
      <meta name="twitter:image:alt" content={`${siteName} — a quiet list of launched sites`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={ogImage} />

      <link rel="icon" href="/favicon.ico" sizes="32x32" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.webmanifest" />
      <meta name="theme-color" content="#1a120b" />
    </>
  );
}

export function SiteSeo({
  title,
  description,
  path,
}: {
  title: string;
  description?: string;
  path: string;
}) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://example.com";
  return (
    <SeoHead
      title={title}
      description={description}
      canonical={`${origin}${path}`}
    />
  );
}

export function HomepageSeo() {
  const totalSites = sites.length;
  const description = `${siteTagline} ${totalSites} launched site${totalSites === 1 ? "" : "s"}. Clean, minimal, easy to browse.`;
  const canonical =
    typeof window !== "undefined"
      ? window.location.origin + "/"
      : "https://example.com/";

  return (
    <SeoHead
      title={siteName}
      description={description}
      canonical={canonical}
    />
  );
}
