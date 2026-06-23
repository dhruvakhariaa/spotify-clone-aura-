import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { completeSpotifyLogin } from "../lib/spotifyAuth";

export default function SpotifyCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Connecting Spotify...");

  useEffect(() => {
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");

    if (error) {
      setStatus(`Spotify returned: ${error}`);
      return;
    }
    if (!code) {
      setStatus("Spotify did not return an authorization code.");
      return;
    }

    completeSpotifyLogin(code, state)
      .then(() => {
        setStatus("Spotify connected.");
        window.setTimeout(() => navigate("/app/home", { replace: true }), 650);
      })
      .catch((err) => setStatus(err instanceof Error ? err.message : "Spotify login failed."));
  }, [navigate, params]);

  return (
    <main className="grain grid min-h-screen place-items-center bg-[color:var(--color-ink)] px-5 text-center text-[color:var(--color-paper)]">
      <div className="max-w-lg rounded-2xl border border-white/12 bg-white/[0.06] p-8 backdrop-blur-xl">
        <p className="kicker mb-4 text-[#1db954]">Spotify auth</p>
        <h1 className="display text-4xl">Hold on.</h1>
        <p className="mt-4 text-white/62">{status}</p>
        <Link to="/app/home" className="btn-ghost mt-7 inline-flex">
          Back to app
        </Link>
      </div>
    </main>
  );
}
