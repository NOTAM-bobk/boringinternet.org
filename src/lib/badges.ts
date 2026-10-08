/**
 * The "featured on" badges shown in the footer carousel.
 *
 * Add an entry per badge — the provider gives you an anchor around an image, and
 * these fields are that markup: `href` is the link target, `image` is the badge
 * file, and `width`/`height` are its pixel size so the row never jumps.
 */
export interface FeatureBadge {
  id: string;
  /** Used for the carousel dot's accessible name. */
  name: string;
  href: string;
  image: string;
  width: number;
  height: number;
  alt: string;
}

export const featureBadges: FeatureBadge[] = [
  {
    id: "nick-launches",
    name: "Nick Launches",
    href: "https://nicklaunches.com/",
    image: "https://nicklaunches.com/badges/featured-premium-dark.png",
    width: 244,
    height: 56,
    alt: "Featured on Nick Launches",
  },
];
