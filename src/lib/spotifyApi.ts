import type { PlayableTrack } from "./catalog";
import { readSpotifySession, type SpotifySession } from "./spotifyAuth";

export interface SpotifyProfile {
  id: string;
  display_name?: string;
  product?: "premium" | "free" | "open";
}

export function getActiveSpotifySession(): SpotifySession | null {
  const session = readSpotifySession();
  if (!session?.accessToken) return null;
  if (session.expiresAt <= Date.now() + 15_000) return null;
  return session;
}

export async function spotifyFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = getActiveSpotifySession();
  if (!session) throw new Error("Spotify login is required");
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${session.accessToken}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(`https://api.spotify.com/v1/${path.replace(/^\/+/, "")}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Spotify ${response.status}: ${body || response.statusText}`);
  }
  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

export async function getSpotifyProfile() {
  return spotifyFetch<SpotifyProfile>("me");
}

export async function createSpotifyPlaylist(input: {
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
}) {
  return spotifyFetch<{ id: string; external_urls?: { spotify?: string } }>(`users/${input.userId}/playlists`, {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      description: input.description,
      public: input.isPublic,
    }),
  });
}

export async function addTracksToSpotifyPlaylist(playlistId: string, uris: string[]) {
  for (let i = 0; i < uris.length; i += 100) {
    await spotifyFetch(`playlists/${playlistId}/tracks`, {
      method: "POST",
      body: JSON.stringify({ uris: uris.slice(i, i + 100) }),
    });
  }
}

export async function startSpotifyPlayback(input: { deviceId?: string; uris: string[]; index: number; positionMs?: number }) {
  const query = input.deviceId ? `?device_id=${encodeURIComponent(input.deviceId)}` : "";
  await spotifyFetch(`me/player/play${query}`, {
    method: "PUT",
    body: JSON.stringify({
      uris: input.uris,
      offset: { position: input.index },
      position_ms: input.positionMs ?? 0,
    }),
  });
}

export function spotifyUrisFromTracks(tracks: PlayableTrack[]) {
  return tracks.map((track) => track.spotifyUri).filter((uri): uri is string => Boolean(uri));
}

export async function searchSpotifyTracks(term: string, limit = 20, market = "IN") {
  const params = new URLSearchParams({ q: term, type: "track", limit: String(limit), market });
  return spotifyFetch<any>(`search?${params.toString()}`);
}
