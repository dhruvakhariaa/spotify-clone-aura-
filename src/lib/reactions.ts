import type { Aura, TimeOfDay } from "./types";

export type ReactionTone =
  | "tap"
  | "flip"
  | "select"
  | "next"
  | "wow"
  | "romance"
  | "night"
  | "success"
  | "cursor"
  | "laugh"
  | "soulmate"
  | "make";

export interface ReactionCue {
  id: string;
  tone: ReactionTone;
  title: string;
  caption: string;
  image?: string;
}

const toneMap: Record<ReactionTone, Array<[number, number]>> = {
  tap: [[420, 0.035]],
  flip: [
    [220, 0.04],
    [520, 0.05],
  ],
  select: [
    [330, 0.04],
    [660, 0.05],
  ],
  next: [
    [260, 0.04],
    [390, 0.04],
    [780, 0.06],
  ],
  wow: [
    [520, 0.06],
    [740, 0.08],
    [980, 0.08],
  ],
  romance: [
    [392, 0.08],
    [494, 0.1],
    [659, 0.13],
  ],
  night: [
    [160, 0.08],
    [120, 0.08],
    [240, 0.1],
  ],
  success: [
    [440, 0.05],
    [660, 0.08],
    [880, 0.1],
  ],
  cursor: [[720, 0.018]],
  laugh: [
    [520, 0.045],
    [660, 0.055],
    [520, 0.045],
    [760, 0.075],
  ],
  soulmate: [
    [392, 0.08],
    [494, 0.1],
    [659, 0.13],
  ],
  make: [
    [330, 0.04],
    [440, 0.04],
    [550, 0.06],
  ],
};

let audioContext: AudioContext | null = null;
let lastCursorSound = 0;
const managedAudios = new Set<HTMLAudioElement>();
let routeStopInstalled = false;

/**
 * Optional local audio overrides. Put files in `public/audio/ui/` and add paths here.
 * Example:
 * tap: "/audio/ui/tap.mp3",
 * flip: "/audio/ui/card-flip.mp3",
 * laugh: "/audio/ui/laugh.mp3",
 */
export const REACTION_AUDIO_FILES: Partial<Record<ReactionTone, string>> = {
  tap: "/audio/ui/mouse-click-sound.mp3",
  soulmate: "/audio/ui/careles-romance.mp3",
  make: "/audio/ui/acha-ji-aisa-hai-kya.mp3",
};

const AUDIO_START_OFFSETS: Partial<Record<ReactionTone, number>> = {
  tap: 0.7,
};

function isManagedTone(tone: ReactionTone) {
  return tone !== "tap";
}

export function stopManagedSounds() {
  for (const audio of managedAudios) {
    audio.pause();
    audio.currentTime = 0;
  }
  managedAudios.clear();
}

function installRouteSoundStop() {
  if (routeStopInstalled || typeof window === "undefined") return;
  routeStopInstalled = true;

  const stop = () => stopManagedSounds();
  window.addEventListener("popstate", stop);
  window.addEventListener("hashchange", stop);
  window.addEventListener("pagehide", stop);
  window.addEventListener("beforeunload", stop);

  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);

  window.history.pushState = (...args) => {
    stop();
    return originalPushState(...args);
  };
  window.history.replaceState = (...args) => {
    stop();
    return originalReplaceState(...args);
  };
}

function getAudioContext() {
  const AudioCtor =
    window.AudioContext ??
    (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  audioContext ??= new AudioCtor();
  return audioContext;
}

export function playReactionSound(tone: ReactionTone = "tap") {
  if (typeof window === "undefined") return;
  installRouteSoundStop();
  const now = performance.now();
  if (tone === "cursor" && now - lastCursorSound < 160) return;
  if (tone === "cursor") lastCursorSound = now;

  const audioFile = REACTION_AUDIO_FILES[tone];
  if (audioFile) {
    if (isManagedTone(tone)) stopManagedSounds();
    const audio = new Audio(audioFile);
    audio.volume = tone === "tap" ? 0.45 : tone === "cursor" ? 0.18 : 0.72;
    audio.currentTime = AUDIO_START_OFFSETS[tone] ?? 0;
    if (isManagedTone(tone)) {
      managedAudios.add(audio);
      audio.addEventListener("ended", () => managedAudios.delete(audio), { once: true });
    }
    void audio.play().catch(() => {
      managedAudios.delete(audio);
    });
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;
  void ctx.resume().catch(() => {});

  let offset = 0;
  const master = ctx.createGain();
  master.gain.value = tone === "cursor" ? 0.025 : 0.075;
  master.connect(ctx.destination);

  for (const [freq, duration] of toneMap[tone]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + offset;
    const end = start + duration;
    osc.type = tone === "night" ? "sine" : tone === "romance" ? "triangle" : "square";
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(tone === "cursor" ? 0.025 : 0.12, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(end + 0.02);
    offset += duration * 0.72;
  }
}

export function reactionForArtist(name?: string): ReactionCue {
  if (name === "The Weeknd") {
    return {
      id: "artist-weeknd",
      tone: "wow",
      title: "The Weeknd detected",
      caption: "When the weekend is over but the synths still hurt.",
      image: "/memes/weeknd-over.png",
    };
  }

  if (!name) {
    return {
      id: "artist-generic",
      tone: "select",
      title: "First signal locked",
      caption: "Your taste has entered the booth.",
    };
  }

  return {
    id: `artist-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    tone: "select",
    title: `${name} locked`,
    caption: "That choice now colors the whole Aura.",
  };
}

export function reactionForTime(time: TimeOfDay): ReactionCue | null {
  if (time !== "midnight") return null;
  return {
    id: "midnight-listener",
    tone: "night",
    title: "2 AM listener behavior",
    caption: "Headphones on. Feelings louder than the room.",
    image: "/memes/midnight-squidward.png",
  };
}

export function reactionForMood(moodIds: string[]): ReactionCue {
  if (moodIds.includes("tender")) {
    return {
      id: "mood-tender",
      tone: "romance",
      title: "Tender mode",
      caption: "The romance engine is warming up.",
    };
  }
  if (moodIds.includes("feral")) {
    return {
      id: "mood-feral",
      tone: "wow",
      title: "Volume warning",
      caption: "This Aura is not sitting politely.",
    };
  }
  return {
    id: "mood-next",
    tone: "next",
    title: "Feeling mapped",
    caption: "The emotional EQ moved.",
  };
}

export function reactionForAura(aura: Aura): ReactionCue {
  const romantic =
    aura.moodIds.includes("tender") ||
    aura.moodIds.includes("nostalgic") ||
    aura.archetype.accent.toLowerCase().includes("ff") ||
    aura.features.valence > 0.62;

  if (romantic) {
    return {
      id: "aura-romance",
      tone: "romance",
      title: "Romance reveal",
      caption: "Soft launch, loud feelings.",
    };
  }

  return {
    id: "aura-reveal",
    tone: "success",
    title: "Aura revealed",
    caption: "The signal resolved.",
  };
}
