import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <main className="grain grid min-h-screen place-items-center bg-[color:var(--color-ink)] px-5 py-12 text-[color:var(--color-paper)]">
      <div className="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-[0.95fr_1.05fr] md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 28, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl border border-white/14 bg-white/[0.07] p-5 shadow-[0_28px_90px_rgba(0,0,0,.32)] backdrop-blur-xl"
        >
          <div className="relative aspect-square overflow-hidden rounded-xl border border-white/12 bg-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,.24),transparent_24%),linear-gradient(135deg,#10121f,#050509_70%)]" />
            <div className="absolute left-1/2 top-[18%] h-[38%] w-[42%] -translate-x-1/2 rounded-[46%] border border-white/18 bg-[#d7b28f] shadow-[inset_-22px_-18px_34px_rgba(0,0,0,.28)]" />
            <div className="absolute left-[42%] top-[32%] h-3 w-3 rounded-full bg-black" />
            <div className="absolute right-[42%] top-[32%] h-3 w-3 rounded-full bg-black" />
            <div className="absolute left-[49%] top-[36%] h-10 w-4 -translate-x-1/2 rounded-full bg-[#b98666]" />
            <div className="absolute left-[45%] top-[49%] h-2 w-[10%] rounded-full bg-black" />
            <div className="absolute left-[25%] top-[24%] h-[44%] w-[22%] origin-bottom -rotate-12 rounded-[999px_999px_28px_28px] border border-white/24 bg-[#e4c0a2]" />
            <p className="display absolute bottom-7 left-5 right-5 text-center text-4xl leading-[0.92] text-[#ffe436] [text-shadow:3px_3px_0_#000,-2px_-2px_0_#000] md:text-5xl">
              Ruko zara sabr karo
            </p>
          </div>
          <p className="mt-3 text-center text-xs font-bold uppercase text-white/42">
            Meme reference: the classic patience warning, now guarding broken routes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="kicker mb-4 text-[color:var(--accent)]">404 - route went off beat</p>
          <h1 className="display text-5xl leading-[0.9] md:text-7xl">This page is not in the queue.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
            The link tried to skip ahead. Wait a second, return to the app, and let the signal lock again.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/app/home" className="btn-blue">
              Back to app
            </Link>
            <Link to="/" className="btn-ghost">
              Landing page
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
