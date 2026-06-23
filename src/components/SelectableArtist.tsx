import { useEffect, useRef, useState } from "react";
import { artistImage } from "../lib/artistImage";

interface Props {
  name: string;
  sub?: string;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

/** A selectable artist tile with a real (lazy-loaded) photo — for the Aura picker. */
export function SelectableArtist({ name, sub, selected, disabled, onToggle }: Props) {
  const [img, setImg] = useState<string>();
  const [seen, setSeen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setSeen(true)),
      { rootMargin: "250px" }
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
      onClick={onToggle}
      disabled={disabled && !selected}
      className={`group relative text-left rounded-xl overflow-hidden transition-all disabled:opacity-30 ${
        selected ? "ring-2 ring-[color:var(--color-blue)] ring-offset-2 ring-offset-[color:var(--color-ink)]" : ""
      }`}
    >
      <div className="relative aspect-square bg-[color:var(--color-ash)]">
        {img ? (
          <img src={img} alt={name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: "radial-gradient(circle at 35% 30%, #2b3bff44, #07080f)" }} />
        )}
        <div className={`absolute inset-0 transition-colors ${selected ? "bg-[color:var(--color-blue)]/25" : "bg-black/10 group-hover:bg-black/0"}`} />
        {selected && (
          <div className="absolute top-2 right-2 w-7 h-7 grid place-items-center rounded-full bg-[color:var(--color-blue)] text-white text-sm font-bold">
            ✓
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 to-transparent">
          <div className="font-bold text-sm leading-tight truncate">{name}</div>
          {sub && <div className="text-[0.65rem] text-white/60 truncate">{sub}</div>}
        </div>
      </div>
    </button>
  );
}
