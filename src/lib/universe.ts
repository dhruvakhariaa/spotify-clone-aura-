import { ROSTER } from "../data/roster";
import { tracksFromArtists, type PlayableTrack } from "./catalog";
import { searchSpotifyTracks } from "./spotifyApi";
import { hasSupabaseConfig, supabaseRest, supabaseUpsert } from "./supabaseClient";

const TRACKS_KEY = "aura.universe.tracks";
const PROMPT_KEY = "aura.universe.prompted";

export interface UniverseTrack extends PlayableTrack {
  source: "itunes" | "spotify";
  spotifyId?: string;
  spotifyUri?: string;
  spotifyUrl?: string;
  album?: string;
  market?: string;
  artistIds?: string[];
  previewUrl?: string;
  karaokeStatus?: "ready" | "pending" | "unavailable";
  karaokeUrl?: string;
}

export function hasSeenUniversePrompt() {
  return localStorage.getItem(PROMPT_KEY) === "1";
}

export function markUniversePromptSeen() {
  localStorage.setItem(PROMPT_KEY, "1");
}

export function getCachedUniverseTracks(): UniverseTrack[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(TRACKS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCachedUniverseTracks(tracks: UniverseTrack[]) {
  localStorage.setItem(TRACKS_KEY, JSON.stringify(tracks));
}

function normalizeKey(track: Pick<PlayableTrack, "title" | "artist" | "durationSec">) {
  const text = `${track.title}-${track.artist}`.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const dur = Math.round((track.durationSec || 0) / 5) * 5;
  return `${text}-${dur}`;
}

export function dedupeTracks<T extends PlayableTrack>(tracks: T[]): T[] {
  const seen = new Set<string>();
  return tracks.filter((track) => {
    const key = track.spotifyId ?? normalizeKey(track);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function fisherYates<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function mapSpotifyTrack(item: any): UniverseTrack | null {
  if (!item?.id || !item?.uri || !item?.name) return null;
  const artist = item.artists?.map((a: any) => a.name).join(", ") || "Unknown artist";
  return {
    id: `spotify-${item.id}`,
    spotifyId: item.id,
    spotifyUri: item.uri,
    spotifyUrl: item.external_urls?.spotify,
    title: item.name,
    artist,
    artistIds: item.artists?.map((a: any) => a.id).filter(Boolean),
    album: item.album?.name,
    artwork: item.album?.images?.[0]?.url,
    url: item.preview_url ?? "",
    previewUrl: item.preview_url ?? undefined,
    durationSec: item.duration_ms ? Math.round(item.duration_ms / 1000) : 30,
    source: "spotify",
    market: "IN",
    karaokeStatus: "unavailable",
  };
}

export async function searchSpotifyCatalog(term: string, limit = 24) {
  const response = await searchSpotifyTracks(term, limit, "IN");
  const tracks = Array.isArray(response?.tracks?.items) ? response.tracks.items : [];
  const mapped = tracks.map(mapSpotifyTrack).filter(Boolean) as UniverseTrack[];
  return applyKaraokeAssets(dedupeTracks(mapped));
}

async function discoverFromSpotify(perArtist: number) {
  const proxy = import.meta.env.VITE_SPOTIFY_PROXY?.replace(/\/+$/, "");
  if (proxy) {
    const params = new URLSearchParams({
      artists: ROSTER.map((artist) => artist.name).join("|"),
      perArtist: String(Math.min(80, Math.max(5, perArtist))),
    });
    const response = await fetch(`${proxy}/api/spotify/universe?${params.toString()}`);
    if (!response.ok) throw new Error(`Universe proxy ${response.status}`);
    const json = await response.json();
    if (!json?.ok || !Array.isArray(json.tracks)) throw new Error("Universe proxy failed");
    return json.tracks as UniverseTrack[];
  }

  const batches = await Promise.allSettled(
    ROSTER.map(async (artist) => {
      const response = await searchSpotifyTracks(`artist:${artist.name}`, perArtist, "IN");
      const tracks = Array.isArray(response?.tracks?.items) ? response.tracks.items : [];
      return tracks.map(mapSpotifyTrack).filter(Boolean) as UniverseTrack[];
    })
  );
  return batches.flatMap((batch) => (batch.status === "fulfilled" ? batch.value : []));
}

async function discoverFallback(perArtist: number) {
  const tracks = await tracksFromArtists(ROSTER.map((a) => a.name), perArtist);
  return tracks.map((track) => ({
    ...track,
    previewUrl: track.url,
    karaokeStatus: "unavailable" as const,
  }));
}

async function persistUniverse(tracks: UniverseTrack[]) {
  if (!hasSupabaseConfig()) return;
  const artists = ROSTER.map((artist) => ({
    id: artist.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: artist.name,
    category: artist.category,
    image: null,
    sync_status: "seeded",
  }));
  const rows = tracks.map((track) => ({
    id: track.id,
    spotify_id: track.spotifyId ?? null,
    spotify_uri: track.spotifyUri ?? null,
    title: track.title,
    artist_names: track.artist,
    artist_ids: track.artistIds ?? [],
    album: track.album ?? null,
    artwork: track.artwork ?? null,
    duration_sec: track.durationSec,
    market: track.market ?? "IN",
    preview_url: track.previewUrl ?? track.url ?? null,
    source_metadata: { source: track.source, spotifyUrl: track.spotifyUrl ?? null },
  }));
  await Promise.allSettled([supabaseUpsert("artists", artists), supabaseUpsert("tracks", rows)]);
}

async function applyKaraokeAssets(tracks: UniverseTrack[]) {
  if (!hasSupabaseConfig() || !tracks.length) return tracks;
  try {
    const rows = await supabaseRest<Array<{ track_id: string; instrumental_url: string; status: string }>>(
      "karaoke_assets?status=eq.ready&select=track_id,instrumental_url,status"
    );
    const byTrack = new Map(rows.map((row) => [row.track_id, row]));
    return tracks.map((track) => {
      const asset = byTrack.get(track.id);
      if (!asset?.instrumental_url) return track;
      return { ...track, karaokeStatus: "ready" as const, karaokeUrl: asset.instrumental_url };
    });
  } catch {
    return tracks;
  }
}

export async function buildAuraUniverse(perArtist = 12) {
  let tracks: UniverseTrack[] = [];
  try {
    tracks = await discoverFromSpotify(perArtist);
  } catch {
    tracks = [];
  }
  if (!tracks.length) tracks = await discoverFallback(Math.min(4, perArtist));
  const deduped = dedupeTracks(tracks).filter((track) => track.spotifyUri || track.url);
  const withKaraoke = await applyKaraokeAssets(deduped);
  writeCachedUniverseTracks(withKaraoke);
  persistUniverse(withKaraoke).catch(() => {});
  return withKaraoke;
}

export async function ensureAuraUniverse() {
  const cached = getCachedUniverseTracks();
  if (cached.length) return applyKaraokeAssets(cached);
  return buildAuraUniverse();
}
