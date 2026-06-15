import type { PlayableTrack } from "../../lib/catalog";
import { IconPlay, IconPause } from "./icons";

interface Props {
  track: PlayableTrack;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: (index: number) => void;
}

export function TrackCard({ track, index, isCurrent, isPlaying, onPlay }: Props) {
  return (
    <button
      onClick={() => onPlay(index)}
      className="group text-left w-full min-w-0 flex flex-col gap-3 p-3 rounded-xl border-2 border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/25 transition-all"
    >
      <div className="relative aspect-square rounded-lg overflow-hidden bg-[color:var(--color-ash)]">
        {track.artwork ? (
          <img src={track.artwork} alt="" loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center display text-4xl text-white/20">♪</div>
        )}
        <div
          className={`absolute bottom-2 right-2 grid place-items-center w-11 h-11 rounded-full bg-[color:var(--accent)] text-[color:var(--color-ink)] shadow-lg transition-all ${
            isCurrent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
          }`}
        >
          {isCurrent && isPlaying ? <IconPause s={18} /> : <IconPlay s={18} />}
        </div>
      </div>
      <div className="min-w-0">
        <div
          className="font-bold truncate"
          style={isCurrent ? { color: "var(--accent)" } : undefined}
        >
          {track.title}
        </div>
        <div className="text-sm text-white/50 truncate">{track.artist}</div>
      </div>
    </button>
  );
}
