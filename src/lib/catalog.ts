/**
 * Catalog client — real, recognizable music for everyone with no login.
 *
 * Playback + artwork come from the iTunes Search API (CORS-enabled, no auth,
 * 30-second previews, covers Bollywood/Tollywood/Hollywood/indie). Real artist
 * *headshots* are layered on top via the Spotify proxy (see lib/artistImage.ts)
 * when configured — iTunes only exposes album/track art.
 */

import { isSpotifyPremium, spotifyCatalogSearch } from "./spotifyApi";

export type Source = "itunes" | "spotify";

export interface PlayableTrack {
  id: string;
  title: string;
  artist: string;
  artwork?: string;
  /** Playable audio URL (a 30s preview). */
  url: string;
  /** Spotify full-track identifiers when available. */
  spotifyId?: string;
  spotifyUri?: string;
  spotifyUrl?: string;
  /** Preview URL kept separately so karaoke/Spotify modes can swap audio sources safely. */
  previewUrl?: string;
  album?: string;
  karaokeStatus?: "ready" | "pending" | "unavailable";
  karaokeUrl?: string;
  durationSec: number;
  genre?: string;
  source: Source;
}

/** Upscale iTunes artwork (default thumbs are 100x100). */
export function artUrl(raw: string | undefined, size = 600): string | undefined {
  return raw ? raw.replace(/\/\d+x\d+bb\.(jpg|png)/, `/${size}x${size}bb.$1`) : undefined;
}

function mapItunes(x: any): PlayableTrack {
  return {
    id: `itunes-${x.trackId}`,
    title: x.trackName,
    artist: x.artistName,
    artwork: artUrl(x.artworkUrl100, 600),
    url: x.previewUrl,
    previewUrl: x.previewUrl,
    album: x.collectionName,
    durationSec: x.trackTimeMillis ? Math.round(x.trackTimeMillis / 1000) : 30,
    genre: x.primaryGenreName,
    source: "itunes",
  };
}

async function itunes(params: Record<string, string>): Promise<any[]> {
  const u = new URL("https://itunes.apple.com/search");
  u.searchParams.set("media", "music");
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u.toString());
  if (!r.ok) throw new Error(`iTunes ${r.status}`);
  const j = await r.json();
  return Array.isArray(j.results) ? j.results : [];
}

/** Search songs by free text (artist, title, etc.). Premium-linked accounts get
 *  Spotify results (full-track URIs); everyone else gets iTunes previews. */
export async function searchSongs(term: string, limit = 24): Promise<PlayableTrack[]> {
  if (await isSpotifyPremium()) {
    try {
      const spotify = await spotifyCatalogSearch(term, limit);
      if (spotify.length) return spotify;
    } catch {
      /* fall through to iTunes */
    }
  }
  const rows = await itunes({ term, entity: "song", limit: String(limit) });
  return rows.filter((x) => x.previewUrl).map(mapItunes);
}

/** Top tracks for a specific artist (best-effort filter to that artist).
 *  Premium-linked accounts get Spotify full-track results. */
export async function tracksByArtist(artist: string, limit = 12): Promise<PlayableTrack[]> {
  if (await isSpotifyPremium()) {
    try {
      const spotify = await spotifyCatalogSearch(`artist:${artist}`, limit);
      if (spotify.length) return spotify.slice(0, limit);
    } catch {
      /* fall through to iTunes */
    }
  }
  const rows = await itunes({ term: artist, entity: "song", limit: String(limit * 2), attribute: "artistTerm" });
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const want = norm(artist);
  const tracks = rows
    .filter((x) => x.previewUrl)
    .map(mapItunes)
    .filter((t) => norm(t.artist).includes(want) || want.includes(norm(t.artist)));
  // De-dupe by title.
  const seen = new Set<string>();
  return tracks.filter((t) => {
    const k = t.title.toLowerCase().split("(")[0].trim();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, limit);
}

/** Albums that aren't a single artist's own work — their covers look generic and
 *  often collide across artists (e.g. two Bollywood singers → same "Best of" art). */
const COMPILATION_RE = /\b(best of|greatest|hits|collection|world music|top \d+|vol\.?\s*\d+|various|mega|jukebox|mashup|non[-\s]?stop|all[-\s]?time|romantic songs|love songs)\b/i;

/** A representative cover image for an artist. Prefers a cover from one of the
 *  artist's own (non-compilation) releases so images stay distinct and on-brand. */
export async function artistCover(artist: string): Promise<string | undefined> {
  try {
    const rows = await itunes({ term: artist, entity: "song", limit: "25", attribute: "artistTerm" });
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const want = norm(artist);
    const mine = rows.filter(
      (x) => x.artworkUrl100 && (norm(x.artistName ?? "").includes(want) || want.includes(norm(x.artistName ?? "")))
    );
    const preferred = mine.find((x) => x.collectionName && !COMPILATION_RE.test(x.collectionName)) ?? mine[0];
    return artUrl(preferred?.artworkUrl100, 600);
  } catch {
    return undefined;
  }
}

/** Build a mixed queue from several artists (used for Aura Radio). */
export async function tracksFromArtists(artists: string[], perArtist = 2): Promise<PlayableTrack[]> {
  const results = await Promise.allSettled(artists.map((a) => tracksByArtist(a, perArtist)));
  const out: PlayableTrack[] = [];
  results.forEach((r) => {
    if (r.status === "fulfilled") out.push(...r.value.slice(0, perArtist));
  });
  return out;
}

export function fmtTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
