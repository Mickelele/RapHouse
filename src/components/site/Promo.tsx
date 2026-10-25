import { useState } from "react";
import { ExternalLink, Image as ImageIcon, Instagram, Play } from "lucide-react";
import { contact } from "@/data/raphouse";
import { promoAsGalleryImage, type PromoMaterial } from "@/lib/content";
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

/**
 * Rolka w pionie (9:16). YouTube Shorts odtwarza się na miejscu (iframe dopiero po kliknięciu),
 * Instagram / TikTok otwiera się w nowej karcie. Okładka: obrazek z panelu albo miniatura YouTube.
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
  const [playing, setPlaying] = useState(false);
  const ytId = youTubeId(m.video_url);
  const cover = m.image_url ?? (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null);
  const label = m.artist ? `${m.artist} - ${m.title}` : m.title;

  const face = (
    <>
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
        {ytId ? (
          <Play className="ml-0.5 size-5 fill-current" />
        ) : (
          <ExternalLink className="size-5" />
        )}
      </span>
      {caption && <Caption m={m} />}
    </>
  );

  const box = cn(
    "group relative block aspect-[9/16] overflow-hidden rounded-md border border-border bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    className,
  );

  if (ytId && playing)
    return (
      <div className={box}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`}
          title={label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      </div>
    );
  if (ytId)
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={`Odtwórz rolkę: ${label}`}
        className={box}
      >
        {face}
      </button>
    );
  return (
    <a
      href={m.video_url ?? contact.instagram}
      target="_blank"
      rel="noreferrer"
      aria-label={`Rolka: ${label} (otwiera się w nowej karcie)`}
      className={box}
    >
      {face}
    </a>
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

/** Zakładka "Materiały promocyjne" na /klipy: najpierw rolki, potem grafiki. */
export function PromoGrid({ items }: { items: PromoMaterial[] }) {
  const reels = items.filter((m) => m.kind === "rolka");
  const graphics = items.filter((m) => m.kind === "grafika" && m.image_url);
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
                  <p className="text-sm leading-relaxed text-muted-foreground">{m.description}</p>
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
