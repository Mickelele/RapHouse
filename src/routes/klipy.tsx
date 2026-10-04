import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageLayout } from "@/components/site/PageLayout";
import { VideoGrid } from "@/components/site/Portfolio";
import { useProjects } from "@/lib/content";

const title = "Klipy — teledyski z RapHouse | Studio nagrań Warszawa";
const description =
  "Teledyski i klipy artystów nagrywających w RapHouse. Realizacja klipów od pomysłu po montaż.";

export const Route = createFileRoute("/klipy")({
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
  const { data, isLoading, isError } = useProjects();
  const clips = (data ?? []).filter((p) => p.category === "video");

  return (
    <PageLayout
      eyebrow="Klipy"
      title="Klipy"
      accent="z RapHouse."
      intro="Teledyski artystów, którzy nagrywali u nas. Chcesz klip do swojego numeru? Zrobimy go od pomysłu po montaż."
    >
      <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10 md:pb-32">
        {isLoading ? (
          <EmptyState>Ładowanie klipów…</EmptyState>
        ) : isError ? (
          <EmptyState>Nie udało się pobrać klipów. Spróbuj odświeżyć stronę.</EmptyState>
        ) : (
          <VideoGrid items={clips} />
        )}
        <div className="mt-12">
          <a href="/#kontakt" className="btn-base btn-accent">
            Zapytaj o klip
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
