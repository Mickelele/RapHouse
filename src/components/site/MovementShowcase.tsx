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
// Prędkość auto-przewijania (px/s).
const SPEED = 35;
// Po dotknięciu paska / kliknięciu strzałki auto-przewijanie czeka tyle (ms).
const RESUME_MS = 3000;

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
 * Pasek w bloku "Ruch": kilka rolek, klipów i grafik. Sam powoli przewija się w prawo (w pętli),
 * można go też przewinąć palcem albo strzałkami. Rolki i grafiki z panelu (Materiały
 * promocyjne), klipy z Klipów. Na końcu link do Instagrama.
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
  const [lightbox, setLightbox] = useState<number | null>(null);
  const lightboxOpen = useRef(false);
  lightboxOpen.current = lightbox !== null;
  // Pętla: karty są wyrenderowane dwa razy, a pasek po dojechaniu do drugiej kopii cofa się
  // niezauważenie o jej szerokość. Tylko gdy karty nie mieszczą się w szerokości paska.
  const [loop, setLoop] = useState(false);
  // Strzałki wstrzymują auto-przewijanie na chwilę.
  const pausedUntil = useRef(0);

  useEffect(() => {
    const el = scroller.current;
    if (!el || loop) return;
    setLoop(el.scrollWidth > el.clientWidth + 1);
  }, [items.length, loop]);

  // Szerokość jednej kopii kart = przesunięcie pierwszej karty drugiej kopii.
  const copyWidth = () => {
    const el = scroller.current;
    const second = el?.querySelector<HTMLElement>("[data-copy-start]");
    const first = el?.firstElementChild as HTMLElement | null;
    return second && first ? second.offsetLeft - first.offsetLeft : 0;
  };

  // Auto-przewijanie w prawo. Stoi, gdy: kursor nad paskiem, palec na pasku (i chwilę po),
  // fokus w pasku, otwarty lightbox, pasek poza ekranem, ograniczenie animacji w systemie.
  // Po kliknięciu karty (odtworzenie rolki / klipu, link) staje na dobre.
  useEffect(() => {
    const el = scroller.current;
    if (!el || !loop) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let pos = el.scrollLeft;
    let raf = 0;
    let last = 0;
    let visible = false;
    let hover = false;
    let focus = false;
    let stopped = false;
    let touchUntil = 0;

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(t - last, 50) : 0;
      last = t;
      const now = Date.now();
      if (hover || focus || stopped || lightboxOpen.current) return;
      if (now < touchUntil || now < pausedUntil.current) return;
      const half = copyWidth();
      if (!half) return;
      // Ktoś przewinął ręcznie (palcem, strzałką) - jedziemy dalej od tego miejsca.
      if (Math.abs(el.scrollLeft - pos) > 2) pos = el.scrollLeft;
      pos += (SPEED * dt) / 1000;
      if (pos >= half) pos -= half;
      el.scrollLeft = pos;
    };
    const start = () => {
      if (!raf && visible) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // Ręczne przewinięcie za pierwszą kopię - przeskok o jej szerokość, żeby pętla nie miała końca.
    const onScroll = () => {
      const half = copyWidth();
      if (half && el.scrollLeft >= half) el.scrollLeft -= half;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(el);

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hover = true;
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hover = false;
    };
    const onTouch = () => {
      touchUntil = Date.now() + RESUME_MS;
    };
    const onFocusIn = () => {
      focus = true;
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node | null)) focus = false;
    };
    const onClick = () => {
      stopped = true;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("touchstart", onTouch, { passive: true });
    el.addEventListener("touchmove", onTouch, { passive: true });
    el.addEventListener("touchend", onTouch, { passive: true });
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    el.addEventListener("click", onClick);
    return () => {
      stop();
      io.disconnect();
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("touchstart", onTouch);
      el.removeEventListener("touchmove", onTouch);
      el.removeEventListener("touchend", onTouch);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
      el.removeEventListener("click", onClick);
    };
  }, [loop, items.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    pausedUntil.current = Date.now() + RESUME_MS;
    const amount = el.clientWidth * 0.8;
    // W lewo od samego początku pętli: najpierw niewidoczny przeskok do drugiej kopii.
    if (dir < 0 && el.scrollLeft < amount) el.scrollLeft += copyWidth();
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  // Druga kopia (copy = 1) służy tylko płynnej pętli - ukryta przed czytnikami i klawiaturą.
  const cards = (copy: 0 | 1) => {
    const hidden = copy ? { "aria-hidden": true, inert: true } : {};
    return [
      ...items.map((it, i) => {
        const key = it.kind === "klip" ? `k-${it.p.id}` : `${it.kind}-${it.m.id}`;
        const title =
          it.kind === "klip"
            ? `${it.p.artist} - ${it.p.title}`
            : it.m.artist
              ? `${it.m.artist} - ${it.m.title}`
              : it.m.title;
        return (
          <li
            key={`${copy}-${key}`}
            {...hidden}
            {...(copy && i === 0 ? { "data-copy-start": "" } : {})}
            className="flex shrink-0 flex-col gap-2"
          >
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
      }),
      <li
        key={`${copy}-instagram`}
        {...hidden}
        {...(copy && !items.length ? { "data-copy-start": "" } : {})}
        className="flex shrink-0 flex-col gap-2"
      >
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
      </li>,
    ];
  };

  return (
    <div className="mt-12">
      <div className="mb-4 flex items-center justify-between gap-4">
        <a
          href="/klipy"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
        >
          Klipy i materiały <ArrowRight className="size-3.5" />
        </a>
        {loop && (
          <div className="hidden gap-2 sm:flex">
            <ArrowButton label="Przewiń w lewo" onClick={() => scrollBy(-1)}>
              <ChevronLeft className="size-4" />
            </ArrowButton>
            <ArrowButton label="Przewiń w prawo" onClick={() => scrollBy(1)}>
              <ChevronRight className="size-4" />
            </ArrowButton>
          </div>
        )}
      </div>

      {/* Na telefonie pasek dochodzi do krawędzi ekranu (-mx-5), a pierwsza karta trzyma margines.
          Bez scroll-snap - przyciągałby płynnie przewijany pasek z powrotem do kart. */}
      <ul
        ref={scroller}
        aria-label="Rolki, klipy i grafiki"
        className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:thin] sm:mx-0 sm:px-0"
      >
        {cards(0)}
        {loop && cards(1)}
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
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded border border-border transition-colors hover:border-primary hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}
