import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EmptyState, PageLayout } from "@/components/site/PageLayout";
import { VideoGrid } from "@/components/site/Portfolio";
import { PromoGrid } from "@/components/site/Promo";
import { usePromoMaterials, useProjects } from "@/lib/content";
import { cn } from "@/lib/utils";

const title = "Klipy i materiały promocyjne - RapHouse | Studio nagrań Warszawa";
const description =
  "Teledyski, rolki i grafiki promocyjne artystów RapHouse. Realizacja klipów od pomysłu po montaż i materiały do promocji numeru.";

type Tab = "klipy" | "materialy";

const TABS: { value: Tab; label: string }[] = [
  { value: "klipy", label: "Klipy" },
  { value: "materialy", label: "Materiały promocyjne" },
];

export const Route = createFileRoute("/klipy")({
  // ?zakladka=materialy otwiera materiały promocyjne (link z cennika i ścieżki procesu).
  validateSearch: (search: Record<string, unknown>): { zakladka?: "materialy" } =>
    search["zakladka"] === "materialy" ? { zakladka: "materialy" } : {},
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ClipsPage,
});

function ClipsPage() {
  const { zakladka } = Route.useSearch();
  const navigate = useNavigate({ from: "/klipy" });
  const tab: Tab = zakladka === "materialy" ? "materialy" : "klipy";
  const setTab = (t: Tab) =>
    navigate({
      search: t === "materialy" ? { zakladka: "materialy" } : {},
      replace: true,
      resetScroll: false,
    });

  return (
    <PageLayout
      eyebrow="Klipy i promo"
      title={tab === "klipy" ? "Klipy" : "Materiały"}
      accent={tab === "klipy" ? "z RapHouse." : "promocyjne."}
      intro={
        tab === "klipy"
          ? "Teledyski artystów, którzy nagrywali u nas. Chcesz klip do swojego numeru? Zrobimy go od pomysłu po montaż."
          : "Rolki, okładki i grafiki, z którymi numery naszych artystów wychodzą do ludzi. Zrobimy też pakiet pod Twoją premierę."
      }
    >
      <section className="mx-auto max-w-[1400px] overflow-x-clip px-5 pb-24 md:px-10 md:pb-32">
        <div
          role="tablist"
          aria-label="Klipy czy materiały promocyjne"
          className="mb-10 grid w-full grid-cols-2 rounded-md border border-border p-1 sm:w-fit"
        >
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              id={`klipy-tab-${t.value}`}
              aria-selected={tab === t.value}
              aria-controls="klipy-panel"
              onClick={() => setTab(t.value)}
              className={cn(
                "min-h-11 rounded px-5 text-xs font-bold uppercase tracking-[0.18em] transition-colors sm:px-8",
                tab === t.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div id="klipy-panel" role="tabpanel" aria-labelledby={`klipy-tab-${tab}`}>
          {tab === "klipy" ? <ClipsTab /> : <PromoTab />}
        </div>

        <div className="mt-12">
          <a href="/#kontakt" className="btn-base btn-accent">
            {tab === "klipy" ? "Zapytaj o klip" : "Zapytaj o materiały"}
          </a>
        </div>
      </section>
    </PageLayout>
  );
}

function ClipsTab() {
  const { data, isLoading, isError } = useProjects();
  const clips = (data ?? []).filter((p) => p.category === "video");
  if (isLoading) return <EmptyState>Ładowanie klipów…</EmptyState>;
  if (isError)
    return <EmptyState>Nie udało się pobrać klipów. Spróbuj odświeżyć stronę.</EmptyState>;
  return <VideoGrid items={clips} />;
}

function PromoTab() {
  const { data, isLoading } = usePromoMaterials();
  if (isLoading) return <EmptyState>Ładowanie materiałów…</EmptyState>;
  // Błąd (np. przed migracją tabeli) = pusty stan z linkiem do Instagrama.
  return <PromoGrid items={data ?? []} />;
}
