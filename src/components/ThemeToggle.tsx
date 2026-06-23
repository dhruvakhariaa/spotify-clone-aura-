import { Moon, Sun } from "lucide-react";
import { useTheme } from "../state/theme";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { isLight, toggleTheme } = useTheme();
  const Icon = isLight ? Moon : Sun;
  const label = isLight ? "Dark mode" : "Light mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`inline-grid place-items-center rounded-full border border-white/14 bg-white/[0.06] text-white/72 transition-colors hover:bg-white/[0.1] hover:text-white ${
        compact ? "h-10 w-10" : "h-11 w-11"
      }`}
    >
      <Icon size={compact ? 17 : 18} />
    </button>
  );
}
