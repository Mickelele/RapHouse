import { useQuery } from "@tanstack/react-query";

// Rezerwacje studia z aplikacji RapApp (base44) - ta sama baza, z której korzysta jej publiczny
// kalendarz (rapapp.base44.app/PublicCalendar). Pobieramy wyłącznie datę i godziny, bez danych
// klientów.
const APP_ID = "69a76b0d6a3135dd2293c35b";
const BOOKINGS_URL = `https://rapapp.base44.app/api/apps/${APP_ID}/entities/Booking`;
export const PUBLIC_CALENDAR_URL = "https://rapapp.base44.app/PublicCalendar";

// Usługi, które zajmują studio (jak w publicznym kalendarzu RapApp).
const STUDIO_SERVICES = ["rent", "session_with_engineer", "raphouse", "lasek"];

type RawBooking = {
  date?: string;
  start_time?: string;
  end_time?: string;
  service_type?: string;
  is_cancelled?: boolean;
};

export type BusySlot = {
  date: string; // yyyy-MM-dd
  start: string; // HH:mm
  end: string; // HH:mm
  // Minuty od północy; koniec o północy lub "po północy" = 24:00.
  startMin: number;
  endMin: number;
};

function toMinutes(t: string) {
  const [h = 0, m = 0] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Zajęte godziny studia w zakresie dat (włącznie), pogrupowane po dniu i posortowane. */
export function useBusySlots(from: string, to: string) {
  return useQuery({
    queryKey: ["studio-busy", from, to],
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    queryFn: async () => {
      const params = new URLSearchParams({
        fields: "date,start_time,end_time,service_type,is_cancelled",
        q: JSON.stringify({ date: { $gte: from, $lte: to } }),
        limit: "1000",
      });
      const res = await fetch(`${BOOKINGS_URL}?${params}`);
      if (!res.ok) throw new Error(`Kalendarz: ${res.status}`);
      const rows = (await res.json()) as RawBooking[];

      const byDay = new Map<string, BusySlot[]>();
      for (const b of rows) {
        if (!b.date || !b.start_time || !b.end_time || b.is_cancelled) continue;
        if (!STUDIO_SERVICES.includes(b.service_type ?? "")) continue;
        // Filtr także po stronie przeglądarki, na wypadek gdyby API zignorowało zakres.
        if (b.date < from || b.date > to) continue;
        const startMin = toMinutes(b.start_time);
        let endMin = toMinutes(b.end_time);
        if (endMin <= startMin) endMin = 24 * 60;
        const list = byDay.get(b.date) ?? [];
        list.push({ date: b.date, start: b.start_time, end: b.end_time, startMin, endMin });
        byDay.set(b.date, list);
      }
      for (const list of byDay.values()) list.sort((a, b) => a.startMin - b.startMin);
      return byDay;
    },
  });
}
