import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

// Czas bezczynności, po którym panel wylogowuje - zmień tutaj.
export const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
// Na ile wcześniej pokazać ostrzeżenie.
export const IDLE_WARNING_MS = 60 * 1000;

const ACTIVITY_KEY = "rh-admin-last-activity";
const LOGOUT_REASON_KEY = "rh-admin-logout-reason";
const CHANNEL = "rh-admin-activity";
const EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;
// Zapis aktywności najczęściej co tyle - mousemove strzela setki razy na sekundę.
const WRITE_THROTTLE_MS = 2000;

function readLastActivity() {
  try {
    return Number(localStorage.getItem(ACTIVITY_KEY)) || 0;
  } catch {
    return 0;
  }
}

// Twarde usunięcie sesji Supabase z przeglądarki - gdy wylogowanie przez serwer się nie uda
// (np. brak sieci), sesja i tak nie może zostać.
function removeStoredSession() {
  try {
    for (const key of Object.keys(localStorage))
      if (/^sb-.+-auth-token/.test(key)) localStorage.removeItem(key);
  } catch {
    /* ignoruj */
  }
}

function writeLastActivity(t: number) {
  try {
    localStorage.setItem(ACTIVITY_KEY, String(t));
  } catch {
    /* tryb prywatny itp. - zostaje licznik w pamięci karty */
  }
}

// Komunikat dla ekranu logowania - czytany raz, potem kasowany.
export function takeLogoutReason(): string | null {
  try {
    const raw = localStorage.getItem(LOGOUT_REASON_KEY);
    if (!raw) return null;
    const { reason, at } = JSON.parse(raw) as { reason: string; at: number };
    // Inne karty też zdążą go pokazać, ale nie wisi w nieskończoność.
    if (Date.now() - at > 60_000) localStorage.removeItem(LOGOUT_REASON_KEY);
    return reason === "idle" ? "Wylogowano z powodu braku aktywności." : null;
  } catch {
    return null;
  }
}

// Świeże logowanie - stara znacznik aktywności z poprzedniej sesji nie może od razu wylogować.
export function resetActivity() {
  writeLastActivity(Date.now());
}

export function clearLogoutReason() {
  try {
    localStorage.removeItem(LOGOUT_REASON_KEY);
  } catch {
    /* ignoruj */
  }
}

/**
 * Wylogowuje po IDLE_TIMEOUT_MS bez aktywności. Ostatnia aktywność jest wspólna dla wszystkich
 * kart (localStorage + BroadcastChannel), więc praca w jednej karcie nie wyloguje drugiej.
 * Zwraca liczbę sekund do wylogowania, gdy trwa ostrzeżenie (inaczej null), funkcję „zostań”
 * oraz `expired` - po upływie czasu panel ma pokazać ekran logowania od razu, bez czekania
 * na odpowiedź serwera.
 */
export function useIdleLogout(enabled: boolean) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const loggingOut = useRef(false);
  const last = useRef(0);
  const lastWrite = useRef(0);
  const warning = useRef(false);
  const channel = useRef<BroadcastChannel | null>(null);

  const markActive = useCallback((force = false) => {
    const now = Date.now();
    last.current = now;
    if (force || now - lastWrite.current > WRITE_THROTTLE_MS) {
      lastWrite.current = now;
      writeLastActivity(now);
      channel.current?.postMessage({ type: "activity", at: now });
    }
  }, []);

  // Po ponownym zalogowaniu.
  const resetExpired = useCallback(() => {
    loggingOut.current = false;
    setExpired(false);
  }, []);

  const logOut = useCallback(async () => {
    if (loggingOut.current) return;
    loggingOut.current = true;
    // Komunikat zapisany przed pokazaniem ekranu logowania, który go odczyta.
    try {
      localStorage.setItem(LOGOUT_REASON_KEY, JSON.stringify({ reason: "idle", at: Date.now() }));
    } catch {
      /* ignoruj */
    }
    warning.current = false;
    setSecondsLeft(null);
    setExpired(true);
    // "local": wylogowuje tę przeglądarkę; inne urządzenia zostają zalogowane.
    const res = await supabase?.auth
      .signOut({ scope: "local" })
      .catch((e: Error) => ({ error: e }));
    if (res?.error) removeStoredSession();
    try {
      localStorage.removeItem(ACTIVITY_KEY);
    } catch {
      /* ignoruj */
    }
  }, []);

  const stayLoggedIn = useCallback(() => {
    warning.current = false;
    setSecondsLeft(null);
    markActive(true);
  }, [markActive]);

  useEffect(() => {
    if (!enabled) return;

    channel.current =
      typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;
    channel.current?.addEventListener(
      "message",
      (e: MessageEvent<{ type: string; at: number }>) => {
        if (e.data?.type === "activity") last.current = Math.max(last.current, e.data.at);
      },
    );

    // Powrót po długiej przerwie (np. zamknięta przeglądarka) - licznik ze storage.
    const stored = readLastActivity();
    last.current = stored || Date.now();
    if (!stored) markActive(true);

    const onActivity = () => {
      // W trakcie ostrzeżenia liczy się tylko przycisk „Zostań zalogowany”.
      if (!warning.current) markActive();
    };
    for (const ev of EVENTS) window.addEventListener(ev, onActivity, { passive: true });

    const onStorage = (e: StorageEvent) => {
      if (e.key === ACTIVITY_KEY && e.newValue)
        last.current = Math.max(last.current, Number(e.newValue));
    };
    window.addEventListener("storage", onStorage);

    const tick = setInterval(() => {
      const latest = Math.max(last.current, readLastActivity());
      last.current = latest;
      const left = IDLE_TIMEOUT_MS - (Date.now() - latest);

      if (left <= 0) {
        clearInterval(tick);
        void logOut();
      } else if (left <= IDLE_WARNING_MS) {
        warning.current = true;
        setSecondsLeft(Math.ceil(left / 1000));
      } else if (warning.current) {
        // Ktoś kliknął „Zostań” w innej karcie.
        warning.current = false;
        setSecondsLeft(null);
      }
    }, 1000);

    return () => {
      clearInterval(tick);
      for (const ev of EVENTS) window.removeEventListener(ev, onActivity);
      window.removeEventListener("storage", onStorage);
      channel.current?.close();
      channel.current = null;
      warning.current = false;
      setSecondsLeft(null);
    };
  }, [enabled, markActive, logOut]);

  return { secondsLeft, stayLoggedIn, expired, resetExpired, logOut };
}
