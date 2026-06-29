import { useLayoutEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ArrowUpRight, CalendarDays, Headphones, Radio, Search, Sparkles, Users } from "lucide-react";
import { useLenis } from "../hooks/useLenis";
import { GenerativeMark } from "../components/GenerativeMark";
import { ThemeToggle } from "../components/ThemeToggle";
import { deriveAura } from "../lib/deriveAura";
import { CONCERTS, EDITORIAL_IMAGES, HERO_ARTISTS, PLAYLIST_CONCEPTS } from "../data/editorial";

function ArtistPortrait({ name, pullQuote, index }: { name: string; pullQuote: string; index: number }) {
  // Editorial atmospheric photography rather than iTunes album art, which
  // misrepresents artists (e.g. a film poster for a singer). The bold name +
  // pull-quote carry the identity; real headshots arrive with the Spotify proxy.
  const editorial = EDITORIAL_IMAGES[index % EDITORIAL_IMAGES.length];
  return (
    <div className={`hero-artist on-dark group relative overflow-hidden rounded-lg border border-white/12 bg-white/[0.04] ${
      index === 0 ? "min-h-[230px] md:min-h-[270px]" : "min-h-[124px]"
    }`}>
      <img src={editorial.src} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className={`${index === 0 ? "text-2xl" : "text-xl"} display leading-none`}>{name}</p>
        <p className="mt-2 text-sm leading-5 text-white/68">{pullQuote}</p>
      </div>
    </div>
  );
}

export default function Landing() {
  useLenis();
  const rootRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const teaserAura = useMemo(
    () => deriveAura(["Arijit Singh", "Prateek Kuhad", "The Weeknd"], ["nocturnal", "tender"], "midnight"),
    []
  );

  useLayoutEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".gsap-rise", {
        opacity: 0,
        y: 34,
        duration: 0.85,
        stagger: 0.08,
        ease: "power3.out",
      });
      gsap.from(".hero-artist", {
        opacity: 0,
        y: 42,
        rotate: (i) => [-2, 1.5, -1][i] ?? 0,
        duration: 1,
        stagger: 0.1,
        delay: 0.2,
        ease: "power3.out",
      });
      gsap.to(".hero-mark", {
        y: 28,
        scale: 1.04,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={rootRef} className="grain relative bg-[color:var(--color-ink)] text-white">
      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-5 py-4 backdrop-blur-xl md:px-10">
        <Link to="/" className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#1db954] text-[color:var(--color-ink)]">
            <Radio size={18} />
          </span>
          <span className="display text-2xl">AURA</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-bold text-white/64 md:flex">
          <a href="#concerts" className="hover:text-white">Concerts</a>
          <a href="#identity" className="hover:text-white">Aura</a>
          <Link to="/app/home" className="hover:text-white">App</Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <Link to="/onboard" className="btn-blue text-xs">
            Enter
          </Link>
        </div>
      </nav>

      <section ref={heroRef} className="landing-hero relative min-h-screen overflow-hidden px-5 pb-10 pt-28 md:px-10 md:pt-28">
        <div className="absolute inset-0">
          <img src={EDITORIAL_IMAGES[0].src} alt="" className="landing-hero-image h-full w-full object-cover opacity-34" />
          <div className="landing-hero-side-scrim absolute inset-0 bg-[linear-gradient(90deg,#07080f_0%,rgba(7,8,15,.9)_46%,rgba(7,8,15,.58)_100%)]" />
          <div className="landing-hero-bottom-scrim absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,15,.35)_0%,rgba(7,8,15,.12)_45%,#07080f_100%)]" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-8rem)] max-w-[1360px] gap-8 lg:grid-cols-[minmax(0,700px)_minmax(320px,420px)] lg:items-center lg:justify-between">
          <div className="landing-hero-copy max-w-[760px]">
            <p className="gsap-rise kicker mb-5 inline-flex rounded-full border border-white/16 bg-white/[0.08] px-3 py-2 text-white/76 backdrop-blur-md">
              Music identity. Real artists. India first.
            </p>
            <h1 className="gsap-rise display t-hero max-w-[640px] leading-[0.92]">
              Your taste has a face.
            </h1>
            <p className="gsap-rise mt-6 max-w-lg text-base leading-7 text-white/72 md:text-lg md:leading-8">
              Press play and watch a living identity take shape — your Aura. Search, jam, and build
              Aura-native playlists. Spotify-familiar, unmistakably you.
            </p>
            <div className="gsap-rise mt-8 flex flex-wrap gap-3">
              <Link to="/onboard" className="btn-blue inline-flex items-center gap-2">
                Find your Aura <ArrowUpRight size={18} />
              </Link>
              <Link to="/app/home" className="btn-ghost inline-flex items-center gap-2">
                Open app <Headphones size={18} />
              </Link>
            </div>
          </div>

          <div className="hero-artist-panel rounded-xl border border-white/12 bg-black/28 p-2.5 shadow-2xl backdrop-blur-xl">
            <div className="grid gap-2.5">
              <ArtistPortrait name={HERO_ARTISTS[0].name} pullQuote={HERO_ARTISTS[0].pullQuote} index={0} />
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {HERO_ARTISTS.slice(1, 3).map((artist, index) => (
                  <ArtistPortrait key={artist.name} name={artist.name} pullQuote={artist.pullQuote} index={index + 1} />
                ))}
              </div>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
              {[
                ["India", "first"],
                ["Live", "concerts"],
                ["Aura", "native"],
              ].map(([top, bottom]) => (
                <div key={top} className="rounded-lg border border-white/10 bg-white/[0.045] px-2 py-2">
                  <p className="display text-lg text-[#1db954]">{top}</p>
                  <p className="text-xs font-bold text-white/45">{bottom}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-stat-strip border-y border-white/10 bg-[#0c0f18] px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-4">
          {[
            ["30 sec", "previews without login"],
            ["Premium", "Spotify playback later"],
            ["India", "concerts and artist lanes"],
            ["Live", "wrapped while you listen"],
          ].map(([n, label]) => (
            <div key={label} className="flex items-baseline gap-3">
              <span className="display text-3xl text-[#1db954]">{n}</span>
              <span className="text-sm font-bold text-white/54">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="identity" className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1480px] gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <p className="kicker mb-4 text-[#1db954]">The human layer</p>
            <h2 className="display t-xl max-w-3xl">The algorithm should feel like taste, not math.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Search, title: "Search with intent", text: "Artists, songs, moods, cities, and concerts belong in the same mental space." },
              { icon: Users, title: "Collaborate natively", text: "Playlists live in AURA first, then sync to Spotify when accounts arrive." },
              { icon: Sparkles, title: "Explain the feeling", text: "Energy, mood, and tempo are tuned from music culture, not random sliders." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
                <Icon className="mb-8 text-[#1db954]" size={24} />
                <h3 className="display text-2xl">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/58">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="concerts" className="px-5 pb-24 md:px-10 md:pb-32">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker mb-3 text-white/45">Curated India dates</p>
              <h2 className="display t-xl">Concerts that feel close.</h2>
            </div>
            <span className="text-sm text-white/45">Concept data now. Real event APIs later.</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {CONCERTS.map((concert) => (
              <article key={concert.id} className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]">
                <div className="relative h-64 overflow-hidden">
                  <img src={concert.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="display text-3xl">{concert.artist}</p>
                    <p className="mt-1 text-sm text-white/68">{concert.supporting}</p>
                  </div>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-4 p-5">
                  <CalendarDays style={{ color: concert.accent }} size={24} />
                  <div>
                    <p className="font-bold">{concert.date} - {concert.city}</p>
                    <p className="text-sm text-white/54">{concert.venue}</p>
                    <p className="mt-4 text-sm text-white/68">{concert.mood}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 md:px-10 md:pb-32">
        <div className="mx-auto grid max-w-[1480px] gap-6 lg:grid-cols-[1fr_.9fr]">
          <div className="aura-identity-card relative min-h-[560px] overflow-hidden rounded-lg border border-white/10 bg-[#10121f] p-6 md:p-8">
            <div className="hero-mark absolute bottom-[-12%] right-[-8%] h-[62vmin] w-[62vmin] opacity-72">
              <GenerativeMark aura={teaserAura} />
            </div>
            <div className="relative z-10 max-w-xl">
              <p className="kicker mb-4 text-[#e8ff3a]">Aura identity</p>
              <h2 className="display t-xl">Still yours. Just less synthetic.</h2>
              <p className="mt-6 text-lg leading-8 text-white/68">
                The generative mark becomes the signature layer over real listening, real artists, and real nights out.
              </p>
            </div>
          </div>
          <div className="grid gap-4">
            {PLAYLIST_CONCEPTS.map((playlist) => (
              <div key={playlist.title} className="rounded-lg border border-white/10 bg-white/[0.035] p-6">
                <p className="kicker mb-3 text-white/42">{playlist.people} collaborators</p>
                <h3 className="display text-3xl">{playlist.title}</h3>
                <p className="mt-2 text-sm font-bold text-[#1db954]">{playlist.aura}</p>
                <p className="mt-5 text-white/62">{playlist.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-white/46 md:px-10">
        <div className="mx-auto flex max-w-[1480px] flex-col justify-between gap-3 sm:flex-row">
          <span className="display text-xl text-white">AURA</span>
          <span className="text-sm">A concept music app. Not affiliated with Spotify.</span>
        </div>
      </footer>
    </main>
  );
}
