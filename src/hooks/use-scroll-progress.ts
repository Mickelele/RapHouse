import { useEffect, useRef } from "react";

/**
 * Postęp przewijania elementu jako zmienna CSS `--p` (0 → 1), ustawiana bezpośrednio na elemencie
 * (bez re-renderów Reacta). 0 = górna krawędź elementu na wysokości `start` ekranu,
 * 1 = na wysokości `end` (ułamki wysokości okna, 1 = dół ekranu, 0 = góra).
 * Działa w obie strony - przy przewijaniu w górę wartość maleje.
 *
 * W stylach używaj `var(--p, 1)`: przed załadowaniem JS i przy włączonym w systemie
 * ograniczeniu animacji elementy stoją w stanie końcowym.
 */
export function useScrollProgress<T extends HTMLElement>({ start = 1, end = 0.35 } = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Telefony i ograniczenie animacji: stan końcowy, bez nasłuchiwania przewijania.
    if (window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 1023px)").matches) {
      el.style.setProperty("--p", "1");
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const top = el.getBoundingClientRect().top;
      const p = (start * vh - top) / ((start - end) * vh);
      el.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(4));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [start, end]);

  return ref;
}
