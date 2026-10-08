import { useEffect, useState } from "react";
import { featureBadges } from "../lib/badges";

/** How long a badge stays up before the carousel moves on. */
const ROTATE_MS = 5200;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * The "featured on" strip: one badge at a time, rotating on a timer and pausing
 * while you hover or tab through it. Add more badges to `src/lib/badges.ts` and
 * they join the rotation — a single badge just sits there, no dots, no timer.
 */
export function FeatureBadges() {
  const count = featureBadges.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (count < 2 || paused || prefersReducedMotion()) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  if (count === 0) return null;

  return (
    <div
      className="footer-badges"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <p className="footer-badges-label">Featured on</p>

      <div className="badge-viewport">
        {featureBadges.map((badge, i) => (
          <a
            key={badge.id}
            href={badge.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`badge-slide${i === index ? " badge-slide-active" : ""}`}
            aria-hidden={i === index ? undefined : true}
            tabIndex={i === index ? undefined : -1}
          >
            <img
              src={badge.image}
              alt={badge.alt}
              width={badge.width}
              height={badge.height}
              loading="lazy"
              decoding="async"
            />
          </a>
        ))}
      </div>

      {count > 1 && (
        <div className="badge-dots" aria-label="Choose a featured-on badge">
          {featureBadges.map((badge, i) => (
            <button
              key={badge.id}
              type="button"
              className={`badge-dot${i === index ? " badge-dot-active" : ""}`}
              aria-label={`Show the ${badge.name} badge`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
