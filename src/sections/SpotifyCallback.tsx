import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { completeSpotifyLogin, spotifyRedirectUri } from "../lib/spotifyAuth";

export default function SpotifyCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Connecting Spotify...");
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");

    if (error) {
      setStatus(`Spotify returned: ${error}`);
      setErrored(true);
      return;
    }
    if (!code) {
      setStatus("Spotify did not return an authorization code.");
      setErrored(true);
      return;
    }

    completeSpotifyLogin(code, state)
      .then(() => {
        setStatus("Spotify connected. Taking you back…");
        window.setTimeout(() => navigate("/app/home", { replace: true }), 650);
      })
      .catch((err) => {
        setStatus(err instanceof Error ? err.message : "Spotify login failed.");
        setErrored(true);
      });
  }, [navigate, params]);

  return (
    <main className="grain grid min-h-screen place-items-center bg-[color:var(--color-ink)] px-5 text-center text-[color:var(--color-paper)]">
      <div className="max-w-lg rounded-2xl border border-white/12 bg-white/[0.06] p-8 backdrop-blur-xl">
        <p className="kicker mb-4 text-[#1db954]">Spotify auth</p>
        <h1 className="display text-4xl">{errored ? "Hmm." : "Hold on."}</h1>
        <p className="mt-4 text-white/62">{status}</p>

        {errored && (
          <div className="mt-6 rounded-xl border border-white/12 bg-black/20 p-4 text-left text-xs leading-relaxed text-white/62">
            <p className="mb-2 font-bold uppercase tracking-wide text-white/45">Register this exact redirect URI</p>
            <code className="block break-all rounded-lg bg-black/35 px-2.5 py-2 text-[#9fe3b6]">{spotifyRedirectUri()}</code>
            <p className="mt-3">
              Add it under your app at{" "}
              <span className="text-white/85">developer.spotify.com/dashboard → Settings → Redirect URIs</span>. Spotify now
              requires <span className="text-white/85">127.0.0.1</span> (not <span className="text-white/85">localhost</span>) for
              loopback — open the app at that host so the URI matches.
            </p>
          </div>
        )}

        <Link to="/app/home" className="btn-ghost mt-7 inline-flex">
          Back to app
        </Link>
      </div>
    </main>
  );
}
