// Dopasowanie plików audio do bitów po nazwie (narzędzie "Podepnij pliki audio" w panelu).
// Klucz pliku: nazwa bez numeru z przodu ("17. rozey.mp3" -> "rozey"), dopisku " prev",
// dopisku z folderem "(…)" i znaków innych niż litery/cyfry. Bit ma dwa klucze: z tytułu
// i ze starej nazwy pliku (np. ".../18-baunser-mj9uezfi.mp3" -> "baunser").

export function matchKey(name: string) {
  return name
    .toLowerCase()
    .replace(/\.(mp3|wav|m4a|ogg)$/, "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/^\d+[.\-_\s]+/, "")
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "")
    .replace(/prev(iew)?$/, "");
}

// Stara nazwa pliku z adresu: "18-baunser-mj9uezfi.mp3" -> "baunser".
export function oldFileKey(url: string | null) {
  if (!url) return null;
  const file = decodeURIComponent(url.split("/").pop() ?? "");
  const stem = file.replace(/\.[a-z0-9]+$/i, "").replace(/-[a-z0-9]{8}$/i, "");
  return matchKey(stem) || null;
}

export type BeatRef = { id: string; title: string; audio_url: string | null };

/**
 * Dla każdego bitu: nazwa pasującego pliku albo null. Najpierw dokładny klucz (tytuł albo stara
 * nazwa pliku), potem ten sam klucz bez cyfr na końcu ("funk3" -> "funk") - tylko gdy jednoznaczny.
 * Jeden plik trafia najwyżej do jednego bitu.
 */
export function matchBeatsToFiles(beats: BeatRef[], fileNames: string[]) {
  const byKey = new Map<string, string[]>();
  for (const f of fileNames) {
    const k = matchKey(f);
    byKey.set(k, [...(byKey.get(k) ?? []), f]);
  }
  const used = new Set<string>();
  const take = (key: string | null) => {
    if (!key) return null;
    const free = (byKey.get(key) ?? []).filter((f) => !used.has(f));
    return free.length === 1 ? free[0]! : null;
  };

  const result = new Map<string, string | null>();
  // Dwa przebiegi: dokładne klucze dla wszystkich bitów, potem luźniejsze dla reszty.
  for (const b of beats) {
    const file = take(matchKey(b.title)) ?? take(oldFileKey(b.audio_url));
    if (file) used.add(file);
    result.set(b.id, file);
  }
  for (const b of beats) {
    if (result.get(b.id)) continue;
    const loose = [matchKey(b.title), oldFileKey(b.audio_url)]
      .filter((k): k is string => !!k)
      .map((k) => k.replace(/\d+$/, ""))
      .filter((k) => k.length >= 3);
    const file = loose.map(take).find(Boolean) ?? null;
    if (file) used.add(file);
    result.set(b.id, file);
  }
  return result;
}
