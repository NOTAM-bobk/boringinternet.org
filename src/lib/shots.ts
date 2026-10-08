import { siteDomain } from "./siteTile";

/**
 * Live preview of a site, rendered on thum.io's servers and streamed back as an
 * image — so the browser never has to draw the thumbnail itself. No API key
 * needed; `allowJPG` keeps the payload small and `maxAge` keeps it cached.
 *
 * The default 960x800 pair comes back as a 960x600 (16:10) image, which is the
 * aspect ratio the preview cards use.
 */
export function screenshotUrl(
  url: string,
  width = 960,
  crop = 800,
  maxAgeHours = 72,
): string {
  return `https://image.thum.io/get/width/${width}/crop/${crop}/allowJPG/maxAge/${maxAgeHours}/${url}`;
}

/**
 * Site icons rendered server-side at the exact pixel size we display, so cards
 * get a crisp bitmap even when the site only declares its icon in <head>.
 */
export function serverIconUrl(url: string, size: number): string {
  const host = siteDomain(url);
  const px = size <= 16 ? 16 : size <= 32 ? 32 : size <= 64 ? 64 : 128;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${px}`;
}
