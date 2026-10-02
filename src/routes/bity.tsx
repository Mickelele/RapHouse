import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageLayout } from "@/components/site/PageLayout";
import { BeatCard } from "@/components/site/BeatCard";
import { Reveal } from "@/components/site/Reveal";
import { contact } from "@/data/raphouse";
import { useBeatCategories, useBeats, usePricing } from "@/lib/content";
import { cn } from "@/lib/utils";

const title = "Bity — katalog i bity na zamówienie | RapHouse Warszawa";
const description =
  "Katalog bitów RapHouse w różnych klimatach oraz bity produkowane od podstaw na zamówienie. Producent Jezzy.C.";

export const Route = createFileRoute("/bity")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: BeatsPage,
});

// Cena z cennika (edytowalnego w panelu) po tytule pozycji.
function usePrice(name: string) {
  return usePricing().find((p) => p.title === name)?.lines[0]?.price;
}

function BeatsPage() {
  return (
    <PageLayout
      eyebrow="Bity"
      title="Bity"
      accent="z RapHouse."
      intro="Wybierz bit z katalogu albo zamów produkcję od podstaw — pod Twój numer, klimat i tempo."
    >
      <Catalog />
      <CustomBeat />
      <Producer />
    </PageLayout>
  );
}

function Catalog() {
  const { data, isLoading, isError } = useBeats();
  const catalogPrice = usePrice("Bity z katalogu");
  const { data: allCategories } = useBeatCategories();
  const [category, setCategory] = useState<string | null>(null);

  // Tylko kategorie, w których są bity — w kolejności ustawionej w panelu.
  const categories = useMemo(() => {
    const used = new Set((data ?? []).map((b) => b.category));
    return (allCategories ?? []).map((c) => c.name).filter((n) => used.has(n));
  }, [data, allCategories]);
  const beats = (data ?? []).filter((b) => !category || b.category === category);

  return (
    <section id="katalog" className="surface-deep border-y border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
        <Reveal>
          <p className="eyebrow mb-6">Katalog bitów</p>
          <h2 className="font-display text-[clamp(2.25rem,5vw,4rem)]">
            Posłuchaj <span className="text-primary">i wybierz.</span>
          </h2>
          <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
            Bity w różnych klimatach, brzmieniach i tempach
            {catalogPrice && <> — w cenach {catalogPrice}</>}. Spodobał Ci się któryś? Zadzwoń albo
            napisz, podając tytuł bitu — wrócimy z finalną wyceną.
          </p>
        </Reveal>

        {categories.length > 1 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {[null, ...categories].map((c) => (
              <button
                key={c ?? "all"}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors",
                  category === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary hover:text-foreground",
                )}
              >
                {c ?? "Wszystkie"}
              </button>
            ))}
          </div>
        )}

        <div className="mt-10">
          {isLoading ? (
            <EmptyState>Ładowanie bitów…</EmptyState>
          ) : isError ? (
            <EmptyState>Nie udało się pobrać katalogu. Spróbuj odświeżyć stronę.</EmptyState>
          ) : !beats.length ? (
            <EmptyState>
              Katalog jest w przygotowaniu. Zadzwoń:{" "}
              <a href={contact.phoneHref} className="text-primary">
                {contact.phone}
              </a>
            </EmptyState>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {beats.map((beat, i) => (
                <Reveal key={beat.id} delay={(i % 3) * 80}>
                  <BeatCard beat={beat} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CustomBeat() {
  const customPrice = usePrice("Bit na zamówienie");
  return (
    <section id="na-zamowienie" className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
      <Reveal>
        <div className="card-surface grid gap-10 p-8 md:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow">Bit na zamówienie</p>
            <h2 className="font-display mt-4 text-4xl md:text-6xl">
              Od zera, <span className="text-primary">pod Ciebie.</span>
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
              Producent tworzy bit od podstaw — pod Twój numer, klimat, tempo, a nawet pod gotową
              acapellę. Masz realny wpływ na każdy element brzmienia.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-6 lg:flex-col lg:items-end">
            {customPrice && (
              <p className="font-display text-4xl text-primary md:text-5xl">{customPrice}</p>
            )}
            <a href={contact.phoneHref} className="btn-base btn-accent">
              Zadzwoń i zamów
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const artists =
  "Alberto, ReTo, Filipek, VNM, Bonus RPK, Zbuku, Hades, DJ Kebs, Kuba Knap, Frosti, WdoWA, Epis DYM KNF, Rufuz, Bober i wielu innych.";

function Producer() {
  return (
    <section id="producent" className="surface-deep border-t border-border">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <p className="eyebrow mb-6">Producent</p>
          <h2 className="font-display text-[clamp(3rem,8vw,6.5rem)]">
            Jezzy<span className="text-primary">.C</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Blisko 300 utworów z premierą na koncie.
          </p>
        </Reveal>
        <Reveal delay={90}>
          <dl className="flex flex-col gap-8">
            <div>
              <dt className="eyebrow mb-3">Wykształcenie</dt>
              <dd className="leading-relaxed text-muted-foreground">
                Państwowa Szkoła Muzyczna I stopnia w Sanoku (perkusja, fortepian, keyboard) oraz
                studia „Music Production BSc” w Derby (UK) — produkcja i realizacja muzyki,
                akustyka, prawo autorskie.
              </dd>
            </div>
            <div>
              <dt className="eyebrow mb-3">Wykonawcy na bitach</dt>
              <dd className="leading-relaxed text-muted-foreground">{artists}</dd>
            </div>
            <div>
              <dt className="eyebrow mb-3">Inne współprace</dt>
              <dd className="leading-relaxed text-muted-foreground">
                Step, Asfalt, QueQuality, DeNekstBest, MaxFlo Records &amp; Środowisko Miejskie.
                Muzyka do reklam odzieżowych i do podcastu Lecha Poznań „Mecz? I co dalej”.
              </dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
