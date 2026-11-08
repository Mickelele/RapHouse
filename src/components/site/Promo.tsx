import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { isShowableGraphic, promoAsGalleryImage, type PromoMaterial } from "@/lib/content";
import { cn } from "@/lib/utils";
import { AutoplayYouTube } from "./AutoplayYouTube";
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
 * Rolka w pionie (9:16) z YouTube Shorts - gra sama, bez dźwięku, w pętli (szczegóły
 * w AutoplayYouTube). Rolka bez linku do YouTube pokazuje tylko okładkę.
 */
export function ReelCard({
  m,
  className,
  caption = true,
  keepMounted = false,
}: {
  m: PromoMaterial;
  className?: string;
  // false = podpis pod kartą (pasek w sekcji "Ruch"), a nie na obrazku.
  caption?: boolean;
  // true w pasku Ruchu (odtwarzacz pauzuje zamiast znikać) - patrz AutoplayYouTube.
  keepMounted?: boolean;
}) {
  return (
    <AutoplayYouTube
      video={m.video_url}
      title={m.artist ? `${m.artist} - ${m.title}` : m.title}
      cover={m.image_url}
      keepMounted={keepMounted}
      className={cn("aspect-[9/16]", className)}
    >
      {caption && <Caption m={m} />}
    </AutoplayYouTube>
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

// Ile rolek / grafik pokazujemy na start i dokładamy po "Pokaż więcej".
const REELS_STEP = 10;
const GRAPHICS_STEP = 12;

/** "Oprawa wydania" na /realizacje: najpierw rolki, potem grafiki - partiami. */
export function PromoGrid({ items }: { items: PromoMaterial[] }) {
  const reels = items.filter((m) => m.kind === "rolka");
  const graphics = items.filter(isShowableGraphic);
  const [open, setOpen] = useState<number | null>(null);
  const [reelCount, setReelCount] = useState(REELS_STEP);
  const [graphicCount, setGraphicCount] = useState(GRAPHICS_STEP);

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
            {reels.slice(0, reelCount).map((m) => (
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
          <ShowMore
            left={reels.length - reelCount}
            what="rolek"
            onClick={() => setReelCount((c) => c + REELS_STEP)}
          />
        </div>
      )}
      {!!graphics.length && (
        <div>
          <p className="eyebrow mb-6">Grafiki i okładki</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {graphics.slice(0, graphicCount).map((m, i) => (
              <li key={m.id}>
                <GraphicCard m={m} onOpen={() => setOpen(i)} className="w-full" />
              </li>
            ))}
          </ul>
          <ShowMore
            left={graphics.length - graphicCount}
            what="grafik"
            onClick={() => setGraphicCount((c) => c + GRAPHICS_STEP)}
          />
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

function ShowMore({ left, what, onClick }: { left: number; what: string; onClick: () => void }) {
  if (left <= 0) return null;
  return (
    <div className="mt-8 flex justify-center">
      <button type="button" onClick={onClick} className="btn-base btn-ghost-line">
        Pokaż więcej {what} ({left})
      </button>
    </div>
  );
}
