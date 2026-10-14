import { useEffect, useRef } from "react";
import { getFrame, MIC_FRAMES, startLoading, subscribe } from "@/lib/mic-frames";
import { cn } from "@/lib/utils";

// Jak szybko animacja dogania przewijanie (0-1): mniej = miękcej, więcej = ciaśniej za scrollem.
const EASE = 0.14;

/**
 * Mikrofon rozbierany na części w rytm przewijania. `getProgress` zwraca postęp 0 → 1
 * (liczony przez sekcję, w której stoi komponent). Pozycja animacji płynnie dogania przewijanie,
 * a między sąsiednimi klatkami jest przenikanie - ruch jest miękki zamiast skokowy.
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
    startLoading();

    const last = MIC_FRAMES - 1;
    let current = progressRef.current() * last; // aktualna (ułamkowa) pozycja w klatkach
    let raf = 0;

    const nearest = (i: number) => {
      for (let d = 0; d <= last; d++) {
        const a = getFrame(i - d) ?? getFrame(i + d);
        if (a) return a;
      }
      return null;
    };

    const drawImage = (img: HTMLImageElement, alpha: number) => {
      const { width, height } = canvas;
      // "contain": cała klatka mieści się w canvasie, wyśrodkowana.
      const scale = Math.min(width / img.naturalWidth, height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
    };

    const render = () => {
      const base = Math.floor(current);
      const t = current - base;
      const a = nearest(base);
      if (!a) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawImage(a, 1);
      // Przenikanie: następna klatka nałożona z przezroczystością równą części ułamkowej.
      const b = t > 0.02 ? getFrame(base + 1) : null;
      if (b) drawImage(b, t);
      ctx.globalAlpha = 1;
    };

    const tick = () => {
      raf = 0;
      const target = progressRef.current() * last;
      const diff = target - current;
      current = Math.abs(diff) < 0.01 ? target : current + diff * EASE;
      render();
      if (current !== target) raf = requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    // Rozdzielczość canvasu = rozmiar na ekranie × gęstość pikseli (ostro na telefonach).
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      render();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    // Dociągnięta klatka może być tą, której brakowało - odśwież rysunek.
    const unsubscribe = subscribe(render);
    window.addEventListener("scroll", schedule, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      unsubscribe();
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
