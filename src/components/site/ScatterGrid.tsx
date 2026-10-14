import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Zakres przewijania (ułamki wysokości okna). Siatka: liczy się jej ŚRODEK - zebrane karty
// wjeżdżają od dołu ekranu i są rozsypane, gdy środek siatki dojedzie do połowy ekranu.
const GRID_START = 1;
const GRID_END = 0.5;
// Jedna kolumna (telefon): liczy się górna krawędź każdej karty.
const CARD_START = 0.95;
const CARD_END = 0.45;
// Lekki "losowy" obrót każdej karty w stanie zebranym (stały, żeby nie skakał).
const ROTATIONS = [-14, 9, -6, 12, -10, 7, -12, 5];

function progress(y: number, vh: number, start: number, end: number) {
  return Math.min(1, Math.max(0, (start * vh - y) / ((start - end) * vh)));
}

/**
 * Siatka, której elementy przy przewijaniu w dół rozsypują się ze środka na swoje miejsca,
 * a przy przewijaniu w górę wracają do środka. Na jednej kolumnie (telefon) każda karta
 * wlatuje na przemian z lewej i prawej, licząc od własnej pozycji.
 */
export function ScatterGrid({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      grid.style.setProperty("--p", "1");
      return;
    }

    let singleColumn = false;
    let raf = 0;

    // Odległość środka każdej karty od środka siatki (offsety nie uwzględniają transformacji).
    const measure = () => {
      const items = [...grid.children] as HTMLElement[];
      singleColumn = items.every((el) => el.offsetLeft === items[0]?.offsetLeft);
      const cx = grid.clientWidth / 2;
      const cy = grid.clientHeight / 2;
      items.forEach((el, i) => {
        const dx = singleColumn
          ? (i % 2 ? 1 : -1) * el.offsetWidth * 0.7
          : cx - (el.offsetLeft + el.offsetWidth / 2);
        const dy = singleColumn ? 0 : cy - (el.offsetTop + el.offsetHeight / 2);
        el.style.setProperty("--dx", `${dx}px`);
        el.style.setProperty("--dy", `${dy}px`);
        el.style.setProperty("--r", `${ROTATIONS[i % ROTATIONS.length]}deg`);
      });
      update();
    };

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const rect = grid.getBoundingClientRect();
      if (singleColumn) {
        grid.style.removeProperty("--p");
        for (const el of grid.children as HTMLCollectionOf<HTMLElement>) {
          const p = progress(rect.top + el.offsetTop, vh, CARD_START, CARD_END);
          el.style.setProperty("--p", p.toFixed(4));
        }
      } else {
        for (const el of grid.children as HTMLCollectionOf<HTMLElement>)
          el.style.removeProperty("--p");
        const p = progress(rect.top + rect.height / 2, vh, GRID_START, GRID_END);
        grid.style.setProperty("--p", p.toFixed(4));
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(grid);
    for (const el of grid.children) ro.observe(el);
    measure();
    window.addEventListener("scroll", schedule, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
    };
  }, [children]);

  return (
    <div ref={ref} className={cn("scatter-grid", className)}>
      {children}
    </div>
  );
}
