import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Clapperboard, Disc3, Globe2, Mic2, Music2 } from "lucide-react";
import { ROSTER, CATEGORY_LABELS, type RosterCategory } from "../data/roster";
import { MOODS, TIMES } from "../data/moods";
import { deriveAura } from "../lib/deriveAura";
import { encodePicks } from "../lib/encodeAura";
import { playReactionSound, reactionForArtist, reactionForMood, reactionForTime, type ReactionCue } from "../lib/reactions";
import { GenerativeMark } from "../components/GenerativeMark";
import { SelectableArtist } from "../components/SelectableArtist";
import { ReactionToast } from "../components/SonicReaction";
import { DisplayCard, DisplayCards, type DisplayCardProps } from "../components/ui/display-cards";
import type { TimeOfDay } from "../lib/types";

const MIN_ARTISTS = 3;
const MAX_ARTISTS = 6;
const MAX_MOODS = 3;

const FILTERS: { id: "all" | RosterCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "bollywood", label: CATEGORY_LABELS.bollywood },
  { id: "indie-in", label: "Indie" },
  { id: "tollywood", label: CATEGORY_LABELS.tollywood },
  { id: "hollywood", label: CATEGORY_LABELS.hollywood },
];

const CATEGORY_CARDS: DisplayCardProps[] = [
  {
    id: "all",
    icon: <Disc3 className="size-4" />,
    title: "All",
    description: "Every lane open",
    date: `${ROSTER.length} artists`,
    iconClassName: "bg-[#33363d] text-white",
    titleClassName: "text-[#8f9299]",
  },
  {
    id: "bollywood",
    icon: <Clapperboard className="size-4" />,
    title: "Bollywood",
    description: "Playback, hooks, memory",
    date: `${ROSTER.filter((a) => a.category === "bollywood").length} artists`,
    iconClassName: "bg-[#33363d] text-white",
    titleClassName: "text-[#8f9299]",
  },
  {
    id: "indie-in",
    icon: <Mic2 className="size-4" />,
    title: "Indie",
    description: "Rooms, guitars, longing",
    date: `${ROSTER.filter((a) => a.category === "indie-in").length} artists`,
    iconClassName: "bg-[#315dff] text-white",
    titleClassName: "text-[#315dff]",
  },
  {
    id: "tollywood",
    icon: <Music2 className="size-4" />,
    title: "Tollywood/South",
    description: "Mass BGM and melody",
    date: `${ROSTER.filter((a) => a.category === "tollywood").length} artists`,
    iconClassName: "bg-[#33363d] text-white",
    titleClassName: "text-[#8f9299]",
  },
  {
    id: "hollywood",
    icon: <Globe2 className="size-4" />,
    title: "Global",
    description: "Pop, rap, alt, stadiums",
    date: `${ROSTER.filter((a) => a.category === "hollywood").length} artists`,
    iconClassName: "bg-[#315dff] text-white",
    titleClassName: "text-[#315dff]",
  },
];

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
  const [filter, setFilter] = useState<"all" | RosterCategory | null>(null);
  const [reaction, setReaction] = useState<ReactionCue | null>(null);
  const [pendingStep, setPendingStep] = useState<number | null>(null);

  const visibleArtists = useMemo(
    () => (!filter ? [] : filter === "all" ? ROSTER : ROSTER.filter((a) => a.category === filter)),
    [filter]
  );

  const previewAura = useMemo(() => {
    if (!artists.length) return null;
    return deriveAura(artists, moods, time ?? "dusk");
  }, [artists, moods, time]);

  const selectedCard = CATEGORY_CARDS.find((card) => card.id === filter);

  const showReaction = (cue: ReactionCue, nextStep?: number) => {
    setPendingStep(nextStep ?? null);
    setReaction({ ...cue, id: `${cue.id}-${Date.now()}` });
  };

  const closeReaction = () => {
    setReaction(null);
    if (pendingStep !== null) {
      setStep(pendingStep);
      setPendingStep(null);
    }
  };

  const toggle = (list: string[], set: (v: string[]) => void, id: string, max: number) => {
    playReactionSound(list.includes(id) ? "tap" : "select");
    if (list.includes(id)) set(list.filter((x) => x !== id));
    else if (list.length < max) set([...list, id]);
  };

  const canNext =
    (step === 0 && artists.length >= MIN_ARTISTS) ||
    (step === 1 && moods.length >= 1) ||
    (step === 2 && !!time);

  const finish = () => {
    playReactionSound("success");
    const code = encodePicks(artists, moods, time ?? "dusk");
    if (matchCode) navigate(`/s/${matchCode}/${code}`);
    else navigate(`/a/${code}?reveal=1`);
  };

  const next = () => {
    if (!canNext) return;
    if (step === 0) {
      showReaction(reactionForArtist(artists[0]), 1);
      return;
    }
    if (step === 1) {
      showReaction(reactionForMood(moods), 2);
      return;
    }
    finish();
  };

  const selectCategory = (id: string) => {
    playReactionSound("flip");
    setFilter(id as "all" | RosterCategory);
  };

  return (
    <main className="grain flex min-h-screen flex-col lg:flex-row">
      {/* Cursor sticker trail disabled for now. Keep SonicCursorTrail in components/SonicReaction.tsx for a later cursor-sound pass. */}
      {/* <SonicCursorTrail /> */}
      <ReactionToast cue={reaction} onDone={closeReaction} />

      <aside className="relative flex flex-col justify-between overflow-hidden border-b-2 border-white/15 p-5 md:p-10 lg:w-[40%] lg:border-b-0 lg:border-r-2">
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="display text-xl">
            AURA
          </Link>
          <span className="kicker text-white/50">0{step + 1} / 03</span>
        </div>

        <div className="relative my-6 flex min-h-[240px] flex-1 items-center justify-center">
          {previewAura ? (
            <motion.div
              key={previewAura.archetype.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="aspect-square w-[70vmin] max-w-[420px]"
            >
              <GenerativeMark aura={previewAura} />
            </motion.div>
          ) : (
            <div className="text-center text-white/30">
              <div className="display mb-3 text-6xl">?</div>
              <p className="kicker">your mark is forming</p>
            </div>
          )}
        </div>

        <div className="relative z-10 min-h-[60px]">
          {previewAura && (
            <motion.div key={previewAura.archetype.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <p className="kicker text-white/50">leaning toward</p>
              <p className="display text-2xl" style={{ color: previewAura.archetype.accent }}>
                {previewAura.archetype.name}
              </p>
            </motion.div>
          )}
        </div>
      </aside>

      <section className="flex flex-col p-5 md:p-10 lg:w-[60%]">
        <div className="flex-1">
          <motion.div key={step} {...enterAnim}>
            {step === 0 && (
              <div>
                <h2 className="display mb-2 text-4xl md:text-5xl">Who do you love?</h2>
                <p className="mb-5 text-white/55">
                  Open a lane, then pick at least {MIN_ARTISTS}. ({artists.length}/{MAX_ARTISTS})
                </p>

                {!filter && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.12, duration: 0.35 }}
                    className="flex min-h-[430px] items-center justify-center py-10"
                  >
                    <DisplayCards cards={CATEGORY_CARDS} onSelect={selectCategory} />
                  </motion.div>
                )}

                {filter && selectedCard && (
                  <div>
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                      <motion.div
                        initial={{ y: 80, rotateX: -90, opacity: 0 }}
                        animate={{ y: 0, rotateX: 0, opacity: 1 }}
                        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full max-w-[18rem]"
                      >
                        <DisplayCard {...selectedCard} selected className="h-28 max-w-[18rem] -skew-y-0" />
                      </motion.div>

                      <div className="flex flex-wrap gap-2">
                        {FILTERS.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => selectCategory(f.id)}
                            className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold uppercase transition-colors ${
                              filter === f.id
                                ? "border-[color:var(--color-blue)] bg-[color:var(--color-blue)] text-white"
                                : "border-white/15 text-white/55 hover:border-white/40"
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            playReactionSound("tap");
                            setFilter(null);
                          }}
                          className="rounded-full border-2 border-white/15 px-3 py-1.5 text-xs font-bold uppercase text-white/55 hover:border-white/40"
                        >
                          Cards
                        </button>
                      </div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="grid grid-cols-3 gap-2.5 sm:grid-cols-4"
                    >
                      {visibleArtists.map((a) => (
                        <SelectableArtist
                          key={a.name}
                          name={a.name}
                          sub={a.blurb}
                          selected={artists.includes(a.name)}
                          disabled={artists.length >= MAX_ARTISTS}
                          onToggle={() => toggle(artists, setArtists, a.name, MAX_ARTISTS)}
                        />
                      ))}
                    </motion.div>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="display mb-2 text-4xl md:text-5xl">What's the feeling?</h2>
                <p className="mb-7 text-white/55">
                  Pick up to {MAX_MOODS}. ({moods.length}/{MAX_MOODS})
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {MOODS.map((m) => {
                    const on = moods.includes(m.id);
                    const locked = !on && moods.length >= MAX_MOODS;
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggle(moods, setMoods, m.id, MAX_MOODS)}
                        disabled={locked}
                        className={`rounded-lg border-2 p-4 text-left transition-all ${
                          on
                            ? "border-[color:var(--accent-2)] bg-[color:var(--accent-2)] text-[color:var(--color-ink)]"
                            : locked
                              ? "border-white/10 text-white/25"
                              : "border-white/20 hover:border-white/60"
                        }`}
                      >
                        <span className="display block text-xl">{m.label}</span>
                        <span className={`text-sm ${on ? "text-black/60" : "text-white/45"}`}>{m.blurb}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="display mb-2 text-4xl md:text-5xl">When do you listen?</h2>
                <p className="mb-7 text-white/55">The hour colors everything.</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {TIMES.map((t) => {
                    const on = time === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          playReactionSound("select");
                          setTime(t.id);
                          const cue = reactionForTime(t.id);
                          if (cue) showReaction(cue);
                        }}
                        className={`rounded-lg border-2 p-6 text-left transition-all ${
                          on
                            ? "border-[color:var(--color-paper)] bg-[color:var(--color-paper)] text-[color:var(--color-ink)]"
                            : "border-white/20 hover:border-white/60"
                        }`}
                      >
                        <span className="display block text-3xl">{t.label}</span>
                        <span className={`kicker ${on ? "text-black/50" : "text-white/40"}`}>{t.hours}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t-2 border-white/15 pt-8">
          <button
            onClick={() => {
              playReactionSound("tap");
              if (step > 0) setStep(step - 1);
              else navigate("/");
            }}
            className="btn-ghost text-xs"
          >
            Back
          </button>
          <button onClick={next} disabled={!canNext} className="btn-acid disabled:cursor-not-allowed disabled:opacity-30">
            {step < 2 ? "Next" : "Reveal my Aura"}
          </button>
        </div>
      </section>
    </main>
  );
}
