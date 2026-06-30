import { useEffect, useRef } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * A landing motion concept: one clickable character in the city opens a full-bleed
 * canvas take-over that plays "their" idea. `render` paints into the supplied
 * canvas and returns a cleanup that cancels its animation loop.
 */
export interface MotionConcept {
  id: string;
  /** Character / concept name shown on hover and in the take-over. */
  name: string;
  /** Short concept tagline. */
  label: string;
  /** Hex accent colour driving the visual + glow. */
  accent: string;
  /** Position over the city image, as percentages (0–100). */
  x: number;
  y: number;
  render: (canvas: HTMLCanvasElement, accent: string) => () => void;
}

// --- canvas helpers -------------------------------------------------------

function setup(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);
  return { ctx, dpr, removeResize: () => window.removeEventListener("resize", resize) };
}

function loop(draw: (t: number) => void) {
  let raf = 0;
  const start = performance.now();
  const tick = (now: number) => {
    draw((now - start) / 1000);
    raf = requestAnimationFrame(tick);
  };
  draw(0); // immediate first frame — robust if rAF is throttled/suspended
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

// --- paint helpers --------------------------------------------------------

function hexToRgb(hex: string) {
  const m = hex.replace("#", "");
  const n = parseInt(m.length === 3 ? m.replace(/(.)/g, "$1$1") : m, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgba(hex: string, a: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/** Cinematic accent-tinted backdrop with a breathing radial glow + film grain feel. */
function backdrop(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string, t: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, rgba(accent, 0.22));
  g.addColorStop(0.5, "rgba(10,8,20,1)");
  g.addColorStop(1, "rgba(4,3,10,1)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const pulse = 0.5 + 0.5 * Math.sin(t * 0.9);
  const rg = ctx.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, Math.max(w, h) * (0.5 + pulse * 0.12));
  rg.addColorStop(0, rgba(accent, 0.16 + pulse * 0.08));
  rg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, w, h);
}

// --- renderers ------------------------------------------------------------

/** A glowing vinyl spinning down into frame, light sweep, drifting notes. */
const renderVinylDrop: MotionConcept["render"] = (canvas, accent) => {
  const { ctx, removeResize } = setup(canvas);
  const notes = Array.from({ length: 16 }, () => ({ x: Math.random(), y: Math.random(), s: 0.5 + Math.random() }));
  const stop = loop((t) => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    backdrop(ctx, w, h, accent, t);

    // drifting glyphs
    ctx.fillStyle = rgba(accent, 0.5);
    ctx.font = "bold 22px system-ui";
    notes.forEach((n, i) => {
      const y = ((n.y - ((t * 0.05 * n.s) % 1) + 1) % 1) * h;
      ctx.globalAlpha = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t + i));
      ctx.fillText(i % 2 ? "♪" : "♫", n.x * w, y);
    });
    ctx.globalAlpha = 1;

    const cx = w / 2;
    const drop = Math.min(1, t / 0.8);
    const ease = 1 - Math.pow(1 - drop, 3);
    const cy = h / 2 - 160 + ease * 160;
    const R = Math.min(w, h) * 0.3;
    ctx.save();
    ctx.translate(cx, cy);
    // outer glow
    ctx.shadowColor = accent;
    ctx.shadowBlur = 50;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fillStyle = "#0a0a12";
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.rotate(t * 1.8);
    for (let i = 1; i < 26; i += 1) {
      ctx.beginPath();
      ctx.arc(0, 0, (R * i) / 26, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${0.015 + (i % 2) * 0.04})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    // rotating light sweep
    const sweep = ctx.createLinearGradient(-R, 0, R, 0);
    sweep.addColorStop(0, "rgba(255,255,255,0)");
    sweep.addColorStop(0.5, rgba(accent, 0.5));
    sweep.addColorStop(1, "rgba(255,255,255,0)");
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = sweep;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // label + spindle
    const lg = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.34);
    lg.addColorStop(0, "#fff");
    lg.addColorStop(0.4, accent);
    lg.addColorStop(1, rgba(accent, 0.6));
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0a0a12";
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  return () => {
    stop();
    removeResize();
  };
};

/** A neon equalizer skyline at twilight — glowing bars, window lights, reflection. */
const renderEqualizerCity: MotionConcept["render"] = (canvas, accent) => {
  const { ctx, removeResize } = setup(canvas);
  const bars = 40;
  const seeds = Array.from({ length: bars }, () => Math.random() * 10);
  const stars = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random() * 0.5, s: Math.random() }));
  const stop = loop((t) => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    backdrop(ctx, w, h, accent, t);
    // stars
    stars.forEach((s) => {
      ctx.globalAlpha = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2 + s.s * 10));
      ctx.fillStyle = "#fff";
      ctx.fillRect(s.x * w, s.y * h, 1.6, 1.6);
    });
    ctx.globalAlpha = 1;

    const base = h * 0.78;
    const bw = w / bars;
    for (let i = 0; i < bars; i += 1) {
      const energy = 0.5 + 0.5 * Math.sin(t * 2.2 + seeds[i] + i * 0.3);
      const bh = energy * h * 0.5 + 16;
      const x = i * bw;
      const g = ctx.createLinearGradient(0, base, 0, base - bh);
      g.addColorStop(0, rgba(accent, 0.5));
      g.addColorStop(1, accent);
      ctx.shadowColor = accent;
      ctx.shadowBlur = 18;
      ctx.fillStyle = g;
      ctx.fillRect(x + bw * 0.14, base - bh, bw * 0.72, bh);
      ctx.shadowBlur = 0;
      // window lights
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      for (let y = base - bh + 10; y < base - 6; y += 13) {
        ctx.fillRect(x + bw * 0.32, y, bw * 0.16, 4);
        ctx.fillRect(x + bw * 0.56, y, bw * 0.16, 4);
      }
      // reflection
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = accent;
      ctx.fillRect(x + bw * 0.14, base, bw * 0.72, bh * 0.4);
      ctx.globalAlpha = 1;
    }
  });
  return () => {
    stop();
    removeResize();
  };
};

/** A sunset horizon with a blooming sun and layered glowing waveforms. */
const renderSoundwaveHorizon: MotionConcept["render"] = (canvas, accent) => {
  const { ctx, removeResize } = setup(canvas);
  const motes = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() }));
  const stop = loop((t) => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    backdrop(ctx, w, h, accent, t);
    const horizon = h * 0.6;
    // sun bloom
    const sunR = Math.min(w, h) * 0.16;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 80;
    const sg = ctx.createRadialGradient(w / 2, horizon, 0, w / 2, horizon, sunR);
    sg.addColorStop(0, "#fff");
    sg.addColorStop(0.5, accent);
    sg.addColorStop(1, rgba(accent, 0.2));
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(w / 2, horizon, sunR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // floating motes
    motes.forEach((m, i) => {
      const y = ((m.y - (t * 0.03 * (0.5 + m.s)) % 1) + 1) % 1 * horizon;
      ctx.globalAlpha = 0.2 + 0.4 * m.s;
      ctx.fillStyle = rgba(accent, 1);
      ctx.fillRect(m.x * w, y, 2 + m.s * 2, 2 + m.s * 2);
      void i;
    });
    ctx.globalAlpha = 1;
    // layered glowing waveforms
    for (let layer = 0; layer < 5; layer += 1) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 5) {
        const phase = t * (1.1 + layer * 0.35);
        const amp = 30 - layer * 4;
        const y =
          horizon + 36 + layer * 20 +
          Math.sin(x * 0.013 + phase) * amp * (0.6 + 0.4 * Math.sin(x * 0.003 + phase));
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.shadowColor = accent;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = layer === 0 ? "#fff" : rgba(accent, 0.7 - layer * 0.12);
      ctx.lineWidth = layer === 0 ? 2.5 : 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  });
  return () => {
    stop();
    removeResize();
  };
};

/** Glitch scatter blooming into a hue-shifting particle flower with RGB split. */
const renderGlitchBloom: MotionConcept["render"] = (canvas, accent) => {
  const { ctx, removeResize } = setup(canvas);
  const base = hexToRgb(accent);
  const N = 320;
  const pts = Array.from({ length: N }, (_, i) => ({
    a: (i / N) * Math.PI * 2,
    r: Math.random(),
    s: 0.6 + Math.random() * 1.1,
  }));
  let first = true;
  const stop = loop((t) => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (first) {
      backdrop(ctx, w, h, accent, t);
      first = false;
    } else {
      // motion trails
      ctx.fillStyle = "rgba(5,4,12,0.16)";
      ctx.fillRect(0, 0, w, h);
    }
    const cx = w / 2;
    const cy = h / 2;
    const bloom = (Math.sin(t * 0.7) * 0.5 + 0.5) * Math.min(w, h) * 0.36 + 30;
    const glitch = Math.max(0, Math.sin(t * 2.6) * 22);
    pts.forEach((p, i) => {
      const petal = Math.sin(p.a * 6 + t) * 0.45 + 0.85;
      const rr = p.r * bloom * petal;
      const x = cx + Math.cos(p.a + t * 0.25) * rr;
      const y = cy + Math.sin(p.a + t * 0.25) * rr;
      const sz = 2.4 * p.s;
      if (i % 9 === 0) {
        // RGB split glitch shards
        ctx.fillStyle = "rgba(255,40,80,0.7)";
        ctx.fillRect(x - glitch, y, sz, sz);
        ctx.fillStyle = "rgba(40,160,255,0.7)";
        ctx.fillRect(x + glitch, y, sz, sz);
      }
      const hue = 0.7 + 0.3 * Math.sin(p.a * 3 + t);
      ctx.fillStyle =
        i % 6 === 0
          ? "#ffffff"
          : `rgb(${Math.round(base.r * hue + 255 * (1 - hue) * 0.2)},${Math.round(base.g * hue)},${Math.round(base.b * hue + 80 * (1 - hue))})`;
      ctx.fillRect(x, y, sz, sz);
    });
  });
  return () => {
    stop();
    removeResize();
  };
};

// --- concept registry (positions are % over public/landing/city.png) -------

export const CONCEPTS: MotionConcept[] = [
  { id: "vinyl-drop", name: "DJ Whiskers", label: "Vinyl drop", accent: "#3ad1ff", x: 56, y: 40, render: renderVinylDrop },
  { id: "equalizer-city", name: "Riff", label: "Equalizer city", accent: "#1db954", x: 45, y: 41, render: renderEqualizerCity },
  { id: "soundwave-horizon", name: "Vox", label: "Soundwave horizon", accent: "#ff7d3a", x: 66, y: 44, render: renderSoundwaveHorizon },
  { id: "glitch-bloom", name: "Static", label: "Glitch to bloom", accent: "#e8ff3a", x: 30, y: 64, render: renderGlitchBloom },
  // The rest reuse a renderer with their own accent/name — same interface, swap
  // in bespoke art/renderers later without touching the city or the take-over.
  { id: "crowd-torches", name: "The Crowd", label: "Crowd torches", accent: "#ff5d8f", x: 50, y: 78, render: renderEqualizerCity },
  { id: "heartbeat", name: "Pulse", label: "Heartbeat → beat", accent: "#ff4d4d", x: 62, y: 80, render: renderSoundwaveHorizon },
  { id: "liquid-sound", name: "Drift", label: "Liquid sound", accent: "#9b7dff", x: 38, y: 79, render: renderGlitchBloom },
  { id: "album-morph", name: "Cover", label: "Album-cover morph", accent: "#5ad0c0", x: 74, y: 74, render: renderVinylDrop },
  { id: "from-everyone", name: "Everyone", label: "From everyone, to you", accent: "#ffd76a", x: 82, y: 68, render: renderGlitchBloom },
];

// --- take-over host -------------------------------------------------------

export function MotionTakeover({ concept, onClose }: { concept: MotionConcept; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const cleanup = reduce ? undefined : concept.render(canvas, concept.accent);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      cleanup?.();
      window.removeEventListener("keydown", onKey);
    };
  }, [concept, onClose]);

  return (
    <div
      className="fixed inset-0 z-[100]"
      style={{
        ["--accent" as string]: concept.accent,
        background: `radial-gradient(120% 90% at 50% 42%, ${concept.accent}33, #0a0814 55%, #040308)`,
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_40%,rgba(0,0,0,.7))]" />

      <button
        onClick={onClose}
        className="absolute right-5 top-5 z-10 grid size-11 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/70"
        aria-label="Back to the city"
      >
        <X size={20} />
      </button>

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-4 p-6 md:p-12">
        <p className="kicker text-[color:var(--accent)]">{concept.name}</p>
        <h2 className="display text-5xl leading-[0.9] text-white md:text-7xl">{concept.label}</h2>
        <Link
          to="/signup"
          className="btn-blue inline-flex items-center gap-2"
          style={{ background: concept.accent, color: "#07080f" }}
        >
          Create your AURA <ArrowUpRight size={18} />
        </Link>
      </div>
    </div>
  );
}
