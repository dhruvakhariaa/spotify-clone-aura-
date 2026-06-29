import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AuthProvider } from "./state/auth";
import { GlobalInteractionAudio } from "./components/GlobalInteractionAudio";
import { initTheme } from "./state/theme";
import "./index.css";

// Keep Connect -> authorize -> callback on a single origin so the PKCE verifier
// (origin-keyed in localStorage) survives the round-trip. The Spotify app's
// registered redirect uses 127.0.0.1; vite.config has server.host:true so it's
// served there too. Without this, opening at localhost loses the verifier and
// the callback fails with "Missing Spotify PKCE verifier".
if (typeof window !== "undefined" && window.location.hostname === "localhost") {
  window.location.replace(window.location.href.replace("localhost", "127.0.0.1"));
}

initTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <GlobalInteractionAudio />
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
