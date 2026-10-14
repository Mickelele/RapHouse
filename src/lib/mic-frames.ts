// Klatki animacji mikrofonu: public/mikrofon/frame_001.webp … frame_144.webp (przezroczyste tło,
// zoptymalizowane; oryginały w mikrofon-zrodla/). Wspólny magazyn: wczytuje je raz, a animacja
// i ekran ładowania tylko z niego korzystają.

export const MIC_FRAMES = 144;
// Co która klatka jest "kluczowa" - te idą pierwsze i tylko na nie czeka ekran ładowania.
// Reszta dociąga się w tle, a animacja do tego czasu przenika między kluczowymi.
const KEY_STEP = 6;
// Ile klatek pobierać naraz.
const CONCURRENCY = 8;
// Pojedyncza klatka nie może zablokować całego ładowania (np. zawieszone połączenie).
const FRAME_TIMEOUT_MS = 10_000;

export const frameSrc = (i: number) => `/mikrofon/frame_${String(i + 1).padStart(3, "0")}.webp`;

const keyFrames = new Set([
  ...Array.from({ length: Math.ceil(MIC_FRAMES / KEY_STEP) }, (_, k) => k * KEY_STEP),
  MIC_FRAMES - 1,
]);
export const KEY_FRAMES = keyFrames.size;

const frames: (HTMLImageElement | null)[] = Array(MIC_FRAMES).fill(null);
let done = 0; // wszystkie klatki: wczytane albo nieudane
let keyDone = 0; // tylko kluczowe
let started = false;
const listeners = new Set<() => void>();

export function getFrame(i: number) {
  return frames[i] ?? null;
}

/** Ile kluczowych klatek jest gotowych (0 … KEY_FRAMES) - na tym czeka ekran ładowania. */
export function getKeyDone() {
  return keyDone;
}

/** Ile wszystkich klatek jest gotowych (0 … MIC_FRAMES). */
export function getDone() {
  return done;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

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
      if (keyFrames.has(i)) keyDone++;
      for (const l of listeners) l();
      resolve();
    };
    const timer = setTimeout(() => finish(false), FRAME_TIMEOUT_MS);
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = frameSrc(i);
  });
}

/** Rusza pobieranie (tylko raz): najpierw klatki kluczowe, potem reszta, po kilka naraz. */
export function startLoading() {
  if (started || typeof window === "undefined") return;
  started = true;
  const all = Array.from({ length: MIC_FRAMES }, (_, i) => i);
  const queue = [...all.filter((i) => keyFrames.has(i)), ...all.filter((i) => !keyFrames.has(i))];
  let next = 0;
  const worker = async () => {
    while (next < queue.length) await load(queue[next++]!);
  };
  void Promise.all(Array.from({ length: CONCURRENCY }, worker));
}
