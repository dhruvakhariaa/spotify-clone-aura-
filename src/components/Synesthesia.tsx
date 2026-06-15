import { useEffect, useRef, type MutableRefObject } from "react";
import type { Aura } from "../lib/types";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Props {
  aura: Aura;
  levelRef: MutableRefObject<number>;
  className?: string;
}

const RES = 560;

/**
 * The "Synesthesia" skin — a radial spectrum + breathing core that pulses to
 * the player's loudness proxy. Fixed-buffer canvas, GPU-composited blur.
 */
export function Synesthesia({ aura, levelRef, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { seed, features, archetype } = aura;
    const rng = mulberry32(seed);
    canvas.width = RES;
    canvas.height = RES;
    canvas.style.filter = "blur(0.4px)";

    const BARS = 72;
    const phases = Array.from({ length: BARS }, () => rng() * Math.PI * 2);
    const freqs = Array.from({ length: BARS }, () => 0.5 + rng() * 2.5);
    const cx = RES / 2;
    const cy = RES / 2;
    const ringR = RES * 0.26;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    const render = (now: number) => {
      const t = now / 1000;
      const level = reduce ? 0.25 : levelRef.current;
      ctx.clearRect(0, 0, RES, RES);
      ctx.globalCompositeOperation = "lighter";

      // radial bars
      for (let i = 0; i < BARS; i++) {
        const ang = (i / BARS) * Math.PI * 2;
        const wob = 0.5 + 0.5 * Math.sin(t * freqs[i] + phases[i]);
        const len = ringR * (0.12 + (0.35 + 0.65 * features.energy) * level * (0.5 + wob));
        const x1 = cx + Math.cos(ang) * ringR;
        const y1 = cy + Math.sin(ang) * ringR;
        const x2 = cx + Math.cos(ang) * (ringR + len);
        const y2 = cy + Math.sin(ang) * (ringR + len);
        ctx.strokeStyle = i % 2 ? archetype.accent : archetype.accent2;
        ctx.globalAlpha = 0.5 + 0.4 * level;
        ctx.lineWidth = RES * 0.012;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // breathing core
      const coreR = ringR * (0.7 + level * 0.35);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      g.addColorStop(0, "rgba(255,255,255,0.92)");
      g.addColorStop(0.35, archetype.accent2 + "dd");
      g.addColorStop(0.75, archetype.accent + "66");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = 0.55 + 0.4 * features.valence;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [aura, levelRef]);

  return (
    <canvas ref={canvasRef} className={className} style={{ width: "100%", height: "100%", display: "block" }} />
  );
}
