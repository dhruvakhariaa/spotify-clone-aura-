import { Download, GripHorizontal, Heart, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { toPng } from "html-to-image";
import { usePlayer } from "../../state/player";
import { fmtTime } from "../../lib/catalog";
import { isTrackLiked, toggleLikedSong } from "../../state/likedSongs";
import { playReactionSound } from "../../lib/reactions";

const DEVICE_SRC = "/carvaan_go_device%201.svg";
const MIN_DEVICE_WIDTH = 188;
const MAX_DEVICE_WIDTH = 260;
const DEFAULT_DEVICE_WIDTH = 204;
const DEVICE_WIDTH_KEY = "aura.retro-player.width";
const PLAYER_POS_KEY = "aura.retro-player.position";

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
          y: clamp(current.y, 8, Math.max(8, window.innerHeight - height - 8)),
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
        y: clamp(moveEvent.clientY - drag.offsetY, 8, Math.max(8, window.innerHeight - height - 8)),
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
        y: clamp(resize.panelTop, 8, Math.max(8, window.innerHeight - panelHeight - 8)),
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
      className={`fixed z-40 hidden rounded-lg border border-white/10 bg-[#0b0d16]/92 p-3 shadow-[0_22px_70px_rgba(0,0,0,.45)] backdrop-blur-xl xl:block ${
        panelPos ? "" : "bottom-5 right-5"
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
              onClick={downloadDevice}
              className="grid size-7 place-items-center rounded-md border border-white/10 bg-white/[0.035] text-white/58 hover:text-white"
              aria-label="Download iPod image"
              title="Download iPod image"
            >
              <Download size={14} />
            </button>
          </div>
        </div>
        <div ref={deviceRef} className="relative w-full" style={{ width: deviceWidth }}>
          <img
            src={DEVICE_SRC}
            alt=""
            className="pointer-events-none block w-full select-none drop-shadow-[0_14px_34px_rgba(0,0,0,.32)]"
            draggable={false}
          />

          <Link
            to="/app/now"
            className="absolute left-[15.7%] top-[27.2%] block h-[29.6%] w-[68.8%] overflow-hidden bg-[#18182f] px-[5.4%] py-[4.7%] text-[#d6e4f1] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"
          >
            <div className="grid h-full min-w-0 grid-rows-[1fr_1fr_auto] gap-1.5">
              <div className="min-w-0">
                <div className="mb-0.5 flex items-center justify-between gap-2 text-[0.5rem] font-bold uppercase text-[#b8c9dc]/58">
                  <span>Song</span>
                  <Heart size={10} fill={liked ? "currentColor" : "none"} className={liked ? "text-[#b7a0ff]" : ""} />
                </div>
                <ScreenMarquee value={title} className="display text-[0.92rem] leading-[0.9] text-[#eef4ff]" />
              </div>
              <div className="min-w-0">
                <p className="mb-0.5 text-[0.5rem] font-bold uppercase text-[#b8c9dc]/58">Artist</p>
                <ScreenMarquee value={artist} className="font-serif text-[0.68rem] uppercase leading-none text-[#eef4ff]/88" />
              </div>
              <div className="flex min-w-0 items-center gap-1.5 text-[0.5rem] font-bold text-[#c7d8ec]/78">
                <span className="w-6 shrink-0 tabular-nums">{fmtTime(p.currentTime)}</span>
                <div className="h-1 min-w-0 flex-1 rounded-full bg-white/18">
                  <div className="h-full rounded-full bg-[#c7d8ec]" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 shrink-0 text-right tabular-nums">{fmtTime(p.duration || 30)}</span>
              </div>
            </div>
          </Link>

          <div className="absolute left-1/2 top-[73%] h-[28%] w-[48%] -translate-x-1/2 -translate-y-1/2">
            <button
              onClick={toggleLike}
              disabled={!p.current}
              className={`retro-wheel-button retro-wheel-button-top ${liked ? "is-on" : ""}`}
              aria-label={liked ? "Remove from Liked Songs" : "Add to Liked Songs"}
              title={liked ? "Remove from Liked Songs" : "Add to Liked Songs"}
            >
              <span className="sr-only">{liked ? "Remove from Liked Songs" : "Add to Liked Songs"}</span>
            </button>
            <button
              onClick={() => {
                playReactionSound("tap");
                p.prev();
              }}
              className="retro-wheel-button retro-wheel-button-left"
              aria-label="Previous song"
              title="Previous"
            >
              <span className="sr-only">Previous song</span>
            </button>
            <button
              onClick={() => {
                playReactionSound("tap");
                p.next();
              }}
              className="retro-wheel-button retro-wheel-button-right"
              aria-label="Next song"
              title="Next"
            >
              <span className="sr-only">Next song</span>
            </button>
            <button
              onClick={() => {
                playReactionSound("tap");
                p.toggle();
              }}
              disabled={!p.current}
              className="retro-wheel-button retro-wheel-button-bottom"
              aria-label={p.isPlaying ? "Pause" : "Play"}
              title={p.isPlaying ? "Pause" : "Play"}
            >
              <span className="sr-only">{p.isPlaying ? "Pause" : "Play"}</span>
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
