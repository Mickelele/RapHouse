import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { EmptyState, PageLayout } from "@/components/site/PageLayout";
import { regulationSlug, useRegulations } from "@/lib/content";
import { formatDate } from "@/lib/media";
import { cn } from "@/lib/utils";

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
  // Rozwinięte regulaminy (po kotwicy z tytułu). Na start wszystkie zwinięte.
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  const toggle = (slug: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  // Link ze stopki (/regulaminy#nazwa): rozwija ten regulamin i przewija do niego. Regulaminy
  // dochodzą z bazy po załadowaniu strony, więc robimy to dopiero, gdy się pojawią - i przy
  // każdej zmianie kotwicy (klik w stopce, będąc już na tej stronie).
  useEffect(() => {
    if (!data?.length) return;
    const openFromHash = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      if (!slug || !data.some((r) => regulationSlug(r.title) === slug)) return;
      setOpen((prev) => new Set(prev).add(slug));
      requestAnimationFrame(() => document.getElementById(slug)?.scrollIntoView());
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [data]);

  return (
    <PageLayout eyebrow="Regulaminy" title="Regulaminy" accent="studia.">
      <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10 md:pb-32">
        {isLoading ? (
          <EmptyState>Ładowanie regulaminów…</EmptyState>
        ) : isError || !items.length ? (
          <EmptyState>Regulaminy pojawią się tu wkrótce.</EmptyState>
        ) : (
          <div className="flex max-w-4xl flex-col gap-4">
            {items.map((r) => {
              const slug = regulationSlug(r.title);
              const expanded = open.has(slug);
              return (
                <article key={r.id} id={slug} className="card-surface scroll-mt-28">
                  <h2>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`${slug}-tresc`}
                      onClick={() => toggle(slug)}
                      className="group flex w-full items-center justify-between gap-6 p-6 text-left md:p-8"
                    >
                      <span>
                        <span className="font-display block text-2xl transition-colors group-hover:text-primary md:text-3xl">
                          {r.title}
                        </span>
                        <span className="mt-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          Aktualizacja: {formatDate(r.updated_at)}
                        </span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-6 shrink-0 text-primary transition-transform duration-300",
                          expanded && "rotate-180",
                        )}
                      />
                    </button>
                  </h2>
                  {/* Płynne rozwijanie: wiersz siatki 0fr → 1fr. */}
                  <div
                    id={`${slug}-tresc`}
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden" inert={!expanded}>
                      <div className="whitespace-pre-line border-t border-border px-6 pb-8 pt-6 leading-relaxed text-muted-foreground md:px-8">
                        {r.body}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </PageLayout>
  );
}
