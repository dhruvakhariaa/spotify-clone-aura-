import { useEffect, useState } from "react";

/**
 * Opt-in "fun mode" for the floating retro iPod player.
 * Off by default — the docked glass PlayerBar is the primary control surface,
 * so nothing is ever occluded unless the user explicitly summons the iPod.
 * Mirrors the localStorage + event pattern used by state/theme.ts.
 */
const KEY = "aura.ipod";
const EVENT = "aura:ipod";

export function getIpodVisible(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setIpodVisible(visible: boolean) {
  try {
    localStorage.setItem(KEY, visible ? "1" : "0");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useIpodVisible() {
  const [visible, setVisible] = useState<boolean>(() => getIpodVisible());

  useEffect(() => {
    const update = () => setVisible(getIpodVisible());
    update();
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return {
    visible,
    toggle: () => setIpodVisible(!getIpodVisible()),
    setVisible: setIpodVisible,
  };
}
