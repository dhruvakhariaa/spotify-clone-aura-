import { Link } from "react-router-dom";
import { ArrowUpRight, Heart, Plus, Users } from "lucide-react";
import { PLAYLIST_CONCEPTS } from "../../data/editorial";
import { useMyAura } from "../../state/aura";
import { useLikedSongs } from "../../state/likedSongs";
import { GenerativeMark } from "../../components/GenerativeMark";

export default function Library() {
  const aura = useMyAura();
  const likedSongs = useLikedSongs();

  return (
    <div className="px-5 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
          <div>
            <p className="kicker mb-3 text-white/42">Aura-native library</p>
            <h1 className="display t-lg max-w-4xl">Collaborative playlists before Spotify sync.</h1>
            <p className="mt-5 max-w-2xl text-white/62">
              These are concept rooms for now: playlist identity, contributors, Aura covers, and export-ready structure.
              Supabase can make them real without changing the product shape.
            </p>
          </div>
          <button className="btn-blue inline-flex items-center justify-center gap-2">
            <Plus size={18} /> New playlist
          </button>
        </header>

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
