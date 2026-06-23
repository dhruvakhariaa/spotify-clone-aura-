import { createContext, useContext, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import type { PlayableTrack } from "../lib/catalog";
import { recordListen } from "./wrapped";

interface PlayerState {
  current: PlayableTrack | null;
  queue: PlayableTrack[];
  index: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  loading: boolean;
  /** Smoothed 0..1 "loudness" proxy for the Synesthesia visualizer (read in a rAF loop, not React state). */
  levelRef: MutableRefObject<number>;
  play: (tracks: PlayableTrack[], startIndex?: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (sec: number) => void;
  setVolume: (v: number) => void;
}

const Ctx = createContext<PlayerState | null>(null);

export function usePlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!audioRef.current && typeof Audio !== "undefined") {
    audioRef.current = new Audio();
    audioRef.current.preload = "auto";
  }

  const [queue, setQueue] = useState<PlayableTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const levelRef = useRef(0);

  const current = queue[index] ?? null;

  // Wire audio element events once.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
    const onTime = () => setCurrentTime(a.currentTime);
    const onDur = () => setDuration(a.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setLoading(true);
    const onPlaying = () => setLoading(false);
    const onEnded = () => setIndex((i) => (i + 1 < queue.length ? i + 1 : i));
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("durationchange", onDur);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("waiting", onWaiting);
    a.addEventListener("playing", onPlaying);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("durationchange", onDur);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("waiting", onWaiting);
      a.removeEventListener("playing", onPlaying);
      a.removeEventListener("ended", onEnded);
    };
  }, [queue.length, volume]);

  // Load + play whenever the current track changes.
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !current) return;
    a.src = current.url;
    setLoading(true);
    setCurrentTime(0);
    recordListen(current);
    a.play().then(() => setLoading(false)).catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  // Synthetic "loudness" — a convincing pulse derived from play state + a beat.
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const a = audioRef.current;
      if (a && !a.paused) {
        const t = a.currentTime;
        const beat = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 2); // ~2 Hz pulse
        const flutter = 0.5 + 0.5 * Math.sin(t * 13.0 + Math.sin(t * 3.1) * 4);
        const target = Math.min(1, 0.35 + 0.4 * beat + 0.25 * flutter);
        levelRef.current += (target - levelRef.current) * 0.2;
      } else {
        levelRef.current += (0 - levelRef.current) * 0.08;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const api = useMemo<PlayerState>(() => {
    const a = () => audioRef.current;
    return {
      current,
      queue,
      index,
      isPlaying,
      currentTime,
      duration,
      volume,
      loading,
      levelRef,
      play: (tracks, startIndex = 0) => {
        setQueue(tracks);
        setIndex(startIndex);
      },
      toggle: () => {
        const el = a();
        if (!el || !current) return;
        if (el.paused) el.play().catch(() => {});
        else el.pause();
      },
      next: () => setIndex((i) => (i + 1 < queue.length ? i + 1 : i)),
      prev: () => {
        const el = a();
        if (el && el.currentTime > 3) {
          el.currentTime = 0;
          return;
        }
        setIndex((i) => (i > 0 ? i - 1 : i));
      },
      seek: (sec) => {
        const el = a();
        if (el) el.currentTime = sec;
      },
      setVolume: (v) => {
        const el = a();
        if (el) el.volume = v;
        setVolumeState(v);
      },
    };
  }, [current, queue, index, isPlaying, currentTime, duration, volume, loading]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
