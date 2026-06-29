import { Link } from "react-router-dom";
import { Mic2, Shuffle } from "lucide-react";
import { usePlayer } from "../../state/player";
import { useIpodVisible } from "../../state/uiMode";
import { fmtTime } from "../../lib/catalog";
import { IconPlay, IconPause, IconNext, IconPrev, IconVolume } from "./icons";

export function PlayerBar() {
  const p = usePlayer();
  const ipod = useIpodVisible();
  const pct = p.duration ? (p.currentTime / p.duration) * 100 : 0;

  return (
    <div className="h-[76px] glass-strong rounded-2xl grid grid-cols-[1fr_auto] md:grid-cols-3 items-center gap-3 px-4 md:px-6 shadow-[0_16px_50px_rgba(0,0,0,.4)]">
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
          <button
            onClick={p.toggleShuffle}
            className={`hidden p-1 transition-colors sm:block ${p.shuffleEnabled ? "text-[color:var(--accent)]" : "text-white/55 hover:text-white"}`}
            aria-label={p.shuffleEnabled ? "Turn shuffle off" : "Turn shuffle on"}
          >
            <Shuffle size={18} />
          </button>
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
          <button
            onClick={p.toggleKaraoke}
            disabled={!p.canUseKaraoke && !p.karaokeMode}
            className={`hidden p-1 transition-colors disabled:opacity-30 sm:block ${
              p.karaokeMode ? "text-[color:var(--accent-2)]" : "text-white/55 hover:text-white"
            }`}
            aria-label={p.karaokeMode ? "Exit karaoke" : "Enter karaoke"}
          >
            <Mic2 size={18} />
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

      {/* volume + retro iPod toggle */}
      <div className="hidden md:flex items-center gap-3 justify-self-end text-white/55">
        <button
          type="button"
          onClick={ipod.toggle}
          aria-pressed={ipod.visible}
          aria-label={ipod.visible ? "Hide retro iPod player" : "Show retro iPod player"}
          title={ipod.visible ? "Hide iPod" : "Retro iPod player"}
          className={`grid size-9 place-items-center rounded-full border transition-colors ${
            ipod.visible
              ? "border-[color:var(--accent)] text-[color:var(--accent)]"
              : "border-[color:var(--hairline)] hover:text-white"
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="6" y="2" width="12" height="20" rx="3" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="15.5" r="3.1" stroke="currentColor" strokeWidth="1.8" />
            <line x1="9" y1="6" x2="15" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <div className="flex items-center gap-2.5">
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
    </div>
  );
}
