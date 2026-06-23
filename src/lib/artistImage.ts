import { artistCover } from "./catalog";

/**
 * Resolve a real artist photo. Prefers a Spotify headshot (via the proxy in
 * server/), and falls back to iTunes album/track artwork so there's always a
 * human face on screen even before Spotify is configured.
 *
 * The backend is fully OPT-IN: it's only contacted when VITE_SPOTIFY_PROXY is
 * set (e.g. "http://localhost:8787" in .env). With it unset — the default — we
 * never touch the network proxy, so there are zero connection errors.
 */
const PROXY = (import.meta.env.VITE_SPOTIFY_PROXY as string | undefined)?.replace(/\/$/, "");
const cache = new Map<string, string | undefined>();
let backendPromise: Promise<boolean> | null = null;

function backendReady(): Promise<boolean> {
  if (!PROXY) return Promise.resolve(false);
  if (!backendPromise) {
    backendPromise = fetch(`${PROXY}/api/health`, { signal: AbortSignal.timeout?.(2000) })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => Boolean(j?.ok && j?.hasCreds))
      .catch(() => false);
  }
  return backendPromise;
}

export async function artistImage(name: string): Promise<string | undefined> {
  if (cache.has(name)) return cache.get(name);

  let img: string | undefined;
  if (await backendReady()) {
    try {
      const r = await fetch(`${PROXY}/api/spotify/artist?name=${encodeURIComponent(name)}`, {
        signal: AbortSignal.timeout?.(3000),
      });
      if (r.ok) img = (await r.json())?.artist?.image;
    } catch {
      /* fall through to iTunes */
    }
  }

  if (!img) img = await artistCover(name);
  cache.set(name, img);
  return img;
}
