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
        className={`h-10 w-10 rounded-full border text-xs font-black transition-colors ${
          connected
            ? "border-[#1db954] bg-[#1db954] text-[#07080f]"
            : "border-white/14 bg-white/[0.06] text-white/64 hover:text-white"
        } disabled:cursor-not-allowed disabled:opacity-35`}
      >
        S
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
      className={`rounded-full border px-4 py-2 text-xs font-black uppercase transition-colors ${
        connected
          ? "border-[#1db954] bg-[#1db954] text-[#07080f]"
          : "border-white/14 bg-white/[0.06] text-white/64 hover:border-white/32 hover:text-white"
      } disabled:cursor-not-allowed disabled:opacity-35`}
    >
      {connected ? "Spotify connected" : configured ? "Connect Spotify" : "Add Spotify client ID"}
    </button>
  );
}
