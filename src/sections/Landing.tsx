import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLenis } from "../hooks/useLenis";
import { GenerativeMark } from "../components/GenerativeMark";
import { deriveAura } from "../lib/deriveAura";
import { ARCHETYPES } from "../data/archetypes";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Landing() {
  useLenis();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const markY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const markScale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -120]);

  // A real Aura to render the teaser mark behind the hero.
  const teaserAura = useMemo(
    () => deriveAura(["beach-house", "tame-impala", "burial"], ["nocturnal"], "midnight"),
    []
  );

  const names = ARCHETYPES.map((a) => a.name.replace("The ", ""));

  return (
    <main className="grain relative">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-10 py-5 mix-blend-difference">
        <span className="display text-2xl tracking-tight">AURA</span>
        <div className="flex items-center gap-4">
          <span className="kicker hidden sm:block opacity-70">EST. 2026</span>
          <Link to="/onboard" className="btn-ghost text-xs">
            Enter
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center px-5 md:px-10 overflow-hidden">
        <motion.div
          style={{ y: markY, scale: markScale }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-60"
        >
          <div className="w-[120vmin] h-[120vmin]">
            <GenerativeMark aura={teaserAura} />
          </div>
        </motion.div>

        <motion.div style={{ y: heroTextY }} className="relative z-10 max-w-[1200px]">
          <motion.p variants={fadeUp} initial="hidden" animate="show" className="kicker mb-5 text-[color:var(--accent)]">
            A music app where
          </motion.p>
          <h1 className="display t-hero">
            {["You are", "what you", "listen to"].map((line, i) => (
              <motion.span key={line} variants={fadeUp} custom={i + 1} initial="hidden" animate="show" className="block">
                {line}
              </motion.span>
            ))}
          </h1>
          <motion.p variants={fadeUp} custom={4} initial="hidden" animate="show" className="mt-7 max-w-md text-lg text-white/70">
            Spotify gave you a library. <span className="text-white">AURA gives you a face</span> — a living poster of your taste you'll want to share.
          </motion.p>
        </motion.div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <motion.span
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="kicker opacity-60"
          >
            ↓ scroll
          </motion.span>
        </div>
      </section>

      {/* MANIFESTO — acid panel, electric-blue type (the premium combo) */}
      <section className="bg-[color:var(--color-lime)] text-[color:var(--color-blue)] px-5 md:px-10 py-28 md:py-40">
        <div className="max-w-[1200px] mx-auto">
          <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="kicker mb-8 text-[color:var(--color-ink)]/70">
            The thesis
          </motion.p>
          <motion.h2 variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }} className="display t-xl">
            Your taste is a fingerprint. So why does it look like everyone else's playlist?
          </motion.h2>
        </div>
      </section>

      {/* ARCHETYPE MARQUEE */}
      <section className="py-16 border-y-2 border-white/15 overflow-hidden">
        <div className="marquee gap-10" style={{ ["--marquee-dur" as string]: "55s" }}>
          {[...names, ...names].map((n, i) => (
            <span key={i} className="display text-5xl md:text-7xl text-white/15 whitespace-nowrap">
              {n} <span className="text-[color:var(--accent)]">✦</span>
            </span>
          ))}
        </div>
        <div className="marquee gap-10 mt-6" style={{ ["--marquee-dur" as string]: "70s", animationDirection: "reverse" }}>
          {[...names.slice().reverse(), ...names.slice().reverse()].map((n, i) => (
            <span key={i} className="display text-5xl md:text-7xl text-white/15 whitespace-nowrap">
              {n} <span className="text-[color:var(--accent-2)]">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* STEPS */}
      <section className="px-5 md:px-10 py-28 md:py-40">
        <div className="max-w-[1200px] mx-auto">
          <p className="kicker mb-12 text-white/50">How it works — 30 seconds</p>
          <div className="grid md:grid-cols-3 gap-px bg-white/15 border-2 border-white/15">
            {[
              { n: "01", t: "Pick", d: "Tap the artists you love, swipe a few moods, choose when you listen most." },
              { n: "02", t: "Reveal", d: "Watch your taste resolve into one of 16 archetypes — and a living, generative mark." },
              { n: "03", t: "Share", d: "Export a poster built to be screenshotted. Then merge it with a friend's." },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="bg-[color:var(--color-ink)] p-8 md:p-10 min-h-[280px] flex flex-col justify-between hover:bg-[color:var(--color-smoke)] transition-colors"
              >
                <span className="display text-6xl text-[color:var(--accent)]">{s.n}</span>
                <div>
                  <h3 className="display text-3xl mb-3">{s.t}</h3>
                  <p className="text-white/60">{s.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONNECTIVE TISSUE TEASER */}
      <section className="px-5 md:px-10 pb-28 md:pb-40">
        <div className="max-w-[1200px] mx-auto">
          <p className="kicker mb-6 text-white/50">One Aura. Every feature, reborn.</p>
          <div className="flex flex-wrap gap-3">
            {[
              "Aura Radio — recs that explain why",
              "Soulmate — merge two tastes",
              "Jam — rooms that blend everyone's Aura",
              "Wrapped — always-on, not once a year",
              "Synesthesia — the player feels the song",
            ].map((c) => (
              <span key={c} className="chip text-sm normal-case tracking-normal">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-5 md:px-10 py-32 md:py-48 border-t-2 border-white/15 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
          <div className="w-[80vmin] h-[80vmin]">
            <GenerativeMark aura={teaserAura} />
          </div>
        </div>
        <div className="relative z-10 max-w-[1200px] mx-auto text-center">
          <h2 className="display t-hero mb-10">
            Conjure<br />your aura
          </h2>
          <Link to="/onboard" className="btn-acid text-base inline-block">
            Start — it's free ↗
          </Link>
        </div>
      </section>

      <footer className="px-5 md:px-10 py-10 border-t-2 border-white/15 flex flex-col sm:flex-row justify-between gap-3 text-white/40">
        <span className="display text-xl text-white">AURA</span>
        <span className="kicker">A concept by you · Not affiliated with Spotify</span>
      </footer>
    </main>
  );
}
