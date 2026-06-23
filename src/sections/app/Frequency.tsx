import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMyAura } from "../../state/aura";
import { GenerativeMark } from "../../components/GenerativeMark";
import type { Aura } from "../../lib/types";

/**
 * Frequency — "you're never listening alone". A live field of everyone sharing
 * your Aura right now. The global count is a believable simulation (seeded by
 * your Aura, gently drifting) since there's no shared backend; in production
 * this would read real presence.
 */
function ListenerField({ aura, count }: { aura: Aura; count: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countRef = useRef(count);
  countRef.current = count;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const RES = 720;
    canvas.width = RES;
    canvas.height = RES;

    const MAX = 140;
    const dots = Array.from({ length: MAX }, () => ({
      a: Math.random() * Math.PI * 2,
      r: 0.12 + Math.random() * 0.42,
      sp: 0.0002 + Math.random() * 0.0006,
      ph: Math.random() * Math.PI * 2,
      sz: 1.5 + Math.random() * 3,
    }));
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    const render = (now: number) => {
      ctx.clearRect(0, 0, RES, RES);
      const cx = RES / 2;
      const cy = RES / 2;
      const visible = Math.max(8, Math.min(MAX, Math.round((countRef.current / 400) * MAX)));
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < visible; i++) {
        const d = dots[i];
        const ang = d.a + (reduce ? 0 : now * d.sp);
        const rr = d.r * RES * (0.95 + 0.1 * Math.sin(now * 0.001 + d.ph));
        const x = cx + Math.cos(ang) * rr;
        const y = cy + Math.sin(ang) * rr;
        const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(now * 0.003 + d.ph));
        ctx.fillStyle = i % 3 === 0 ? aura.archetype.accent2 : aura.archetype.accent;
        ctx.globalAlpha = tw * 0.8;
        ctx.beginPath();
        ctx.arc(x, y, d.sz, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [aura]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />;
}

export default function Frequency() {
  const aura = useMyAura();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!aura) return;
    const base = 60 + (aura.seed % 380);
    setCount(base);
    const iv = setInterval(() => {
      setCount((c) => {
        const drift = Math.round((Math.random() - 0.45) * 6);
        return Math.max(Math.round(base * 0.8), Math.min(Math.round(base * 1.25), c + drift));
      });
    }, 2200);
    return () => clearInterval(iv);
  }, [aura]);

  if (!aura) {
    return (
      <div className="min-h-full grid place-items-center text-center px-6 gap-5">
        <h1 className="display t-lg">Frequency</h1>
        <p className="text-white/55 max-w-sm">Make your Aura to find everyone who shares it.</p>
        <Link to="/onboard" className="btn-blue">Conjure your Aura ✦</Link>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-full flex flex-col items-center justify-center px-5 py-12 text-center overflow-hidden"
      style={{ ["--accent" as string]: aura.archetype.accent, ["--accent-2" as string]: aura.archetype.accent2 }}
    >
      <div className="relative w-[min(86vw,620px)] aspect-square mb-8">
        <div className="absolute inset-0"><ListenerField aura={aura} count={count} /></div>
        <div className="absolute inset-0 grid place-items-center">
          <div className="w-[38%] h-[38%]"><GenerativeMark aura={aura} /></div>
        </div>
      </div>

      <p className="kicker text-white/45 mb-3">Right now</p>
      <h1 className="display leading-none mb-4" style={{ fontSize: "clamp(3rem,9vw,6rem)" }}>
        <span style={{ color: aura.archetype.accent }}>{count.toLocaleString()}</span> souls
      </h1>
      <p className="text-xl text-white/70 max-w-md">
        are tuned to <span className="text-white font-bold">{aura.archetype.name}</span> with you. You're
        never listening alone.
      </p>
      <Link to="/app/home" className="btn-ghost mt-10">Back to your music</Link>
    </div>
  );
}
