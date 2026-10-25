import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Instagram } from "lucide-react";
import { contact } from "@/data/raphouse";
import {
  promoAsGalleryImage,
  usePromoMaterials,
  useProjects,
  type Project,
  type PromoMaterial,
} from "@/lib/content";
import { cn } from "@/lib/utils";
import { Lightbox } from "./Lightbox";
import { GraphicCard, ReelCard } from "./Promo";
import { YouTubeLite } from "./YouTubeLite";

// Ile pozycji każdego rodzaju trafia do paska.
const PER_KIND = 4;

type Item =
  | { kind: "rolka"; m: PromoMaterial }
  | { kind: "grafika"; m: PromoMaterial }
  | { kind: "klip"; p: Project };

const KIND_LABEL = { rolka: "Rolka", grafika: "Grafika", klip: "Klip" } as const;

// Na przemian: rolka, klip, grafika, rolka, … - żeby w pasku od razu było widać wszystkiego po trochu.
function interleave(lists: Item[][]) {
  const out: Item[] = [];
  for (let i = 0; lists.some((l) => i < l.length); i++)
    for (const l of lists) {
      const item = l[i];
      if (item) out.push(item);
    }
  return out;
}

/**
 * Pasek w bloku "Ruch": kilka rolek, klipów i grafik przewijanych w bok (palcem albo strzałkami).
 * Rolki i grafiki z panelu (Materiały promocyjne), klipy z Klipów. Na końcu link do Instagrama.
 */
export function MovementShowcase() {
  const { data: projects } = useProjects();
  const { data: promo } = usePromoMaterials();
  const graphics = (promo ?? []).filter((m) => m.kind === "grafika" && m.image_url);

  const items = interleave([
    (promo ?? [])
      .filter((m) => m.kind === "rolka")
      .slice(0, PER_KIND)
      .map((m) => ({ kind: "rolka", m })),
    (projects ?? [])
      .filter((p) => p.category === "video" && p.video_url)
      .slice(0, PER_KIND)
      .map((p) => ({ kind: "klip", p })),
    graphics.slice(0, PER_KIND).map((m) => ({ kind: "grafika", m })),
  ]);

  const scroller = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Strzałki gasną na początku / końcu paska.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () =>
      setEdges({
        start: el.scrollLeft <= 4,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
      });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [items.length]);

  const scrollBy = (dir: 1 | -1) =>
    scroller.current?.scrollBy({
      left: dir * scroller.current.clientWidth * 0.8,
      behavior: "smooth",
    });

  return (
    <div className="mt-12">
      <div className="mb-4 flex items-center justify-between gap-4">
        <a
          href="/klipy"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
        >
          Klipy i materiały <ArrowRight className="size-3.5" />
        </a>
        <div className="hidden gap-2 sm:flex">
          <ArrowButton label="Przewiń w lewo" disabled={edges.start} onClick={() => scrollBy(-1)}>
            <ChevronLeft className="size-4" />
          </ArrowButton>
          <ArrowButton label="Przewiń w prawo" disabled={edges.end} onClick={() => scrollBy(1)}>
            <ChevronRight className="size-4" />
          </ArrowButton>
        </div>
      </div>

      {/* Na telefonie pasek dochodzi do krawędzi ekranu (-mx-5), a pierwsza karta trzyma margines. */}
      <ul
        ref={scroller}
        aria-label="Rolki, klipy i grafiki"
        className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:thin] sm:mx-0 sm:scroll-px-0 sm:px-0"
      >
        {items.map((it) => {
          const key = it.kind === "klip" ? `k-${it.p.id}` : `${it.kind}-${it.m.id}`;
          const title =
            it.kind === "klip"
              ? `${it.p.artist} - ${it.p.title}`
              : it.m.artist
                ? `${it.m.artist} - ${it.m.title}`
                : it.m.title;
          return (
            <li key={key} className="flex shrink-0 snap-start flex-col gap-2">
              <div className="h-60 sm:h-72">
                {it.kind === "rolka" ? (
                  <ReelCard m={it.m} caption={false} className="h-full" />
                ) : it.kind === "grafika" ? (
                  <GraphicCard
                    m={it.m}
                    caption={false}
                    className="h-full"
                    onOpen={() => setLightbox(graphics.findIndex((g) => g.id === it.m.id))}
                  />
                ) : (
                  <div className="aspect-video h-full">
                    <YouTubeLite video={it.p.video_url} title={title} />
                  </div>
                )}
              </div>
              {/* Szerokość podpisu = szerokość karty (w-0 + min-w-full). */}
              <p className="w-0 min-w-full">
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {KIND_LABEL[it.kind]}
                </span>
                <span className="block truncate text-sm">{title}</span>
              </p>
            </li>
          );
        })}

        <li className="flex shrink-0 snap-start flex-col gap-2">
          <a
            href={contact.instagram}
            target="_blank"
            rel="noreferrer"
            className="card-surface group flex aspect-[9/16] h-60 flex-col items-center justify-center gap-4 p-4 text-center transition-colors hover:border-primary sm:h-72"
          >
            <Instagram className="size-8 text-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors group-hover:text-foreground">
              Więcej na Instagramie
            </span>
          </a>
        </li>
      </ul>

      {lightbox !== null && lightbox >= 0 && (
        <Lightbox
          images={graphics.map(promoAsGalleryImage)}
          index={lightbox}
          onIndex={(update) => setLightbox((i) => (i === null ? null : update(i)))}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

function ArrowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded border border-border transition-colors hover:border-primary hover:text-primary",
        "disabled:pointer-events-none disabled:opacity-30",
      )}
    >
      {children}
    </button>
  );
}
