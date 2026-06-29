import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Bind every interface so the app is reachable at http://127.0.0.1:5173 too.
  // Spotify OAuth rejects "localhost" for loopback redirect URIs — open the app
  // on 127.0.0.1 and register http://127.0.0.1:5173/auth/spotify/callback.
  // (Vite reads this once at startup — restart `npm run dev` after changing it.)
  server: { host: true },
});
