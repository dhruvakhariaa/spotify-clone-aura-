import type { Artist } from "../lib/types";

/**
 * Curated picker grid. Feature vectors are our own "vibe" estimates (0..1),
 * used only to place each listener in the Aura engine's space.
 */
export const ARTISTS: Artist[] = [
  { id: "beach-house", name: "Beach House", genre: "Dream Pop", features: { energy: 0.3, valence: 0.45, tempo: 0.34, acoustic: 0.55 } },
  { id: "clairo", name: "Clairo", genre: "Bedroom Pop", features: { energy: 0.32, valence: 0.5, tempo: 0.38, acoustic: 0.6 } },
  { id: "cigarettes-after-sex", name: "Cigarettes After Sex", genre: "Dream Pop", features: { energy: 0.22, valence: 0.3, tempo: 0.28, acoustic: 0.5 } },
  { id: "frank-ocean", name: "Frank Ocean", genre: "R&B", features: { energy: 0.4, valence: 0.45, tempo: 0.42, acoustic: 0.55 } },
  { id: "sza", name: "SZA", genre: "R&B", features: { energy: 0.48, valence: 0.4, tempo: 0.5, acoustic: 0.45 } },
  { id: "100-gecs", name: "100 gecs", genre: "Hyperpop", features: { energy: 0.92, valence: 0.62, tempo: 0.85, acoustic: 0.1 } },
  { id: "charli-xcx", name: "Charli XCX", genre: "Hyperpop", features: { energy: 0.82, valence: 0.66, tempo: 0.78, acoustic: 0.15 } },
  { id: "skrillex", name: "Skrillex", genre: "EDM", features: { energy: 0.95, valence: 0.6, tempo: 0.9, acoustic: 0.08 } },
  { id: "fred-again", name: "Fred again..", genre: "Electronic", features: { energy: 0.7, valence: 0.6, tempo: 0.72, acoustic: 0.25 } },
  { id: "the-midnight", name: "The Midnight", genre: "Synthwave", features: { energy: 0.66, valence: 0.55, tempo: 0.68, acoustic: 0.22 } },
  { id: "kavinsky", name: "Kavinsky", genre: "Synthwave", features: { energy: 0.72, valence: 0.45, tempo: 0.74, acoustic: 0.15 } },
  { id: "paramore", name: "Paramore", genre: "Pop-Punk", features: { energy: 0.82, valence: 0.5, tempo: 0.76, acoustic: 0.3 } },
  { id: "jimmy-eat-world", name: "Jimmy Eat World", genre: "Emo", features: { energy: 0.74, valence: 0.45, tempo: 0.7, acoustic: 0.35 } },
  { id: "bon-iver", name: "Bon Iver", genre: "Indie Folk", features: { energy: 0.34, valence: 0.42, tempo: 0.36, acoustic: 0.72 } },
  { id: "phoebe-bridgers", name: "Phoebe Bridgers", genre: "Indie Folk", features: { energy: 0.3, valence: 0.3, tempo: 0.34, acoustic: 0.7 } },
  { id: "hozier", name: "Hozier", genre: "Soul-Folk", features: { energy: 0.5, valence: 0.5, tempo: 0.48, acoustic: 0.68 } },
  { id: "tame-impala", name: "Tame Impala", genre: "Psych Pop", features: { energy: 0.6, valence: 0.6, tempo: 0.56, acoustic: 0.4 } },
  { id: "slowdive", name: "Slowdive", genre: "Shoegaze", features: { energy: 0.42, valence: 0.45, tempo: 0.4, acoustic: 0.5 } },
  { id: "brian-eno", name: "Brian Eno", genre: "Ambient", features: { energy: 0.14, valence: 0.45, tempo: 0.16, acoustic: 0.6 } },
  { id: "tycho", name: "Tycho", genre: "Ambient", features: { energy: 0.4, valence: 0.6, tempo: 0.46, acoustic: 0.4 } },
  { id: "aphex-twin", name: "Aphex Twin", genre: "IDM", features: { energy: 0.55, valence: 0.4, tempo: 0.62, acoustic: 0.12 } },
  { id: "burial", name: "Burial", genre: "Future Garage", features: { energy: 0.5, valence: 0.3, tempo: 0.6, acoustic: 0.15 } },
  { id: "vulfpeck", name: "Vulfpeck", genre: "Funk", features: { energy: 0.74, valence: 0.85, tempo: 0.68, acoustic: 0.5 } },
  { id: "jungle", name: "Jungle", genre: "Disco-Funk", features: { energy: 0.7, valence: 0.82, tempo: 0.7, acoustic: 0.4 } },
  { id: "burna-boy", name: "Burna Boy", genre: "Afrobeat", features: { energy: 0.72, valence: 0.78, tempo: 0.66, acoustic: 0.4 } },
  { id: "dangelo", name: "D'Angelo", genre: "Neo-Soul", features: { energy: 0.44, valence: 0.55, tempo: 0.42, acoustic: 0.58 } },
  { id: "norah-jones", name: "Norah Jones", genre: "Jazz-Soul", features: { energy: 0.3, valence: 0.55, tempo: 0.34, acoustic: 0.75 } },
  { id: "al-green", name: "Al Green", genre: "Soul", features: { energy: 0.46, valence: 0.8, tempo: 0.44, acoustic: 0.72 } },
  { id: "dua-lipa", name: "Dua Lipa", genre: "Pop", features: { energy: 0.8, valence: 0.88, tempo: 0.76, acoustic: 0.2 } },
  { id: "the-weeknd", name: "The Weeknd", genre: "Pop-R&B", features: { energy: 0.7, valence: 0.45, tempo: 0.7, acoustic: 0.25 } },
  { id: "robyn", name: "Robyn", genre: "Dance-Pop", features: { energy: 0.78, valence: 0.7, tempo: 0.76, acoustic: 0.2 } },
  { id: "deftones", name: "Deftones", genre: "Alt-Metal", features: { energy: 0.86, valence: 0.4, tempo: 0.8, acoustic: 0.25 } },
  { id: "turnstile", name: "Turnstile", genre: "Hardcore", features: { energy: 0.92, valence: 0.55, tempo: 0.86, acoustic: 0.2 } },
  { id: "kendrick-lamar", name: "Kendrick Lamar", genre: "Hip-Hop", features: { energy: 0.7, valence: 0.5, tempo: 0.66, acoustic: 0.3 } },
  { id: "tyler-the-creator", name: "Tyler, the Creator", genre: "Hip-Hop", features: { energy: 0.68, valence: 0.6, tempo: 0.62, acoustic: 0.35 } },
  { id: "mac-demarco", name: "Mac DeMarco", genre: "Slacker Rock", features: { energy: 0.4, valence: 0.6, tempo: 0.42, acoustic: 0.55 } },
];

export const ARTIST_BY_ID = Object.fromEntries(
  ARTISTS.map((a) => [a.id, a])
) as Record<string, Artist>;
