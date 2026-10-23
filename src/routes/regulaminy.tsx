import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageLayout } from "@/components/site/PageLayout";
import { regulationSlug, useRegulations } from "@/lib/content";
import { formatDate } from "@/lib/media";

const title = "Regulaminy - studio nagrań RapHouse Warszawa";
const description = "Regulaminy studia nagrań RapHouse: wynajem studia, sesje nagraniowe i usługi.";

export const Route = createFileRoute("/regulaminy")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: RegulationsPage,
});

function RegulationsPage() {
  const { data, isLoading, isError } = useRegulations();
  const items = data ?? [];

  // Link ze stopki (/regulaminy#nazwa): regulaminy dochodzą z bazy po załadowaniu strony,
  // więc przeglądarka nie ma jeszcze do czego przewinąć - przewijamy, gdy się pojawią.
  useEffect(() => {
    if (!data?.length || !window.location.hash) return;
    document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView();
  }, [data]);

  return (
    <PageLayout eyebrow="Regulaminy" title="Regulaminy" accent="studia.">
      <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10 md:pb-32">
        {isLoading ? (
          <EmptyState>Ładowanie regulaminów…</EmptyState>
        ) : isError || !items.length ? (
          <EmptyState>Regulaminy pojawią się tu wkrótce.</EmptyState>
        ) : (
          <div className="grid gap-10 lg:grid-cols-12">
            {/* Spis treści - przy kilku regulaminach. */}
            {items.length > 1 && (
              <nav aria-label="Spis regulaminów" className="lg:col-span-4">
                <ul className="flex flex-col gap-2 lg:sticky lg:top-28">
                  {items.map((r) => (
                    <li key={r.id}>
                      <a
                        href={`#${regulationSlug(r.title)}`}
                        className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
                      >
                        {r.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <div
              className={items.length > 1 ? "flex flex-col gap-6 lg:col-span-8" : "lg:col-span-9"}
            >
              {items.map((r) => (
                <article
                  key={r.id}
                  id={regulationSlug(r.title)}
                  className="card-surface scroll-mt-28 p-7 md:p-10"
                >
                  <h2 className="font-display text-3xl md:text-4xl">{r.title}</h2>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Aktualizacja: {formatDate(r.updated_at)}
                  </p>
                  <div className="mt-6 whitespace-pre-line leading-relaxed text-muted-foreground">
                    {r.body}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </PageLayout>
  );
}
