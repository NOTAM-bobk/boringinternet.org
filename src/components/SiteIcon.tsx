import { useEffect, useState } from "react";
import type { Site } from "../lib/siteData";
import { siteInitials, siteTileStyle } from "../lib/siteTile";

/**
 * The site's real icon, in order of preference:
 *   1. the site's own /favicon.ico
 *   2. a keyless icon lookup for the domain (catches sites that only declare an
 *      icon in their HTML head)
 *   3. a monogram tile in the brand palette
 */
function attemptsFor(url: string): string[] {
  try {
    const { origin, hostname } = new URL(url);
    return [
      `${origin}/favicon.ico`,
      `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
    ];
  } catch {
    return [];
  }
}

export function SiteIcon({
  site,
  size = 40,
  label = true,
}: {
  site: Site;
  size?: number;
  label?: boolean;
}) {
  const [step, setStep] = useState(0);
  const attempts = attemptsFor(site.url);

  useEffect(() => {
    setStep(0);
  }, [site.url]);

  const src = step < attempts.length ? attempts[step] : null;
  const boxStyle = { width: size, height: size };

  if (src === null) {
    return (
      <span
        className="site-tile"
        style={{ ...siteTileStyle(site.slug), ...boxStyle, fontSize: Math.max(10, size * 0.32) }}
        aria-hidden="true"
      >
        {siteInitials(site.name)}
      </span>
    );
  }

  return (
    <span className="site-icon" style={boxStyle} title={label ? site.name : undefined}>
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setStep((current) => current + 1)}
      />
    </span>
  );
}
