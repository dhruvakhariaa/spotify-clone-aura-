import { forwardRef } from "react";
import type { Aura } from "../lib/types";
import { GenerativeMark } from "./GenerativeMark";

interface Props {
  aura: Aura;
}

const bars = (aura: Aura) => [
  { label: "Energy", v: aura.features.energy },
  { label: "Mood", v: aura.features.valence },
  { label: "Tempo", v: aura.features.tempo },
];

/**
 * The shareable artifact: a magazine-cover identity poster. Self-contained and
 * sized 4:5 for social. Background = the archetype's accent; ink everything else.
 */
export const AuraPoster = forwardRef<HTMLDivElement, Props>(({ aura }, ref) => {
  const { archetype } = aura;
  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: "4 / 5",
        background: archetype.accent,
        color: "var(--color-ink)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div className="absolute inset-0 flex flex-col p-[5%]">
        {/* top bar */}
        <div className="flex justify-between" style={{ fontWeight: 700, letterSpacing: "0.12em", fontSize: "0.7vw", textTransform: "uppercase" }}>
          <span style={{ fontSize: "min(2.6vw,0.8rem)" }}>AURA.FM</span>
          <span style={{ fontSize: "min(2.6vw,0.8rem)" }}>EST. 2026</span>
        </div>

        {/* kicker + name */}
        <div className="mt-[3%]">
          <p style={{ fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "min(3vw,0.95rem)" }}>
            You sound like
          </p>
          <h1
            className="display"
            style={{ fontSize: "min(9.5vw,3.2rem)", lineHeight: 0.88, marginTop: "1%" }}
          >
            {archetype.name}
          </h1>
        </div>

        {/* mark */}
        <div
          className="relative mt-[4%] mb-[4%] flex-1 rounded-md overflow-hidden"
          style={{ background: "var(--color-ink)", minHeight: 0 }}
        >
          <GenerativeMark aura={aura} />
          <span
            className="absolute bottom-2 right-3 display"
            style={{ color: archetype.accent, fontSize: "min(4vw,1.1rem)", opacity: 0.9 }}
          >
            #{aura.serial}
          </span>
        </div>

        {/* genres */}
        <div className="flex flex-wrap gap-[1.5%] mb-[3%]">
          {archetype.genres.map((g) => (
            <span
              key={g}
              style={{
                background: "var(--color-ink)",
                color: archetype.accent,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                fontSize: "min(2.6vw,0.72rem)",
                padding: "0.3em 0.6em",
                borderRadius: "999px",
              }}
            >
              {g}
            </span>
          ))}
        </div>

        {/* bars */}
        <div className="flex flex-col gap-[2%]">
          {bars(aura).map((b) => (
            <div key={b.label} className="flex items-center gap-[3%]">
              <span style={{ width: "22%", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "min(2.6vw,0.72rem)" }}>
                {b.label}
              </span>
              <div style={{ flex: 1, height: "min(2.2vw,0.6rem)", background: "rgba(10,10,10,0.18)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${Math.round(b.v * 100)}%`, height: "100%", background: "var(--color-ink)" }} />
              </div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div
          className="mt-[4%] -mx-[5%] -mb-[5%] px-[5%] py-[3.5%] flex justify-between items-center"
          style={{ background: "var(--color-ink)", color: archetype.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "min(2.6vw,0.72rem)" }}
        >
          <span>↗ aura.fm</span>
          <span style={{ opacity: 0.7 }}>{archetype.tagline}</span>
        </div>
      </div>
    </div>
  );
});

AuraPoster.displayName = "AuraPoster";
