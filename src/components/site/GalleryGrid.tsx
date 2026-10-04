import { useState } from "react";
import { gallerySrc, gallerySrcSet, type GalleryImage } from "@/data/gallery";
import { cn } from "@/lib/utils";
import { Lightbox } from "./Lightbox";

// Równa siatka (spójna z kartami na stronie); pełne, nieprzycięte zdjęcie pokazuje lightbox.
export function GalleryGrid({ images, className }: { images: GalleryImage[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <ul
        className={cn("grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 xl:grid-cols-4", className)}
      >
        {images.map((img, i) => (
          <li key={img.id}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Powiększ: ${img.alt}`}
              className="group block aspect-square w-full overflow-hidden rounded-md border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <img
                src={gallerySrc(img)}
                srcSet={gallerySrcSet(img)}
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                alt={img.alt}
                width={img.width}
                height={img.height}
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>
      {open !== null && (
        <Lightbox
          images={images}
          index={open}
          onIndex={(update) => setOpen((i) => (i === null ? null : update(i)))}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
