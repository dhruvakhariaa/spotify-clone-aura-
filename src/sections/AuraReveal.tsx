import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toPng } from "html-to-image";
import { decodeAura } from "../lib/encodeAura";
import { saveAuraCode } from "../state/aura";
import { recordCanvasToWebm, downloadBlob } from "../lib/exportVideo";
import { AuraPoster } from "../components/AuraPoster";

function RevealOverlay({ name, accent, onDone }: { name: string; accent: string; onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      onDone();
      return;
    }
    const t1 = setTimeout(() => setPhase(1), 900);
    const t2 = setTimeout(() => setPhase(2), 2100);
    const t3 = setTimeout(onDone, 3000);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[color:var(--color-ink)] px-6 text-center"
      exit={{ y: "-100%", transition: { duration: 0.7, ease: [0.7, 0, 0.3, 1] } }}
    >
      <AnimatePresence mode="wait">
        {phase === 0 && (
          <motion.p key="p0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="kicker text-white/60">
            Reading your frequency<span className="inline-block animate-pulse">…</span>
          </motion.p>
        )}
        {phase === 1 && (
          <motion.p key="p1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="display t-lg">
            You sound like
          </motion.p>
        )}
        {phase === 2 && (
          <motion.h1
            key="p2"
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="display t-xl"
            style={{ color: accent }}
          >
            {name}
          </motion.h1>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AuraReveal() {
  const { code = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const aura = useMemo(() => decodeAura(code), [code]);
  const posterRef = useRef<HTMLDivElement>(null);
  const [revealing, setRevealing] = useState(params.get("reveal") === "1");
  const [toast, setToast] = useState("");
  const [recording, setRecording] = useState(false);

  // Persist this Aura as the visitor's own so the whole app themes to it.
  useEffect(() => {
    if (aura) saveAuraCode(code);
  }, [aura, code]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const downloadMotion = async () => {
    const canvas = posterRef.current?.querySelector("canvas");
    if (!canvas) return;
    setRecording(true);
    showToast("Recording 5s loop…");
    try {
      const blob = await recordCanvasToWebm(canvas as HTMLCanvasElement, 5000);
      downloadBlob(blob, `aura-${aura?.serial ?? "loop"}.webm`);
      showToast("Motion downloaded ✓");
    } catch {
      showToast("Motion export failed");
    } finally {
      setRecording(false);
    }
  };

  const download = async () => {
    if (!posterRef.current) return;
    try {
      const url = await toPng(posterRef.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = `aura-${aura?.serial ?? "card"}.png`;
      a.click();
      showToast("Poster downloaded ✓");
    } catch {
      showToast("Export failed — try again");
    }
  };

  const copyLink = async () => {
    const link = `${window.location.origin}/a/${code}`;
    try {
      await navigator.clipboard.writeText(link);
      showToast("Share link copied ✓");
    } catch {
      showToast(link);
    }
  };

  if (!aura) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-6">
        <h1 className="display t-lg">This Aura doesn't exist.</h1>
        <p className="text-white/50">The link may be broken. Conjure your own instead.</p>
        <Link to="/onboard" className="btn-acid">Make your Aura ✦</Link>
      </main>
    );
  }

  return (
    <main
      className="grain min-h-screen"
      style={{ ["--accent" as string]: aura.archetype.accent, ["--accent-2" as string]: aura.archetype.accent2 }}
    >
      <AnimatePresence onExitComplete={() => params.get("reveal") && setParams({}, { replace: true })}>
        {revealing && (
          <RevealOverlay name={aura.archetype.name} accent={aura.archetype.accent} onDone={() => setRevealing(false)} />
        )}
      </AnimatePresence>

      <nav className="flex items-center justify-between px-5 md:px-10 py-5">
        <Link to="/" className="display text-xl">AURA</Link>
        <Link to="/onboard" className="btn-ghost text-xs">Make your own</Link>
      </nav>

      <div className="max-w-[1100px] mx-auto px-5 md:px-10 pb-24 grid lg:grid-cols-[420px_1fr] gap-10 lg:gap-16 items-start">
        {/* Poster */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: revealing ? 3 : 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] mx-auto shadow-2xl"
        >
          <AuraPoster ref={posterRef} aura={aura} />
        </motion.div>

        {/* Details + actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: revealing ? 3.3 : 0.25, duration: 0.6 }}
        >
          <span className="chip mb-5">✦ Archetype #{aura.serial}</span>
          <h1 className="display t-lg mb-3">{aura.archetype.name}</h1>
          <p className="text-xl text-white/70 mb-8">{aura.archetype.tagline}</p>

          <div className="border-2 border-white/15 rounded-lg p-5 mb-8">
            <p className="kicker text-white/45 mb-2">Your signature track</p>
            <p className="display text-2xl">{aura.archetype.signatureTrack.title}</p>
            <p className="text-white/60">{aura.archetype.signatureTrack.artist}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { l: "Energy", v: aura.features.energy },
              { l: "Mood", v: aura.features.valence },
              { l: "Tempo", v: aura.features.tempo },
            ].map((s) => (
              <div key={s.l} className="border-2 border-white/15 rounded-lg p-4 text-center">
                <div className="display text-3xl" style={{ color: aura.archetype.accent }}>
                  {Math.round(s.v * 100)}
                </div>
                <div className="kicker text-white/45 mt-1">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <Link to={`/s/${code}`} className="btn-acid">💞 Find your Soulmate</Link>
            <Link to="/app/home" className="btn-ghost">Enter the app ↗</Link>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={download} className="btn-ghost">↓ Poster (PNG)</button>
            <button onClick={downloadMotion} disabled={recording} className="btn-ghost disabled:opacity-40">
              {recording ? "● Recording…" : "↓ Motion (video)"}
            </button>
            <button onClick={copyLink} className="btn-ghost">Copy link</button>
          </div>

          <p className="text-white/40 text-sm mt-6">
            Same picks always make the same Aura — this one lives entirely in its link. Send it to a
            friend and your two Auras can merge into a Soulmate.
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[color:var(--color-paper)] text-[color:var(--color-ink)] font-bold px-5 py-3 rounded-full text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
