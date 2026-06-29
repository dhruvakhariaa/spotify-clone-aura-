import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Radio, Sparkles, Ticket, Volume2 } from "lucide-react";
import { CONCERTS } from "../../data/concerts";
import { EDITORIAL_IMAGES } from "../../data/editorial";
import { PlaceholderImage } from "../../components/app/PlaceholderImage";
import { playReactionSound } from "../../lib/reactions";

const CITY_FILTERS = ["All", "Mumbai", "Bengaluru", "Hyderabad"] as const;

const EXPERIENCE_LANES = [
  { title: "Before doors", text: "Warm-up tracks, queue energy, weather, and friends arriving late.", tone: "anticipation" },
  { title: "During the hook", text: "The app shifts into lyric-scale typography, crowd pulse, and setlist memory.", tone: "crowd" },
  { title: "Afterglow", text: "Save the night into Live Wrapped with the city, artist, and your actual plays.", tone: "memory" },
];

export default function Concerts() {
  const [city, setCity] = useState<(typeof CITY_FILTERS)[number]>("All");
  const [active, setActive] = useState(CONCERTS[0].id);

  const visible = useMemo(() => (city === "All" ? CONCERTS : CONCERTS.filter((c) => c.city === city)), [city]);
  const featured = CONCERTS.find((c) => c.id === active) ?? visible[0] ?? CONCERTS[0];

  return (
    <div className="px-5 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-[1500px]">
        {/* ---------- HERO ---------- */}
        <section className="on-dark relative mb-10 overflow-hidden rounded-2xl border border-white/10 bg-[#10121f] p-5 md:p-8">
          <img src={EDITORIAL_IMAGES[0].src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,8,15,.95),rgba(7,8,15,.74)_46%,rgba(7,8,15,.42))]" />
          <div className="relative z-10 grid min-h-[380px] gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <p className="kicker mb-4 text-[color:var(--accent)]">Concerts · India first</p>
              <h1 className="display max-w-4xl text-5xl leading-[0.9] md:text-7xl">Real seats. No scalper tax.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/68">
                AURA holds a slice of every show off the resale market and prices it for fans who actually listen. Pick a city,
                then walk the stadium and grab a Fan Seat at face value.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {CITY_FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setCity(filter)}
                    className={`rounded-full border px-4 py-2 text-xs font-black uppercase transition-colors ${
                      city === filter
                        ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--color-ink)]"
                        : "border-white/16 bg-white/[0.04] text-white/62 hover:border-white/42 hover:text-white"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/14 bg-black/30 p-4 backdrop-blur-xl" style={{ ["--accent" as string]: featured.accent }}>
              <p className="label mb-3 text-white/44">Now staging</p>
              <Link to={`/app/concerts/${featured.id}`} className="group block overflow-hidden rounded-xl border border-white/10">
                <PlaceholderImage src={featured.heroImage} label={featured.artist} className="h-44 w-full transition-transform duration-500 group-hover:scale-105" />
              </Link>
              <h2 className="display mt-4 text-3xl">{featured.artist}</h2>
              <p className="mt-2 text-sm text-white/58">{featured.tagline}</p>
              <div className="mt-5 flex gap-2">
                <Link to={`/app/concerts/${featured.id}`} className="btn-blue flex-1 justify-center px-4 py-3 text-xs">
                  Get tickets
                </Link>
                <button
                  type="button"
                  onClick={() => playReactionSound("wow")}
                  className="grid size-11 shrink-0 place-items-center rounded-full border border-white/16 text-white/70 hover:text-white"
                  aria-label="Soundcheck"
                  title="Soundcheck"
                >
                  <Volume2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- CONCERT CARDS ---------- */}
        <section className="mb-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker mb-2 text-white/42">Concept dates</p>
              <h2 className="display text-3xl md:text-4xl">Pick your crowd.</h2>
            </div>
            <span className="text-sm text-white/42">Tap a show for the full stadium + Fan Seats.</span>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {visible.map((concert, index) => (
              <motion.div
                key={concert.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onMouseEnter={() => setActive(concert.id)}
                style={{ ["--accent" as string]: concert.accent }}
              >
                <Link
                  to={`/app/concerts/${concert.id}`}
                  className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] transition-colors hover:border-[color:var(--accent)]"
                >
                  <div className="relative h-72 overflow-hidden">
                    <PlaceholderImage src={concert.heroImage} label={`${concert.artist} — hero`} className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5">
                      <p className="display text-4xl">{concert.artist}</p>
                      <p className="mt-2 line-clamp-1 text-sm text-white/70">{concert.tagline}</p>
                    </div>
                  </div>
                  <div className="grid gap-4 p-5">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-1 shrink-0 text-[color:var(--accent)]" size={20} />
                      <div className="min-w-0">
                        <p className="font-bold">{concert.date}</p>
                        <p className="truncate text-sm text-white/50">
                          <MapPin size={13} className="mr-1 inline" />
                          {concert.venue}, {concert.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="inline-flex items-center gap-1.5 font-bold text-[color:var(--accent)]">
                        <Sparkles size={15} /> Fan Seats held
                      </span>
                      <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-3 py-1.5 text-xs font-black uppercase text-[#07080f] transition group-hover:brightness-110">
                        <Ticket size={14} /> Get tickets
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ---------- EXPERIENCE LANES ---------- */}
        <section className="mb-12 grid gap-4 md:grid-cols-3">
          {EXPERIENCE_LANES.map((lane, index) => (
            <motion.article
              key={lane.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"
            >
              <Sparkles className="mb-7 text-[color:var(--accent)]" size={24} />
              <p className="label mb-2 text-white/40">{lane.tone}</p>
              <h3 className="display text-3xl">{lane.title}</h3>
              <p className="mt-4 text-sm leading-6 text-white/58">{lane.text}</p>
            </motion.article>
          ))}
        </section>

        {/* ---------- CITY RADIO ---------- */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
          <div className="grid md:grid-cols-[1fr_1.2fr]">
            <div className="p-6 md:p-8">
              <Radio className="mb-8 text-[#1db954]" size={28} />
              <p className="kicker mb-3 text-white/42">City radio</p>
              <h2 className="display text-4xl">Every concert should leave a playlist behind.</h2>
              <p className="mt-5 text-sm leading-6 text-white/58">
                Pre-show radio, check-in memories, and post-show listening history flow straight into Live Wrapped.
              </p>
            </div>
            <div className="grid min-h-[320px] grid-cols-3 gap-2 p-2">
              {EDITORIAL_IMAGES.map((image) => (
                <img key={image.id} src={image.src} alt="" className="h-full min-h-[300px] w-full rounded-xl object-cover" />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
