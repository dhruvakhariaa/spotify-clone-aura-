import { useEffect, useState } from "react";
import type { PlayableTrack } from "../lib/catalog";
import { addTracksToSpotifyPlaylist, createSpotifyPlaylist, getSpotifyProfile, spotifyUrisFromTracks } from "../lib/spotifyApi";
import { getLocalUserId, hasSupabaseConfig, supabaseRest } from "../lib/supabaseClient";

export interface AuraPlaylist {
  id: string;
  userId: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdSource: "manual" | "universe" | "queue" | "liked";
  aura?: Record<string, unknown>;
  spotifyPlaylistId?: string;
  spotifyUrl?: string;
  createdAt: number;
  tracks: PlayableTrack[];
}

const KEY = "aura.playlists";
const EVENT = "aura:playlists";

function read(): AuraPlaylist[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(playlists: AuraPlaylist[]) {
  localStorage.setItem(KEY, JSON.stringify(playlists));
  window.dispatchEvent(new CustomEvent(EVENT));
}

async function persistPlaylist(playlist: AuraPlaylist) {
  if (!hasSupabaseConfig()) return;
  await supabaseRest("playlists", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify([
      {
        id: playlist.id,
        user_id: playlist.userId,
        name: playlist.name,
        description: playlist.description,
        visibility: playlist.isPublic ? "public" : "private",
        aura_metadata: playlist.aura ?? {},
        created_source: playlist.createdSource,
        spotify_playlist_id: playlist.spotifyPlaylistId ?? null,
      },
    ]),
  });
  if (playlist.tracks.length) {
    await supabaseRest("playlist_tracks", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(
        playlist.tracks.map((track, order) => ({
          playlist_id: playlist.id,
          track_id: track.id,
          track_snapshot: track,
          track_order: order,
          added_at: new Date().toISOString(),
        }))
      ),
    });
  }
}

export function createAuraPlaylist(input: {
  name: string;
  description?: string;
  isPublic: boolean;
  createdSource: AuraPlaylist["createdSource"];
  tracks?: PlayableTrack[];
}) {
  const playlist: AuraPlaylist = {
    id: crypto.randomUUID(),
    userId: getLocalUserId(),
    name: input.name.trim(),
    description: input.description?.trim() ?? "",
    isPublic: input.isPublic,
    createdSource: input.createdSource,
    createdAt: Date.now(),
    tracks: input.tracks ?? [],
  };
  write([playlist, ...read()]);
  persistPlaylist(playlist).catch(() => {});
  return playlist;
}

export function addTracksToAuraPlaylist(playlistId: string, tracks: PlayableTrack[]) {
  const playlists = read();
  const next = playlists.map((playlist) => {
    if (playlist.id !== playlistId) return playlist;
    const existing = new Set(playlist.tracks.map((track) => track.id));
    return { ...playlist, tracks: [...playlist.tracks, ...tracks.filter((track) => !existing.has(track.id))] };
  });
  write(next);
  const changed = next.find((playlist) => playlist.id === playlistId);
  if (changed) persistPlaylist(changed).catch(() => {});
}

export async function syncAuraPlaylistToSpotify(playlistId: string) {
  const playlist = read().find((item) => item.id === playlistId);
  if (!playlist) throw new Error("Playlist not found");
  const uris = spotifyUrisFromTracks(playlist.tracks);
  if (!uris.length) throw new Error("This playlist has no Spotify-backed tracks yet");

  const profile = await getSpotifyProfile();
  const spotifyPlaylist = await createSpotifyPlaylist({
    userId: profile.id,
    name: playlist.name,
    description: playlist.description || "Created in AURA.",
    isPublic: playlist.isPublic,
  });
  await addTracksToSpotifyPlaylist(spotifyPlaylist.id, uris);

  const next = read().map((item) =>
    item.id === playlist.id
      ? { ...item, spotifyPlaylistId: spotifyPlaylist.id, spotifyUrl: spotifyPlaylist.external_urls?.spotify }
      : item
  );
  write(next);
  const changed = next.find((item) => item.id === playlist.id);
  if (changed) persistPlaylist(changed).catch(() => {});
  return changed;
}

export function useAuraPlaylists() {
  const [playlists, setPlaylists] = useState<AuraPlaylist[]>(() => read());
  useEffect(() => {
    const update = () => setPlaylists(read());
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return playlists;
}
