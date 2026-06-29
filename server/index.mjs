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

async function spotifyGet(path) {
  const t = await getToken();
  const res = await fetch(`https://api.spotify.com/v1/${path.replace(/^\/+/, "")}`, {
    headers: { Authorization: "Bearer " + t },
  });
  if (!res.ok) throw new Error(`spotify-${res.status}`);
  return res.json();
}

async function lookupArtist(name) {
  if (!name) return null;
  if (cache.has(name)) return cache.get(name);
  const j = await spotifyGet(`search?type=artist&limit=1&q=${encodeURIComponent(name)}`);
  const a = j.artists?.items?.[0];
  const out = a
    ? { id: a.id, name: a.name, image: a.images?.[0]?.url, followers: a.followers?.total, genres: a.genres }
    : null;
  cache.set(name, out);
  return out;
}

function mapAlbumTrack(track, album) {
  return {
    id: `spotify-${track.id}`,
    spotifyId: track.id,
    spotifyUri: track.uri,
    spotifyUrl: track.external_urls?.spotify,
    title: track.name,
    artist: track.artists?.map((a) => a.name).join(", ") || "Unknown artist",
    artistIds: track.artists?.map((a) => a.id).filter(Boolean) || [],
    album: album.name,
    artwork: album.images?.[0]?.url,
    url: track.preview_url || "",
    previewUrl: track.preview_url || undefined,
    durationSec: track.duration_ms ? Math.round(track.duration_ms / 1000) : 30,
    source: "spotify",
    market: "IN",
    karaokeStatus: "unavailable",
  };
}

async function lookupUniverseTracks(artistNames, perArtist) {
  const out = [];
  for (const name of artistNames) {
    const artist = await lookupArtist(name);
    if (!artist?.id) continue;
    const albums = await spotifyGet(
      `artists/${artist.id}/albums?include_groups=album,single,appears_on&market=IN&limit=30`
    );
    const seenAlbums = new Set();
    const selectedAlbums = (albums.items || []).filter((album) => {
      if (!album?.id || seenAlbums.has(album.id)) return false;
      seenAlbums.add(album.id);
      return true;
    });

    const artistTracks = [];
    for (const albumRef of selectedAlbums) {
      if (artistTracks.length >= perArtist) break;
      const album = await spotifyGet(`albums/${albumRef.id}?market=IN`);
      const tracks = album.tracks?.items || [];
      artistTracks.push(...tracks.map((track) => mapAlbumTrack(track, album)));
    }
    out.push(...artistTracks.slice(0, perArtist));
  }

  const seen = new Set();
  return out.filter((track) => {
    const key = track.spotifyId || `${track.title}-${track.artist}-${track.durationSec}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

  if (url.pathname === "/api/spotify/universe") {
    try {
      const artistNames = (url.searchParams.get("artists") || "")
        .split("|")
        .map((name) => name.trim())
        .filter(Boolean)
        .slice(0, 120);
      const perArtist = Math.min(80, Math.max(5, Number(url.searchParams.get("perArtist")) || 30));
      const tracks = await lookupUniverseTracks(artistNames, perArtist);
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: true, tracks }));
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
