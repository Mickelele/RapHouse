import { createFileRoute } from "@tanstack/react-router";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { PageLayout } from "@/components/site/PageLayout";
import { useGalleryImages } from "@/lib/content";

const title = "Galeria - studio nagrań RapHouse Warszawa";
const description =
  "Zobacz studio RapHouse od środka: kabina nagraniowa, stanowisko realizatora, sprzęt.";

export const Route = createFileRoute("/galeria")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const galleryImages = useGalleryImages();
  return (
    <PageLayout
      eyebrow="Galeria"
      title="Studio"
      accent="od środka."
      intro="Kabina, stanowisko realizatora i sprzęt, na którym powstają Wasze numery."
    >
      <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10 md:pb-32">
        <GalleryGrid images={galleryImages} />
      </section>
    </PageLayout>
  );
}
