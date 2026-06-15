import type { Aura, FeatureVector } from "./types";
import { ARCHETYPES } from "../data/archetypes";

const KEYS: (keyof FeatureVector)[] = ["energy", "valence", "tempo", "acoustic"];

export interface SoulmateResult {
  compatibility: number; // 12..99
  sharedGenres: string[];
  bridge: { title: string; artist: string; archetypeName: string; accent: string };
  sameArchetype: boolean;
}

function distance(a: FeatureVector, b: FeatureVector): number {
  return Math.sqrt(KEYS.reduce((s, k) => s + (a[k] - b[k]) ** 2, 0));
}

function nearestArchetype(v: FeatureVector) {
  let best = ARCHETYPES[0];
  let bd = Infinity;
  for (const a of ARCHETYPES) {
    const d = distance(v, a.center);
    if (d < bd) {
      bd = d;
      best = a;
    }
  }
  return best;
}

/**
 * Merge two Auras: a believable compatibility %, the genres they share, and a
 * "bridge song" — the signature track of the archetype sitting at the midpoint
 * of their two tastes (a song that lives exactly between them).
 */
export function computeSoulmate(a: Aura, b: Aura): SoulmateResult {
  const d = distance(a.features, b.features); // 0..2
  const raw = 1 - Math.min(d, 1.7) / 1.7;
  const compatibility = Math.max(12, Math.min(99, Math.round(raw * 100)));

  const gb = new Set(b.archetype.genres);
  const sharedGenres = a.archetype.genres.filter((g) => gb.has(g));

  const mid = Object.fromEntries(
    KEYS.map((k) => [k, (a.features[k] + b.features[k]) / 2])
  ) as unknown as FeatureVector;
  const bridgeArch = nearestArchetype(mid);

  return {
    compatibility,
    sharedGenres,
    bridge: {
      title: bridgeArch.signatureTrack.title,
      artist: bridgeArch.signatureTrack.artist,
      archetypeName: bridgeArch.name,
      accent: bridgeArch.accent,
    },
    sameArchetype: a.archetype.id === b.archetype.id,
  };
}

export function compatibilityVerdict(pct: number): string {
  if (pct >= 90) return "Two halves of the same record.";
  if (pct >= 75) return "Dangerously in tune.";
  if (pct >= 55) return "A duet waiting to happen.";
  if (pct >= 35) return "Opposites with a shared chorus.";
  return "Beautifully, chaotically different.";
}
