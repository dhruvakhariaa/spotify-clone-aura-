import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactionCue } from "../lib/reactions";
import { playReactionSound } from "../lib/reactions";

const STICKERS = ["wow", "bass", "2am", "loop", "again", "oof", "spark"];

interface TrailItem {
  id: number;
  x: number;
  y: number;
  label: string;
}

export function SonicCursorTrail({ enabled = true }: { enabled?: boolean }) {
  const [items, setItems] = useState<TrailItem[]>([]);
  const last = useRef(0);
  const seq = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const onMove = (event: PointerEvent) => {
      const now = performance.now();
      if (now - last.current < 130) return;
      last.current = now;
      const id = seq.current++;
      setItems((current) => [
        ...current.slice(-7),
        {
          id,
          x: event.clientX,
          y: event.clientY,
          label: STICKERS[id % STICKERS.length],
        },
      ]);
      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== id));
      }, 760);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      <AnimatePresence>
        {items.map((item) => (
          <motion.span
            key={item.id}
            initial={{ opacity: 0, scale: 0.8, x: item.x, y: item.y }}
            animate={{ opacity: 1, scale: 1, x: item.x + 14, y: item.y - 22 }}
            exit={{ opacity: 0, scale: 0.7, y: item.y - 54 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="absolute rounded-full border border-white/18 bg-[color:var(--accent)] px-2.5 py-1 text-[0.62rem] font-black uppercase text-[color:var(--color-ink)] shadow-[0_10px_30px_rgba(0,0,0,.24)]"
          >
            {item.label}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function ReactionToast({ cue, onDone }: { cue: ReactionCue | null; onDone: () => void }) {
  const onDoneRef = useRef(onDone);
  const [revealed, setRevealed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!cue) return;
    setRevealed(false);
    setImageFailed(false);
    playReactionSound(cue.tone);
    const timer = window.setTimeout(() => {
      setRevealed(true);
      playReactionSound(cue.image ? "wow" : "select");
    }, 820);
    return () => window.clearTimeout(timer);
  }, [cue]);

  return (
    <AnimatePresence>
      {cue && (
        <motion.div
          key={cue.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#07080f]/48 px-4 py-8 backdrop-blur-md"
        >
          <motion.div
            initial={{ y: 48, scale: 0.86, rotateY: -26, rotateZ: -2, filter: "blur(8px)" }}
            animate={{ y: 0, scale: 1, rotateY: revealed ? 0 : 16, rotateZ: revealed ? 0 : 2, filter: "blur(0px)" }}
            exit={{ y: 32, opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-h-[88vh] max-w-[94vw] [perspective:1200px]"
          >
            <motion.div
              animate={{ rotateY: revealed ? 0 : 180 }}
              transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-2xl border border-white/18 bg-white/[0.12] p-3 shadow-[0_30px_110px_rgba(0,0,0,.56)] backdrop-blur-2xl"
            >
              {!revealed && (
                <div className="grid h-[min(62vh,480px)] w-[min(86vw,360px)] place-items-center rounded-xl border border-white/16 bg-[linear-gradient(135deg,rgba(255,255,255,.18),rgba(184,156,255,.16),rgba(58,209,255,.12))]">
                  <motion.div
                    animate={{ opacity: [0.35, 1, 0.35], scale: [0.96, 1.04, 0.96] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                    className="text-center"
                  >
                    <p className="kicker mb-3 text-white/54">opening signal</p>
                    <p className="display text-4xl text-white">???</p>
                  </motion.div>
                </div>
              )}

              {revealed && cue.image && !imageFailed && (
                <img
                  src={cue.image}
                  alt={cue.title}
                  onError={() => setImageFailed(true)}
                  className="block h-auto w-auto rounded-xl object-contain"
                  style={{ maxWidth: "min(92vw, 760px)", maxHeight: "70vh" }}
                />
              )}

              {revealed && (!cue.image || imageFailed) && (
                <div className="grid min-h-[260px] w-[min(86vw,420px)] place-items-center rounded-xl border border-white/14 bg-white/[0.08] p-7 text-center">
                  <div>
                    <p className="display text-3xl text-white">{cue.title}</p>
                    <p className="mt-3 text-sm leading-6 text-white/62">{cue.caption}</p>
                  </div>
                </div>
              )}
            </motion.div>

            {revealed && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.28 }}
                className="mt-4 rounded-2xl border border-white/14 bg-[#10121f]/72 p-4 text-center shadow-[0_20px_70px_rgba(0,0,0,.36)] backdrop-blur-xl"
              >
                <p className="display text-xl text-white">{cue.title}</p>
                <p className="mx-auto mt-1 max-w-md text-sm leading-5 text-white/62">{cue.caption}</p>
                <button
                  type="button"
                  onClick={() => {
                    playReactionSound("laugh");
                    onDoneRef.current();
                  }}
                  className="mt-4 rounded-full bg-white px-5 py-2.5 text-xs font-black uppercase text-[#07080f] transition-transform hover:-translate-y-0.5"
                >
                  I laughed, continue
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
