import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { PageLayout } from "@/components/site/PageLayout";
import { Skeleton } from "@/components/site/Skeleton";
import { useGalleryImages, useGear, type GearItem } from "@/lib/content";

const title = "Sprzęt - studio nagrań RapHouse Warszawa";
const description =
  "Sprzęt studia RapHouse: Apollo Twin, Warm Audio WA-47F, odsłuchy KRK, Cubase, FL Studio, Auto-Tune, FabFilter, iZotope Ozone.";

export const Route = createFileRoute("/sprzet")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: GearPage,
});

// Sprzęt pogrupowany po rodzaju (pole "Rodzaj" w panelu), w kolejności z panelu.
function groupByTag(gear: GearItem[]) {
  const groups = new Map<string, string[]>();
  for (const g of gear) {
    const tag = g.tag?.trim() || "Inne";
    groups.set(tag, [...(groups.get(tag) ?? []), g.name]);
  }
  return [...groups];
}

function GearPage() {
  const gear = useGear();
  const gallery = useGalleryImages();

  return (
    <PageLayout
      eyebrow="Sprzęt"
      title="Sprzęt, który"
      accent="robi robotę."
      intro="Apollo Twin pozwala sterować odsłuchem z kabiny przez UAD Console i nagrywać z przedwzmacniaczami UNISON oraz efektami w czasie rzeczywistym - bez odczuwalnych opóźnień. Ślady zostają czyste, więc na miksie masz pełną swobodę."
    >
      <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10 md:pb-32">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {!gear &&
            Array.from({ length: 6 }, (_, i) => (
              <li key={i}>
                <Skeleton className="h-40 w-full" />
              </li>
            ))}
          {groupByTag(gear ?? []).map(([tag, names]) => (
            <li key={tag} className="card-surface p-6 md:p-7">
              <p className="eyebrow mb-4">{tag}</p>
              <ul className="flex flex-col gap-2">
                {names.map((name) => (
                  <li key={name} className="font-display text-2xl leading-tight">
                    {name}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        {gallery?.length !== 0 && (
          <div className="mt-16">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-[clamp(2rem,4.5vw,3.5rem)]">
                Zajrzyj <span className="text-primary">do środka.</span>
              </h2>
              <a href="/galeria" className="btn-base btn-ghost-line">
                Zobacz całą galerię <ArrowRight className="size-4" />
              </a>
            </div>
            <GalleryGrid
              images={gallery?.slice(0, 4) ?? null}
              loadingCount={4}
              className="md:grid-cols-4 xl:grid-cols-4"
            />
          </div>
        )}
      </section>
    </PageLayout>
  );
}
