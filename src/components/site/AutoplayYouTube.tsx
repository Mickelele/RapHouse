import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Film, Volume2, VolumeX } from "lucide-react";
import { youTubeId } from "@/lib/media";
import { cn } from "@/lib/utils";

// Polecenie dla odtwarzacza YouTube w iframe (wymaga enablejsapi=1 w adresie).
function ytCommand(
  frame: HTMLIFrameElement | null,
  func: "playVideo" | "pauseVideo" | "mute" | "unMute",
) {
  frame?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
}

// Ile film musi być na ekranie, zanim załaduje się odtwarzacz - przy szybkim przewijaniu
// mijane filmy nie odpalają YouTube na darmo.
const MOUNT_DELAY_MS = 350;

/**
 * Film z YouTube (rolka albo klip), który gra sam - bez dźwięku, w pętli, bez kontrolek. Do tego
 * czasu i poza ekranem widać tylko miniaturę; odtwarzacz (ciężki iframe YouTube) ładuje się
 * dopiero, gdy film chwilę jest na ekranie. Po najechaniu (na telefonie zawsze) przycisk
 * włącza / wyłącza dźwięk. Proporcje (aspect-*) i wielkość ustawia className.
 * Bez linku do YouTube - sama okładka.
 */
export function AutoplayYouTube({
  video,
  title,
  cover,
  className,
  keepMounted = false,
  children,
}: {
  video: string | null;
  title: string;
  // Własna okładka; bez niej miniatura z YouTube.
  cover?: string | null;
  className?: string;
  // true (pasek w Ruchu, kilka filmów w pętli): odtwarzacz po zjechaniu z ekranu tylko pauzuje,
  // zamiast znikać - inaczej ładowałby się od nowa przy każdym okrążeniu paska.
  // false (siatka z wieloma rolkami): poza ekranem odtwarzacz jest usuwany - w pamięci są
  // tylko te widoczne.
  keepMounted?: boolean;
  // Nakładka na film (np. podpis).
  children?: ReactNode;
}) {
  const ytId = youTubeId(video);
  const poster = cover ?? (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null);

  const frame = useRef<HTMLIFrameElement>(null);
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  // Odtwarzacz załadowany - dopiero wtedy zasłania miniaturę (bez czarnego mignięcia).
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(true);

  // Callback ref + state: obserwator startuje dopiero, gdy element naprawdę jest w DOM.
  const boxRef = useCallback((el: HTMLDivElement | null) => setBox(el), []);
  useEffect(() => {
    if (!box || !ytId) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(([e]) => {
      const on = !!e?.isIntersecting;
      setVisible(on);
      clearTimeout(timer);
      if (on) timer = setTimeout(() => setMounted(true), MOUNT_DELAY_MS);
      else if (!keepMounted) {
        setMounted(false);
        setReady(false);
        setMuted(true);
      }
    });
    io.observe(box);
    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, [box, ytId, keepMounted]);

  useEffect(() => {
    if (mounted) ytCommand(frame.current, visible ? "playVideo" : "pauseVideo");
  }, [visible, mounted]);

  const toggleSound = () => {
    ytCommand(frame.current, muted ? "unMute" : "mute");
    if (muted) ytCommand(frame.current, "playVideo");
    setMuted(!muted);
  };

  return (
    <div
      ref={boxRef}
      className={cn(
        "group relative overflow-hidden rounded-md border border-border bg-black",
        className,
      )}
    >
      {poster ? (
        <img
          src={poster}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center bg-secondary">
          <Film className="size-8 text-muted-foreground" />
        </span>
      )}
      {ytId && mounted && (
        // Kliknięcia przechodzą przez odtwarzacz (pointer-events-none) - dźwięk włącza przycisk,
        // a pasek w Ruchu dalej się przewija.
        <iframe
          ref={frame}
          src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&rel=0&playsinline=1&modestbranding=1&enablejsapi=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          tabIndex={-1}
          onLoad={() => setReady(true)}
          className={cn(
            "pointer-events-none absolute inset-0 size-full transition-opacity duration-500",
            ready ? "opacity-100" : "opacity-0",
          )}
        />
      )}
      {children}
      {ytId && (
        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? `Włącz dźwięk: ${title}` : `Wycisz: ${title}`}
          aria-pressed={!muted}
          className={cn(
            "absolute right-2 top-2 inline-flex size-10 items-center justify-center rounded-full bg-black/60 text-white transition-opacity hover:bg-primary hover:text-primary-foreground focus-visible:opacity-100",
            // Myszka: widać po najechaniu (albo gdy dźwięk włączony). Dotyk: zawsze.
            muted
              ? "opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
              : "opacity-100",
          )}
        >
          {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
        </button>
      )}
    </div>
  );
}
