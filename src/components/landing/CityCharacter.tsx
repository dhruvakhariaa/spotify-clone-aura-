import { useState } from "react";
import { motion } from "framer-motion";
import type { MotionConcept } from "./concepts";

/**
 * A clickable character in the city. By default it's an invisible hit-area placed
 * over a figure already painted into city.png, marked with a pulsing pin + a
 * hover label. If a clean transparent sprite is provided later (`spriteSrc`), it
 * renders that sprite instead so characters can become free-roaming.
 */
export function CityCharacter({
  concept,
  index,
  reduced,
  spriteSrc,
  onSelect,
}: {
  concept: MotionConcept;
  index: number;
  reduced: boolean;
  spriteSrc?: string;
  onSelect: (concept: MotionConcept) => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(concept)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      style={{ left: `${concept.x}%`, top: `${concept.y}%`, ["--accent" as string]: concept.accent }}
      aria-label={`${concept.name} — ${concept.label}`}
      initial={false}
      animate={reduced ? undefined : { y: [0, -6, 0] }}
      transition={reduced ? undefined : { duration: 2.4 + (index % 4) * 0.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* hover label */}
      <span
        className={`pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-black/80 px-3 py-1.5 text-center backdrop-blur-sm transition-all duration-200 ${
          hover ? "opacity-100" : "opacity-0 translate-y-1"
        }`}
      >
        <span className="block text-[0.7rem] font-black uppercase tracking-wide text-[color:var(--accent)]">{concept.name}</span>
        <span className="block text-[0.62rem] font-bold text-white/70">{concept.label}</span>
      </span>

      {spriteSrc ? (
        <img
          src={spriteSrc}
          alt=""
          className="h-16 w-auto [image-rendering:pixelated] drop-shadow-[0_6px_14px_rgba(0,0,0,.5)]"
        />
      ) : (
        <span className="relative grid place-items-center">
          {/* hit-area over the in-art figure */}
          <span className="block h-12 w-9 rounded-md transition-colors group-hover:bg-[color:var(--accent)]/10 md:h-16 md:w-12" />
          {/* pulsing pin */}
          <span className="absolute -bottom-1 grid place-items-center">
            <span className="absolute h-4 w-4 animate-ping rounded-full bg-[color:var(--accent)]/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--accent)] shadow-[0_0_10px_var(--accent)] ring-2 ring-black/40" />
          </span>
        </span>
      )}
    </motion.button>
  );
}
