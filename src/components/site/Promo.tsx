import { useCallback, useEffect, useRef, useState } from "react";
import { Film, Image as ImageIcon, Volume2, VolumeX } from "lucide-react";
import { isShowableGraphic, promoAsGalleryImage, type PromoMaterial } from "@/lib/content";
import { youTubeId } from "@/lib/media";
import { cn } from "@/lib/utils";
import { Lightbox } from "./Lightbox";
import { LinkList } from "./Media";

function Caption({ m }: { m: PromoMaterial }) {
  return (
    <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 pt-10 text-left">
      {m.artist && (
        <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          {m.artist}
        </span>
      )}
      <span className="mt-0.5 block text-sm font-semibold leading-tight text-white">{m.title}</span>
    </span>
  );
}

// Polecenie dla odtwarzacza YouTube w iframe (wymaga enablejsapi=1 w adresie).
function ytCommand(
  frame: HTMLIFrameElement | null,
  func: "playVideo" | "pauseVideo" | "mute" | "unMute",
) {
  frame?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
}

/**
 * Rolka w pionie (9:16) z YouTube Shorts - gra sama, bez dźwięku, w pętli. Odtwarzacz ładuje się,
 * gdy rolka zbliża się do ekranu, i pauzuje, gdy z niego zjedzie (kilka rolek naraz nie obciąża
 * telefonu). Po najechaniu (na telefonie zawsze) przycisk włącza / wyłącza dźwięk.
 * Rolka bez linku do YouTube pokazuje tylko okładkę.
 */
export function ReelCard({
  m,
  className,
  caption = true,
}: {
  m: PromoMaterial;
  className?: string;
  // false = podpis pod kartą (pasek w sekcji "Ruch"), a nie na obrazku.
  caption?: boolean;
}) {
  const ytId = youTubeId(m.video_url);
  const cover = m.image_url ?? (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null);
  const label = m.artist ? `${m.artist} - ${m.title}` : m.title;

  const frame = useRef<HTMLIFrameElement>(null);
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [muted, setMuted] = useState(true);

  // Callback ref + state: obserwator startuje dopiero, gdy element naprawdę jest w DOM.
  const boxRef = useCallback((el: HTMLDivElement | null) => setBox(el), []);
  useEffect(() => {
    if (!box || !ytId) return;
    const io = new IntersectionObserver(
      ([e]) => {
        const on = !!e?.isIntersecting;
        setVisible(on);
        if (on) setMounted(true);
      },
      { rootMargin: "200px" },
    );
    io.observe(box);
    return () => io.disconnect();
  }, [box, ytId]);

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
        "group relative aspect-[9/16] overflow-hidden rounded-md border border-border bg-black",
        className,
      )}
    >
      {cover ? (
        <img
          src={cover}
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
        // Pionowy Short w pionowej karcie wypełnia ją w całości. Kliknięcia przechodzą przez
        // odtwarzacz (pointer-events-none) - dźwięk włącza przycisk, a pasek dalej się przewija.
        <iframe
          ref={frame}
          src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&rel=0&playsinline=1&modestbranding=1&enablejsapi=1`}
          title={label}
          allow="autoplay; encrypted-media; picture-in-picture"
          tabIndex={-1}
          className="pointer-events-none absolute inset-0 size-full"
        />
      )}
      {caption && <Caption m={m} />}
      {ytId && (
        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? `Włącz dźwięk: ${label}` : `Wycisz: ${label}`}
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

/** Grafika (kwadrat, przycięta) - pełny obraz po kliknięciu w lightboxie. */
export function GraphicCard({
  m,
  onOpen,
  className,
  caption = true,
}: {
  m: PromoMaterial;
  onOpen: () => void;
  className?: string;
  caption?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Powiększ grafikę: ${m.title}`}
      className={cn(
        "group relative block aspect-square overflow-hidden rounded-md border border-border bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        className,
      )}
    >
      {m.image_url ? (
        <img
          src={m.image_url}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <span className="flex size-full items-center justify-center">
          <ImageIcon className="size-8 text-muted-foreground" />
        </span>
      )}
      {caption && <Caption m={m} />}
    </button>
  );
}

/** "Oprawa wydania" na /realizacje: najpierw rolki, potem grafiki. */
export function PromoGrid({ items }: { items: PromoMaterial[] }) {
  const reels = items.filter((m) => m.kind === "rolka");
  const graphics = items.filter(isShowableGraphic);
  const [open, setOpen] = useState<number | null>(null);

  if (!reels.length && !graphics.length)
    return (
      <div className="card-surface flex flex-col items-center gap-6 p-10 text-center text-muted-foreground">
        <p>Rolki, okładki i grafiki już wkrótce.</p>
        <a href="/#kontakt" className="btn-base btn-ghost-line">
          Zapytaj o oprawę wydania
        </a>
      </div>
    );

  return (
    <div className="flex flex-col gap-14">
      {!!reels.length && (
        <div>
          <p className="eyebrow mb-6">Rolki</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {reels.map((m) => (
              <li key={m.id} className="flex flex-col gap-3">
                <ReelCard m={m} />
                {m.description && (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {m.description}
                  </p>
                )}
                <LinkList links={m.links} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {!!graphics.length && (
        <div>
          <p className="eyebrow mb-6">Grafiki i okładki</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {graphics.map((m, i) => (
              <li key={m.id}>
                <GraphicCard m={m} onOpen={() => setOpen(i)} className="w-full" />
              </li>
            ))}
          </ul>
        </div>
      )}
      {open !== null && (
        <Lightbox
          images={graphics.map(promoAsGalleryImage)}
          index={open}
          onIndex={(update) => setOpen((i) => (i === null ? null : update(i)))}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
