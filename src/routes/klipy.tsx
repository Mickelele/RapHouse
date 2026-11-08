import { createFileRoute, redirect } from "@tanstack/react-router";

// Klipy i oprawa wydania są teraz na /realizacje (filtry). Stare linki - także zapisane w panelu
// (/klipy, /klipy?zakladka=materialy) - przekierowują na właściwy filtr.
export const Route = createFileRoute("/klipy")({
  validateSearch: (search: Record<string, unknown>): { zakladka?: string } =>
    typeof search["zakladka"] === "string" ? { zakladka: search["zakladka"] } : {},
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/realizacje",
      search: { filtr: search.zakladka === "materialy" ? "oprawa" : "klipy" },
      statusCode: 301,
    });
  },
});
