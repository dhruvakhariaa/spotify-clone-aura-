import { createBrowserRouter, Navigate } from "react-router-dom";
import Landing from "./sections/Landing";
import Login from "./sections/Login";
import Signup from "./sections/Signup";
import AuthCallback from "./sections/AuthCallback";
import { RequireAuth } from "./components/auth/RequireAuth";
import TastePicker from "./sections/TastePicker";
import AuraReveal from "./sections/AuraReveal";
import Soulmate from "./sections/Soulmate";
import SpotifyCallback from "./sections/SpotifyCallback";
import AppShell from "./components/app/AppShell";
import Home from "./sections/app/Home";
import NowPlaying from "./sections/app/NowPlaying";
import Discover from "./sections/app/Discover";
import Concerts from "./sections/app/Concerts";
import ConcertDetail from "./sections/app/ConcertDetail";
import Jam from "./sections/app/Jam";
import Frequency from "./sections/app/Frequency";
import Library from "./sections/app/Library";
import Wrapped from "./sections/app/Wrapped";
import NotFound from "./sections/NotFound";

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  { path: "/onboard", element: <TastePicker /> },
  { path: "/a/:code", element: <AuraReveal /> },
  { path: "/s/:a", element: <Soulmate /> },
  { path: "/s/:a/:b", element: <Soulmate /> },
  { path: "/auth/spotify/callback", element: <SpotifyCallback /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/app",
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/app/home" replace /> },
          { path: "home", element: <Home /> },
          { path: "now", element: <NowPlaying /> },
          { path: "discover", element: <Discover /> },
          { path: "concerts", element: <Concerts /> },
          { path: "concerts/:id", element: <ConcertDetail /> },
          { path: "library", element: <Library /> },
          { path: "jam", element: <Jam /> },
          { path: "jam/:room", element: <Jam /> },
          { path: "frequency", element: <Frequency /> },
          { path: "wrapped", element: <Wrapped /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
