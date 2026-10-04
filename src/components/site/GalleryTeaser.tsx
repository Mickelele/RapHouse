import { ArrowRight } from "lucide-react";
import { useGalleryImages } from "@/lib/content";
import { GalleryGrid } from "./GalleryGrid";
import { Reveal } from "./Reveal";

const TEASER_COUNT = 4;

// Zajawka galerii na stronie głównej — kilka zdjęć pod sekcją sprzętu.
export function GalleryTeaser() {
  const galleryImages = useGalleryImages();
  if (!galleryImages.length) return null;
  return (
    <section id="galeria" className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10 md:pb-32">
      <Reveal>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-4">Galeria</p>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.5rem)]">
              Zajrzyj <span className="text-primary">do środka.</span>
            </h2>
          </div>
          <a href="/galeria" className="btn-base btn-ghost-line">
            Zobacz galerię <ArrowRight className="size-4" />
          </a>
        </div>
        <GalleryGrid
          images={galleryImages.slice(0, TEASER_COUNT)}
          className="md:grid-cols-4 xl:grid-cols-4"
        />
      </Reveal>
    </section>
  );
}
