import { useEffect, useState } from "react";
import type { PlayableTrack } from "../lib/catalog";

const KEY = "aura.playlist.liked";
const EVENT = "aura:liked-songs";

function read(): PlayableTrack[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(tracks: PlayableTrack[]) {
  localStorage.setItem(KEY, JSON.stringify(tracks));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function getLikedSongs(): PlayableTrack[] {
  return read();
}

export function isTrackLiked(id: string | undefined): boolean {
  return Boolean(id && read().some((track) => track.id === id));
}

export function toggleLikedSong(track: PlayableTrack): boolean {
  const current = read();
  const exists = current.some((item) => item.id === track.id);
  const next = exists ? current.filter((item) => item.id !== track.id) : [track, ...current];
  write(next);
  return !exists;
}

export function useLikedSongs() {
  const [tracks, setTracks] = useState<PlayableTrack[]>(() => read());

  useEffect(() => {
    const update = () => setTracks(read());
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return tracks;
}

