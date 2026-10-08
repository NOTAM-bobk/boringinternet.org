# Boring Internet

A quiet directory of launched sites. Everything on the page comes out of one
editable file, and the only server-side piece is a small Cloudflare Worker that
counts trending votes.

## Editing the directory

`sites.json` at the repo root is the whole catalog:

- `site` / `tagline` — brand text used in the header, footer, and SEO tags
- `categories` — the chips shown above the grid
- `sites[]` — `name`, `slug`, `url`, `description`, `category`, `tags`,
  `trending` (ranking score), `launched` (date)

Add an entry, redeploy, done. The site icon for each row is a monogram tile
generated from the name, so there is nothing to upload per site.

## Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Vite dev server |
| `bun run build` | Typecheck and build to `dist/` |
| `bun run icons` | Regenerate the whole icon set (see below) |
| `bun run lint` | oxlint |

## Icons

`bun run icons` (`scripts/generate-icons.mjs`, no dependencies) draws the mark —
an ink tile with three stacked bars, the middle one in the brand orange — and
writes:

- `public/favicon.svg` — modern browsers and the tab strip
- `public/favicon.ico` — 16/32/48 px fallback for legacy browsers
- `public/icon-32.png`, `public/icon-192.png`, `public/icon-512.png`
- `public/apple-touch-icon.png` — iOS home screen
- `public/og.png` — 1200×630 card for search results and social previews
- `public/manifest.webmanifest` — installable app metadata

`index.html` and `src/components/SeoHead.tsx` link all of them. The OG tag
points at `og.png`; change the brand colours in the script and re-run it if the
palette moves.

## Trending votes

`src/pages/Trending.tsx` lists the top 51 sites as a stack. Vote counts live in
the Worker at `cloudflare/votes-worker.js`, backed by Workers KV.

1. `cd cloudflare && wrangler kv namespace create VOTES`
2. Paste the printed id into `cloudflare/wrangler.toml`
3. `wrangler deploy`
4. Set the site's `VITE_VOTES_API_URL` to the deployed Worker URL
   (e.g. `https://boring-internet-votes.<account>.workers.dev`) and set
   `ALLOWED_ORIGIN` in `wrangler.toml` to the site's origin
5. Redeploy the site

Until `VITE_VOTES_API_URL` is set the page says so and keeps votes in the
browser's localStorage, so the UI is usable but votes are not shared.
