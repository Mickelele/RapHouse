import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useGalleryImages, useGear } from "@/lib/content";
import { GalleryGrid } from "./GalleryGrid";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

const GALLERY_COUNT = 5;

export function Studio() {
  const [active, setActive] = useState(0);
  const gear = useGear();
  const gallery = useGalleryImages();

  return (
    <section
      id="galeria"
      className="mx-auto max-w-[1400px] scroll-mt-20 px-5 py-24 md:px-10 md:py-32"
    >
      <div className="grid gap-6 md:grid-cols-12">
        {/* Zdjęcia z galerii (panel admina → Galeria, pierwsze 5): duże + rząd czterech. */}
        <Reveal className="md:col-span-7">
          <GalleryGrid
            images={gallery.slice(0, GALLERY_COUNT)}
            className="grid-cols-4 md:grid-cols-4 xl:grid-cols-4 [&>li:first-child]:col-span-4 [&>li:first-child>button]:aspect-[4/3]"
          />
          <a href="/galeria" className="btn-base btn-ghost-line mt-6">
            Zobacz całą galerię <ArrowRight className="size-4" />
          </a>
        </Reveal>

        <div className="flex flex-col gap-6 md:col-span-5">
          <Reveal delay={100}>
            <p className="eyebrow mb-5">Sprzęt</p>
            <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)]">
              Sprzęt, który
              <br />
              <span className="text-primary">robi robotę.</span>
            </h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              Apollo Twin pozwala sterować odsłuchem z kabiny przez UAD Console i nagrywać z
              przedwzmacniaczami UNISON oraz efektami w czasie rzeczywistym - bez odczuwalnych
              opóźnień. Ślady zostają czyste, więc na miksie masz pełną swobodę.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <ul className="divide-y divide-border border-y border-border">
              {gear.map((g, i) => (
                <li key={`${g.name}-${i}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="flex w-full items-baseline justify-between gap-4 py-3 text-left"
                  >
                    <span
                      className={cn(
                        "font-display text-xl transition-colors md:text-2xl",
                        active === i ? "text-primary" : "text-foreground",
                      )}
                    >
                      {g.name}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      {g.tag}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
