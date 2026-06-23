import { useEffect, useState } from "react";

export type AuraTheme = "dark" | "light";

const KEY = "aura.theme";
const EVENT = "aura:theme";

function systemTheme(): AuraTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function getTheme(): AuraTheme {
  try {
    const stored = localStorage.getItem(KEY);
    return stored === "light" || stored === "dark" ? stored : systemTheme();
  } catch {
    return "dark";
  }
}

export function setTheme(theme: AuraTheme) {
  localStorage.setItem(KEY, theme);
  document.documentElement.dataset.theme = theme;
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function initTheme() {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = getTheme();
}

export function useTheme() {
  const [theme, setThemeState] = useState<AuraTheme>(() => getTheme());

  useEffect(() => {
    const update = () => setThemeState(getTheme());
    update();
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return {
    theme,
    isLight: theme === "light",
    toggleTheme: () => setTheme(theme === "light" ? "dark" : "light"),
    setTheme,
  };
}
