import type { Aura, FeatureVector, TimeOfDay } from "./types";
import { ROSTER_BY_NAME } from "../data/roster";
import { MOODS, TIMES } from "../data/moods";
import { ARCHETYPES } from "../data/archetypes";

const FEATURES: (keyof FeatureVector)[] = ["energy", "valence", "tempo", "acoustic"];

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Deterministic 32-bit string hash (cyrb53-lite). */
function hashSeed(str: string): number {
  let h1 = 0xdeadbeef ^ str.length;
  let h2 = 0x41c6ce57 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  // `^` yields a *signed* int32 in JS — coerce back to unsigned for clean serials.
  return ((h2 >>> 0) ^ (h1 >>> 0)) >>> 0;
}

function distance(a: FeatureVector, b: FeatureVector): number {
  return Math.sqrt(FEATURES.reduce((sum, k) => sum + (a[k] - b[k]) ** 2, 0));
}

/**
 * The core mapping: picks -> a vibe vector -> nearest archetype.
 * Pure and deterministic: identical inputs always yield the identical Aura.
 */
export function deriveAura(
  artistIds: string[],
  moodIds: string[],
  time: TimeOfDay
): Aura {
  // 1. Base vector = mean of chosen artists (fallback to neutral center).
  // `artistIds` holds roster artist NAMES.
  const base: FeatureVector = { energy: 0.5, valence: 0.5, tempo: 0.5, acoustic: 0.5 };
  const chosen = artistIds.map((id) => ROSTER_BY_NAME[id]).filter(Boolean);
  if (chosen.length) {
    for (const k of FEATURES) {
      base[k] = chosen.reduce((s, a) => s + a.features[k], 0) / chosen.length;
    }
  }

  // 2. Apply mood + time nudges.
  for (const id of moodIds) {
    const mood = MOODS.find((m) => m.id === id);
    if (mood) for (const k of FEATURES) base[k] += mood.delta[k] ?? 0;
  }
  const t = TIMES.find((x) => x.id === time);
  if (t) for (const k of FEATURES) base[k] += t.delta[k] ?? 0;

  const features: FeatureVector = {
    energy: clamp01(base.energy),
    valence: clamp01(base.valence),
    tempo: clamp01(base.tempo),
    acoustic: clamp01(base.acoustic),
  };

  // 3. Nearest archetype wins.
  let archetype = ARCHETYPES[0];
  let best = Infinity;
  for (const a of ARCHETYPES) {
    const d = distance(features, a.center);
    if (d < best) {
      best = d;
      archetype = a;
    }
  }

  // 4. Deterministic seed + serial from the exact picks.
  const signature = `${[...artistIds].sort().join(",")}|${[...moodIds].sort().join(",")}|${time}`;
  const seed = hashSeed(signature);
  const serial = String(seed % 10000).padStart(4, "0");

  return { archetype, features, artistIds, moodIds, time, seed, serial };
}

/** Apply an Aura's accent pair to a DOM element's CSS variables. */
export function applyAccent(el: HTMLElement, aura: Aura | null) {
  if (!aura) return;
  el.style.setProperty("--accent", aura.archetype.accent);
  el.style.setProperty("--accent-2", aura.archetype.accent2);
}
