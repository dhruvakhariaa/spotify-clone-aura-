import { useEffect, type RefObject } from "react";
import Lenis from "lenis";

/** Mounts Lenis smooth-scroll for the lifetime of the calling component. */
export function useLenis(wrapperRef?: RefObject<HTMLElement>, contentRef?: RefObject<HTMLElement>) {
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const wrapper = wrapperRef?.current;
    const content = contentRef?.current;
    const lenis = new Lenis({
      wrapper: wrapper ?? window,
      content: content ?? document.documentElement,
      duration: 0.85,
      lerp: 0.12,
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [contentRef, wrapperRef]);
}
