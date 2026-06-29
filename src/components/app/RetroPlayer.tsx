import { Download, GripHorizontal, Heart, Mic2, Shuffle, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { toPng } from "html-to-image";
import { usePlayer } from "../../state/player";
import { fmtTime } from "../../lib/catalog";
import { isTrackLiked, toggleLikedSong } from "../../state/likedSongs";
import { setIpodVisible } from "../../state/uiMode";
import { playReactionSound } from "../../lib/reactions";
import { IconPlay, IconPause, IconNext, IconPrev } from "./icons";

const MIN_DEVICE_WIDTH = 188;
const MAX_DEVICE_WIDTH = 260;
const DEFAULT_DEVICE_WIDTH = 204;
const DEVICE_WIDTH_KEY = "aura.retro-player.width";
const PLAYER_POS_KEY = "aura.retro-player.position";
/** The docked PlayerBar hides while the iPod is open, so the iPod only needs a
 *  small edge pad — it can be dragged anywhere across the viewport. */
const BAR_CLEARANCE = 8;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function ScreenMarquee({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldRoll, setShouldRoll] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    const text = el?.querySelector("span");
    if (!el || !text) return;

    const measure = () => {
      setShouldRoll(text.scrollWidth > el.clientWidth + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    observer.observe(text);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [value]);

  return (
    <div ref={ref} className={`screen-marquee ${shouldRoll ? "is-rolling" : ""}`} title={value}>
      <span className={className}>{value}</span>
      {shouldRoll && (
        <span className={className} aria-hidden="true">
          {value}
        </span>
      )}
    </div>
  );
}

export function RetroPlayer() {
  const p = usePlayer();
  const panelRef = useRef<HTMLElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startWidth: number; panelLeft: number; panelTop: number } | null>(null);
  const [liked, setLiked] = useState(false);
  const [toast, setToast] = useState("");
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [deviceWidth, setDeviceWidth] = useState(() => {
    const stored = Number(localStorage.getItem(DEVICE_WIDTH_KEY));
    return Number.isFinite(stored) ? Math.min(MAX_DEVICE_WIDTH, Math.max(MIN_DEVICE_WIDTH, stored)) : DEFAULT_DEVICE_WIDTH;
  });
  const [panelPos, setPanelPos] = useState<{ x: number; y: number } | null>(() => {
    try {
      const raw = localStorage.getItem(PLAYER_POS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { x?: number; y?: number };
      if (!Number.isFinite(parsed.x) || !Number.isFinite(parsed.y)) return null;
      return { x: parsed.x as number, y: parsed.y as number };
    } catch {
      return null;
    }
  });
  const pct = p.duration ? (p.currentTime / p.duration) * 100 : 0;
  const title = p.current?.title ?? "Nothing playing";
  const artist = p.current?.artist ?? "Pick a track";

  useEffect(() => {
    setLiked(isTrackLiked(p.current?.id));
  }, [p.current?.id]);

  useEffect(() => {
    localStorage.setItem(DEVICE_WIDTH_KEY, String(deviceWidth));
  }, [deviceWidth]);

  useEffect(() => {
    if (panelPos) localStorage.setItem(PLAYER_POS_KEY, JSON.stringify(panelPos));
  }, [panelPos]);

  useEffect(() => {
    const keepPanelInView = () => {
      setPanelPos((current) => {
        if (!current) return current;
        const rect = panelRef.current?.getBoundingClientRect();
        const width = rect?.width ?? deviceWidth + 32;
        const height = rect?.height ?? 520;
        return {
          x: clamp(current.x, 8, Math.max(8, window.innerWidth - width - 8)),
          y: clamp(current.y, 8, Math.max(8, window.innerHeight - height - BAR_CLEARANCE)),
        };
      });
    };

    keepPanelInView();
    window.addEventListener("resize", keepPanelInView);
    return () => window.removeEventListener("resize", keepPanelInView);
  }, [deviceWidth]);

  const toggleLike = () => {
    playReactionSound("tap");
    if (!p.current) return;
    setLiked(toggleLikedSong(p.current));
  };

  const resizeDevice = (next: number) => {
    playReactionSound("tap");
    setDeviceWidth(Math.min(MAX_DEVICE_WIDTH, Math.max(MIN_DEVICE_WIDTH, next)));
  };

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    event.preventDefault();
    const drag = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
    dragRef.current = drag;
    setPanelPos({ x: rect.left, y: rect.top });
    setDragging(true);

    const move = (moveEvent: PointerEvent) => {
      const rectNow = panelRef.current?.getBoundingClientRect();
      const width = rectNow?.width ?? deviceWidth + 32;
      const height = rectNow?.height ?? 520;
      setPanelPos({
        x: clamp(moveEvent.clientX - drag.offsetX, 8, Math.max(8, window.innerWidth - width - 8)),
        y: clamp(moveEvent.clientY - drag.offsetY, 8, Math.max(8, window.innerHeight - height - BAR_CLEARANCE)),
      });
    };

    const end = () => {
      dragRef.current = null;
      setDragging(false);
      playReactionSound("tap");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  };

  const beginResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    resizeRef.current = { startX: event.clientX, startWidth: deviceWidth, panelLeft: rect.left, panelTop: rect.top };
    setPanelPos({ x: rect.left, y: rect.top });
    setResizing(true);

    const resize = resizeRef.current;
    const move = (moveEvent: PointerEvent) => {
      if (!resize) return;
      const nextWidth = clamp(resize.startWidth + moveEvent.clientX - resize.startX, MIN_DEVICE_WIDTH, MAX_DEVICE_WIDTH);
      const panelRect = panelRef.current?.getBoundingClientRect();
      const panelWidth = nextWidth + 32;
      const panelHeight = panelRect?.height ?? 520;
      setDeviceWidth(nextWidth);
      setPanelPos({
        x: clamp(resize.panelLeft, 8, Math.max(8, window.innerWidth - panelWidth - 8)),
        y: clamp(resize.panelTop, 8, Math.max(8, window.innerHeight - panelHeight - BAR_CLEARANCE)),
      });
    };

    const end = () => {
      resizeRef.current = null;
      setResizing(false);
      playReactionSound("tap");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  };

  const keyboardResize = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      resizeDevice(deviceWidth - 8);
    }
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      resizeDevice(deviceWidth + 8);
    }
    if (event.key === "Home") {
      event.preventDefault();
      resizeDevice(MIN_DEVICE_WIDTH);
    }
    if (event.key === "End") {
      event.preventDefault();
      resizeDevice(MAX_DEVICE_WIDTH);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1700);
  };

  const downloadDevice = async () => {
    if (!deviceRef.current) return;
    playReactionSound("success");
    try {
      const url = await toPng(deviceRef.current, { pixelRatio: 3, cacheBust: true, backgroundColor: "transparent" });
      const a = document.createElement("a");
      a.href = url;
      a.download = `aura-ipod-${(p.current?.title ?? "now-playing").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      a.click();
      showToast("iPod image downloaded");
    } catch {
      showToast("Export failed");
    }
  };

  return (
    <aside
      ref={panelRef}
      className={`on-dark fixed z-40 hidden rounded-[1.5rem] border border-white/20 bg-[#0b0e1c]/55 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_24px_70px_rgba(0,0,0,.45)] backdrop-blur-2xl backdrop-saturate-150 md:block ${
        panelPos ? "" : "bottom-[104px] right-5"
      } ${dragging || resizing ? "select-none" : ""}`}
      style={{
        width: deviceWidth + 32,
        ...(panelPos ? { left: panelPos.x, top: panelPos.y } : {}),
      }}
    >
      <div className="flex w-full flex-col items-center">
        <div className="mb-2 flex w-full items-end justify-between" style={{ maxWidth: deviceWidth }}>
          <div
            onPointerDown={beginDrag}
            className={`min-w-0 cursor-grab touch-none select-none ${dragging ? "cursor-grabbing" : ""}`}
            title="Drag player"
          >
            <p className="kicker text-white/38">Now playing</p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-[0.7rem] text-white/48">
              <GripHorizontal size={14} /> Drag player
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                playReactionSound("tap");
                p.toggleShuffle();
              }}
              className={`grid size-7 place-items-center rounded-md border border-white/10 bg-white/[0.035] hover:text-white ${
                p.shuffleEnabled ? "text-[#b7a0ff]" : "text-white/58"
              }`}
              aria-label={p.shuffleEnabled ? "Turn shuffle off" : "Turn shuffle on"}
              title={p.shuffleEnabled ? "Shuffle on" : "Shuffle"}
            >
              <Shuffle size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                playReactionSound("tap");
                p.toggleKaraoke();
              }}
              disabled={!p.canUseKaraoke && !p.karaokeMode}
              className={`grid size-7 place-items-center rounded-md border border-white/10 bg-white/[0.035] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 ${
                p.karaokeMode ? "text-[#e8ff3a]" : "text-white/58"
              }`}
              aria-label={p.karaokeMode ? "Exit karaoke" : "Enter karaoke"}
              title={p.canUseKaraoke ? (p.karaokeMode ? "Exit karaoke" : "Karaoke") : "Karaoke not available yet"}
            >
              <Mic2 size={14} />
            </button>
            <button
              type="button"
              onClick={downloadDevice}
              className="grid size-7 place-items-center rounded-md border border-white/10 bg-white/[0.035] text-white/58 hover:text-white"
              aria-label="Download iPod image"
              title="Download iPod image"
            >
              <Download size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                playReactionSound("tap");
                setIpodVisible(false);
              }}
              className="grid size-7 place-items-center rounded-md border border-white/10 bg-white/[0.035] text-white/58 hover:text-white"
              aria-label="Hide iPod player"
              title="Hide iPod"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        <div
          ref={deviceRef}
          className="relative w-full overflow-hidden rounded-[1.4rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.015))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_12px_30px_rgba(0,0,0,.32)]"
          style={{ width: deviceWidth }}
        >
          <div
            className="pointer-events-none absolute -top-10 left-1/2 h-24 w-32 -translate-x-1/2 rounded-full blur-2xl"
            style={{ background: "color-mix(in srgb, var(--accent) 36%, transparent)" }}
          />

          {/* screen */}
          <Link
            to="/app/now"
            className="relative block overflow-hidden rounded-xl border border-white/12 bg-[#070a14]/85 px-3 py-2.5 text-[#eaf1ff] shadow-[inset_0_0_22px_rgba(0,0,0,.5)]"
          >
            <div className="flex items-center justify-between text-[0.5rem] font-bold uppercase tracking-wide text-[#9fb2cc]">
              <span>{p.transport === "spotify" ? "Spotify" : p.karaokeMode ? "Karaoke" : "Now playing"}</span>
              <Heart size={10} fill={liked ? "currentColor" : "none"} className={liked ? "text-[color:var(--accent)]" : ""} />
            </div>
            <ScreenMarquee value={title} className="display mt-1 text-[0.84rem] leading-[1] text-white" />
            <ScreenMarquee value={artist} className="mt-0.5 text-[0.64rem] font-semibold uppercase tracking-wide text-[#bcccea]" />
            <div className="mt-2 flex items-center gap-1.5 text-[0.5rem] font-bold tabular-nums text-[#9fb2cc]">
              <span className="w-6 shrink-0">{fmtTime(p.currentTime)}</span>
              <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--accent)" }} />
              </div>
              <span className="w-6 shrink-0 text-right">{fmtTime(p.duration || 30)}</span>
            </div>
          </Link>

          {/* glass click-wheel */}
          <div className="relative mx-auto mt-3 aspect-square w-[82%]">
            <div className="absolute inset-0 rounded-full border border-white/14 bg-white/[0.05] shadow-[inset_0_2px_12px_rgba(0,0,0,.4),inset_0_-2px_10px_rgba(255,255,255,.07)]" />
            <button
              onClick={toggleLike}
              disabled={!p.current}
              className="absolute left-1/2 top-[5%] grid size-7 -translate-x-1/2 place-items-center rounded-full text-white/70 transition-colors hover:text-white disabled:opacity-40"
              aria-label={liked ? "Remove from Liked Songs" : "Add to Liked Songs"}
              title={liked ? "Remove from Liked Songs" : "Add to Liked Songs"}
            >
              <Heart size={15} fill={liked ? "currentColor" : "none"} className={liked ? "text-[color:var(--accent)]" : ""} />
            </button>
            <button
              onClick={() => {
                playReactionSound("tap");
                p.prev();
              }}
              className="absolute left-[4%] top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-white/70 transition-colors hover:text-white"
              aria-label="Previous song"
              title="Previous"
            >
              <IconPrev s={17} />
            </button>
            <button
              onClick={() => {
                playReactionSound("tap");
                p.next();
              }}
              className="absolute right-[4%] top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-white/70 transition-colors hover:text-white"
              aria-label="Next song"
              title="Next"
            >
              <IconNext s={17} />
            </button>
            <span className="absolute bottom-[6%] left-1/2 -translate-x-1/2 text-[0.5rem] font-black uppercase tracking-[0.2em] text-white/35">
              Aura
            </span>
            <button
              onClick={() => {
                playReactionSound("tap");
                p.toggle();
              }}
              disabled={!p.current}
              className="absolute left-1/2 top-1/2 grid size-[38%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/16 bg-white/[0.09] text-white shadow-[0_4px_14px_rgba(0,0,0,.4),inset_0_1px_0_rgba(255,255,255,.2)] transition-transform hover:scale-105 disabled:opacity-40"
              aria-label={p.isPlaying ? "Pause" : "Play"}
              title={p.isPlaying ? "Pause" : "Play"}
            >
              {p.isPlaying ? <IconPause s={18} /> : <IconPlay s={18} />}
            </button>
          </div>
        </div>

        <div className="mt-2 flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2.5 text-white/58" style={{ maxWidth: deviceWidth }}>
          <Volume2 size={16} />
          <input
            type="range"
            className="range flex-1"
            min={0}
            max={1}
            step={0.01}
            value={p.volume}
            onChange={(e) => p.setVolume(Number(e.target.value))}
            style={{ ["--range-pct" as string]: `${p.volume * 100}%` }}
          />
        </div>
        <button
          type="button"
          onPointerDown={beginResize}
          onKeyDown={keyboardResize}
          className={`mt-2 flex h-5 w-24 cursor-ew-resize touch-none items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white/50 transition-colors hover:bg-white/[0.07] hover:text-white/75 ${
            resizing ? "bg-white/[0.09] text-white" : ""
          }`}
          aria-label="Drag to resize iPod player"
          title="Drag left or right to resize"
        >
          <span className="h-1 w-12 rounded-full bg-current" />
        </button>
        {toast && <p className="mt-2 text-center text-[0.68rem] font-bold uppercase text-white/45">{toast}</p>}
      </div>
    </aside>
  );
}
