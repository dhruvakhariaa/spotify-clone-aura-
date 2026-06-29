import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { PlayerProvider } from "../../state/player";
import { useMyAura } from "../../state/aura";
import { useIpodVisible } from "../../state/uiMode";
import { Sidebar } from "./Sidebar";
import { PlayerBar } from "./PlayerBar";
import { RetroPlayer } from "./RetroPlayer";

/** Persistent app frame: sidebar + native scroll content + docked player bar. */
export default function AppShell() {
  const aura = useMyAura();
  const ipod = useIpodVisible();
  const location = useLocation();
  const pageKey = location.pathname.split("/").slice(0, 3).join("/");
  // Jam has its own contextual player — don't stack the global dock on top of it.
  const isJam = location.pathname.startsWith("/app/jam");
  const themeStyle = aura
    ? ({ ["--accent" as string]: aura.archetype.accent, ["--accent-2" as string]: aura.archetype.accent2 })
    : undefined;

  return (
    <PlayerProvider>
      <div className="relative flex h-screen flex-col bg-[color:var(--color-ink)]" style={themeStyle}>
        <div className="flex min-h-0 flex-1">
          <Sidebar aura={aura} />
          <main className="app-scroll min-w-0 flex-1 overflow-y-auto">
            <motion.div
              key={pageKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-full pb-28"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
        {/* Floating glass dock — frosts the content scrolling behind it. Hidden
            while the retro iPod is summoned so the two never stack. */}
        {!ipod.visible && !isJam && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 pb-3 pr-3 pl-[88px] lg:pl-[272px]">
            <div className="pointer-events-auto">
              <PlayerBar />
            </div>
          </div>
        )}
        {ipod.visible && <RetroPlayer />}
      </div>
    </PlayerProvider>
  );
}
