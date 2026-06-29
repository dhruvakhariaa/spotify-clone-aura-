import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Heart, Loader2, Plus, RefreshCw, Users, X } from "lucide-react";
import { PLAYLIST_CONCEPTS } from "../../data/editorial";
import type { PlayableTrack } from "../../lib/catalog";
import { ensureAuraUniverse } from "../../lib/universe";
import { readSpotifySession } from "../../lib/spotifyAuth";
import { useMyAura } from "../../state/aura";
import { useLikedSongs } from "../../state/likedSongs";
import { usePlayer } from "../../state/player";
import { createAuraPlaylist, syncAuraPlaylistToSpotify, useAuraPlaylists, type AuraPlaylist } from "../../state/playlists";
import { GenerativeMark } from "../../components/GenerativeMark";

type SeedSource = "manual" | "queue" | "liked" | "universe";

function sourceLabel(source: SeedSource) {
  if (source === "queue") return "Current queue";
  if (source === "liked") return "Liked songs";
  if (source === "universe") return "AURA Universe";
  return "Empty playlist";
}

function PlaylistModal({
  likedSongs,
  queue,
  onClose,
}: {
  likedSongs: PlayableTrack[];
  queue: PlayableTrack[];
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [source, setSource] = useState<SeedSource>("manual");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!name.trim()) {
      setError("Name the playlist first.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let tracks: PlayableTrack[] = [];
      if (source === "queue") tracks = queue;
      if (source === "liked") tracks = likedSongs;
      if (source === "universe") tracks = await ensureAuraUniverse();
      createAuraPlaylist({
        name,
        description,
        isPublic,
        createdSource: source,
        tracks,
      });
      onClose();
    } catch {
      setError("Could not create the playlist.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-5 backdrop-blur-md">
      <div className="on-dark w-full max-w-2xl rounded-lg border border-white/14 bg-[#10121f]/96 p-5 shadow-[0_28px_90px_rgba(0,0,0,.46)]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="kicker mb-2 text-white/42">Aura-native playlist</p>
            <h2 className="display text-4xl">New playlist</h2>
          </div>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-md border border-white/10 text-white/58 hover:text-white" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4">
          <label className="block">
            <span className="label mb-2 block text-white/48">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 font-bold outline-none focus:border-[color:var(--accent)]"
              placeholder="Hostel after hours"
            />
          </label>
          <label className="block">
            <span className="label mb-2 block text-white/48">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-24 w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 outline-none focus:border-[color:var(--accent)]"
              placeholder="What does this room feel like?"
            />
          </label>
          <div>
            <span className="label mb-2 block text-white/48">Seed from</span>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {(["manual", "queue", "liked", "universe"] as SeedSource[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setSource(item)}
                  className={`rounded-lg border px-3 py-3 text-left text-xs font-bold uppercase ${
                    source === item ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white" : "border-white/10 bg-white/[0.035] text-white/62"
                  }`}
                >
                  {sourceLabel(item)}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm font-bold text-white/72">
            <input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} />
            Public when synced to Spotify
          </label>
        </div>

        {error && <p className="mt-4 text-sm font-bold text-[#ff7d7d]">{error}</p>}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button onClick={onClose} className="btn-ghost px-5 py-3 text-xs">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="btn-blue inline-flex items-center gap-2 px-5 py-3 text-xs disabled:opacity-45">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Create playlist
          </button>
        </div>
      </div>
    </div>
  );
}

function SavedPlaylistCard({ playlist }: { playlist: AuraPlaylist }) {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const canSync = Boolean(readSpotifySession() && playlist.tracks.some((track) => track.spotifyUri));

  const sync = async () => {
    setSyncing(true);
    setMessage("");
    try {
      await syncAuraPlaylistToSpotify(playlist.id);
      setMessage("Synced to Spotify");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Spotify sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="kicker mb-2 text-white/42">{playlist.createdSource} / {playlist.tracks.length} tracks</p>
          <h2 className="display truncate text-3xl">{playlist.name}</h2>
          <p className="mt-2 line-clamp-2 text-sm text-white/58">{playlist.description || "No description yet."}</p>
        </div>
        {playlist.spotifyPlaylistId && <Check className="shrink-0 text-[#1db954]" size={22} />}
      </div>
      <div className="mb-5 grid grid-cols-4 gap-2">
        {playlist.tracks.slice(0, 4).map((track) => (
          <div key={track.id} className="aspect-square overflow-hidden rounded bg-white/[0.04]">
            {track.artwork && <img src={track.artwork} alt="" className="h-full w-full object-cover" />}
          </div>
        ))}
      </div>
      <button
        onClick={sync}
        disabled={!canSync || syncing || Boolean(playlist.spotifyPlaylistId)}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase text-white/62 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {syncing ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
        {playlist.spotifyPlaylistId ? "Spotify synced" : "Sync to Spotify"}
      </button>
      {message && <p className="mt-3 text-xs font-bold text-white/48">{message}</p>}
    </article>
  );
}

export default function Library() {
  const aura = useMyAura();
  const likedSongs = useLikedSongs();
  const playlists = useAuraPlaylists();
  const player = usePlayer();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="px-5 py-8 md:px-10 md:py-12">
      {showModal && <PlaylistModal likedSongs={likedSongs} queue={player.queue} onClose={() => setShowModal(false)} />}
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
          <div>
            <p className="kicker mb-3 text-white/42">Aura-native library</p>
            <h1 className="display t-lg max-w-4xl">Collaborative playlists before Spotify sync.</h1>
            <p className="mt-5 max-w-2xl text-white/62">
              Create playlists from the Universe, your current queue, or liked songs. They save in AURA first and can sync to Spotify when connected.
            </p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-blue inline-flex items-center justify-center gap-2">
            <Plus size={18} /> New playlist
          </button>
        </header>

        {playlists.length > 0 && (
          <section className="mb-8 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {playlists.map((playlist) => (
              <SavedPlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </section>
        )}

        <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          <article className="relative min-h-[420px] overflow-hidden rounded-lg border border-[#a98cff]/60 bg-[#a98cff]/[0.08] p-6">
            <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[#a98cff]/20 blur-3xl" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-black/24 px-3 py-2 text-sm text-white/72">
                  <Heart size={16} fill="currentColor" /> {likedSongs.length} liked
                </div>
                <h2 className="display text-4xl leading-none">Liked Songs</h2>
                <p className="mt-3 text-sm font-bold text-[#a98cff]">Created from the device heart button</p>
              </div>
              <div>
                {likedSongs.length ? (
                  <div className="mb-6 space-y-2">
                    {likedSongs.slice(0, 3).map((track) => (
                      <div key={track.id} className="grid grid-cols-[40px_1fr] items-center gap-3 rounded-lg bg-black/24 p-2">
                        {track.artwork ? (
                          <img src={track.artwork} alt="" className="h-10 w-10 rounded object-cover" />
                        ) : (
                          <div className="grid h-10 w-10 place-items-center rounded bg-white/10 text-white/40">♪</div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{track.title}</p>
                          <p className="truncate text-xs text-white/45">{track.artist}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mb-6 text-white/62">Play a song and tap the top heart on the device wheel to create this playlist.</p>
                )}
                <Link to="/app/home" className="inline-flex items-center gap-2 font-bold text-white hover:text-[#a98cff]">
                  Find songs to like <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>
          </article>

          {PLAYLIST_CONCEPTS.map((playlist, index) => (
            <article key={playlist.title} className="relative min-h-[420px] overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] p-6">
              {aura && (
                <div className="absolute -right-16 -top-12 h-64 w-64 opacity-40">
                  <GenerativeMark aura={{ ...aura, seed: aura.seed + index * 311 }} />
                </div>
              )}
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-black/24 px-3 py-2 text-sm text-white/62">
                    <Users size={16} /> {playlist.people} collaborators
                  </div>
                  <h2 className="display text-4xl leading-none">{playlist.title}</h2>
                  <p className="mt-3 text-sm font-bold text-[#1db954]">{playlist.aura}</p>
                </div>
                <div>
                  <p className="mb-6 text-white/62">{playlist.blurb}</p>
                  <Link to="/app/jam" className="inline-flex items-center gap-2 font-bold text-white hover:text-[#1db954]">
                    Start a listening room <ArrowUpRight size={18} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
