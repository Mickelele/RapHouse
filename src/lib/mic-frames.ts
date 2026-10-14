// Klatki animacji mikrofonu: public/mikrofon/000.webp … 143.webp (przezroczyste tło).
// Wspólny magazyn: wczytuje je raz, a animacja i ekran ładowania tylko z niego korzystają.

export const MIC_FRAMES = 144;
// Ile klatek pobierać naraz.
const CONCURRENCY = 8;

const frames: (HTMLImageElement | null)[] = Array(MIC_FRAMES).fill(null);
let done = 0; // wczytane albo nieudane - po MIC_FRAMES ładowanie jest skończone
let started = false;
const listeners = new Set<() => void>();

const frameSrc = (i: number) => `/mikrofon/${String(i).padStart(3, "0")}.webp`;

export function getFrame(i: number) {
  return frames[i] ?? null;
}

/** Ile klatek jest już gotowych (0 … MIC_FRAMES). */
export function getDone() {
  return done;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Pojedyncza klatka nie może zablokować całego ładowania (np. zawieszone połączenie).
const FRAME_TIMEOUT_MS = 10_000;

function load(i: number) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (ok) {
        frames[i] = img;
        // Dekodowanie w tle, bez czekania - w karcie w tle przeglądarka potrafi je wstrzymać.
        img.decode?.().catch(() => {});
      }
      done++;
      for (const l of listeners) l();
      resolve();
    };
    const timer = setTimeout(() => finish(false), FRAME_TIMEOUT_MS);
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = frameSrc(i);
  });
}

/** Rusza pobieranie (tylko raz): najpierw pierwsza klatka, potem reszta po kilka naraz. */
export function startLoading() {
  if (started || typeof window === "undefined") return;
  started = true;
  void (async () => {
    await load(0);
    let next = 1;
    const worker = async () => {
      while (next < MIC_FRAMES) await load(next++);
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  })();
}
