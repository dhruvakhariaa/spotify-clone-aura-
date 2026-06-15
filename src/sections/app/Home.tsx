import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePlayer } from "../../state/player";
import { useMyAura } from "../../state/aura";
import { ROSTER, nearestArtists, type RosterArtist } from "../../data/roster";
import { tracksByArtist, tracksFromArtists, type PlayableTrack } from "../../lib/catalog";
import { GenerativeMark } from "../../components/GenerativeMark";
import { TrackCard } from "../../components/app/TrackCard";
import { ArtistCard } from "../../components/app/ArtistCard";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Late night";
}

const DEFAULT_FEATURED = [
  "Arijit Singh", "Prateek Kuhad", "Sid Sriram", "The Weeknd",
  "Dua Lipa", "Anirudh Ravichander", "Diljit Dosanjh", "Billie Eilish",
  "A.R. Rahman", "Ritviz", "Lana Del Rey", "Shreya Ghoshal",
];

export default function Home() {
  const p = usePlayer();
  const aura = useMyAura();
  const [radio, setRadio] = useState<PlayableTrack[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadingArtist, setLoadingArtist] = useState<string | null>(null);

  const featured: RosterArtist[] = useMemo(() => {
    if (aura) return nearestArtists(aura.features, 12);
    return DEFAULT_FEATURED.map((n) => ROSTER.find((a) => a.name === n)).filter(Boolean) as RosterArtist[];
  }, [aura]);

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    tracksFromArtists(featured.slice(0, 9).map((a) => a.name), 2)
      .then((t) => {
        if (!alive) return;
        setRadio(t);
        setStatus(t.length ? "ready" : "error");
      })
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
    };
  }, [featured]);

  const playArtist = async (name: string) => {
    setLoadingArtist(name);
    try {
      const tracks = await tracksByArtist(name, 15);
      if (tracks.length) p.play(tracks, 0);
    } finally {
      setLoadingArtist(null);
    }
  };

  const playRadioFrom = (i: number) => {
    if (p.current?.id === radio[i].id) p.toggle();
    else p.play(radio, i);
  };

  return (
    <div className="px-5 md:px-10 py-8 md:py-12 max-w-[1500px] mx-auto">
      {/* HEADER */}
      <header className="flex items-center justify-between gap-6 mb-12 md:mb-16">
        <div className="min-w-0">
          <p className="kicker text-white/45 mb-2">{greeting()}</p>
          <h1 className="display t-lg leading-none">
            {aura ? (
              <>
                <span className="text-white/40">You sound like</span>
                <br />
                <span style={{ color: aura.archetype.accent }}>{aura.archetype.name}</span>
              </>
            ) : (
              "Welcome to AURA"
            )}
          </h1>
          {!aura && (
            <Link to="/onboard" className="btn-blue mt-6 inline-block">
              Conjure your Aura ✦
            </Link>
          )}
        </div>
        {aura && (
          <Link to="/app/now" className="hidden md:block w-32 h-32 lg:w-40 lg:h-40 shrink-0">
            <GenerativeMark aura={aura} />
          </Link>
        )}
      </header>

      {/* ARTISTS FOR YOU */}
      <section className="mb-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="display text-2xl md:text-3xl">Artists for you</h2>
          <Link to="/app/discover" className="kicker text-white/40 hover:text-white">browse all →</Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {featured.slice(0, 6).map((a) => (
            <ArtistCard
              key={a.name}
              name={a.name}
              sub={a.blurb}
              loading={loadingArtist === a.name}
              onPlay={() => playArtist(a.name)}
            />
          ))}
        </div>
      </section>

      {/* AURA RADIO */}
      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="display text-2xl md:text-3xl">{aura ? "Aura Radio" : "On rotation"}</h2>
          <span className="kicker text-white/40">
            {aura ? `tuned to ${aura.archetype.name.replace("The ", "")}` : "a little of everything"}
          </span>
        </div>

        {status === "loading" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl border border-white/10 bg-white/[0.02] animate-pulse" />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="surface p-10 text-center">
            <p className="display text-2xl mb-2">The signal dropped.</p>
            <p className="text-white/50">Couldn't reach the catalog. Try again in a moment.</p>
          </div>
        )}

        {status === "ready" && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.04 } } }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
          >
            {radio.map((t, i) => (
              <motion.div key={t.id} className="min-w-0" variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <TrackCard track={t} index={i} isCurrent={p.current?.id === t.id} isPlaying={p.isPlaying} onPlay={playRadioFrom} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
