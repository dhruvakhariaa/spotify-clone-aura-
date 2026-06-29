import { getActiveSpotifySession, startSpotifyPlayback } from "./spotifyApi";

declare global {
  interface Window {
    Spotify?: any;
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

let sdkPromise: Promise<void> | null = null;
let playerPromise: Promise<{ player: any; deviceId: string }> | null = null;

function loadSpotifySdk() {
  if (window.Spotify) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<void>((resolve, reject) => {
    window.onSpotifyWebPlaybackSDKReady = () => resolve();
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    script.onerror = () => reject(new Error("Spotify Web Playback SDK failed to load"));
    document.body.appendChild(script);
  });
  return sdkPromise;
}

export async function getSpotifyPlaybackDevice() {
  const session = getActiveSpotifySession();
  if (!session) throw new Error("Spotify login is required");
  if (playerPromise) return playerPromise;

  playerPromise = (async () => {
    await loadSpotifySdk();
    const player = new window.Spotify.Player({
      name: "AURA Universe Player",
      getOAuthToken: (cb: (token: string) => void) => {
        const latest = getActiveSpotifySession();
        if (latest) cb(latest.accessToken);
      },
      volume: 0.8,
    });

    const deviceId = await new Promise<string>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("Spotify device did not become ready")), 12_000);
      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        window.clearTimeout(timeout);
        resolve(device_id);
      });
      player.addListener("initialization_error", ({ message }: { message: string }) => reject(new Error(message)));
      player.addListener("authentication_error", ({ message }: { message: string }) => reject(new Error(message)));
      player.addListener("account_error", ({ message }: { message: string }) => reject(new Error(message)));
      player.connect();
    });

    return { player, deviceId };
  })();

  return playerPromise;
}

export async function playSpotifyQueue(uris: string[], index: number) {
  const { deviceId } = await getSpotifyPlaybackDevice();
  await startSpotifyPlayback({ deviceId, uris, index });
}

export async function toggleSpotifyPlayback() {
  const device = await getSpotifyPlaybackDevice();
  await device.player.togglePlay();
}
