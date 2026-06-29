import { useEffect, useRef, useState } from "react";
import { artistImage } from "../../lib/artistImage";
import { IconPlay } from "./icons";

interface Props {
  name: string;
  sub?: string;
  onPlay: () => void;
  loading?: boolean;
}

/** Round artist tile with a real photo (Spotify headshot → iTunes fallback). */
export function ArtistCard({ name, sub, onPlay, loading }: Props) {
  const [img, setImg] = useState<string>();
  const [seen, setSeen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  // Only fetch the photo once the card is near the viewport.
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSeen(true)),
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  useEffect(() => {
    if (!seen) return;
    let on = true;
    artistImage(name).then((i) => on && setImg(i));
    return () => {
      on = false;
    };
  }, [seen, name]);

  return (
    <button
      ref={ref}
      onClick={onPlay}
      className="group text-center flex flex-col items-center gap-3 w-full min-w-0 p-3 rounded-2xl hover:bg-white/[0.04] transition-colors"
    >
      <div className="relative w-full aspect-square rounded-full overflow-hidden bg-[color:var(--color-ash)]">
        {img ? (
          <img src={img} alt={name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: "radial-gradient(circle at 35% 30%, #2b3bff55, #07080f)" }}
          />
        )}
        <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <span className="grid place-items-center w-12 h-12 rounded-full bg-[color:var(--color-blue)] text-white">
            {loading ? <span className="animate-pulse">•</span> : <IconPlay s={20} />}
          </span>
        </div>
      </div>
      <div className="min-w-0 w-full">
        <div className="font-bold leading-tight line-clamp-2">{name}</div>
        {sub && <div className="text-xs text-white/45 truncate">{sub}</div>}
      </div>
    </button>
  );
}
