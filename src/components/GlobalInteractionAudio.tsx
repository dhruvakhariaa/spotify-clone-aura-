import { useEffect } from "react";
import { playReactionSound, type ReactionTone } from "../lib/reactions";

function toneFromElement(el: Element): ReactionTone {
  const explicit = el.getAttribute("data-audio-tone") as ReactionTone | null;
  return explicit ?? "tap";
}

export function GlobalInteractionAudio() {
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const interactive = target.closest("button, a, [role='button'], input[type='range']");
      if (!interactive) return;
      if (interactive.hasAttribute("disabled") || interactive.getAttribute("aria-disabled") === "true") return;
      if (interactive.hasAttribute("data-audio-muted")) return;
      playReactionSound(toneFromElement(interactive));
    };

    window.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });
    return () => window.removeEventListener("pointerdown", onPointerDown, { capture: true });
  }, []);

  return null;
}
