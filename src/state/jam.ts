import { useCallback, useEffect, useRef, useState } from "react";
import type { Aura, FeatureVector } from "../lib/types";
import type { PlayableTrack } from "../lib/catalog";
import { ARCHETYPES } from "../data/archetypes";

/**
 * Realtime Jam rooms over the BroadcastChannel API — synced playback + presence
 * across browser tabs/windows on the same machine, with zero backend. (In
 * production this same interface would be backed by Supabase Realtime for true
 * cross-device rooms.)
 */

export interface Peer {
  id: string;
  name: string;
  accent: string;
  accent2: string;
  auraCode: string | null;
  lastSeen: number;
}

export interface PlaybackState {
  queue: PlayableTrack[];
  index: number;
  positionMs: number;
  playing: boolean;
  ts: number;
}

type Msg =
  | { type: "hello"; peer: Omit<Peer, "lastSeen"> }
  | { type: "bye"; id: string }
  | { type: "playback"; from: string; state: PlaybackState };

const FEATURES: (keyof FeatureVector)[] = ["energy", "valence", "tempo", "acoustic"];
const rid = () => Math.random().toString(36).slice(2, 9);

function hexAvg(hexes: string[]): string {
  if (!hexes.length) return "#2b3bff";
  let r = 0, g = 0, b = 0;
  for (const h of hexes) {
    const n = parseInt(h.replace("#", ""), 16);
    r += (n >> 16) & 255;
    g += (n >> 8) & 255;
    b += n & 255;
  }
  const k = hexes.length;
  const to = (x: number) => Math.round(x / k).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Merge several Auras into one "group Aura" — averaged vibe + blended colours. */
export function groupAura(auras: Aura[]): Aura | null {
  if (!auras.length) return null;
  const features = {} as FeatureVector;
  for (const k of FEATURES) features[k] = auras.reduce((s, a) => s + a.features[k], 0) / auras.length;

  let nearest = ARCHETYPES[0];
  let best = Infinity;
  for (const a of ARCHETYPES) {
    const d = Math.sqrt(FEATURES.reduce((s, k) => s + (features[k] - a.center[k]) ** 2, 0));
    if (d < best) { best = d; nearest = a; }
  }

  const accent = hexAvg(auras.map((a) => a.archetype.accent));
  const accent2 = hexAvg(auras.map((a) => a.archetype.accent2));
  const seed = auras.reduce((s, a) => (s + a.seed) >>> 0, 0) || 1;

  return {
    archetype: { ...nearest, accent, accent2, name: `The ${auras.length}-Way Blend` },
    features,
    artistIds: [],
    moodIds: [],
    time: "dusk",
    seed,
    serial: String(seed % 10000).padStart(4, "0"),
  };
}

/** Presence + messaging for a Jam room. Generic over playback handling. */
export function useJam(roomId: string, me: Omit<Peer, "lastSeen" | "id">) {
  const [peers, setPeers] = useState<Peer[]>([]);
  const chanRef = useRef<BroadcastChannel | null>(null);
  const idRef = useRef<string>(rid());
  const meRef = useRef(me);
  meRef.current = me;
  const playbackHandler = useRef<((s: PlaybackState) => void) | null>(null);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const chan = new BroadcastChannel(`aura-jam-${roomId}`);
    chanRef.current = chan;
    const myId = idRef.current;

    const helloMsg = (): Msg => ({ type: "hello", peer: { id: myId, ...meRef.current } });
    chan.postMessage(helloMsg());

    chan.onmessage = (e: MessageEvent<Msg>) => {
      const msg = e.data;
      if (msg.type === "hello") {
        if (msg.peer.id === myId) return;
        setPeers((prev) => {
          const known = prev.some((p) => p.id === msg.peer.id);
          if (!known) chan.postMessage(helloMsg()); // let the newcomer learn about me
          const next = prev.filter((p) => p.id !== msg.peer.id);
          return [...next, { ...msg.peer, lastSeen: Date.now() }];
        });
      } else if (msg.type === "bye") {
        setPeers((prev) => prev.filter((p) => p.id !== msg.id));
      } else if (msg.type === "playback") {
        if (msg.from !== myId) playbackHandler.current?.(msg.state);
      }
    };

    const beat = setInterval(() => chan.postMessage(helloMsg()), 3000);
    const prune = setInterval(
      () => setPeers((prev) => prev.filter((p) => Date.now() - p.lastSeen < 9000)),
      4000
    );
    const bye = () => chan.postMessage({ type: "bye", id: myId } as Msg);
    window.addEventListener("beforeunload", bye);

    return () => {
      bye();
      clearInterval(beat);
      clearInterval(prune);
      window.removeEventListener("beforeunload", bye);
      chan.close();
    };
  }, [roomId]);

  const postPlayback = useCallback((state: PlaybackState) => {
    chanRef.current?.postMessage({ type: "playback", from: idRef.current, state } as Msg);
  }, []);

  const onPlayback = useCallback((fn: (s: PlaybackState) => void) => {
    playbackHandler.current = fn;
  }, []);

  return { peers, myId: idRef.current, postPlayback, onPlayback };
}
