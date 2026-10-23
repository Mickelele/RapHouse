import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageLayout } from "@/components/site/PageLayout";
import { AudioGrid } from "@/components/site/Portfolio";
import { useAudioProjects } from "@/lib/content";

const title = "Realizacje - nagrania, mix i mastering z RapHouse | Studio nagrań Warszawa";
const description =
  "Numery nagrane, zmiksowane i zmasterowane w studiu RapHouse w Warszawie. Posłuchaj, jak brzmią nasze realizacje.";

export const Route = createFileRoute("/realizacje")({
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
  const { items, isLoading, isError } = useAudioProjects();

  return (
    <PageLayout
      eyebrow="Realizacje"
      title="Co tu"
      accent="powstało."
      intro="Numery nagrane, zmiksowane i zmasterowane u nas - od oldschoolu po trap. Teledyski znajdziesz w zakładce Klipy."
    >
      <section className="mx-auto max-w-[1400px] overflow-x-clip px-5 pb-24 md:px-10 md:pb-32">
        {isLoading ? (
          <EmptyState>Ładowanie realizacji…</EmptyState>
        ) : isError ? (
          <EmptyState>Nie udało się pobrać realizacji. Spróbuj odświeżyć stronę.</EmptyState>
        ) : (
          <AudioGrid items={items} />
        )}
        <div className="mt-12 flex flex-wrap gap-3">
          <a href="/rezerwacja" className="btn-base btn-accent">
            Rezerwuj
          </a>
          <a href="/klipy" className="btn-base btn-ghost-line">
            Zobacz klipy
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
