import { useEffect, useRef } from "react";
import type { AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Jak często panel zgłasza aktywność do bazy (admin_heartbeat) i sprawdza sesję na serwerze.
const HEARTBEAT_MS = 60 * 1000;
const CHECK_MS = 60 * 1000;
const EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;

// Sesja usunięta na serwerze (endpoint logout_idle_admins) albo wygasła - a nie chwilowy brak sieci.
function isRevoked(error: AuthError) {
  return (
    error.status === 401 ||
    error.status === 403 ||
    /session.*(not.*exist|not_found|missing)|jwt.*expired|invalid.*jwt/i.test(error.message)
  );
}

/**
 * Serwerowa część wylogowania: zgłasza aktywność admina do bazy i co minutę sprawdza, czy sesja
 * nadal istnieje. Gdy endpoint logout_idle_admins ją usunął, wywołuje onRevoked().
 */
export function useServerSession(enabled: boolean, onRevoked: () => void) {
  const revoked = useRef(onRevoked);
  revoked.current = onRevoked;

  useEffect(() => {
    if (!enabled || !supabase) return;
    const sb = supabase;
    let lastBeat = 0;

    const heartbeat = () => {
      const now = Date.now();
      if (now - lastBeat < HEARTBEAT_MS) return;
      lastBeat = now;
      void sb.rpc("admin_heartbeat");
    };

    const check = async () => {
      const { error } = await sb.auth.getUser();
      if (error && isRevoked(error)) revoked.current();
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };

    heartbeat();
    void check();
    for (const ev of EVENTS) window.addEventListener(ev, heartbeat, { passive: true });
    document.addEventListener("visibilitychange", onVisible);
    const timer = setInterval(() => void check(), CHECK_MS);

    return () => {
      clearInterval(timer);
      for (const ev of EVENTS) window.removeEventListener(ev, heartbeat);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled]);
}
