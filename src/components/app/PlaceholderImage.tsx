import { useState } from "react";

interface Props {
  /** A path under /public, e.g. "/concerts/mumbai-arijit/hero.jpg". */
  src: string;
  label?: string;
  className?: string;
  /**
   * "cover" (default) fills + crops the box — right for heroes, cards, avatars.
   * "contain" shows the WHOLE image and lets the box size to it (right for memes
   * and any art you want shown in full). Pass max bounds via className.
   */
  fit?: "cover" | "contain";
}

/**
 * Renders the image at `src`. If the file isn't there yet, it shows a tidy
 * labelled placeholder telling you exactly which file to drop where — so you
 * can fill artwork in later without touching code. See public/PLACEHOLDERS.md.
 */
export function PlaceholderImage({ src, label, className = "", fit = "cover" }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`grid place-items-center bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_18%,transparent),rgba(0,0,0,.35))] ${
          fit === "contain" ? "min-h-[240px] w-full" : ""
        } ${className}`}
      >
        <div className="px-3 text-center">
          <p className="label text-white/55">Image slot</p>
          {label && <p className="mt-1 text-xs font-bold text-white/85">{label}</p>}
          <code className="mt-1 block break-all text-[0.6rem] text-white/45">public{src}</code>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={label ?? ""}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${fit === "contain" ? "block h-auto w-auto object-contain" : "object-cover"} ${className}`}
    />
  );
}
