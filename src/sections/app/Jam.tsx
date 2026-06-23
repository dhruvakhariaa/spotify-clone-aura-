import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { usePlayer } from "../../state/player";
import { useMyAura, getAuraCode } from "../../state/aura";
import { useJam, groupAura, type PlaybackState } from "../../state/jam";
import { decodeAura } from "../../lib/encodeAura";
import { nearestArtists } from "../../data/roster";
import { tracksFromArtists } from "../../lib/catalog";
import { ARCHETYPE_BY_ID } from "../../data/archetypes";
import { GenerativeMark } from "../../components/GenerativeMark";
import { Synesthesia } from "../../components/Synesthesia";
import { IconPlay, IconPause, IconNext, IconPrev } from "../../components/app/icons";
import type { Aura } from "../../lib/types";

const rid = () => Math.random().toString(36).slice(2, 8);

export default function Jam() {
  const { room } = useParams();
  const navigate = useNavigate();

  if (!room) {
    return (
      <div className="px-5 md:px-10 py-16 max-w-2xl mx-auto text-center min-h-full flex flex-col items-center justify-center">
        <h1 className="display t-lg mb-4">Jam</h1>
        <p className="text-white/55 mb-10 max-w-md">
          A live room where everyone's Aura merges into one — and you all hear the same song, in sync.
          Open it in another tab to feel it work.
        </p>
        <button onClick={() => navigate(`/app/jam/${rid()}?host=1`)} className="btn-blue text-base">
          Start a Jam →
        </button>
      </div>
    );
  }
  return <Room roomId={room} />;
}

function Room({ roomId }: { roomId: string }) {
  const p = usePlayer();
  const myAura = useMyAura();
  const [params] = useSearchParams();
  const isHost = params.get("host") === "1";
  const [joined, setJoined] = useState(isHost);
  const [toast, setToast] = useState("");
  const [seeding, setSeeding] = useState(false);

  const fallback = ARCHETYPE_BY_ID["neon-nomad"];
  const meAura: Aura =
    myAura ?? { archetype: fallback, features: fallback.center, artistIds: [], moodIds: [], time: "dusk", seed: 7, serial: "0000" };

  const { peers, postPlayback, onPlayback } = useJam(roomId, {
    name: myAura ? myAura.archetype.name.replace("The ", "") : "Guest",
    accent: meAura.archetype.accent,
    accent2: meAura.archetype.accent2,
    auraCode: getAuraCode(),
  });

  // Everyone present (me + peers), with decoded Auras for the blend.
  const auras = useMemo(() => {
    const peerAuras = peers.map((pe) => (pe.auraCode ? decodeAura(pe.auraCode) : null)).filter(Boolean) as Aura[];
    return [meAura, ...peerAuras];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peers, myAura]);
  const group = useMemo(() => groupAura(auras) ?? meAura, [auras, meAura]);

  // ---- HOST: broadcast our playback ----
  const pRef = useRef(p);
  pRef.current = p;
  useEffect(() => {
    if (!isHost) return;
    const send = () => {
      const cur = pRef.current;
      if (!cur.current) return;
      postPlayback({
        queue: cur.queue,
        index: cur.index,
        positionMs: cur.currentTime * 1000,
        playing: cur.isPlaying,
        ts: Date.now(),
      });
    };
    send();
    const iv = setInterval(send, 2000);
    return () => clearInterval(iv);
  }, [isHost, postPlayback, p.current?.id, p.isPlaying]);

  // ---- FOLLOWER: apply host playback ----
  const joinedRef = useRef(joined);
  joinedRef.current = joined;
  const latest = useRef<PlaybackState | null>(null);
  useEffect(() => {
    if (isHost) return;
    onPlayback((state) => {
      latest.current = state;
      if (joinedRef.current) apply(state);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost]);

  const apply = (state: PlaybackState) => {
    const cur = pRef.current;
    const target = state.queue[state.index];
    if (!target) return;
    if (cur.current?.id !== target.id) cur.play(state.queue, state.index);
    const wantSec = state.positionMs / 1000 + (Date.now() - state.ts) / 1000;
    if (Math.abs(cur.currentTime - wantSec) > 1.8 && isFinite(wantSec)) cur.seek(wantSec);
    if (state.playing && !cur.isPlaying) cur.toggle();
    if (!state.playing && cur.isPlaying) cur.toggle();
  };

  const join = () => {
    setJoined(true);
    if (latest.current) apply(latest.current);
  };

  const seedRadio = async () => {
    setSeeding(true);
    try {
      const tracks = await tracksFromArtists(nearestArtists(meAura.features, 8).map((a) => a.name), 2);
      if (tracks.length) p.play(tracks, 0);
    } finally {
      setSeeding(false);
    }
  };

  const copyInvite = async () => {
    const link = `${window.location.origin}/app/jam/${roomId}`;
    try {
      await navigator.clipboard.writeText(link);
      setToast("Invite link copied ✓");
    } catch {
      setToast(link);
    }
    setTimeout(() => setToast(""), 2200);
  };

  const headcount = peers.length + 1;

  return (
    <div
      className="relative min-h-full px-5 md:px-10 py-8 md:py-12 overflow-hidden"
      style={{ ["--accent" as string]: group.archetype.accent, ["--accent-2" as string]: group.archetype.accent2 }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-25 flex items-center justify-center">
        <div className="w-[90vmin] h-[90vmin]"><Synesthesia aura={group} levelRef={p.levelRef} /></div>
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between gap-4 mb-10 flex-wrap">
          <div>
            <p className="kicker text-white/45 mb-1">Jam · {headcount} {headcount === 1 ? "listener" : "listeners"}</p>
            <h1 className="display text-3xl md:text-5xl">{group.archetype.name}</h1>
          </div>
          <button onClick={copyInvite} className="btn-blue">↗ Invite</button>
        </div>

        {/* participants */}
        <div className="flex flex-wrap gap-5 mb-12">
          {auras.map((a, i) => (
            <div key={i} className="flex flex-col items-center gap-2 w-20">
              <div className="w-16 h-16"><GenerativeMark aura={a} /></div>
              <span className="text-xs text-white/60 text-center truncate w-full">
                {i === 0 ? "You" : a.archetype.name.replace("The ", "")}
              </span>
            </div>
          ))}
        </div>

        {/* now playing / controls */}
        <div className="surface p-6 md:p-8">
          {p.current ? (
            <div className="flex items-center gap-5">
              {p.current.artwork && <img src={p.current.artwork} alt="" className="w-16 h-16 rounded-lg object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="kicker text-white/40 mb-1">{isHost ? "You're the DJ" : "Host is playing"}</p>
                <div className="display text-xl truncate">{p.current.title}</div>
                <div className="text-white/55 truncate">{p.current.artist}</div>
              </div>
              {isHost ? (
                <div className="flex items-center gap-3">
                  <button onClick={p.prev} className="text-white/65 hover:text-white"><IconPrev s={22} /></button>
                  <button onClick={p.toggle} className="grid place-items-center w-12 h-12 rounded-full bg-[color:var(--color-blue)] text-white">
                    {p.isPlaying ? <IconPause s={20} /> : <IconPlay s={20} />}
                  </button>
                  <button onClick={p.next} className="text-white/65 hover:text-white"><IconNext s={22} /></button>
                </div>
              ) : !joined ? (
                <button onClick={join} className="btn-blue shrink-0">Tap to join ▶</button>
              ) : (
                <span className="kicker text-[color:var(--color-blue)]">● in sync</span>
              )}
            </div>
          ) : isHost ? (
            <div className="text-center py-4">
              <p className="text-white/60 mb-4">Start a track to kick off the jam.</p>
              <button onClick={seedRadio} disabled={seeding} className="btn-blue disabled:opacity-40">
                {seeding ? "Loading…" : "Start Aura Radio ▶"}
              </button>
            </div>
          ) : (
            <p className="text-center text-white/55 py-4">Waiting for the host to start a track…</p>
          )}
        </div>

        {peers.length === 0 && (
          <p className="text-center text-white/35 text-sm mt-6">
            Open this room in another browser tab (or send the invite) to see Auras merge live.
          </p>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[color:var(--color-paper)] text-[color:var(--color-ink)] font-bold px-5 py-3 rounded-full text-sm">
          {toast}
        </div>
      )}
      <Link to="/app/home" className="sr-only">home</Link>
    </div>
  );
}
