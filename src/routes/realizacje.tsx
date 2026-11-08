import type { ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EmptyState, PageLayout } from "@/components/site/PageLayout";
import { AudioGrid, VideoGrid } from "@/components/site/Portfolio";
import { PromoGrid } from "@/components/site/Promo";
import { Skeleton } from "@/components/site/Skeleton";
import { useAudioProjects, usePromoMaterials, useProjects } from "@/lib/content";
import { cn } from "@/lib/utils";

const title = "Realizacje - utwory, klipy i oprawa wydania | RapHouse Warszawa";
const description =
  "Utwory nagrane i zmiksowane w RapHouse, teledyski oraz oprawa wydania: rolki, okładki i grafiki. Studio nagrań w Warszawie.";

type Filter = "utwory" | "klipy" | "oprawa";

const FILTERS: { value: Filter | undefined; label: string }[] = [
  { value: undefined, label: "Wszystkie" },
  { value: "utwory", label: "Utwory" },
  { value: "klipy", label: "Klipy" },
  { value: "oprawa", label: "Oprawa wydania" },
];

export const Route = createFileRoute("/realizacje")({
  // ?filtr=utwory|klipy|oprawa - da się podlinkować konkretny filtr (cennik, ścieżka procesu).
  validateSearch: (search: Record<string, unknown>): { filtr?: Filter } => {
    const f = search["filtr"];
    return f === "utwory" || f === "klipy" || f === "oprawa" ? { filtr: f } : {};
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { filtr } = Route.useSearch();
  const navigate = useNavigate({ from: "/realizacje" });
  const setFilter = (f: Filter | undefined) =>
    navigate({ search: f ? { filtr: f } : {}, replace: true, resetScroll: false });

  const show = (f: Filter) => !filtr || filtr === f;

  return (
    <PageLayout
      eyebrow="Realizacje"
      title="Co tu"
      accent="powstało"
      intro="Utwory nagrane, zmiksowane i zmasterowane u nas, teledyski i cała oprawa wydania - rolki, okładki, grafiki. Wszystko, czego potrzebuje Twój numer."
    >
      <section className="mx-auto max-w-[1400px] overflow-x-clip px-5 pb-24 md:px-10 md:pb-32">
        <div
          role="tablist"
          aria-label="Rodzaj realizacji"
          className="mb-12 grid w-full grid-cols-2 gap-1 rounded-md border border-border p-1 sm:inline-grid sm:w-auto sm:grid-cols-4"
        >
          {FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              role="tab"
              aria-selected={filtr === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "min-h-11 rounded px-5 text-xs font-bold uppercase tracking-[0.18em] transition-colors",
                filtr === f.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-20">
          {show("utwory") && (
            <Group title="Utwory" accent="z mixem i masterem" showTitle={!filtr}>
              <Tracks />
            </Group>
          )}
          {show("klipy") && (
            <Group title="Klipy" accent="od pomysłu po montaż" showTitle={!filtr}>
              <Clips />
            </Group>
          )}
          {show("oprawa") && (
            <Group title="Oprawa wydania" accent="rolki i grafiki" showTitle={!filtr}>
              <Promo />
            </Group>
          )}
        </div>

        <div className="mt-16 flex flex-wrap gap-3">
          <a href="/rezerwacja" className="btn-base btn-accent">
            Rezerwuj
          </a>
          <a href="/#kontakt" className="btn-base btn-ghost-line">
            Zapytaj o wycenę
          </a>
        </div>
      </section>
    </PageLayout>
  );
}

// W widoku "Wszystkie" każda grupa ma nagłówek; po wybraniu filtra nagłówek jest zbędny.
function Group({
  title,
  accent,
  showTitle,
  children,
}: {
  title: string;
  accent: string;
  showTitle: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      {showTitle && (
        <h2 className="font-display mb-8 text-[clamp(2rem,4.5vw,3.5rem)]">
          {title} <span className="text-primary">{accent}</span>
        </h2>
      )}
      {children}
    </div>
  );
}

function Loading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-56 w-full" />
      ))}
    </div>
  );
}

function Tracks() {
  const { items, isError } = useAudioProjects();
  if (!items) return <Loading />;
  if (isError)
    return <EmptyState>Nie udało się pobrać utworów. Spróbuj odświeżyć stronę.</EmptyState>;
  return <AudioGrid items={items} />;
}

function Clips() {
  const { data, isPending, isError } = useProjects();
  if (isPending) return <Loading />;
  if (isError)
    return <EmptyState>Nie udało się pobrać klipów. Spróbuj odświeżyć stronę.</EmptyState>;
  return <VideoGrid items={data.filter((p) => p.category === "video")} />;
}

function Promo() {
  const { data, isPending } = usePromoMaterials();
  if (isPending) return <Loading />;
  return <PromoGrid items={data ?? []} />;
}
