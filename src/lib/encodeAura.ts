import type { Aura, TimeOfDay } from "./types";
import { ARTISTS } from "../data/artists";
import { MOODS, TIMES } from "../data/moods";
import { deriveAura } from "./deriveAura";

/**
 * Compact, URL-safe encoding of the *picks* (not the result), so an Aura is
 * fully reconstructable from its short code alone — the share artifact needs
 * no backend.  Shape: [timeIndex, [artistIdx...], [moodIdx...]].
 */

const toB64Url = (s: string) =>
  btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const fromB64Url = (s: string) => {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
};

export function encodePicks(
  artistIds: string[],
  moodIds: string[],
  time: TimeOfDay
): string {
  const ai = artistIds.map((id) => ARTISTS.findIndex((a) => a.id === id)).filter((i) => i >= 0);
  const mi = moodIds.map((id) => MOODS.findIndex((m) => m.id === id)).filter((i) => i >= 0);
  const ti = Math.max(0, TIMES.findIndex((t) => t.id === time));
  return toB64Url(JSON.stringify([ti, ai, mi]));
}

export function encodeAura(aura: Aura): string {
  return encodePicks(aura.artistIds, aura.moodIds, aura.time);
}

/** Reconstruct an Aura from a share code. Returns null if the code is junk. */
export function decodeAura(code: string): Aura | null {
  try {
    const parsed = JSON.parse(fromB64Url(code));
    if (!Array.isArray(parsed)) return null;
    const [ti, ai, mi] = parsed as [number, number[], number[]];
    const time = (TIMES[ti]?.id ?? "dusk") as TimeOfDay;
    const artistIds = (ai ?? []).map((i) => ARTISTS[i]?.id).filter(Boolean) as string[];
    const moodIds = (mi ?? []).map((i) => MOODS[i]?.id).filter(Boolean) as string[];
    if (!artistIds.length) return null;
    return deriveAura(artistIds, moodIds, time);
  } catch {
    return null;
  }
}
