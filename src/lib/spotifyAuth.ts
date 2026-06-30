export interface SpotifySession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope: string;
}

const SESSION_KEY = "aura.spotify.session";
const VERIFIER_KEY = "aura.spotify.pkce.verifier";
const STATE_KEY = "aura.spotify.pkce.state";
const EVENT = "aura:spotify";

export const SPOTIFY_SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-top-read",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-private",
  "playlist-modify-public",
];

function clientId() {
  return import.meta.env.VITE_SPOTIFY_CLIENT_ID ?? "";
}

export function spotifyRedirectUri() {
  // Use the configured URI only when it matches the current origin (local dev on
  // 127.0.0.1). On any other origin (e.g. the deployed Vercel domain) derive it
  // from the runtime origin so the callback works without env reconfiguration.
  const configured = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  if (configured) {
    try {
      if (new URL(configured).origin === window.location.origin) return configured;
    } catch {
      /* malformed env — fall through */
    }
  }
  return `${window.location.origin}/auth/spotify/callback`;
}

function randomString(length: number) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

function base64Url(input: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function challenge(verifier: string) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64Url(digest);
}

export function readSpotifySession(): SpotifySession | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!parsed?.accessToken || typeof parsed.expiresAt !== "number") return null;
    return parsed as SpotifySession;
  } catch {
    return null;
  }
}

export function writeSpotifySession(session: SpotifySession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function spotifySessionEvent() {
  return EVENT;
}

export function hasSpotifyClientId() {
  return Boolean(clientId());
}

export async function startSpotifyLogin() {
  const id = clientId();
  if (!id) throw new Error("Missing VITE_SPOTIFY_CLIENT_ID");

  const verifier = randomString(64);
  const state = randomString(32);
  localStorage.setItem(VERIFIER_KEY, verifier);
  localStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: id,
    scope: SPOTIFY_SCOPES.join(" "),
    code_challenge_method: "S256",
    code_challenge: await challenge(verifier),
    redirect_uri: spotifyRedirectUri(),
    state,
  });

  window.location.assign(`https://accounts.spotify.com/authorize?${params.toString()}`);
}

export async function completeSpotifyLogin(code: string, returnedState: string | null) {
  const verifier = localStorage.getItem(VERIFIER_KEY);
  const expectedState = localStorage.getItem(STATE_KEY);
  localStorage.removeItem(VERIFIER_KEY);
  localStorage.removeItem(STATE_KEY);

  if (!verifier) throw new Error("Missing Spotify PKCE verifier");
  if (!returnedState || returnedState !== expectedState) throw new Error("Spotify state mismatch");

  const body = new URLSearchParams({
    client_id: clientId(),
    grant_type: "authorization_code",
    code,
    redirect_uri: spotifyRedirectUri(),
    code_verifier: verifier,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) throw new Error("Spotify token exchange failed");
  const token = await response.json();
  const session: SpotifySession = {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: Date.now() + token.expires_in * 1000,
    scope: token.scope ?? "",
  };
  writeSpotifySession(session);
  return session;
}
