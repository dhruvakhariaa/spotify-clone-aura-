import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Radio } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { PixelCity } from "../components/landing/PixelCity";
import { CONCEPTS, MotionTakeover, type MotionConcept } from "../components/landing/concepts";

/** Track a media query as React state. */
function useMedia(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return matches;
}

export default function Landing() {
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const isMobile = useMedia("(max-width: 767px)");
  const [active, setActive] = useState<MotionConcept | null>(null);

  // Lock body scroll while a take-over is open.
  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <main className="on-dark relative h-screen w-screen overflow-hidden bg-[#08060f] text-white">
      {/* On mobile, free-roaming hotspots are hard to tap — the scene stays a
          static backdrop and concepts move into a tap-friendly row below. */}
      <PixelCity reduced={reduced || isMobile} onSelect={setActive} />

      {/* top nav */}
      <nav className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-5 py-4 md:px-10">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#1db954] text-[#07080f]">
            <Radio size={18} />
          </span>
          <span className="display text-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,.6)]">AURA</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <Link to="/login" className="btn-ghost text-xs">
            Log in
          </Link>
        </div>
      </nav>

      {/* tagline + CTA */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-5 pb-8 md:px-12 md:pb-12">
        <div className="mx-auto max-w-[1480px]">
          <p className="kicker mb-3 text-white/70 drop-shadow-[0_2px_8px_rgba(0,0,0,.7)]">An interactive music city</p>
          <h1 className="display max-w-3xl text-5xl leading-[0.92] drop-shadow-[0_4px_18px_rgba(0,0,0,.8)] md:text-8xl">
            scene set hai,<br />gaana laga
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/74 drop-shadow-[0_2px_8px_rgba(0,0,0,.7)] md:text-base">
            The city is the set. Click a character and their music plays — then step into the real app.
          </p>

          {/* desktop hint / mobile concept row */}
          {isMobile ? (
            <div className="pointer-events-auto mt-5 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
              {CONCEPTS.map((concept) => (
                <button
                  key={concept.id}
                  onClick={() => setActive(concept)}
                  className="shrink-0 rounded-full border border-white/15 bg-black/50 px-3 py-2 text-xs font-bold backdrop-blur-sm"
                  style={{ color: concept.accent }}
                >
                  {concept.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-white/45">
              Tap a glowing character to play their concept
            </p>
          )}

          <div className="pointer-events-auto mt-6 flex flex-wrap gap-3">
            <Link to="/signup" className="btn-blue inline-flex items-center gap-2">
              Create your AURA <ArrowUpRight size={18} />
            </Link>
            <Link to="/login" className="btn-ghost inline-flex items-center gap-2">
              I already have one
            </Link>
          </div>
        </div>
      </div>

      {active && <MotionTakeover concept={active} onClose={() => setActive(null)} />}
    </main>
  );
}
