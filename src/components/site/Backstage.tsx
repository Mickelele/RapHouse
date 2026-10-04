import { backstage } from "@/data/features";
import { GalleryGrid } from "./GalleryGrid";
import { Reveal } from "./Reveal";
import { YouTubeLite } from "./YouTubeLite";

export function Backstage() {
  const { intro, photos, videos } = backstage;
  if (!photos.length && !videos.length) return null;

  return (
    <section id="kulisy" className="surface-deep border-y border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <Reveal>
          <p className="eyebrow mb-6">Kulisy</p>
          <h2 className="font-display max-w-4xl text-[clamp(2.5rem,6vw,5rem)]">
            Zza <span className="text-primary">kulis.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{intro}</p>
        </Reveal>

        {videos.length > 0 && (
          <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {videos.map((v, i) => (
              <Reveal key={v.video} delay={(i % 3) * 80}>
                <figure className="flex flex-col gap-3">
                  <YouTubeLite video={v.video} title={v.title} />
                  <figcaption className="text-sm text-muted-foreground">{v.title}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}

        {photos.length > 0 && (
          <Reveal delay={120} className={videos.length ? "mt-6" : "mt-14"}>
            <GalleryGrid images={photos} className="xl:grid-cols-4" />
          </Reveal>
        )}
      </div>
    </section>
  );
}
