import { artistCover } from "./catalog";

/**
 * Resolve a real artist photo. Prefers a Spotify headshot (via the proxy in
 * server/), and falls back to iTunes album/track artwork so there's always a
 * human face on screen even before Spotify creds are configured.
 *
 * The proxy is probed once via /api/health; if it's absent or has no creds we
 * skip it entirely (no per-artist failed requests).
 */
const cache = new Map<string, string | undefined>();
let backendPromise: Promise<boolean> | null = null;

function backendReady(): Promise<boolean> {
  if (!backendPromise) {
    backendPromise = fetch("/api/health", { signal: AbortSignal.timeout?.(2000) })
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
      const r = await fetch(`/api/spotify/artist?name=${encodeURIComponent(name)}`, {
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
