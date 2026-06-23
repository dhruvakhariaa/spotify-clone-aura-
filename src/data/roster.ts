import type { FeatureVector } from "../lib/types";

/**
 * Curated cross-culture roster so anyone — Indian or global — sees artists they
 * connect with. Feature vectors (energy / valence / tempo / acoustic, 0..1) are
 * hand-curated from how listeners actually describe these artists (YouTube/Reddit
 * sentiment + genre knowledge), since Spotify's audio-features API was deprecated.
 */
export type RosterCategory = "indie-in" | "bollywood" | "tollywood" | "hollywood";

export const CATEGORY_LABELS: Record<RosterCategory, string> = {
  "indie-in": "Indian Indie",
  bollywood: "Bollywood",
  tollywood: "Tollywood / South",
  hollywood: "Hollywood / Global",
};

export interface RosterArtist {
  name: string;
  category: RosterCategory;
  blurb: string;
  features: FeatureVector;
}

export const ROSTER: RosterArtist[] = [
  // ---------- Indian Indie ----------
  { name: "Prateek Kuhad", category: "indie-in", blurb: "Soft-spoken heartbreak", features: { energy: 0.3, valence: 0.5, tempo: 0.35, acoustic: 0.82 } },
  { name: "Anuv Jain", category: "indie-in", blurb: "Acoustic longing", features: { energy: 0.28, valence: 0.46, tempo: 0.32, acoustic: 0.85 } },
  { name: "The Local Train", category: "indie-in", blurb: "Anthemic Hindi rock", features: { energy: 0.66, valence: 0.6, tempo: 0.62, acoustic: 0.45 } },
  { name: "Ritviz", category: "indie-in", blurb: "Sunlit electronic", features: { energy: 0.82, valence: 0.84, tempo: 0.78, acoustic: 0.32 } },
  { name: "Lifafa", category: "indie-in", blurb: "Dreamy Delhi synth", features: { energy: 0.52, valence: 0.55, tempo: 0.55, acoustic: 0.28 } },
  { name: "When Chai Met Toast", category: "indie-in", blurb: "Sunshine indie folk", features: { energy: 0.62, valence: 0.86, tempo: 0.62, acoustic: 0.62 } },
  { name: "Peter Cat Recording Co.", category: "indie-in", blurb: "Gypsy-jazz romance", features: { energy: 0.5, valence: 0.58, tempo: 0.5, acoustic: 0.55 } },
  { name: "Taba Chake", category: "indie-in", blurb: "Mellow mountain folk", features: { energy: 0.4, valence: 0.62, tempo: 0.42, acoustic: 0.72 } },

  // ---------- Bollywood ----------
  { name: "Arijit Singh", category: "bollywood", blurb: "The voice of longing", features: { energy: 0.4, valence: 0.48, tempo: 0.42, acoustic: 0.55 } },
  { name: "Atif Aslam", category: "bollywood", blurb: "Raw romantic ache", features: { energy: 0.5, valence: 0.52, tempo: 0.48, acoustic: 0.52 } },
  { name: "Sunidhi Chauhan", category: "bollywood", blurb: "Powerhouse pop vocals", features: { energy: 0.82, valence: 0.74, tempo: 0.76, acoustic: 0.34 } },
  { name: "Shreya Ghoshal", category: "bollywood", blurb: "Velvet & classical", features: { energy: 0.45, valence: 0.64, tempo: 0.45, acoustic: 0.6 } },
  { name: "A.R. Rahman", category: "bollywood", blurb: "Cinematic soul", features: { energy: 0.55, valence: 0.62, tempo: 0.5, acoustic: 0.55 } },
  { name: "Pritam", category: "bollywood", blurb: "Chart-topping romance", features: { energy: 0.66, valence: 0.7, tempo: 0.64, acoustic: 0.4 } },
  { name: "Lata Mangeshkar", category: "bollywood", blurb: "Timeless playback grace", features: { energy: 0.34, valence: 0.62, tempo: 0.36, acoustic: 0.74 } },
  { name: "Mohammed Rafi", category: "bollywood", blurb: "Golden-era range", features: { energy: 0.48, valence: 0.66, tempo: 0.48, acoustic: 0.68 } },
  { name: "Kishore Kumar", category: "bollywood", blurb: "Playful evergreen charm", features: { energy: 0.58, valence: 0.78, tempo: 0.58, acoustic: 0.62 } },
  { name: "Asha Bhosle", category: "bollywood", blurb: "Cabaret to classical", features: { energy: 0.62, valence: 0.74, tempo: 0.62, acoustic: 0.58 } },
  { name: "Udit Narayan", category: "bollywood", blurb: "90s sunshine romance", features: { energy: 0.56, valence: 0.76, tempo: 0.56, acoustic: 0.55 } },
  { name: "Sonu Nigam", category: "bollywood", blurb: "Melodic vocal theatre", features: { energy: 0.52, valence: 0.64, tempo: 0.5, acoustic: 0.58 } },
  { name: "Alka Yagnik", category: "bollywood", blurb: "Classic romantic glow", features: { energy: 0.44, valence: 0.66, tempo: 0.45, acoustic: 0.6 } },
  { name: "Shaan", category: "bollywood", blurb: "Smooth 2000s warmth", features: { energy: 0.55, valence: 0.76, tempo: 0.56, acoustic: 0.5 } },
  { name: "KK", category: "bollywood", blurb: "Anthemic nostalgia", features: { energy: 0.6, valence: 0.58, tempo: 0.6, acoustic: 0.5 } },
  { name: "Shankar Mahadevan", category: "bollywood", blurb: "Classical firepower", features: { energy: 0.72, valence: 0.72, tempo: 0.7, acoustic: 0.52 } },
  { name: "Diljit Dosanjh", category: "bollywood", blurb: "Punjabi swagger", features: { energy: 0.82, valence: 0.86, tempo: 0.78, acoustic: 0.28 } },
  { name: "Neha Kakkar", category: "bollywood", blurb: "Dancefloor pop", features: { energy: 0.82, valence: 0.8, tempo: 0.8, acoustic: 0.24 } },
  { name: "Badshah", category: "bollywood", blurb: "Party hip-hop", features: { energy: 0.86, valence: 0.76, tempo: 0.82, acoustic: 0.18 } },
  { name: "Jubin Nautiyal", category: "bollywood", blurb: "Soaring ballads", features: { energy: 0.5, valence: 0.58, tempo: 0.5, acoustic: 0.5 } },

  // ---------- Tollywood / South ----------
  { name: "Sid Sriram", category: "tollywood", blurb: "Carnatic-soul ache", features: { energy: 0.42, valence: 0.5, tempo: 0.42, acoustic: 0.55 } },
  { name: "Anirudh Ravichander", category: "tollywood", blurb: "Mass electronic energy", features: { energy: 0.86, valence: 0.78, tempo: 0.82, acoustic: 0.28 } },
  { name: "Devi Sri Prasad", category: "tollywood", blurb: "Peppy festival beats", features: { energy: 0.85, valence: 0.85, tempo: 0.82, acoustic: 0.3 } },
  { name: "S.S. Thaman", category: "tollywood", blurb: "Adrenaline BGM", features: { energy: 0.82, valence: 0.7, tempo: 0.8, acoustic: 0.3 } },
  { name: "Kaala Bhairava", category: "tollywood", blurb: "Folk firestorm", features: { energy: 0.84, valence: 0.7, tempo: 0.82, acoustic: 0.42 } },
  { name: "Armaan Malik", category: "tollywood", blurb: "Pan-India romance", features: { energy: 0.5, valence: 0.64, tempo: 0.5, acoustic: 0.45 } },

  // ---------- Hollywood / Global ----------
  { name: "The Weeknd", category: "hollywood", blurb: "After-hours synth-noir", features: { energy: 0.7, valence: 0.45, tempo: 0.7, acoustic: 0.2 } },
  { name: "Billie Eilish", category: "hollywood", blurb: "Whispered dark-pop", features: { energy: 0.35, valence: 0.35, tempo: 0.4, acoustic: 0.45 } },
  { name: "Dua Lipa", category: "hollywood", blurb: "Disco euphoria", features: { energy: 0.82, valence: 0.85, tempo: 0.78, acoustic: 0.2 } },
  { name: "Taylor Swift", category: "hollywood", blurb: "Diary-pop storyteller", features: { energy: 0.55, valence: 0.6, tempo: 0.55, acoustic: 0.45 } },
  { name: "Kendrick Lamar", category: "hollywood", blurb: "Cinematic hip-hop", features: { energy: 0.72, valence: 0.5, tempo: 0.68, acoustic: 0.3 } },
  { name: "Lana Del Rey", category: "hollywood", blurb: "Melancholy Americana", features: { energy: 0.3, valence: 0.35, tempo: 0.35, acoustic: 0.55 } },
  { name: "Arctic Monkeys", category: "hollywood", blurb: "Smirking indie rock", features: { energy: 0.65, valence: 0.5, tempo: 0.65, acoustic: 0.4 } },
  { name: "Coldplay", category: "hollywood", blurb: "Stadium catharsis", features: { energy: 0.6, valence: 0.66, tempo: 0.55, acoustic: 0.5 } },
  { name: "Frank Ocean", category: "hollywood", blurb: "Introspective R&B", features: { energy: 0.4, valence: 0.46, tempo: 0.42, acoustic: 0.55 } },
  { name: "Travis Scott", category: "hollywood", blurb: "Psychedelic trap", features: { energy: 0.85, valence: 0.5, tempo: 0.8, acoustic: 0.15 } },
];

export const ROSTER_BY_NAME: Record<string, RosterArtist> = Object.fromEntries(
  ROSTER.map((a) => [a.name, a])
);

export function rosterByCategory(cat: RosterCategory): RosterArtist[] {
  return ROSTER.filter((a) => a.category === cat);
}

/** Roster artists nearest the given vibe vector — used to seed Aura Radio. */
export function nearestArtists(v: FeatureVector, n = 8): RosterArtist[] {
  const keys: (keyof FeatureVector)[] = ["energy", "valence", "tempo", "acoustic"];
  const d = (a: RosterArtist) =>
    Math.sqrt(keys.reduce((s, k) => s + (a.features[k] - v[k]) ** 2, 0));
  return [...ROSTER].sort((a, b) => d(a) - d(b)).slice(0, n);
}
