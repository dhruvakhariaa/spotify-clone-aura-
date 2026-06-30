import { useEffect, useRef, useState } from "react";
import { Check, ListPlus, Plus } from "lucide-react";
import type { PlayableTrack } from "../../lib/catalog";
import { addTracksToAuraPlaylist, createAuraPlaylist, useAuraPlaylists } from "../../state/playlists";

/**
 * Add-the-given-track-to-a-playlist popover. Lists the user's playlists (checked
 * if the track is already in them) and lets them spin up a new playlist seeded
 * with the track. Used on track cards and in both players so any song can be
 * added independently.
 */
export function AddToPlaylist({
  track,
  size = 18,
  className = "",
  align = "right",
}: {
  track: PlayableTrack | null | undefined;
  size?: number;
  className?: string;
  align?: "left" | "right";
}) {
  const playlists = useAuraPlaylists();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  const inPlaylist = (id: string) =>
    track ? playlists.find((p) => p.id === id)?.tracks.some((t) => t.id === track.id) ?? false : false;

  const add = (id: string) => {
    if (track) addTracksToAuraPlaylist(id, [track]);
    setOpen(false);
  };

  const create = () => {
    if (!track) return;
    createAuraPlaylist({
      name: name.trim() || `${track.title} mix`,
      isPublic: false,
      createdSource: "manual",
      tracks: [track],
    });
    setName("");
    setCreating(false);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={!track}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Add to playlist"
        title="Add to playlist"
        className={`grid place-items-center text-white/55 transition-colors hover:text-white disabled:opacity-30 ${className}`}
      >
        <ListPlus size={size} />
      </button>

      {open && (
        <div
          role="menu"
          className={`on-dark absolute bottom-full z-50 mb-2 w-60 overflow-hidden rounded-xl border border-white/12 bg-[#10121f] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,.5)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <p className="px-2.5 py-1.5 text-[0.62rem] font-black uppercase tracking-wide text-white/40">Add to playlist</p>
          <div className="max-h-56 overflow-y-auto">
            {playlists.length === 0 && !creating && (
              <p className="px-2.5 py-2 text-xs text-white/45">No playlists yet — create one below.</p>
            )}
            {playlists.map((p) => {
              const has = inPlaylist(p.id);
              return (
                <button
                  key={p.id}
                  role="menuitem"
                  onClick={() => add(p.id)}
                  disabled={has}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-white/80 hover:bg-white/[0.06] disabled:opacity-50"
                >
                  <span className="truncate">{p.name}</span>
                  {has ? <Check size={15} className="shrink-0 text-[color:var(--accent)]" /> : <Plus size={15} className="shrink-0 text-white/45" />}
                </button>
              );
            })}
          </div>

          {creating ? (
            <div className="mt-1 flex items-center gap-1.5 border-t border-white/10 px-1.5 pt-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && create()}
                placeholder="Playlist name"
                className="min-w-0 flex-1 rounded-md border border-white/12 bg-white/[0.05] px-2 py-1.5 text-sm outline-none focus:border-[color:var(--accent)]"
              />
              <button onClick={create} className="btn-blue shrink-0 px-2.5 py-1.5 text-xs">Add</button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="mt-1 flex w-full items-center gap-2 border-t border-white/10 px-2.5 py-2 text-sm font-bold text-[color:var(--accent)]"
            >
              <Plus size={15} /> New playlist
            </button>
          )}
        </div>
      )}
    </div>
  );
}
