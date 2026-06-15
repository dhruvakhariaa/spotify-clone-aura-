/** Minimal inline icons — stroke inherits currentColor, sized via the `s` prop. */
type P = { s?: number; className?: string };
const svg = (path: ReactNode, fill = false) =>
  function Icon({ s = 20, className }: P) {
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill={fill ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        {path}
      </svg>
    );
  };

import type { ReactNode } from "react";

export const IconHome = svg(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>);
export const IconCompass = svg(<><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>);
export const IconLibrary = svg(<><path d="M5 4v16M10 4v16" /><path d="m15 5 4 15" /></>);
export const IconJam = svg(<><circle cx="7" cy="17" r="3" /><circle cx="17" cy="15" r="3" /><path d="M10 17V6l10-2v11" /></>);
export const IconWrapped = svg(<><path d="M12 3v18M3 12h18" /><circle cx="12" cy="12" r="9" /></>);
export const IconPlay = svg(<path d="M7 4v16l13-8z" />, true);
export const IconPause = svg(<><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>, true);
export const IconNext = svg(<><path d="M6 4v16l10-8z" fill="currentColor" /><rect x="17" y="4" width="2.5" height="16" rx="1" fill="currentColor" /></>, true);
export const IconPrev = svg(<><path d="M18 4v16L8 12z" fill="currentColor" /><rect x="4.5" y="4" width="2.5" height="16" rx="1" fill="currentColor" /></>, true);
export const IconVolume = svg(<><path d="M4 9v6h4l5 4V5L8 9z" /><path d="M16 8a5 5 0 0 1 0 8" /></>);
export const IconShare = svg(<><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 14v6h14v-6" /></>);
export const IconHeart = svg(<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z" />);
