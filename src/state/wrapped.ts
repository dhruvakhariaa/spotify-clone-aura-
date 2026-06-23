import type { PlayableTrack } from "../lib/catalog";

export interface ListenEvent {
  id: string;
  title: string;
  artist: string;
  artwork?: string;
  genre?: string;
  ts: number;
}

const KEY = "aura.listen.history";
const MAX = 120;

function read(): ListenEvent[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(events: ListenEvent[]) {
  localStorage.setItem(KEY, JSON.stringify(events.slice(0, MAX)));
}

export function recordListen(track: PlayableTrack) {
  const next: ListenEvent = {
    id: track.id,
    title: track.title,
    artist: track.artist,
    artwork: track.artwork,
    genre: track.genre,
    ts: Date.now(),
  };
  const prev = read().filter((e) => !(e.id === track.id && Date.now() - e.ts < 1000 * 60 * 10));
  write([next, ...prev]);
}

export function getListenHistory(): ListenEvent[] {
  return read();
}

export function liveWrappedSummary(events = read()) {
  const artistCounts = new Map<string, number>();
  const genreCounts = new Map<string, number>();
  const hourCounts = new Map<number, number>();

  for (const event of events) {
    artistCounts.set(event.artist, (artistCounts.get(event.artist) ?? 0) + 1);
    if (event.genre) genreCounts.set(event.genre, (genreCounts.get(event.genre) ?? 0) + 1);
    const hour = new Date(event.ts).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
  }

  const top = <T,>(map: Map<T, number>) =>
    [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));

  const topHour = top(hourCounts)[0]?.name;
  const daypart =
    topHour === undefined
      ? "not enough signal yet"
      : topHour < 5
      ? "after midnight"
      : topHour < 12
      ? "morning"
      : topHour < 17
      ? "afternoon"
      : topHour < 22
      ? "evening"
      : "late night";

  return {
    total: events.length,
    topArtists: top(artistCounts).slice(0, 5),
    topGenres: top(genreCounts).slice(0, 5),
    daypart,
    last: events[0] ?? null,
  };
}

