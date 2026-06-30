import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import type { PlayableTrack } from "../../lib/catalog";
import { isTrackLiked, toggleLikedSong } from "../../state/likedSongs";

/** Heart toggle for the current/given track. Reactive to likes changing elsewhere. */
export function LikeButton({
  track,
  size = 18,
  className = "",
}: {
  track: PlayableTrack | null | undefined;
  size?: number;
  className?: string;
}) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const sync = () => setLiked(isTrackLiked(track?.id));
    sync();
    window.addEventListener("aura:liked-songs", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("aura:liked-songs", sync);
      window.removeEventListener("storage", sync);
    };
  }, [track?.id]);

  return (
    <button
      type="button"
      onClick={() => track && setLiked(toggleLikedSong(track))}
      disabled={!track}
      aria-pressed={liked}
      aria-label={liked ? "Remove from Liked Songs" : "Add to Liked Songs"}
      title={liked ? "Remove from Liked Songs" : "Like"}
      className={`grid place-items-center transition-colors disabled:opacity-30 ${
        liked ? "text-[color:var(--accent)]" : "text-white/55 hover:text-white"
      } ${className}`}
    >
      <Heart size={size} fill={liked ? "currentColor" : "none"} />
    </button>
  );
}
