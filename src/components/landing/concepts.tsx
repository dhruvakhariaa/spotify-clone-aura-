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

// --- renderers ------------------------------------------------------------

/** A vinyl record spinning down into frame with a tonearm and groove shimmer. */
const renderVinylDrop: MotionConcept["render"] = (canvas, accent) => {
  const { ctx, removeResize } = setup(canvas);
  const stop = loop((t) => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const drop = Math.min(1, t / 0.9);
    const cy = h / 2 - 120 + drop * 120; // ease into place
    const R = Math.min(w, h) * 0.32;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 1.6);
    // disc
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fillStyle = "#0a0a12";
    ctx.fill();
    // grooves
    for (let i = 1; i < 22; i += 1) {
      ctx.beginPath();
      ctx.arc(0, 0, (R * i) / 22, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${0.02 + (i % 2) * 0.03})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    // label
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.34, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();
    // shimmer highlight
    ctx.beginPath();
    ctx.arc(0, 0, R, -0.5 + Math.sin(t) * 0.3, 0.3 + Math.sin(t) * 0.3);
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();
  });
  return () => {
    stop();
    removeResize();
  };
};

/** An equalizer skyline — bars rising like neon buildings. */
const renderEqualizerCity: MotionConcept["render"] = (canvas, accent) => {
  const { ctx, removeResize } = setup(canvas);
  const bars = 48;
  const seeds = Array.from({ length: bars }, () => Math.random() * 10);
  const stop = loop((t) => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    const bw = w / bars;
    for (let i = 0; i < bars; i += 1) {
      const energy = 0.5 + 0.5 * Math.sin(t * 2 + seeds[i] + i * 0.3);
      const bh = energy * h * 0.6 + 12;
      const x = i * bw;
      const grad = ctx.createLinearGradient(0, h, 0, h - bh);
      grad.addColorStop(0, accent);
      grad.addColorStop(1, "rgba(255,255,255,0.85)");
      ctx.fillStyle = grad;
      ctx.fillRect(x + bw * 0.12, h - bh, bw * 0.76, bh);
      // window dots on each "building"
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      for (let y = h - bh + 10; y < h - 6; y += 14) {
        ctx.fillRect(x + bw * 0.3, y, bw * 0.18, 4);
        ctx.fillRect(x + bw * 0.55, y, bw * 0.18, 4);
      }
    }
  });
  return () => {
    stop();
    removeResize();
  };
};

/** A glowing horizon with a layered, pulsing waveform sun. */
const renderSoundwaveHorizon: MotionConcept["render"] = (canvas, accent) => {
  const { ctx, removeResize } = setup(canvas);
  const stop = loop((t) => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    const horizon = h * 0.62;
    // sun
    const sunR = Math.min(w, h) * 0.18;
    const grad = ctx.createRadialGradient(w / 2, horizon, 0, w / 2, horizon, sunR * 2.2);
    grad.addColorStop(0, accent);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(w / 2, horizon, sunR * 2.2, 0, Math.PI * 2);
    ctx.fill();
    // stacked waveforms
    for (let layer = 0; layer < 4; layer += 1) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const phase = t * (1.2 + layer * 0.4);
        const amp = 26 - layer * 4;
        const y =
          horizon +
          40 +
          layer * 22 +
          Math.sin(x * 0.012 + phase) * amp * (0.6 + 0.4 * Math.sin(x * 0.003 + phase));
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(255,255,255,${0.5 - layer * 0.1})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
  return () => {
    stop();
    removeResize();
  };
};

/** Glitch scatter that blooms into a particle flower. */
const renderGlitchBloom: MotionConcept["render"] = (canvas, accent) => {
  const { ctx, removeResize } = setup(canvas);
  const N = 220;
  const pts = Array.from({ length: N }, (_, i) => ({
    a: (i / N) * Math.PI * 2,
    r: Math.random(),
    s: 0.6 + Math.random() * 0.8,
  }));
  const stop = loop((t) => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const bloom = (Math.sin(t * 0.8) * 0.5 + 0.5) * Math.min(w, h) * 0.34;
    const glitch = Math.max(0, Math.sin(t * 3) * 18);
    pts.forEach((p, i) => {
      const petal = Math.sin(p.a * 5 + t) * 0.4 + 0.8;
      const rr = p.r * bloom * petal;
      const x = cx + Math.cos(p.a + t * 0.2) * rr + (i % 7 === 0 ? glitch : 0);
      const y = cy + Math.sin(p.a + t * 0.2) * rr;
      ctx.fillStyle = i % 5 === 0 ? "#ffffff" : accent;
      ctx.fillRect(x, y, 2.4 * p.s, 2.4 * p.s);
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
    <div className="fixed inset-0 z-[100] bg-black" style={{ ["--accent" as string]: concept.accent }}>
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
