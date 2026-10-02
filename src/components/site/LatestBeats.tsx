import { ArrowRight } from "lucide-react";
import { useLatestBeats } from "@/lib/content";
import { BeatCard } from "./BeatCard";
import { Reveal } from "./Reveal";

export function LatestBeats() {
  const { data } = useLatestBeats(3);
  if (!data?.length) return null;

  return (
    <section id="najnowsze-bity" className="surface-deep border-y border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <Reveal>
          <p className="eyebrow mb-6">Najnowsze bity</p>
          <h2 className="font-display max-w-4xl text-[clamp(2.5rem,6vw,5rem)]">
            Świeżo <span className="text-primary">z produkcji.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((beat, i) => (
            <Reveal key={beat.id} delay={i * 80}>
              <BeatCard beat={beat} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="mt-12">
          <a href="/bity" className="btn-base btn-ghost-line">
            Zobacz wszystkie bity <ArrowRight className="size-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
