/**
 * Minimal Audius client — free, open, no-auth catalog of full-length real tracks.
 * Used so AURA has genuine playback without any Spotify licensing.
 */

export interface AudiusTrack {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
  genre?: string;
  mood?: string;
  artwork?: string;
  streamUrl: string;
}

const APP = "AURA";
const FALLBACK_HOSTS = [
  "https://discoveryprovider.audius.co",
  "https://discoveryprovider2.audius.co",
  "https://discoveryprovider3.audius.co",
];

let hostPromise: Promise<string> | null = null;

/** Resolve a healthy Audius discovery host (cached for the session). */
function getHost(): Promise<string> {
  if (hostPromise) return hostPromise;
  hostPromise = (async () => {
    try {
      const r = await fetch("https://api.audius.co");
      const j = await r.json();
      const hosts: string[] = Array.isArray(j?.data) ? j.data : [];
      if (hosts.length) return hosts[Math.floor(Math.random() * Math.min(hosts.length, 5))];
    } catch {
      /* fall through to fallback */
    }
    return FALLBACK_HOSTS[0];
  })();
  return hostPromise;
}

function mapTrack(host: string, t: any): AudiusTrack {
  const art = t?.artwork
    ? t.artwork["480x480"] || t.artwork["150x150"] || t.artwork["1000x1000"]
    : undefined;
  return {
    id: String(t.id),
    title: t.title ?? "Untitled",
    artist: t.user?.name ?? t.user?.handle ?? "Unknown Artist",
    durationSec: Number(t.duration) || 0,
    genre: t.genre || undefined,
    mood: t.mood || undefined,
    artwork: art,
    streamUrl: `${host}/v1/tracks/${t.id}/stream?app_name=${APP}`,
  };
}

async function fetchTracks(path: string, params: Record<string, string>): Promise<AudiusTrack[]> {
  const host = await getHost();
  const u = new URL(`${host}${path}`);
  u.searchParams.set("app_name", APP);
  for (const [k, v] of Object.entries(params)) if (v) u.searchParams.set(k, v);
  const r = await fetch(u.toString());
  if (!r.ok) throw new Error(`Audius ${r.status}`);
  const j = await r.json();
  const data: any[] = Array.isArray(j?.data) ? j.data : [];
  return data
    .filter((t) => t && t.is_streamable !== false && (t.duration ?? 0) > 0)
    .map((t) => mapTrack(host, t));
}

export function getTrending(genre?: string, limit = 24): Promise<AudiusTrack[]> {
  return fetchTracks("/v1/tracks/trending", { genre: genre ?? "", time: "week" }).then((t) =>
    t.slice(0, limit)
  );
}

export function searchTracks(query: string, limit = 24): Promise<AudiusTrack[]> {
  return fetchTracks("/v1/tracks/search", { query }).then((t) => t.slice(0, limit));
}

export function fmtTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
