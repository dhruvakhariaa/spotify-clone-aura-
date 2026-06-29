import { createContext, useContext, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import type { PlayableTrack } from "../lib/catalog";
import { fisherYates } from "../lib/universe";
import { playSpotifyQueue, toggleSpotifyPlayback } from "../lib/spotifyPlayback";
import { getActiveSpotifySession, spotifyUrisFromTracks } from "../lib/spotifyApi";
import { recordListen } from "./wrapped";

type Transport = "preview" | "spotify" | "karaoke";

interface PlayerState {
  current: PlayableTrack | null;
  queue: PlayableTrack[];
  originalQueue: PlayableTrack[];
  index: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  loading: boolean;
  shuffleEnabled: boolean;
  karaokeMode: boolean;
  transport: Transport;
  canUseKaraoke: boolean;
  canUseSpotify: boolean;
  /** Smoothed 0..1 "loudness" proxy for the Synesthesia visualizer (read in a rAF loop, not React state). */
  levelRef: MutableRefObject<number>;
  play: (tracks: PlayableTrack[], startIndex?: number) => void;
  shufflePlay: (tracks: PlayableTrack[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (sec: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  setShuffle: (enabled: boolean) => void;
  toggleKaraoke: () => void;
  exitKaraoke: () => void;
}

const Ctx = createContext<PlayerState | null>(null);

export function usePlayer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

function clampIndex(index: number, tracks: PlayableTrack[]) {
  return Math.min(Math.max(index, 0), Math.max(0, tracks.length - 1));
}

function shuffleKeepingCurrent(tracks: PlayableTrack[], current: PlayableTrack | null) {
  if (!current) return fisherYates(tracks);
  const rest = tracks.filter((track) => track.id !== current.id);
  return [current, ...fisherYates(rest)];
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!audioRef.current && typeof Audio !== "undefined") {
    audioRef.current = new Audio();
    audioRef.current.preload = "auto";
  }

  const [queue, setQueue] = useState<PlayableTrack[]>([]);
  const [originalQueue, setOriginalQueue] = useState<PlayableTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [karaokeMode, setKaraokeMode] = useState(false);
  const [transport, setTransport] = useState<Transport>("preview");
  const levelRef = useRef(0);

  const current = queue[index] ?? null;
  const canUseKaraoke = current?.karaokeStatus === "ready" && Boolean(current.karaokeUrl);
  const canUseSpotify = Boolean(current?.spotifyUri && getActiveSpotifySession());

  // Wire audio element events once.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
    const onTime = () => setCurrentTime(a.currentTime);
    const onDur = () => setDuration(a.duration || current?.durationSec || 0);
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
  }, [current?.durationSec, queue.length, volume]);

  // Load + play whenever the current track changes or karaoke mode changes.
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !current) return;

    const sourceUrl = karaokeMode && canUseKaraoke ? current.karaokeUrl : current.url || current.previewUrl || "";
    const spotifyQueue = spotifyUrisFromTracks(queue);
    const spotifyIndex = current.spotifyUri ? spotifyQueue.indexOf(current.spotifyUri) : -1;
    const shouldUseSpotify = !karaokeMode && current.spotifyUri && spotifyIndex >= 0 && getActiveSpotifySession();

    setLoading(true);
    setCurrentTime(0);
    setDuration(current.durationSec || 0);
    recordListen(current);

    if (shouldUseSpotify) {
      a.pause();
      a.removeAttribute("src");
      setTransport("spotify");
      playSpotifyQueue(spotifyQueue, spotifyIndex)
        .then(() => {
          setIsPlaying(true);
          setLoading(false);
        })
        .catch(() => {
          if (!sourceUrl) {
            setIsPlaying(false);
            setLoading(false);
            return;
          }
          setTransport("preview");
          a.src = sourceUrl;
          a.play().then(() => setLoading(false)).catch(() => setLoading(false));
        });
      return;
    }

    if (!sourceUrl) {
      setTransport("preview");
      setIsPlaying(false);
      setLoading(false);
      return;
    }

    setTransport(karaokeMode && canUseKaraoke ? "karaoke" : "preview");
    a.src = sourceUrl;
    a.play().then(() => setLoading(false)).catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, karaokeMode]);

  useEffect(() => {
    if (!karaokeMode || canUseKaraoke) return;
    setKaraokeMode(false);
  }, [canUseKaraoke, karaokeMode]);

  // Spotify SDK state does not update the HTML audio clock, so keep a lightweight local timer.
  useEffect(() => {
    if (transport !== "spotify" || !isPlaying) return;
    const id = window.setInterval(() => {
      setCurrentTime((time) => Math.min(time + 1, duration || current?.durationSec || time + 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [current?.durationSec, duration, isPlaying, transport]);

  // Synthetic "loudness" - a convincing pulse derived from play state + a beat.
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const a = audioRef.current;
      if (isPlaying) {
        const t = transport === "spotify" ? currentTime : a?.currentTime ?? currentTime;
        const beat = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 2);
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
  }, [currentTime, isPlaying, transport]);

  const api = useMemo<PlayerState>(() => {
    const a = () => audioRef.current;
    const setShuffle = (enabled: boolean) => {
      setShuffleEnabled(enabled);
      setQueue((active) => {
        if (!active.length) return active;
        const base = originalQueue.length ? originalQueue : active;
        const activeCurrent = active[index] ?? current;
        if (enabled) {
          setIndex(0);
          return shuffleKeepingCurrent(base, activeCurrent);
        }
        const restoredIndex = clampIndex(base.findIndex((track) => track.id === activeCurrent?.id), base);
        setIndex(restoredIndex < 0 ? 0 : restoredIndex);
        return base;
      });
    };

    return {
      current,
      queue,
      originalQueue,
      index,
      isPlaying,
      currentTime,
      duration,
      volume,
      loading,
      shuffleEnabled,
      karaokeMode,
      transport,
      canUseKaraoke,
      canUseSpotify,
      levelRef,
      play: (tracks, startIndex = 0) => {
        const safeIndex = clampIndex(startIndex, tracks);
        setOriginalQueue(tracks);
        if (shuffleEnabled) {
          const shuffled = shuffleKeepingCurrent(tracks, tracks[safeIndex] ?? null);
          setQueue(shuffled);
          setIndex(0);
        } else {
          setQueue(tracks);
          setIndex(safeIndex);
        }
      },
      shufflePlay: (tracks) => {
        const shuffled = fisherYates(tracks);
        setOriginalQueue(tracks);
        setQueue(shuffled);
        setIndex(0);
        setShuffleEnabled(true);
      },
      toggle: () => {
        const el = a();
        if (!current) return;
        if (transport === "spotify") {
          toggleSpotifyPlayback()
            .then(() => setIsPlaying((playing) => !playing))
            .catch(() => {});
          return;
        }
        if (!el) return;
        if (el.paused) el.play().catch(() => {});
        else el.pause();
      },
      next: () => setIndex((i) => (i + 1 < queue.length ? i + 1 : i)),
      prev: () => {
        const el = a();
        if (transport !== "spotify" && el && el.currentTime > 3) {
          el.currentTime = 0;
          return;
        }
        setIndex((i) => (i > 0 ? i - 1 : i));
      },
      seek: (sec) => {
        const el = a();
        if (transport === "spotify") {
          setCurrentTime(sec);
          return;
        }
        if (el) el.currentTime = sec;
      },
      setVolume: (v) => {
        const el = a();
        if (el) el.volume = v;
        setVolumeState(v);
      },
      toggleShuffle: () => setShuffle(!shuffleEnabled),
      setShuffle,
      toggleKaraoke: () => {
        if (!canUseKaraoke && !karaokeMode) return;
        setKaraokeMode((enabled) => !enabled);
      },
      exitKaraoke: () => setKaraokeMode(false),
    };
  }, [
    canUseKaraoke,
    canUseSpotify,
    current,
    currentTime,
    duration,
    index,
    isPlaying,
    karaokeMode,
    loading,
    originalQueue,
    queue,
    shuffleEnabled,
    transport,
    volume,
  ]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
