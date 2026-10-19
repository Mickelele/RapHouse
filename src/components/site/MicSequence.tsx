import { useEffect, useRef } from "react";
import { getFrame, getFrameCount, startLoading, subscribe } from "@/lib/mic-frames";
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

    const last = getFrameCount() - 1;
    let current = progressRef.current() * last; // aktualna (ułamkowa) pozycja w klatkach
    let raf = 0;

    // Najbliższa wczytana klatka w dół / w górę od pozycji (gdy część klatek jeszcze się dociąga).
    const loadedBelow = (pos: number) => {
      for (let i = Math.floor(pos); i >= 0; i--) if (getFrame(i)) return i;
      return -1;
    };
    const loadedAbove = (pos: number) => {
      for (let i = Math.floor(pos) + 1; i <= last; i++) if (getFrame(i)) return i;
      return -1;
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
      let lo = loadedBelow(current);
      let hi = loadedAbove(current);
      if (lo < 0 && hi < 0) return;
      if (lo < 0) [lo, hi] = [hi, -1];
      // Tło = kolor tła strony, klatki (czarne tło) nakładane trybem "lighten":
      // czerń klatki staje się dokładnie tłem strony, więc nie widać prostokąta.
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighten";
      drawImage(getFrame(lo)!, 1);
      // Przenikanie: następna wczytana klatka nałożona proporcjonalnie do pozycji między nimi.
      if (hi > lo) {
        const t = (current - lo) / (hi - lo);
        if (t > 0.02) drawImage(getFrame(hi)!, t);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
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
