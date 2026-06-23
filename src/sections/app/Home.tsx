import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ListMusic, Search, Sparkles, Users } from "lucide-react";
import { usePlayer } from "../../state/player";
import { useMyAura } from "../../state/aura";
import { liveWrappedSummary } from "../../state/wrapped";
import { ROSTER, nearestArtists, type RosterArtist } from "../../data/roster";
import { PLAYLIST_CONCEPTS, WRAPPED_SEEDS } from "../../data/editorial";
import { searchSongs, tracksByArtist, tracksFromArtists, type PlayableTrack } from "../../lib/catalog";
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
  "Arijit Singh",
  "Sunidhi Chauhan",
  "Shreya Ghoshal",
  "Anirudh Ravichander",
  "Atif Aslam",
  "The Weeknd",
  "Diljit Dosanjh",
  "Prateek Kuhad",
  "Lata Mangeshkar",
  "Dua Lipa",
  "KK",
  "Sid Sriram",
];

export default function Home() {
  const p = usePlayer();
  const aura = useMyAura();
  const [radio, setRadio] = useState<PlayableTrack[]>([]);
  const [results, setResults] = useState<PlayableTrack[] | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [searching, setSearching] = useState(false);
  const [loadingArtist, setLoadingArtist] = useState<string | null>(null);
  const wrapped = liveWrappedSummary();

  const featured: RosterArtist[] = useMemo(() => {
    if (aura) return nearestArtists(aura.features, 12);
    return DEFAULT_FEATURED.map((n) => ROSTER.find((a) => a.name === n)).filter(Boolean) as RosterArtist[];
  }, [aura]);

  useLayoutEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.from(".home-rise", {
        opacity: 0,
        y: 22,
        duration: 0.65,
        stagger: 0.055,
        ease: "power3.out",
      });
      const marks = gsap.utils.toArray<HTMLElement>(".home-mark");
      if (marks.length) {
        gsap.to(marks, {
          scale: 1.035,
          y: 14,
          duration: 3.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    });
    return () => ctx.revert();
  }, []);

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
      const tracks = await tracksByArtist(name, 15);
      if (tracks.length) p.play(tracks, 0);
    } finally {
      setLoadingArtist(null);
    }
  };

  const playRadioFrom = (i: number) => {
    const list = results ?? radio;
    if (!list[i]) return;
    if (p.current?.id === list[i].id) p.toggle();
    else p.play(list, i);
  };

  return (
    <div className="px-5 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-[1500px]">
        <section className="home-rise relative mb-8 overflow-hidden rounded-lg border border-white/10 bg-[#10121f] p-5 md:p-7 lg:p-8">
          {aura && (
            <div className="home-mark pointer-events-none absolute -right-16 -top-16 h-80 w-80 opacity-45 md:h-[34rem] md:w-[34rem]">
              <GenerativeMark aura={aura} />
            </div>
          )}
          <div className="relative z-10 grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] lg:items-end">
            <div>
              <p className="kicker mb-3 text-white/45">{greeting()}</p>
              <h1 className="display max-w-3xl text-4xl leading-[0.92] md:text-5xl">
                {aura ? (
                  <>
                    <span className="text-white/44">You sound like</span>
                    <br />
                    <span style={{ color: aura.archetype.accent }}>{aura.archetype.name}</span>
                  </>
                ) : (
                  "Your music, made human."
                )}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/62 md:text-base">
                Premium recommendations, artist-led moments, India-focused concerts, and a live identity that changes as you listen.
              </p>
              {!aura && (
                <Link to="/onboard" className="btn-blue mt-7 inline-flex items-center gap-2">
                  Conjure your Aura <Sparkles size={18} />
                </Link>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                runSearch(query);
              }}
              className="rounded-lg border border-white/10 bg-black/25 p-3 backdrop-blur-md"
            >
              <label className="label mb-2 block text-white/44">Search</label>
              <div className="flex items-center gap-2">
                <Search className="ml-2 shrink-0 text-white/42" size={20} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find artists, songs, moods..."
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-white/32"
                />
                <button type="submit" className="btn-blue shrink-0 px-5 py-3 text-xs">
                  {searching ? "..." : "Go"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {results && (
          <section className="home-rise mb-10">
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <h2 className="display text-3xl">{results.length ? `Results for ${query}` : `Nothing found for ${query}`}</h2>
              <button
                onClick={() => {
                  setResults(null);
                  setQuery("");
                }}
                className="kicker text-white/45 hover:text-white"
              >
                clear
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-6">
              {results.map((t, i) => (
                <TrackCard key={t.id} track={t} index={i} isCurrent={p.current?.id === t.id} isPlaying={p.isPlaying} onPlay={playRadioFrom} />
              ))}
            </div>
          </section>
        )}

        {!results && (
          <>
            <section className="home-rise mb-10">
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="kicker mb-2 text-white/42">Artist room</p>
                    <h2 className="display text-2xl md:text-3xl">People you can hear yourself in.</h2>
                  </div>
                  <Link to="/app/discover" className="kicker text-white/45 hover:text-white">browse all</Link>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-6">
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
              </div>
            </section>

            <section className="home-rise mb-10">
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <p className="kicker mb-2 text-white/42">{aura ? `tuned to ${aura.archetype.name.replace("The ", "")}` : "a little of everything"}</p>
                  <h2 className="display text-3xl">{aura ? "Aura Radio" : "On rotation"}</h2>
                </div>
                <span className="text-sm text-white/42">iTunes previews now, Spotify Web API next</span>
              </div>

              {status === "loading" && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg border border-white/10 bg-white/[0.025] animate-pulse" />
                  ))}
                </div>
              )}

              {status === "error" && (
                <div className="surface p-10 text-center">
                  <p className="display text-2xl mb-2">The signal dropped.</p>
                  <p className="text-white/50">Could not reach the catalog. Try again in a moment.</p>
                </div>
              )}

              {status === "ready" && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-6">
                  {radio.slice(0, 12).map((t, i) => (
                    <TrackCard key={t.id} track={t} index={i} isCurrent={p.current?.id === t.id} isPlaying={p.isPlaying} onPlay={playRadioFrom} />
                  ))}
                </div>
              )}
            </section>

            <section className="home-rise grid gap-4 lg:grid-cols-3">
              <Link to="/app/library" className="rounded-lg border border-white/10 bg-white/[0.035] p-6 transition-colors hover:bg-white/[0.06]">
                <ListMusic className="mb-8 text-[#1db954]" size={26} />
                <p className="kicker mb-2 text-white/42">Collaborative playlists</p>
                <h3 className="display text-3xl">{PLAYLIST_CONCEPTS[0].title}</h3>
                <p className="mt-4 text-sm text-white/58">{PLAYLIST_CONCEPTS[0].blurb}</p>
              </Link>

              <Link to="/app/wrapped" className="rounded-lg border border-white/10 bg-white/[0.035] p-6 transition-colors hover:bg-white/[0.06]">
                <Sparkles className="mb-8 text-[#e8ff3a]" size={26} />
                <p className="kicker mb-2 text-white/42">Live wrapped</p>
                <h3 className="display text-3xl">{wrapped.total ? `${wrapped.total} signals captured` : WRAPPED_SEEDS[0].value}</h3>
                <p className="mt-4 text-sm text-white/58">A living recap built from in-app listening until Spotify auth arrives.</p>
              </Link>

              <Link to="/app/jam" className="rounded-lg border border-white/10 bg-white/[0.035] p-6 transition-colors hover:bg-white/[0.06]">
                <Users className="mb-8 text-[#3ad1ff]" size={26} />
                <p className="kicker mb-2 text-white/42">Jam room</p>
                <h3 className="display text-3xl">Blend everyone in the room</h3>
                <p className="mt-4 text-sm text-white/58">Local realtime rooms now, Supabase presence later.</p>
              </Link>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
