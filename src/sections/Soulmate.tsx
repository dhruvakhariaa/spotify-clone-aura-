import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { decodeAura } from "../lib/encodeAura";
import { computeSoulmate, compatibilityVerdict } from "../lib/soulmate";
import { getAuraCode } from "../state/aura";
import { GenerativeMark } from "../components/GenerativeMark";

function extractCode(input: string): string {
  const s = input.trim();
  const m = s.match(/\/(?:a|s)\/([^/?#\s]+)/);
  return m ? m[1] : s;
}

export default function Soulmate() {
  const { a = "", b } = useParams();
  const navigate = useNavigate();
  const auraA = useMemo(() => decodeAura(a), [a]);
  const auraB = useMemo(() => (b ? decodeAura(b) : null), [b]);
  const [paste, setPaste] = useState("");
  const [toast, setToast] = useState("");

  const myCode = getAuraCode();

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2200);
  };
  const copyLink = async () => {
    const link = `${window.location.origin}/s/${a}${b ? `/${b}` : ""}`;
    try {
      await navigator.clipboard.writeText(link);
      showToast("Link copied ✓");
    } catch {
      showToast(link);
    }
  };

  if (!auraA) {
    return (
      <main className="min-h-screen grid place-items-center text-center px-6 gap-5">
        <h1 className="display t-lg">This Soulmate link is broken.</h1>
        <Link to="/onboard" className="btn-acid">Make your Aura ✦</Link>
      </main>
    );
  }

  // ---- RESULT: both Auras present ----
  if (auraB) {
    const r = computeSoulmate(auraA, auraB);
    return (
      <main
        className="min-h-screen grain"
        style={{ ["--accent" as string]: auraA.archetype.accent, ["--accent-2" as string]: auraB.archetype.accent }}
      >
        <nav className="flex items-center justify-between px-5 md:px-10 py-5">
          <Link to="/" className="display text-xl">AURA</Link>
          <Link to="/onboard" className="btn-ghost text-xs">Make your own</Link>
        </nav>

        <div className="max-w-[1100px] mx-auto px-5 md:px-10 pb-24">
          <div className="text-center mb-10">
            <p className="kicker text-white/50 mb-3">Sonic Soulmate</p>
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="display leading-none"
              style={{ fontSize: "clamp(4.5rem,18vw,11rem)" }}
            >
              {r.compatibility}%
            </motion.div>
            <p className="display text-xl md:text-2xl mt-2">{compatibilityVerdict(r.compatibility)}</p>
          </div>

          {/* split cover */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[auraA, auraB].map((au, i) => (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden border-2 p-6 md:p-8 min-h-[220px] flex flex-col justify-between"
                style={{ borderColor: au.archetype.accent }}
              >
                <div className="absolute -right-8 -bottom-8 w-44 h-44 opacity-60">
                  <GenerativeMark aura={au} />
                </div>
                <div className="relative z-10">
                  <p className="kicker text-white/45">Aura 0{i + 1}</p>
                </div>
                <div className="relative z-10">
                  <h2 className="display text-2xl md:text-3xl" style={{ color: au.archetype.accent }}>
                    {au.archetype.name}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {au.archetype.genres.map((g) => (
                      <span key={g} className="text-[0.65rem] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-white/10">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* bridge song */}
          <div className="rounded-2xl border-2 border-white/15 p-6 md:p-8 mb-8 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
            <div>
              <p className="kicker text-white/45 mb-2">Your bridge song — meet in the middle</p>
              <p className="display text-2xl md:text-3xl">{r.bridge.title}</p>
              <p className="text-white/60">{r.bridge.artist}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="kicker text-white/40 mb-1">via</p>
              <p className="display text-lg" style={{ color: r.bridge.accent }}>
                {r.bridge.archetypeName.replace("The ", "")}
              </p>
            </div>
          </div>

          {r.sharedGenres.length > 0 && (
            <p className="text-center text-white/55 mb-8">
              You both live in{" "}
              <span className="text-white font-bold">{r.sharedGenres.join(", ")}</span>.
            </p>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={copyLink} className="btn-acid">↗ Share this match</button>
            <Link to="/app/home" className="btn-ghost">Open the app</Link>
          </div>
        </div>

        <Toast toast={toast} />
      </main>
    );
  }

  // ---- INVITE: only Aura A present ----
  return (
    <main
      className="min-h-screen grain flex flex-col"
      style={{ ["--accent" as string]: auraA.archetype.accent, ["--accent-2" as string]: auraA.archetype.accent2 }}
    >
      <nav className="flex items-center justify-between px-5 md:px-10 py-5">
        <Link to="/" className="display text-xl">AURA</Link>
        <Link to="/onboard" className="btn-ghost text-xs">Make your own</Link>
      </nav>

      <div className="flex-1 max-w-[760px] w-full mx-auto px-5 md:px-10 py-8 flex flex-col items-center justify-center text-center">
        <div className="w-40 h-40 mb-6">
          <GenerativeMark aura={auraA} />
        </div>
        <p className="kicker text-white/50 mb-2">You've been challenged by</p>
        <h1 className="display t-lg mb-3" style={{ color: auraA.archetype.accent }}>
          {auraA.archetype.name}
        </h1>
        <p className="text-lg text-white/60 mb-10 max-w-md">
          Add your Aura to reveal your compatibility — and the one song that bridges you both.
        </p>

        <div className="w-full max-w-md flex flex-col gap-3">
          {myCode && (
            <button onClick={() => navigate(`/s/${a}/${myCode}`)} className="btn-acid w-full">
              Match with my Aura ✦
            </button>
          )}
          <Link to={`/onboard?match=${a}`} className="btn-ghost w-full text-center">
            {myCode ? "Make a different Aura" : "Make my Aura to match"}
          </Link>

          <div className="flex items-center gap-3 my-2 text-white/30">
            <span className="rule flex-1" />
            <span className="label whitespace-nowrap">or paste a link</span>
            <span className="rule flex-1" />
          </div>
          <div className="flex gap-2">
            <input
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              placeholder="paste a friend's aura link"
              className="flex-1 bg-white/5 border-2 border-white/15 rounded-full px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)]"
            />
            <button
              onClick={() => paste.trim() && navigate(`/s/${a}/${extractCode(paste)}`)}
              className="btn-acid shrink-0"
            >
              Go
            </button>
          </div>
        </div>
      </div>

      <Toast toast={toast} />
    </main>
  );
}

function Toast({ toast }: { toast: string }) {
  return toast ? (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[color:var(--color-paper)] text-[color:var(--color-ink)] font-bold px-5 py-3 rounded-full text-sm">
      {toast}
    </div>
  ) : null;
}
