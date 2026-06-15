import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ARTISTS } from "../data/artists";
import { MOODS, TIMES } from "../data/moods";
import { deriveAura } from "../lib/deriveAura";
import { encodePicks } from "../lib/encodeAura";
import { GenerativeMark } from "../components/GenerativeMark";
import type { TimeOfDay } from "../lib/types";

const MIN_ARTISTS = 3;
const MAX_ARTISTS = 6;
const MAX_MOODS = 3;

const enterAnim = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
};

export default function TastePicker() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const matchCode = params.get("match");
  const [step, setStep] = useState(0);
  const [artists, setArtists] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [time, setTime] = useState<TimeOfDay | null>(null);

  const previewAura = useMemo(() => {
    if (!artists.length) return null;
    return deriveAura(artists, moods, time ?? "dusk");
  }, [artists, moods, time]);

  const toggle = (list: string[], set: (v: string[]) => void, id: string, max: number) => {
    if (list.includes(id)) set(list.filter((x) => x !== id));
    else if (list.length < max) set([...list, id]);
  };

  const canNext =
    (step === 0 && artists.length >= MIN_ARTISTS) ||
    (step === 1 && moods.length >= 1) ||
    (step === 2 && !!time);

  const finish = () => {
    const code = encodePicks(artists, moods, time ?? "dusk");
    if (matchCode) navigate(`/s/${matchCode}/${code}`);
    else navigate(`/a/${code}?reveal=1`);
  };

  const next = () => (step < 2 ? setStep(step + 1) : finish());

  return (
    <main className="grain min-h-screen flex flex-col lg:flex-row">
      {/* LEFT — building mark */}
      <aside className="lg:w-[40%] relative flex flex-col justify-between p-5 md:p-10 border-b-2 lg:border-b-0 lg:border-r-2 border-white/15 overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <Link to="/" className="display text-xl">AURA</Link>
          <span className="kicker text-white/50">0{step + 1} / 03</span>
        </div>

        <div className="relative flex-1 flex items-center justify-center min-h-[240px] my-6">
          {previewAura ? (
            <motion.div
              key={previewAura.archetype.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-[70vmin] max-w-[420px] aspect-square"
            >
              <GenerativeMark aura={previewAura} />
            </motion.div>
          ) : (
            <div className="text-center text-white/30">
              <div className="display text-6xl mb-3">?</div>
              <p className="kicker">your mark is forming</p>
            </div>
          )}
        </div>

        <div className="relative z-10 min-h-[60px]">
          {previewAura && (
            <motion.div
              key={previewAura.archetype.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="kicker text-white/50">leaning toward</p>
              <p className="display text-2xl" style={{ color: previewAura.archetype.accent }}>
                {previewAura.archetype.name}
              </p>
            </motion.div>
          )}
        </div>
      </aside>

      {/* RIGHT — steps */}
      <section className="lg:w-[60%] flex flex-col p-5 md:p-10">
        <div className="flex-1">
            <motion.div key={step} {...enterAnim}>
            {step === 0 && (
              <div>
                <h2 className="display t-lg mb-2">Who do you love?</h2>
                <p className="text-white/55 mb-7">Pick at least {MIN_ARTISTS}. ({artists.length}/{MAX_ARTISTS})</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ARTISTS.map((a) => {
                    const on = artists.includes(a.id);
                    const locked = !on && artists.length >= MAX_ARTISTS;
                    return (
                      <button
                        key={a.id}
                        onClick={() => toggle(artists, setArtists, a.id, MAX_ARTISTS)}
                        disabled={locked}
                        className={`text-left p-3 border-2 rounded-lg transition-all ${
                          on
                            ? "bg-[color:var(--accent)] text-[color:var(--color-ink)] border-[color:var(--accent)]"
                            : locked
                            ? "border-white/10 text-white/25"
                            : "border-white/20 hover:border-white/60"
                        }`}
                      >
                        <span className="block font-bold leading-tight">{a.name}</span>
                        <span className={`text-xs ${on ? "text-black/60" : "text-white/40"}`}>{a.genre}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="display t-lg mb-2">What's the feeling?</h2>
                <p className="text-white/55 mb-7">Pick up to {MAX_MOODS}. ({moods.length}/{MAX_MOODS})</p>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {MOODS.map((m) => {
                    const on = moods.includes(m.id);
                    const locked = !on && moods.length >= MAX_MOODS;
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggle(moods, setMoods, m.id, MAX_MOODS)}
                        disabled={locked}
                        className={`text-left p-4 border-2 rounded-lg transition-all ${
                          on
                            ? "bg-[color:var(--accent-2)] text-[color:var(--color-ink)] border-[color:var(--accent-2)]"
                            : locked
                            ? "border-white/10 text-white/25"
                            : "border-white/20 hover:border-white/60"
                        }`}
                      >
                        <span className="display text-xl block">{m.label}</span>
                        <span className={`text-sm ${on ? "text-black/60" : "text-white/45"}`}>{m.blurb}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="display t-lg mb-2">When do you listen?</h2>
                <p className="text-white/55 mb-7">The hour colors everything.</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {TIMES.map((t) => {
                    const on = time === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTime(t.id)}
                        className={`text-left p-6 border-2 rounded-lg transition-all ${
                          on
                            ? "bg-[color:var(--color-paper)] text-[color:var(--color-ink)] border-[color:var(--color-paper)]"
                            : "border-white/20 hover:border-white/60"
                        }`}
                      >
                        <span className="display text-3xl block">{t.label}</span>
                        <span className={`kicker ${on ? "text-black/50" : "text-white/40"}`}>{t.hours}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            </motion.div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center justify-between pt-8 mt-6 border-t-2 border-white/15">
          <button
            onClick={() => (step > 0 ? setStep(step - 1) : navigate("/"))}
            className="btn-ghost text-xs"
          >
            ← Back
          </button>
          <button onClick={next} disabled={!canNext} className="btn-acid disabled:opacity-30 disabled:cursor-not-allowed">
            {step < 2 ? "Next →" : "Reveal my Aura ✦"}
          </button>
        </div>
      </section>
    </main>
  );
}
