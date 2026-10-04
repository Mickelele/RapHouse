import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { gallerySrc, gallerySrcSet, type GalleryImage } from "@/data/gallery";

const SWIPE_PX = 50;

export function Lightbox({
  images,
  index,
  onIndex,
  onClose,
}: {
  images: GalleryImage[];
  index: number;
  // Aktualizacja funkcyjna - kilka szybkich naciśnięć strzałki nie liczy od starego indeksu.
  onIndex: (update: (i: number) => number) => void;
  onClose: () => void;
}) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const img = images[index]!;
  const count = images.length;
  const prev = () => onIndex((i) => (i - 1 + count) % count);
  const next = () => onIndex((i) => (i + 1) % count);

  // Klawiatura, blokada przewijania strony i powrót fokusu po zamknięciu.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Sąsiednie zdjęcia ładują się w tle, żeby przełączanie było natychmiastowe.
  useEffect(() => {
    for (const i of [index - 1, index + 1]) {
      const n = images[(i + count) % count];
      if (n) new Image().srcset = gallerySrcSet(n);
    }
  }, [index, images, count]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Zdjęcie ${index + 1} z ${count}: ${img.alt}`}
      className="fixed inset-0 z-[60] flex flex-col bg-black/95"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        if (start == null || end == null || Math.abs(end - start) < SWIPE_PX) return;
        if (end < start) next();
        else prev();
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-sm text-white/70 md:px-6">
        <span className="tabular-nums">
          {index + 1} / {count}
        </span>
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          aria-label="Zamknij galerię"
          className="inline-flex size-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X className="size-6" />
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 md:px-20"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <img
          key={img.id}
          src={gallerySrc(img, 1280)}
          srcSet={gallerySrcSet(img)}
          sizes="100vw"
          alt={img.alt}
          width={img.width}
          height={img.height}
          className="max-h-full max-w-full select-none object-contain"
          draggable={false}
        />
        {count > 1 && (
          <>
            <NavButton side="left" label="Poprzednie zdjęcie" onClick={prev} />
            <NavButton side="right" label="Następne zdjęcie" onClick={next} />
          </>
        )}
      </div>

      <p className="px-4 py-4 text-center text-sm text-white/70 md:px-6">{img.alt}</p>
    </div>
  );
}

function NavButton({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-primary sm:inline-flex ${
        side === "left" ? "left-3 md:left-6" : "right-3 md:right-6"
      }`}
    >
      <Icon className="size-6" />
    </button>
  );
}
