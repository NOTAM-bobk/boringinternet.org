import { useEffect, useState, type CSSProperties } from "react";
import { launches, launchesTitle } from "../lib/launches";
import { prefersReducedMotion } from "../lib/motion";
import { siteDomain } from "../lib/siteTile";
import { SiteIcon } from "./SiteIcon";

/** How long a launch stays up before the row slides to the next one. */
const ROTATE_MS = 5000;

/**
 * The "Launches this week" ticker: one launch at a time, sliding up to the
 * next every five seconds, pausing while a pointer or a keyboard is on it.
 * The list lives in `config/launches.json`; with no entries the whole section
 * stays out of the page.
 */
export function LaunchesThisWeek() {
  const count = launches.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (count < 2 || paused || prefersReducedMotion()) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  if (count === 0) return null;

  return (
    <section className="space-y-4">
      <div
        className="sec-head flex items-end justify-between gap-4 border-b pb-3"
        style={{ borderColor: "var(--rule)" }}
      >
        <h2 className="text-xl font-bold tracking-[-0.01em]">{launchesTitle}</h2>
        <span className="hidden sm:inline text-[11px] font-mono" style={{ color: "var(--muted)" }}>
          {count === 1 ? "1 launch" : `${count} launches`}
        </span>
      </div>

      <div
        className="launch-ticker"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <ol className="launch-track" style={{ "--launch-index": index } as CSSProperties}>
          {launches.map((launch, i) => (
            <li key={launch.id} className="launch-row" aria-hidden={i === index ? undefined : true}>
              <SiteIcon site={launch} size={40} label={false} />
              <div className="launch-copy">
                <a
                  href={launch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="launch-name"
                  tabIndex={i === index ? undefined : -1}
                >
                  {launch.name}
                </a>
                {launch.description && <p className="launch-line">{launch.description}</p>}
              </div>
              <span className="launch-domain">{siteDomain(launch.url)}</span>
            </li>
          ))}
        </ol>
      </div>

      {count > 1 && (
        <div className="carousel-dots" aria-label="Choose a launch">
          {launches.map((launch, i) => (
            <button
              key={launch.id}
              type="button"
              className={`carousel-dot${i === index ? " carousel-dot-active" : ""}`}
              aria-label={`Show ${launch.name}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
