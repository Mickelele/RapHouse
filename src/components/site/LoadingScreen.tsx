import { useEffect, useState, useSyncExternalStore } from "react";
import logo from "@/assets/raphouse-logo.webp";
import { getKeyCount, getKeyDone, startLoading, subscribe } from "@/lib/mic-frames";
import { cn } from "@/lib/utils";

// Najdłużej, ile czekamy na klatki (wolny internet) - potem strona i tak się pokazuje.
const MAX_WAIT_MS = 12_000;
const FADE_MS = 500;

/**
 * Ekran ładowania strony głównej: czeka tylko na kluczowe klatki mikrofonu (co 6.) - reszta
 * dociąga się w tle już po pokazaniu strony.
 * Renderowany już na serwerze, więc nie ma mignięcia treści. Bez JS chowa go samo CSS
 * (animacja `loader-failsafe`), żeby nikt nie utknął na zasłonie.
 */
export function LoadingScreen() {
  const done = useSyncExternalStore(subscribe, getKeyDone, () => 0);
  const [timedOut, setTimedOut] = useState(false);
  const [gone, setGone] = useState(false);
  const keyCount = getKeyCount();
  const finished = (keyCount > 0 && done >= keyCount) || timedOut;

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
  const percent = keyCount ? Math.round((done / keyCount) * 100) : 0;

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
      <div className="absolute size-[28rem] max-w-[90vw] bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_12%,transparent),transparent)]" />
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
