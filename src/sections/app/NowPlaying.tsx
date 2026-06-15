import { Link } from "react-router-dom";
import { usePlayer } from "../../state/player";
import { useMyAura } from "../../state/aura";
import { fmtTime } from "../../lib/catalog";
import { Synesthesia } from "../../components/Synesthesia";
import { ARCHETYPE_BY_ID } from "../../data/archetypes";
import { IconPlay, IconPause, IconNext, IconPrev } from "../../components/app/icons";
import type { Aura } from "../../lib/types";

export default function NowPlaying() {
  const p = usePlayer();
  const myAura = useMyAura();

  const fb = ARCHETYPE_BY_ID["neon-nomad"];
  const vizAura: Aura =
    myAura ?? {
      archetype: fb,
      features: fb.center,
      artistIds: [],
      moodIds: [],
      time: "dusk",
      seed: 2025,
      serial: "0000",
    };

  const pct = p.duration ? (p.currentTime / p.duration) * 100 : 0;

  return (
    <div
      className="relative min-h-full flex flex-col items-center justify-center px-5 md:px-10 py-10 overflow-hidden"
      style={{ ["--accent" as string]: vizAura.archetype.accent, ["--accent-2" as string]: vizAura.archetype.accent2 }}
    >
      {/* ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 opacity-40 flex items-center justify-center">
        <div className="w-[120vmin] h-[120vmin]">
          <Synesthesia aura={vizAura} levelRef={p.levelRef} />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[560px] flex flex-col items-center text-center">
        <p className="kicker text-white/50 mb-8">
          {p.current ? "Now playing" : "Synesthesia"} · feels like {vizAura.archetype.name.replace("The ", "")}
        </p>

        {/* main visual */}
        <div className="w-[min(72vw,440px)] aspect-square mb-10">
          <Synesthesia aura={vizAura} levelRef={p.levelRef} />
        </div>

        {p.current ? (
          <>
            <h1 className="display text-3xl md:text-5xl mb-2 leading-none">{p.current.title}</h1>
            <p className="text-lg text-white/60 mb-8">{p.current.artist}</p>

            {/* seek */}
            <div className="w-full flex items-center gap-3 mb-8">
              <span className="text-xs tabular-nums text-white/45 w-10 text-right">{fmtTime(p.currentTime)}</span>
              <input
                type="range"
                className="range flex-1"
                min={0}
                max={p.duration || 0}
                value={p.currentTime}
                onChange={(e) => p.seek(Number(e.target.value))}
                style={{ ["--range-pct" as string]: `${pct}%` }}
              />
              <span className="text-xs tabular-nums text-white/45 w-10">{fmtTime(p.duration)}</span>
            </div>

            {/* transport */}
            <div className="flex items-center gap-8">
              <button onClick={p.prev} className="text-white/70 hover:text-white transition-colors" aria-label="Previous">
                <IconPrev s={28} />
              </button>
              <button
                onClick={p.toggle}
                className="grid place-items-center w-16 h-16 rounded-full bg-[color:var(--accent)] text-[color:var(--color-ink)] hover:scale-105 transition-transform"
                aria-label={p.isPlaying ? "Pause" : "Play"}
              >
                {p.isPlaying ? <IconPause s={26} /> : <IconPlay s={26} />}
              </button>
              <button onClick={p.next} className="text-white/70 hover:text-white transition-colors" aria-label="Next">
                <IconNext s={28} />
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="display text-3xl md:text-4xl mb-3">Nothing's playing yet.</h1>
            <p className="text-white/55 mb-8 max-w-sm">
              Start a track and watch your Aura move to it — the player breathes to the music.
            </p>
            <Link to="/app/home" className="btn-acid">Find something to play ↗</Link>
          </>
        )}
      </div>
    </div>
  );
}
