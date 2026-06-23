Spotify auth and persistence plan
=================================

Current concept implementation:
- Browser login uses Spotify Authorization Code with PKCE.
- Required browser env var: `VITE_SPOTIFY_CLIENT_ID`.
- Spotify callback URL: `/auth/spotify/callback`.
- Add the full local callback URL to the Spotify Developer Dashboard, for example:
  `http://localhost:5173/auth/spotify/callback`
- Access token, refresh token, scopes, and expiry are stored under
  `localStorage["aura.spotify.session"]` for the concept build.

Current local app persistence:
- Theme preference: `localStorage["aura.theme"]`
- Generated Aura code: `localStorage["aura.code"]`
- Live Wrapped listening events: `localStorage["aura.listen.history"]`

Production direction:
- Use Supabase Auth or a small Node auth service to identify the user.
- Store durable user state by user id:
  - theme preference
  - latest Aura code and Aura history
  - live listening events for Wrapped
  - Aura-native collaborative playlists
- Keep Spotify refresh tokens server-side or in Supabase-managed secure storage.
- Use the browser access token only for short-lived Web API/Web Playback SDK calls.
