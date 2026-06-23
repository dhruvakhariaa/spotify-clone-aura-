import { useEffect, useMemo, useState } from "react";
import type { Aura } from "../lib/types";
import { decodeAura } from "../lib/encodeAura";

/** Persists the visitor's current Aura *code* so the whole app can theme to it. */
const KEY = "aura.code";
const EVENT = "aura:changed";

export function saveAuraCode(code: string) {
  localStorage.setItem(KEY, code);
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function getAuraCode(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** Reactive hook: the visitor's saved Aura (decoded), or null if they have none yet. */
export function useMyAura(): Aura | null {
  const [code, setCode] = useState<string | null>(() => getAuraCode());
  useEffect(() => {
    const update = () => setCode(getAuraCode());
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return useMemo(() => (code ? decodeAura(code) : null), [code]);
}
