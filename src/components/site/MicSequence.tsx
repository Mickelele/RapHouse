import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Klatki animacji: public/mikrofon/000.webp … 143.webp (przezroczyste tło).
export const MIC_FRAMES = 144;
const frameSrc = (i: number) => `/mikrofon/${String(i).padStart(3, "0")}.webp`;

/**
 * Mikrofon rozbierany na części w rytm przewijania. `getProgress` zwraca postęp 0 → 1
 * (liczony przez sekcję, w której stoi komponent); klatka jest rysowana na canvasie,
 * bez re-renderów Reacta. Klatki dociągają się w tle - zanim dojdzie właściwa,
 * rysowana jest najbliższa już wczytana.
 */
export function MicSequence({
  getProgress,
  className,
}: {
  getProgress: () => number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(getProgress);
  progressRef.current = getProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const frames: (HTMLImageElement | null)[] = Array(MIC_FRAMES).fill(null);
    let drawn = -1;
    let raf = 0;
    let cancelled = false;

    const nearestLoaded = (i: number) => {
      for (let d = 0; d < MIC_FRAMES; d++) {
        if (frames[i - d]) return i - d;
        if (frames[i + d]) return i + d;
      }
      return -1;
    };

    const draw = (force = false) => {
      raf = 0;
      const target = Math.round(progressRef.current() * (MIC_FRAMES - 1));
      const i = nearestLoaded(target);
      if (i < 0 || (i === drawn && !force)) return;
      const img = frames[i]!;
      const { width, height } = canvas;
      // "contain": cała klatka mieści się w canvasie, wyśrodkowana.
      const scale = Math.min(width / img.naturalWidth, height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
      drawn = i;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(() => draw());
    };

    // Rozdzielczość canvasu = rozmiar na ekranie × gęstość pikseli (ostro na telefonach).
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      draw(true);
    };

    const load = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          if (!cancelled) {
            frames[i] = img;
            if (drawn < 0) draw();
            else schedule();
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = frameSrc(i);
      });

    // Najpierw pierwsza klatka, potem reszta po kilka naraz (nie zapycha łącza).
    void (async () => {
      await load(0);
      const order = Array.from({ length: MIC_FRAMES - 1 }, (_, k) => k + 1);
      const BATCH = 6;
      for (let k = 0; k < order.length && !cancelled; k += BATCH)
        await Promise.all(order.slice(k, k + BATCH).map(load));
    })();

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("scroll", schedule, { passive: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Mikrofon studyjny rozkładany na części: kosz, kapsuła, elektronika, korpus i złącze"
      className={cn("block", className)}
    />
  );
}
