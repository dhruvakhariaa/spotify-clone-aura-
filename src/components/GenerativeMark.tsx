import { useEffect, useRef } from "react";
import type { Aura } from "../lib/types";

/** Seeded PRNG so a given seed always paints the same mark. */
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

interface Lobe {
  k: number;
  amp: number;
  phase: number;
}

interface Props {
  aura: Aura;
  /** energy of motion: 1 = full, 0 = frozen (reduced motion / export). */
  motion?: number;
  className?: string;
}

/**
 * The Aura's "mark": layered, iridescent, breathing blobs.
 *
 * Renders into a small FIXED-size buffer (cost is independent of display size)
 * and is softened with a cheap GPU-composited CSS blur rather than a costly
 * per-frame canvas blur. The buffer is stretched to fill via CSS.
 */
const RES = 440; // internal buffer is RES x RES, regardless of on-screen size
const STEPS = 84;

export function GenerativeMark({ aura, motion = 1, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const motionScale = reduce ? 0 : motion;

    const { seed, features, archetype } = aura;
    const rng = mulberry32(seed);

    canvas.width = RES;
    canvas.height = RES;

    const layerCount = 3;
    const layers: { lobes: Lobe[]; rot: number; ox: number; oy: number }[] = [];
    for (let l = 0; l < layerCount; l++) {
      const lobeN = 3 + Math.floor(features.tempo * 4); // 3..7
      const lobes: Lobe[] = [];
      for (let i = 0; i < lobeN; i++) {
        lobes.push({
          k: 1 + i,
          amp: (0.04 + rng() * 0.12) * (0.6 + features.energy),
          phase: rng() * Math.PI * 2,
        });
      }
      layers.push({
        lobes,
        rot: rng() * Math.PI * 2,
        ox: (rng() - 0.5) * 0.12,
        oy: (rng() - 0.5) * 0.12,
      });
    }

    const colors = [archetype.accent, archetype.accent2, "#ffffff"];
    const speed = 0.00018 + features.energy * 0.0006;
    // Softness handled by GPU compositor (cheap), scaled to display size.
    canvas.style.filter = `blur(${(1.2 + features.acoustic * 2.4).toFixed(2)}%)`;

    const cx = RES / 2;
    const cy = RES / 2;
    const base = RES * 0.3;

    const drawBlob = (
      ox: number,
      oy: number,
      radius: number,
      layer: (typeof layers)[number],
      t: number,
      color: string,
      alpha: number
    ) => {
      ctx.beginPath();
      for (let s = 0; s <= STEPS; s++) {
        const theta = (s / STEPS) * Math.PI * 2;
        let rmod = 1;
        for (const lobe of layer.lobes) {
          rmod +=
            lobe.amp *
            Math.sin(lobe.k * theta + lobe.phase + t * speed * (1 + lobe.k * 0.2) * motionScale);
        }
        const r = radius * rmod;
        const x = ox + Math.cos(theta + layer.rot) * r;
        const y = oy + Math.sin(theta + layer.rot) * r;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const grad = ctx.createRadialGradient(ox, oy, radius * 0.1, ox, oy, radius * 1.25);
      grad.addColorStop(0, color);
      grad.addColorStop(0.55, color);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = alpha;
      ctx.fillStyle = grad;
      ctx.fill();
    };

    let raf = 0;
    const render = (now: number) => {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, RES, RES);

      ctx.globalCompositeOperation = "lighter";
      layers.forEach((layer, i) => {
        drawBlob(
          cx + layer.ox * base,
          cy + layer.oy * base,
          base * (1 - i * 0.12),
          layer,
          now,
          colors[i % colors.length],
          0.55 - i * 0.1
        );
      });

      // Bright iridescent core.
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 0.6);
      core.addColorStop(0, "rgba(255,255,255,0.9)");
      core.addColorStop(0.4, archetype.accent2 + "cc");
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = 0.5 + features.valence * 0.4;
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, base * 0.6, 0, Math.PI * 2);
      ctx.fill();

      if (motionScale > 0) raf = requestAnimationFrame(render);
    };

    render(0);
    if (motionScale > 0) raf = requestAnimationFrame(render);

    return () => cancelAnimationFrame(raf);
  }, [aura, motion]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
