import { Link } from "react-router-dom";
import { usePlayer } from "../../state/player";
import { fmtTime } from "../../lib/catalog";
import { IconPlay, IconPause, IconNext, IconPrev, IconVolume } from "./icons";

export function PlayerBar() {
  const p = usePlayer();
  const pct = p.duration ? (p.currentTime / p.duration) * 100 : 0;

  return (
    <div className="shrink-0 h-[84px] bg-[color:var(--color-ink)] border-t-2 border-white/12 grid grid-cols-[1fr_auto] md:grid-cols-3 items-center gap-3 px-4 md:px-6">
      {/* track info */}
      <Link to="/app/now" className="flex items-center gap-3 min-w-0 group">
        <div className="w-[52px] h-[52px] shrink-0 rounded-md overflow-hidden bg-[color:var(--color-ash)] grid place-items-center">
          {p.current?.artwork ? (
            <img src={p.current.artwork} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="display text-lg text-white/30">♪</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="font-bold truncate group-hover:underline decoration-2 underline-offset-2">
            {p.current?.title ?? "Nothing playing"}
          </div>
          <div className="text-sm text-white/50 truncate">
            {p.current?.artist ?? "Pick a track to begin"}
          </div>
        </div>
      </Link>

      {/* transport + seek */}
      <div className="flex flex-col items-center gap-2 justify-self-end md:justify-self-center w-full max-w-[520px]">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={p.prev} className="text-white/65 hover:text-white transition-colors p-1" aria-label="Previous">
            <IconPrev s={20} />
          </button>
          <button
            onClick={p.toggle}
            disabled={!p.current}
            className="grid place-items-center w-11 h-11 rounded-full bg-[color:var(--accent)] text-[color:var(--color-ink)] disabled:opacity-30 hover:scale-105 transition-transform"
            aria-label={p.isPlaying ? "Pause" : "Play"}
          >
            {p.isPlaying ? <IconPause s={20} /> : <IconPlay s={20} />}
          </button>
          <button onClick={p.next} className="text-white/65 hover:text-white transition-colors p-1" aria-label="Next">
            <IconNext s={20} />
          </button>
        </div>
        <div className="hidden md:flex items-center gap-2.5 w-full">
          <span className="text-[0.7rem] tabular-nums text-white/45 w-9 text-right">{fmtTime(p.currentTime)}</span>
          <input
            type="range"
            className="range flex-1"
            min={0}
            max={p.duration || 0}
            value={p.currentTime}
            onChange={(e) => p.seek(Number(e.target.value))}
            style={{ ["--range-pct" as string]: `${pct}%` }}
          />
          <span className="text-[0.7rem] tabular-nums text-white/45 w-9">{fmtTime(p.duration)}</span>
        </div>
      </div>

      {/* volume */}
      <div className="hidden md:flex items-center gap-2.5 justify-self-end text-white/55">
        <IconVolume s={18} />
        <input
          type="range"
          className="range w-24"
          min={0}
          max={1}
          step={0.01}
          value={p.volume}
          onChange={(e) => p.setVolume(Number(e.target.value))}
          style={{ ["--range-pct" as string]: `${p.volume * 100}%` }}
        />
      </div>
    </div>
  );
}
