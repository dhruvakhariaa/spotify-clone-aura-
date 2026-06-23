import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { GlobalInteractionAudio } from "./components/GlobalInteractionAudio";
import { initTheme } from "./state/theme";
import "./index.css";

initTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalInteractionAudio />
    <RouterProvider router={router} />
  </StrictMode>
);
