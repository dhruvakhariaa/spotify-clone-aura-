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
      // Buttons get the default tap; links/elements that explicitly opt in via
      // data-audio-tone keep their bespoke cue (e.g. the soulmate/make music on
      // AuraReveal's <Link>s). Generic links + range sliders stay silent.
      const interactive = target.closest("button, [role='button'], [data-audio-tone]");
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
