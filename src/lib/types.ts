/** A point in our 4-dimensional "vibe" space. All values 0..1. */
export interface FeatureVector {
  energy: number; // calm 0 ─ frantic 1
  valence: number; // melancholy 0 ─ euphoric 1
  tempo: number; // slow 0 ─ fast 1
  acoustic: number; // electronic 0 ─ organic/acoustic 1
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  features: FeatureVector;
}

export interface Mood {
  id: string;
  label: string;
  blurb: string;
  /** How picking this mood nudges the listener's vector. */
  delta: Partial<FeatureVector>;
}

export type TimeOfDay = "dawn" | "afternoon" | "dusk" | "midnight";

export interface TimeChoice {
  id: TimeOfDay;
  label: string;
  hours: string;
  delta: Partial<FeatureVector>;
}

export interface Archetype {
  id: string;
  name: string;
  tagline: string;
  genres: string[];
  accent: string;
  accent2: string;
  /** Location of this archetype in vibe space — nearest one wins. */
  center: FeatureVector;
  signatureTrack: { title: string; artist: string };
}

export interface Aura {
  archetype: Archetype;
  features: FeatureVector;
  artistIds: string[];
  moodIds: string[];
  time: TimeOfDay;
  /** Deterministic 32-bit seed derived from the picks — drives the mark. */
  seed: number;
  /** Magazine-style serial, e.g. "0427". */
  serial: string;
}
