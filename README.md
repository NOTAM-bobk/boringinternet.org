# Boring Internet

A quiet directory of launched sites. Everything on the page comes out of one
editable file, and the only server-side piece is a small Cloudflare Worker that
counts trending votes.

## Editing the directory

`sites.json` at the repo root is the whole catalog:

- `site` / `tagline` — brand text used in the header, footer, and SEO tags
- `categories` — the chips shown above the grid
- `sites[]` — `name`, `slug`, `url`, `description`, `category`, `tags`,
  `trending` (vote seed / ranking score), `launched` (date)
- `collections[]` — `title`, `description`, `siteSlugs[]`, rendered as the
  collection cards on the home page

Add an entry, redeploy, done. There is nothing to upload per site: each row
tries the site's own `/favicon.ico`, then a keyless icon lookup for the domain,
then falls back to a monogram tile built from the name.

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

## Trending votes, submissions, and admin

The Worker at `cloudflare/votes-worker.js` does three things, all on Workers KV:

| Route | Who | What |
| --- | --- | --- |
| `GET /counts` | public | vote counts per site slug |
| `POST /vote`, `POST /unvote` | public | add or remove one vote |
| `POST /submit` | public | store a pending site submission (`/submit` page) |
| `POST /admin/submissions` | password | list submissions for review (`/admin` page) |
| `POST /admin/review` | password | set a submission to `approved` / `rejected` |
| `GET /health` | public | liveness + whether the admin password is set |

Deployed at `https://boring-internet-votes.sawyerbobk563.workers.dev`.

Setup notes:

1. `wrangler kv namespace create VOTES`, then paste the id into
   `cloudflare/wrangler.toml`
2. `wrangler secret put ADMIN_PASSWORD` — the review queue password, kept as a
   Worker secret (never in the repo or the browser bundle)
3. `wrangler deploy --config cloudflare/wrangler.toml`
4. Set the site's `VITE_VOTES_API_URL` to the Worker URL

Until `VITE_VOTES_API_URL` is set the pages say so: votes fall back to
localStorage and the submit form is disabled.

Two KV behaviours are worth knowing: writes take up to ~60 seconds to appear
in reads from other locations (the admin page therefore polls every 30s while
unlocked), and neither `/submit` nor `/vote` is rate limited yet, so treat the
queue as trustworthy only behind the password.
