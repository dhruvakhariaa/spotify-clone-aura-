import { useEffect, useState } from "react";
import {
  hasSpotifyClientId,
  readSpotifySession,
  spotifySessionEvent,
  startSpotifyLogin,
  writeSpotifySession,
  type SpotifySession,
} from "../lib/spotifyAuth";

function isActive(session: SpotifySession | null) {
  return Boolean(session && session.expiresAt > Date.now() + 30_000);
}

function SpotifyGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.59 14.43a.62.62 0 01-.86.21c-2.35-1.44-5.3-1.76-8.79-.96a.62.62 0 11-.28-1.21c3.82-.88 7.09-.51 9.72 1.1.3.18.39.57.21.86zm1.22-2.72a.78.78 0 01-1.07.26c-2.69-1.65-6.79-2.13-9.97-1.17a.78.78 0 11-.45-1.49c3.64-1.1 8.15-.56 11.23 1.33.37.22.49.7.26 1.07zm.1-2.84c-3.23-1.92-8.55-2.1-11.63-1.16a.93.93 0 11-.54-1.78c3.54-1.07 9.41-.86 13.13 1.35a.93.93 0 11-.96 1.59z" />
    </svg>
  );
}

export function SpotifyConnectButton({ compact = false }: { compact?: boolean }) {
  const [session, setSession] = useState<SpotifySession | null>(() => readSpotifySession());
  const connected = isActive(session);
  const configured = hasSpotifyClientId();

  useEffect(() => {
    const update = () => setSession(readSpotifySession());
    window.addEventListener(spotifySessionEvent(), update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(spotifySessionEvent(), update);
      window.removeEventListener("storage", update);
    };
  }, []);

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => {
          if (connected) writeSpotifySession(null);
          else void startSpotifyLogin();
        }}
        disabled={!configured && !connected}
        title={connected ? "Disconnect Spotify" : configured ? "Connect Spotify" : "Set VITE_SPOTIFY_CLIENT_ID"}
        className={`grid h-10 w-10 place-items-center rounded-full border transition-colors ${
          connected
            ? "border-[#1db954] bg-[#1db954] text-[#07080f]"
            : configured
              ? "border-[#1db954]/60 bg-[#1db954]/15 text-[#1db954] hover:bg-[#1db954]/25"
              : "border-white/14 bg-white/[0.06] text-white/64 hover:text-white"
        } disabled:cursor-not-allowed disabled:opacity-35`}
      >
        <SpotifyGlyph size={18} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (connected) writeSpotifySession(null);
        else void startSpotifyLogin();
      }}
      disabled={!configured && !connected}
      title={connected ? "Disconnect Spotify" : configured ? "Connect your Spotify account" : "Set VITE_SPOTIFY_CLIENT_ID in .env"}
      className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-black uppercase tracking-wide transition-all ${
        connected
          ? "bg-[#1db954] text-[#06140b] hover:brightness-105"
          : configured
            ? "bg-[#1db954] text-[#06140b] shadow-[0_8px_24px_rgba(29,185,84,.32)] hover:-translate-y-0.5 hover:brightness-110"
            : "border border-white/14 bg-white/[0.06] text-white/55"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <SpotifyGlyph />
      {connected ? "Spotify connected" : configured ? "Connect Spotify" : "Add Spotify ID"}
    </button>
  );
}
