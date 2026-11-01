import { useEffect, useRef, useState } from "react";
import { ExternalLink, Image as ImageIcon, Instagram, Play } from "lucide-react";
import { contact } from "@/data/raphouse";
import { isShowableGraphic, promoAsGalleryImage, type PromoMaterial } from "@/lib/content";
import { instagramEmbedUrl, youTubeId } from "@/lib/media";
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

// true, gdy element jest (prawie) na ekranie - od tego momentu zostaje true.
// Ciężkie iframe'y (YouTube, Instagram) ładują się dopiero wtedy.
function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return { ref, seen };
}

// Szerokość, w której renderujemy embed Instagrama (Instagram nie schodzi poniżej 326 px),
// i wysokość jego górnego paska (avatar + nazwa) - chowamy go, przesuwając iframe w górę.
const IG_WIDTH = 400;
const IG_HEADER = 56;

/**
 * Post / rolka z Instagrama po samym linku (oficjalny embed). Embed ma stałą szerokość, więc
 * skalujemy go do wielkości karty. Kliknięcie otwiera post na Instagramie.
 */
function InstagramFrame({ url, title }: { url: string; title: string }) {
  const { ref, seen } = useSeen<HTMLDivElement>();
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  const scale = box.w ? box.w / IG_WIDTH : 1;

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden bg-white">
      {seen && box.w > 0 && (
        <iframe
          src={url}
          title={title}
          loading="lazy"
          scrolling="no"
          className="absolute left-0 origin-top-left border-0"
          style={{
            width: IG_WIDTH,
            height: box.h / scale + IG_HEADER,
            top: -IG_HEADER * scale,
            transform: `scale(${scale})`,
          }}
        />
      )}
    </div>
  );
}

/**
 * Rolka w pionie (9:16).
 * - YouTube Shorts: w pasku "Ruch" (autoplay) gra sama, bez dźwięku, w pętli; gdzie indziej
 *   okładka i odtwarzanie po kliknięciu.
 * - Instagram bez okładki: embed posta prosto z linku.
 * - Instagram / TikTok z okładką: okładka, kliknięcie otwiera rolkę w nowej karcie.
 */
export function ReelCard({
  m,
  className,
  caption = true,
  autoplay = false,
}: {
  m: PromoMaterial;
  className?: string;
  // false = podpis pod kartą (pasek w sekcji "Ruch"), a nie na obrazku.
  caption?: boolean;
  autoplay?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const { ref, seen } = useSeen<HTMLDivElement>();
  const ytId = youTubeId(m.video_url);
  const igEmbed = instagramEmbedUrl(m.video_url);
  const cover = m.image_url ?? (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null);
  const label = m.artist ? `${m.artist} - ${m.title}` : m.title;

  const box = cn(
    "group relative block aspect-[9/16] overflow-hidden rounded-md border border-border bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    className,
  );

  if (ytId && (playing || autoplay)) {
    const params = playing
      ? "autoplay=1&rel=0&playsinline=1"
      : `autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&rel=0&playsinline=1&modestbranding=1`;
    return (
      <div ref={ref} className={box}>
        {/* Do załadowania (i poza ekranem) - okładka. */}
        {cover && <img src={cover} alt="" className="size-full object-cover" />}
        {seen && (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytId}?${params}`}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        )}
        {/* Autoplay bez dźwięku: kliknięcie włącza od początku z dźwiękiem i kontrolkami. */}
        {!playing && (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Odtwórz z dźwiękiem: ${label}`}
            className="absolute inset-0 size-full"
          />
        )}
      </div>
    );
  }

  if (ytId)
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={`Odtwórz rolkę: ${label}`}
        className={box}
      >
        {cover && (
          <img
            src={cover}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover opacity-85 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
          />
        )}
        <span className="absolute left-1/2 top-1/2 inline-flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-110">
          <Play className="ml-0.5 size-5 fill-current" />
        </span>
        {caption && <Caption m={m} />}
      </button>
    );

  if (igEmbed && !m.image_url)
    return (
      <div className={box}>
        <InstagramFrame url={igEmbed} title={label} />
      </div>
    );

  return (
    <a
      href={m.video_url ?? contact.instagram}
      target="_blank"
      rel="noreferrer"
      aria-label={`Rolka: ${label} (otwiera się w nowej karcie)`}
      className={box}
    >
      {cover ? (
        <img
          src={cover}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover opacity-85 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
        />
      ) : (
        <span className="flex size-full items-center justify-center bg-gradient-to-br from-primary/25 to-secondary">
          <Instagram className="size-8 text-primary" />
        </span>
      )}
      <span className="absolute left-1/2 top-1/2 inline-flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-110">
        <ExternalLink className="size-5" />
      </span>
      {caption && <Caption m={m} />}
    </a>
  );
}

/**
 * Grafika (kwadrat, przycięta). Wgrany obrazek - pełny po kliknięciu w lightboxie;
 * sam link do Instagrama - embed posta.
 */
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
  const box = cn(
    "group relative block aspect-square overflow-hidden rounded-md border border-border bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    className,
  );
  const igEmbed = instagramEmbedUrl(m.video_url);

  if (!m.image_url && igEmbed)
    return (
      <div className={box}>
        <InstagramFrame url={igEmbed} title={m.title} />
      </div>
    );

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Powiększ grafikę: ${m.title}`}
      className={box}
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

/** Zakładka "Materiały promocyjne" na /klipy: najpierw rolki, potem grafiki. */
export function PromoGrid({ items }: { items: PromoMaterial[] }) {
  const reels = items.filter((m) => m.kind === "rolka");
  const graphics = items.filter(isShowableGraphic);
  // Lightbox tylko dla wgranych obrazków (embed Instagrama jest klikalny sam w sobie).
  const images = graphics.filter((m) => m.image_url);
  const [open, setOpen] = useState<number | null>(null);

  if (!reels.length && !graphics.length)
    return (
      <div className="card-surface flex flex-col items-center gap-6 p-10 text-center text-muted-foreground">
        <p>Rolki, okładki i grafiki już wkrótce.</p>
        <a
          href={contact.instagram}
          target="_blank"
          rel="noreferrer"
          className="btn-base btn-ghost-line"
        >
          Zobacz nasz Instagram
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
            {graphics.map((m) => (
              <li key={m.id}>
                <GraphicCard
                  m={m}
                  onOpen={() => setOpen(images.findIndex((g) => g.id === m.id))}
                  className="w-full"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      {open !== null && open >= 0 && (
        <Lightbox
          images={images.map(promoAsGalleryImage)}
          index={open}
          onIndex={(update) => setOpen((i) => (i === null ? null : update(i)))}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
