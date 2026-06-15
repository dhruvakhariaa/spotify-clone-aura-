/**
 * Tiny zero-dependency Spotify token proxy.
 *
 * Holds the client secret server-side (it must NEVER ship to the browser) and
 * exposes real artist headshots via the Spotify Web API search endpoint, which
 * is still available with a client-credentials (app) token — no user login.
 *
 * Run:  npm run server   (needs a .env with SPOTIFY_CLIENT_ID / _SECRET)
 * The frontend falls back to iTunes artwork when this isn't running.
 */
import { createServer } from "node:http";

const PORT = process.env.PORT || 8787;
const ID = process.env.SPOTIFY_CLIENT_ID;
const SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let token = null;
let tokenExp = 0;

async function getToken() {
  if (token && Date.now() < tokenExp) return token;
  if (!ID || !SECRET) throw new Error("no-creds");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(`${ID}:${SECRET}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`token-${res.status}`);
  const j = await res.json();
  token = j.access_token;
  tokenExp = Date.now() + (j.expires_in - 60) * 1000;
  return token;
}

const cache = new Map();

async function lookupArtist(name) {
  if (!name) return null;
  if (cache.has(name)) return cache.get(name);
  const t = await getToken();
  const res = await fetch(
    `https://api.spotify.com/v1/search?type=artist&limit=1&q=${encodeURIComponent(name)}`,
    { headers: { Authorization: "Bearer " + t } }
  );
  if (!res.ok) throw new Error(`search-${res.status}`);
  const j = await res.json();
  const a = j.artists?.items?.[0];
  const out = a
    ? { name: a.name, image: a.images?.[0]?.url, followers: a.followers?.total, genres: a.genres }
    : null;
  cache.set(name, out);
  return out;
}

createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/spotify/artist") {
    try {
      const artist = await lookupArtist(url.searchParams.get("name") || "");
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: true, artist }));
    } catch (e) {
      res.statusCode = e.message === "no-creds" ? 503 : 502;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }

  if (url.pathname === "/api/health") {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true, hasCreds: Boolean(ID && SECRET) }));
    return;
  }

  res.statusCode = 404;
  res.end("not found");
}).listen(PORT, () => {
  console.log(`AURA Spotify proxy on :${PORT} — creds: ${Boolean(ID && SECRET)}`);
});
