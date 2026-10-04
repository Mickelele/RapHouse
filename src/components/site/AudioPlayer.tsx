import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const BARS = 48;

// Naraz gra tylko jeden odtwarzacz na stronie.
let current: HTMLAudioElement | null = null;

// Stały "waveform" wyliczony z adresu pliku - każdy utwór wygląda inaczej, ale zawsze tak samo.
function barHeights(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return Array.from({ length: BARS }, (_, i) => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ i;
    const noise = ((h >>> 0) % 1000) / 1000;
    const envelope = 0.55 + 0.45 * Math.sin((i / BARS) * Math.PI);
    return Math.round((20 + noise * 80) * envelope);
  });
}

function fmt(s: number) {
  if (!Number.isFinite(s)) return "--:--";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export function AudioPlayer({
  src,
  title,
  className,
}: {
  src: string | null;
  title?: string;
  className?: string;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(NaN);
  const bars = useMemo(() => barHeights(src ?? ""), [src]);

  useEffect(() => {
    const a = audio.current;
    return () => {
      if (a && current === a) current = null;
    };
  }, []);

  if (!src) return null;

  const progress = duration > 0 ? time / duration : 0;

  const toggle = () => {
    const a = audio.current!;
    if (a.paused) {
      if (current && current !== a) current.pause();
      current = a;
      setLoading(true);
      a.play().catch(() => setLoading(false));
    } else {
      a.pause();
    }
  };

  const seekTo = (ratio: number) => {
    const a = audio.current!;
    if (!Number.isFinite(a.duration)) {
      // Plik jeszcze nie wczytany - najpierw start, potem przewinięcie.
      a.addEventListener("loadedmetadata", () => (a.currentTime = ratio * a.duration), {
        once: true,
      });
      if (a.paused) toggle();
      return;
    }
    a.currentTime = Math.min(Math.max(ratio, 0), 1) * a.duration;
    setTime(a.currentTime);
  };

  const onPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.type === "pointermove" && e.buttons !== 1) return;
    const r = e.currentTarget.getBoundingClientRect();
    seekTo((e.clientX - r.left) / r.width);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const a = audio.current!;
    if (!Number.isFinite(a.duration)) return;
    if (e.key === "ArrowRight") a.currentTime = Math.min(a.currentTime + 5, a.duration);
    else if (e.key === "ArrowLeft") a.currentTime = Math.max(a.currentTime - 5, 0);
    else return;
    e.preventDefault();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-full sm:gap-4 border border-border bg-background/60 py-2 pl-2 pr-4 sm:pr-5",
        playing && "border-primary/60",
        className,
      )}
    >
      <audio
        ref={audio}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setTime(0);
        }}
        onPlaying={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />

      <button
        type="button"
        onClick={toggle}
        aria-label={
          playing ? `Pauza${title ? `: ${title}` : ""}` : `Odtwórz${title ? `: ${title}` : ""}`
        }
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
      >
        {loading && playing ? (
          <Loader2 className="size-5 animate-spin" />
        ) : playing ? (
          <Pause className="size-5 fill-current" />
        ) : (
          <Play className="ml-0.5 size-5 fill-current" />
        )}
      </button>

      <div
        role="slider"
        tabIndex={0}
        aria-label="Pozycja odtwarzania"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration) || 0}
        aria-valuenow={Math.round(time)}
        aria-valuetext={`${fmt(time)} z ${fmt(duration)}`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          onPointer(e);
        }}
        onPointerMove={onPointer}
        onKeyDown={onKey}
        className="flex h-9 min-w-0 flex-1 cursor-pointer touch-none items-center gap-[2px] rounded outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        {bars.map((h, i) => (
          <span
            key={i}
            style={{ height: `${h}%` }}
            className={cn(
              "flex-1 rounded-full transition-colors duration-150 max-sm:odd:hidden",
              (i + 0.5) / BARS <= progress ? "bg-primary" : "bg-muted-foreground/30",
            )}
          />
        ))}
      </div>

      <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground sm:w-[5.5rem]">
        {fmt(time)}
        <span className="hidden text-muted-foreground/60 sm:inline"> / {fmt(duration)}</span>
      </span>
    </div>
  );
}
