import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { usePlayer } from "../../state/player";
import { useMyAura } from "../../state/aura";
import {
  rosterByCategory, nearestArtists, CATEGORY_LABELS, type RosterCategory,
} from "../../data/roster";
import { searchSongs, tracksByArtist, type PlayableTrack } from "../../lib/catalog";
import { TrackCard } from "../../components/app/TrackCard";
import { ArtistCard } from "../../components/app/ArtistCard";
import type { FeatureVector } from "../../lib/types";

const CATEGORIES: RosterCategory[] = ["indie-in", "bollywood", "tollywood", "hollywood"];

export default function Discover() {
  const p = usePlayer();
  const aura = useMyAura();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayableTrack[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [loadingArtist, setLoadingArtist] = useState<string | null>(null);

  // Mood re-tuning — drag to reshape the "tuned for you" row in real time.
  const [energy, setEnergy] = useState(aura?.features.energy ?? 0.5);
  const [valence, setValence] = useState(aura?.features.valence ?? 0.5);

  const tuned = useMemo(() => {
    const v: FeatureVector = {
      energy,
      valence,
      tempo: aura?.features.tempo ?? 0.5,
      acoustic: aura?.features.acoustic ?? 0.5,
    };
    return nearestArtists(v, 8);
  }, [energy, valence, aura]);

  const runSearch = async (term: string) => {
    if (!term.trim()) {
      setResults(null);
      return;
    }
    setSearching(true);
    try {
      const r = await searchSongs(term, 18);
      setResults(r);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const playArtist = async (name: string) => {
    setLoadingArtist(name);
    try {
      const t = await tracksByArtist(name, 15);
      if (t.length) p.play(t, 0);
    } finally {
      setLoadingArtist(null);
    }
  };

  const playResultFrom = (i: number) => {
    if (!results) return;
    if (p.current?.id === results[i].id) p.toggle();
    else p.play(results, i);
  };

  return (
    <div className="px-5 md:px-10 py-8 md:py-12 max-w-[1500px] mx-auto">
      <h1 className="display t-lg mb-2">Discover</h1>
      <p className="text-white/50 mb-8">Search any artist or song — Bollywood to Billie.</p>

      {/* SEARCH */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        className="flex gap-2 mb-12 max-w-2xl"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artists, songs…"
          className="flex-1 bg-white/5 border-2 border-white/15 rounded-full px-5 py-3.5 outline-none focus:border-[color:var(--color-blue)] transition-colors"
        />
        <button type="submit" className="btn-blue shrink-0">
          {searching ? "…" : "Search"}
        </button>
        {results && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults(null);
            }}
            className="btn-ghost shrink-0"
          >
            Clear
          </button>
        )}
      </form>

      {/* RESULTS */}
      {results && (
        <section className="mb-14">
          <h2 className="display text-2xl mb-6">
            {results.length ? `Results for "${query}"` : `Nothing found for "${query}"`}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {results.map((t, i) => (
              <TrackCard key={t.id} track={t} index={i} isCurrent={p.current?.id === t.id} isPlaying={p.isPlaying} onPlay={playResultFrom} />
            ))}
          </div>
        </section>
      )}

      {!results && (
        <>
          {/* MOOD RE-TUNE */}
          <section className="surface p-6 md:p-8 mb-14">
            <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
              <h2 className="display text-2xl">Tune the room</h2>
              <span className="kicker text-white/40">drag to reshape your picks</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 mb-8 max-w-2xl">
              <Slider label="Energy" left="Calm" right="Frantic" value={energy} onChange={setEnergy} />
              <Slider label="Mood" left="Melancholy" right="Euphoric" value={valence} onChange={setValence} />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {tuned.map((a) => (
                <ArtistCard key={a.name} name={a.name} sub={CATEGORY_LABELS[a.category]} loading={loadingArtist === a.name} onPlay={() => playArtist(a.name)} />
              ))}
            </div>
          </section>

          {/* BROWSE BY CATEGORY */}
          {CATEGORIES.map((cat, ci) => (
            <motion.section
              key={cat}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.04 }}
              className="mb-14"
            >
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="display text-2xl md:text-3xl">{CATEGORY_LABELS[cat]}</h2>
                <span className="kicker text-white/35">{rosterByCategory(cat).length} artists</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {rosterByCategory(cat).map((a) => (
                  <ArtistCard key={a.name} name={a.name} sub={a.blurb} loading={loadingArtist === a.name} onPlay={() => playArtist(a.name)} />
                ))}
              </div>
            </motion.section>
          ))}
        </>
      )}
    </div>
  );
}

function Slider({ label, left, right, value, onChange }: { label: string; left: string; right: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="label text-white/70">{label}</span>
        <span className="label text-[color:var(--color-blue)]">{Math.round(value * 100)}</span>
      </div>
      <input
        type="range"
        className="range w-full"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--range-pct" as string]: `${value * 100}%`, ["--accent" as string]: "var(--color-blue)" }}
      />
      <div className="flex justify-between mt-1 text-[0.65rem] text-white/35">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}
