import { useEffect, useState, useSyncExternalStore } from "react";
import logo from "@/assets/raphouse-logo.png";
import { getDone, MIC_FRAMES, startLoading, subscribe } from "@/lib/mic-frames";
import { cn } from "@/lib/utils";

// Najdłużej, ile czekamy na klatki (wolny internet) - potem strona i tak się pokazuje.
const MAX_WAIT_MS = 12_000;
const FADE_MS = 500;

/**
 * Ekran ładowania strony głównej: czeka, aż wczytają się wszystkie klatki mikrofonu.
 * Renderowany już na serwerze, więc nie ma mignięcia treści. Bez JS chowa go samo CSS
 * (animacja `loader-failsafe`), żeby nikt nie utknął na zasłonie.
 */
export function LoadingScreen() {
  const done = useSyncExternalStore(subscribe, getDone, () => 0);
  const [timedOut, setTimedOut] = useState(false);
  const [gone, setGone] = useState(false);
  const finished = done >= MIC_FRAMES || timedOut;

  useEffect(() => {
    startLoading();
    const t = setTimeout(() => setTimedOut(true), MAX_WAIT_MS);
    return () => clearTimeout(t);
  }, []);

  // Blokada przewijania pod zasłoną; po skończeniu chwila na wygaszenie i usunięcie z DOM.
  useEffect(() => {
    if (finished) {
      document.documentElement.style.overflow = "";
      const t = setTimeout(() => setGone(true), FADE_MS);
      return () => clearTimeout(t);
    }
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [finished]);

  if (gone) return null;
  const percent = Math.round((done / MIC_FRAMES) * 100);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={finished ? "Strona wczytana" : `Ładowanie strony: ${percent}%`}
      className={cn(
        "loader-failsafe fixed inset-0 z-[100] flex flex-col items-center justify-center gap-10 bg-background transition-opacity",
        finished && "pointer-events-none opacity-0",
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <div className="absolute size-[28rem] max-w-[90vw] rounded-full bg-primary/10 blur-3xl" />
      <img src={logo} alt="RapHouse" className="relative h-28 w-auto animate-pulse md:h-36" />
      <div className="relative flex w-64 max-w-[70vw] flex-col items-center gap-3">
        <div className="h-1 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="eyebrow tabular-nums">Ładowanie studia · {percent}%</p>
      </div>
    </div>
  );
}
