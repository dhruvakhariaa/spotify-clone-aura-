import { createBrowserRouter, Navigate } from "react-router-dom";
import Landing from "./sections/Landing";
import TastePicker from "./sections/TastePicker";
import AuraReveal from "./sections/AuraReveal";
import Soulmate from "./sections/Soulmate";
import AppShell from "./components/app/AppShell";
import Home from "./sections/app/Home";
import NowPlaying from "./sections/app/NowPlaying";
import Discover from "./sections/app/Discover";
import ComingSoon from "./sections/app/ComingSoon";

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/onboard", element: <TastePicker /> },
  { path: "/a/:code", element: <AuraReveal /> },
  { path: "/s/:a", element: <Soulmate /> },
  { path: "/s/:a/:b", element: <Soulmate /> },
  {
    path: "/app",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/app/home" replace /> },
      { path: "home", element: <Home /> },
      { path: "now", element: <NowPlaying /> },
      { path: "discover", element: <Discover /> },
      {
        path: "library",
        element: (
          <ComingSoon
            title="Your Library"
            blurb="Collaborative playlists with auto-generated Aura covers, where every contributor shows up as their own color. Coming next."
          />
        ),
      },
      {
        path: "jam",
        element: (
          <ComingSoon
            title="Jam"
            blurb="Live rooms where everyone's Aura merges into one group Aura, and playback stays perfectly in sync. Realtime build is next."
          />
        ),
      },
      {
        path: "wrapped",
        element: (
          <ComingSoon
            title="Wrapped — always on"
            blurb="Not once a year. A living recap that watches your Aura evolve through the seasons and culminates in your future self."
          />
        ),
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
