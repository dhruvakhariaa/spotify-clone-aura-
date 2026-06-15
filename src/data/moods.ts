import type { Mood, TimeChoice } from "../lib/types";

/** Swipeable mood cards — each nudges the listener's vibe vector. */
export const MOODS: Mood[] = [
  { id: "euphoric", label: "Euphoric", blurb: "hands up, eyes closed", delta: { valence: 0.32, energy: 0.22 } },
  { id: "melancholy", label: "Melancholy", blurb: "beautifully sad", delta: { valence: -0.32, energy: -0.12 } },
  { id: "feral", label: "Feral", blurb: "no thoughts, just bass", delta: { energy: 0.34, tempo: 0.24 } },
  { id: "tender", label: "Tender", blurb: "soft and slow", delta: { energy: -0.26, tempo: -0.22, acoustic: 0.18 } },
  { id: "nocturnal", label: "Nocturnal", blurb: "made for 2am", delta: { valence: -0.14, energy: -0.08, acoustic: -0.12 } },
  { id: "nostalgic", label: "Nostalgic", blurb: "ache for another time", delta: { valence: 0.1, acoustic: 0.24 } },
  { id: "hypnotic", label: "Hypnotic", blurb: "locked in a loop", delta: { tempo: 0.12, acoustic: -0.22, energy: 0.06 } },
  { id: "defiant", label: "Defiant", blurb: "loud on purpose", delta: { energy: 0.3, valence: -0.06, acoustic: -0.1 } },
];

/** When you listen most — a final nudge that colors the whole result. */
export const TIMES: TimeChoice[] = [
  { id: "dawn", label: "Dawn", hours: "05–09", delta: { valence: 0.16, acoustic: 0.18, energy: -0.06 } },
  { id: "afternoon", label: "Afternoon", hours: "12–17", delta: { energy: 0.16, valence: 0.12, tempo: 0.08 } },
  { id: "dusk", label: "Dusk", hours: "18–22", delta: { valence: 0.04, tempo: -0.04, acoustic: 0.06 } },
  { id: "midnight", label: "Midnight", hours: "23–04", delta: { valence: -0.2, energy: -0.1, acoustic: -0.16 } },
];
