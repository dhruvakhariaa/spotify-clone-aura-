import type { PlayableTrack } from "../../lib/catalog";
import { IconPlay, IconPause } from "./icons";
import { LikeButton } from "./LikeButton";
import { AddToPlaylist } from "./AddToPlaylist";

interface Props {
  track: PlayableTrack;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: (index: number) => void;
}

export function TrackCard({ track, index, isCurrent, isPlaying, onPlay }: Props) {
  return (
    <div className="group relative w-full min-w-0 flex flex-col gap-3 p-3 rounded-xl border-2 border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/25 transition-all">
      {/* Full-card play trigger sits behind the per-track controls (which are z-10). */}
      <button
        onClick={() => onPlay(index)}
        aria-label={`Play ${track.title} by ${track.artist}`}
        className="absolute inset-0 z-0 rounded-xl"
      />

      <div className="relative aspect-square rounded-lg overflow-hidden bg-[color:var(--color-ash)]">
        {track.artwork ? (
          <img src={track.artwork} alt="" loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center display text-4xl text-white/20">♪</div>
        )}

        {/* per-track controls — above the play trigger */}
        <div className="absolute left-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <span className="grid size-8 place-items-center rounded-full bg-black/55 backdrop-blur-sm">
            <LikeButton track={track} size={15} />
          </span>
          <span className="grid size-8 place-items-center rounded-full bg-black/55 backdrop-blur-sm">
            <AddToPlaylist track={track} size={15} align="left" />
          </span>
        </div>

        <div
          className={`absolute bottom-2 right-2 z-10 grid place-items-center w-11 h-11 rounded-full bg-[color:var(--accent)] text-[color:var(--color-ink)] shadow-lg transition-all pointer-events-none ${
            isCurrent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
          }`}
        >
          {isCurrent && isPlaying ? <IconPause s={18} /> : <IconPlay s={18} />}
        </div>
      </div>

      <div className="min-w-0">
        <div className="font-bold truncate" style={isCurrent ? { color: "var(--accent)" } : undefined}>
          {track.title}
        </div>
        <div className="text-sm text-white/50 truncate">{track.artist}</div>
      </div>
    </div>
  );
}
