import { NavLink, Link } from "react-router-dom";
import type { Aura } from "../../lib/types";
import { getAuraCode } from "../../state/aura";
import { IconHome, IconCompass, IconLibrary, IconJam, IconWrapped, IconGlobe, IconTicket } from "./icons";
import { ThemeToggle } from "../ThemeToggle";
import { SpotifyConnectButton } from "../SpotifyConnectButton";

const NAV = [
  { to: "/app/home", label: "Home", Icon: IconHome, ready: true },
  { to: "/app/discover", label: "Discover", Icon: IconCompass, ready: true },
  { to: "/app/concerts", label: "Concerts", Icon: IconTicket, ready: true },
  { to: "/app/jam", label: "Jam", Icon: IconJam, ready: true },
  { to: "/app/frequency", label: "Frequency", Icon: IconGlobe, ready: true },
  { to: "/app/library", label: "Library", Icon: IconLibrary, ready: true },
  { to: "/app/wrapped", label: "Wrapped", Icon: IconWrapped, ready: true },
];

export function Sidebar({ aura }: { aura: Aura | null }) {
  return (
    <aside className="w-[76px] lg:w-64 shrink-0 h-full flex flex-col bg-[color:var(--color-smoke)] border-r-2 border-white/10">
      {/* brand */}
      <div className="flex h-[68px] shrink-0 items-center justify-between gap-2 border-b-2 border-white/10 px-4 lg:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="block h-3.5 w-3.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
          <span className="display hidden text-2xl lg:block">AURA</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <SpotifyConnectButton compact />
          <ThemeToggle compact />
        </div>
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto py-5 flex flex-col gap-1.5 px-3 lg:px-4">
        {NAV.map(({ to, label, Icon, ready }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3.5 rounded-lg px-3 lg:px-4 py-3 transition-colors ${
                isActive
                  ? "bg-[color:var(--accent)] text-[color:var(--color-ink)]"
                  : "text-white/65 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Icon s={20} />
            <span className="hidden lg:block font-bold uppercase tracking-wide text-sm">{label}</span>
            {!ready && (
              <span className="hidden lg:block ml-auto text-[0.6rem] font-bold uppercase tracking-wider text-white/35 group-hover:text-white/55">
                soon
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* your aura */}
      <div className="p-3 lg:p-4 border-t-2 border-white/10 shrink-0">
        {aura ? (
          <Link to={`/a/${getAuraCode()}`} className="block">
            <div
              className="rounded-xl border-2 p-3 lg:p-4 transition-transform hover:-translate-y-0.5"
              style={{ borderColor: aura.archetype.accent }}
            >
              <p className="label text-white/40 hidden lg:block mb-1">Your aura</p>
              <div className="flex items-center gap-3">
                <span
                  className="block w-8 h-8 rounded-full shrink-0"
                  style={{ background: `radial-gradient(circle at 35% 30%, #fff, ${aura.archetype.accent2}, ${aura.archetype.accent})` }}
                />
                <span className="hidden lg:block display text-base leading-tight" style={{ color: aura.archetype.accent }}>
                  {aura.archetype.name.replace("The ", "")}
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <Link to="/onboard" className="btn-acid w-full text-center text-xs block">
            <span className="hidden lg:inline">Make your Aura ✦</span>
            <span className="lg:hidden">✦</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
