import { Outlet } from "react-router-dom";
import { PlayerProvider } from "../../state/player";
import { useMyAura } from "../../state/aura";
import { Sidebar } from "./Sidebar";
import { PlayerBar } from "./PlayerBar";

/** Persistent app frame: sidebar + scrollable content + bottom player. Themed to the user's Aura. */
export default function AppShell() {
  const aura = useMyAura();
  const themeStyle = aura
    ? ({ ["--accent" as string]: aura.archetype.accent, ["--accent-2" as string]: aura.archetype.accent2 })
    : undefined;

  return (
    <PlayerProvider>
      <div className="h-screen flex flex-col bg-[color:var(--color-ink)]" style={themeStyle}>
        <div className="flex flex-1 min-h-0">
          <Sidebar aura={aura} />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
        <PlayerBar />
      </div>
    </PlayerProvider>
  );
}
