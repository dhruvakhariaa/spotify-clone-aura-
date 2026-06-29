import { useEffect, useRef } from "react";
import { CityCharacter } from "./CityCharacter";
import { CONCEPTS, type MotionConcept } from "./concepts";

/**
 * The hero scene: the pixel city full-bleed with a light parallax on pointer
 * move, an ambient neon-flicker glow, twinkling string-light specks, and a
 * vignette so overlaid type reads. Characters are clickable concept hotspots.
 */
export function PixelCity({
  reduced,
  onSelect,
}: {
  reduced: boolean;
  onSelect: (concept: MotionConcept) => void;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const el = sceneRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const cx = e.clientX / window.innerWidth - 0.5;
      const cy = e.clientY / window.innerHeight - 0.5;
      el.style.setProperty("--px", `${cx * -14}px`);
      el.style.setProperty("--py", `${cy * -10}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  return (
    <div ref={sceneRef} className="absolute inset-0 overflow-hidden bg-[#1a1430]">
      {/* city image (with subtle parallax translate) */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: "translate3d(var(--px,0), var(--py,0), 0) scale(1.05)" }}
      >
        <img
          src="/landing/city.png"
          alt="A neon pixel-art city at dusk: a street stage with a band and a crowd"
          className="h-full w-full object-cover [image-rendering:pixelated]"
        />
        {/* clickable characters layered over the art */}
        <div className="absolute inset-0">
          {CONCEPTS.map((concept, index) => (
            <CityCharacter key={concept.id} concept={concept} index={index} reduced={reduced} onSelect={onSelect} />
          ))}
        </div>
      </div>

      {/* ambient neon flicker */}
      {!reduced && (
        <div className="pointer-events-none absolute inset-0 mix-blend-screen [animation:auraFlicker_5s_ease-in-out_infinite] bg-[radial-gradient(40%_30%_at_30%_22%,rgba(255,93,143,.18),transparent),radial-gradient(40%_30%_at_72%_30%,rgba(58,209,255,.16),transparent)]" />
      )}

      {/* vignette + bottom scrim for legibility */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_30%,transparent_45%,rgba(8,6,18,.7))]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(8,6,18,.92))]" />
    </div>
  );
}
