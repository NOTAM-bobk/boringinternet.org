/**
 * Cloudflare Worker that stores trending votes in Workers KV.
 *
 *   GET  /counts        -> { "site-slug": 12, ... }
 *   POST /vote          -> { slug, count }   body: { "slug": "site-slug" }
 *   POST /unvote        -> { slug, count }   body: { "slug": "site-slug" }
 *
 * Setup (see README):
 *   wrangler kv namespace create VOTES   # paste the id into wrangler.toml
 *   wrangler deploy
 */

const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;
const MAX_BODY_BYTES = 1024;

function cors(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(body, headers, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function readSlug(request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return null;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const slug = typeof parsed?.slug === "string" ? parsed.slug.trim().toLowerCase() : "";
  return SLUG.test(slug) ? slug : null;
}

async function readCount(env, slug) {
  return Number((await env.VOTES.get(slug)) ?? 0) || 0;
}

export default {
  async fetch(request, env) {
    const headers = cors(env);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    const { pathname } = new URL(request.url);

    if (pathname === "/counts" && request.method === "GET") {
      const counts = {};
      let cursor;
      do {
        const page = await env.VOTES.list({ cursor, limit: 1000 });
        for (const key of page.keys) {
          counts[key.name] = Number(key.metadata?.count ?? (await readCount(env, key.name))) || 0;
        }
        cursor = page.list_complete ? undefined : page.cursor;
      } while (cursor);
      return json(counts, headers);
    }

    if ((pathname === "/vote" || pathname === "/unvote") && request.method === "POST") {
      const slug = await readSlug(request);
      if (!slug) return json({ error: "invalid slug" }, headers, 400);

      const current = await readCount(env, slug);
      const next = pathname === "/vote" ? current + 1 : Math.max(0, current - 1);
      await env.VOTES.put(slug, String(next), {
        metadata: { count: next, updatedAt: Date.now() },
      });
      return json({ slug, count: next }, headers);
    }

    return json({ error: "not found" }, headers, 404);
  },
};
