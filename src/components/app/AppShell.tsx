import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { PlayerProvider } from "../../state/player";
import { useMyAura } from "../../state/aura";
import { Sidebar } from "./Sidebar";
import { PlayerBar } from "./PlayerBar";
import { RetroPlayer } from "./RetroPlayer";

/** Persistent app frame: sidebar + native scroll content + floating player. */
export default function AppShell() {
  const aura = useMyAura();
  const location = useLocation();
  const pageKey = location.pathname.split("/").slice(0, 3).join("/");
  const themeStyle = aura
    ? ({ ["--accent" as string]: aura.archetype.accent, ["--accent-2" as string]: aura.archetype.accent2 })
    : undefined;

  return (
    <PlayerProvider>
      <div className="flex h-screen flex-col bg-[color:var(--color-ink)]" style={themeStyle}>
        <div className="flex min-h-0 flex-1">
          <Sidebar aura={aura} />
          <main className="app-scroll min-w-0 flex-1 overflow-y-auto">
            <motion.div
              key={pageKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-full pb-8"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
        <RetroPlayer />
        <div className="xl:hidden">
          <PlayerBar />
        </div>
      </div>
    </PlayerProvider>
  );
}
