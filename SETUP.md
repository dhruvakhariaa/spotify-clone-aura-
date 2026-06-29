# AURA — setup & integrations

The app runs fully **local-first** with zero config (iTunes previews + artwork,
localStorage for playlists/likes/wrapped). The steps below are only needed to
turn on the optional integrations.

```bash
npm install
npm run dev      # → http://localhost:5173  (and http://127.0.0.1:5173)
```

---

## 1) Connect Spotify (login)

The browser login uses **Authorization Code + PKCE** — already implemented. Two
things must line up, and both are on **your** Spotify dashboard:

### a. Use `127.0.0.1`, not `localhost`
Spotify **rejects `http://localhost`** for loopback redirect URIs — it requires
the IP literal `http://127.0.0.1`. Vite is configured (`server: { host: true }`
in `vite.config.ts`) to serve both, so just open:

> **http://127.0.0.1:5173**  ← use this host, then click **Connect Spotify**

### b. Register the redirect URI
1. Go to <https://developer.spotify.com/dashboard> → your app → **Settings**.
2. Under **Redirect URIs**, add **exactly**:
   ```
   http://127.0.0.1:5173/auth/spotify/callback
   ```
3. Save. (If you deploy, also add `https://your-domain/auth/spotify/callback`.)
4. While your app is in **Development mode**, Spotify only allows users you've
   added: **Settings → User Management → add your own Spotify email.**

The Client ID goes in `.env` as `VITE_SPOTIFY_CLIENT_ID` (already set). If login
fails, the callback screen shows the exact URI it tried — copy that into the
dashboard. You can override the URI with `VITE_SPOTIFY_REDIRECT_URI` if needed.

> Full-track playback (vs 30s previews) additionally needs a **Spotify Premium**
> account on the logged-in user — that's a Spotify limitation, not the app.

---

## 2) Supabase (cloud sync for playlists / universe / wrapped)

Optional. Without it the app stays on localStorage. **A wrong/empty anon key is
why you saw playlist "errors"** — the app now disables Supabase for the session
on the first auth failure and keeps working locally, but here's how to do it
properly:

### How to get your `ANON_KEY`
1. Create a project at <https://supabase.com/dashboard> (free tier is fine).
2. Open **Project Settings** (gear icon) → **API**.
3. Copy two values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys → `anon` `public`** → `VITE_SUPABASE_ANON_KEY`
   - ⚠️ Use the **anon / public** key, **not** the `service_role` key (that one
     is secret and must never go in browser code).
4. Put them in `.env`:
   ```ini
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key...
   ```
5. **Apply the schema** so the tables exist and the anon role is allowed to
   write: open **SQL Editor** in the Supabase dashboard and run the SQL in the
   [`supabase/`](./supabase) folder of this repo (tables `playlists`,
   `playlist_tracks`, …, plus their Row Level Security policies).
6. Restart `npm run dev` (Vite reads `.env` at startup).

If REST calls still return **401/403**, the anon key is wrong or RLS has no
policy permitting the action — re-check steps 3 and 5.

---

## 2b) Accounts — Supabase Auth + Google (required to enter the app)

The app now requires a real account to open `/app/*`. Auth is handled by
**Supabase Auth** (email/password, Google OAuth, and an anonymous "guest" mode)
using the same `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from §2 — no extra
server. The session is held by `@supabase/supabase-js` (persisted to
localStorage, auto-refreshed). The guard lives in
[`src/components/auth/RequireAuth.tsx`](./src/components/auth/RequireAuth.tsx);
the provider in [`src/state/auth.tsx`](./src/state/auth.tsx).

### a. Apply the schema (adds RLS)
Run [`supabase/schema.sql`](./supabase/schema.sql) in the **SQL Editor**. It adds
the per-user tables (`auras`, `likes`) and **Row Level Security** so each user
(including guests) can only read/write their own `playlists`, `playlist_tracks`,
`auras`, and `likes`. REST calls now send the signed-in user's access token, so
`auth.uid()` policies resolve correctly. (Shared catalog tables — `artists`,
`tracks`, `karaoke_assets` — keep RLS off so the Universe cache stays writable.)

### b. Enable Email auth
**Authentication → Providers → Email** is on by default. For the smoothest local
demo you can turn **"Confirm email" off** (Authentication → Providers → Email →
*Confirm email*) so signup logs the user straight in. With it on, signup shows a
"check your email" screen and the user logs in after confirming.

### c. Enable Google OAuth (optional but recommended)
1. **Authentication → Providers → Google → Enable.**
2. Create OAuth credentials in the
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   (OAuth client → Web application).
3. **Authorized redirect URI** — add the Supabase callback shown on that provider
   page, i.e. `https://YOUR-PROJECT.supabase.co/auth/v1/callback`.
4. Paste the Google **Client ID** + **Client secret** into the Supabase Google
   provider and save.
5. In **Authentication → URL Configuration**, add your app origins to
   **Redirect URLs**: `http://127.0.0.1:5173/auth/callback` (and
   `http://localhost:5173/auth/callback`, plus your deployed origin). The app
   sends the user to `…/auth/callback?next=…` after Google.

Without Google configured, **email/password** and **Continue as guest** still
work end-to-end. If Supabase isn't configured at all, the guard lets visitors
through so the showcase stays usable local-first.

### d. Enable anonymous (guest) sign-in
**Authentication → Providers → Anonymous sign-ins → Enable** powers the
"Continue as guest" button (a real, held session with no email).

> **Per-user data:** playlists persist to Supabase scoped to the logged-in user
> (RLS-protected). Liked songs and the Aura currently persist in localStorage and
> are tied to the session via the user id; full cross-device server hydration of
> likes/aura is the next increment (tables + policies are already in the schema).

---

## 3) Real artist headshots (optional)

iTunes artwork is used by default. For real Spotify **headshots**, run the
zero-dep proxy in [`server/`](./server):

```bash
# .env needs SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET, then:
npm run server                 # serves on :8787
# and in .env, uncomment:
# VITE_SPOTIFY_PROXY=http://localhost:8787
```

Or skip all of that and just drop your own images — see
[`public/PLACEHOLDERS.md`](./public/PLACEHOLDERS.md).
