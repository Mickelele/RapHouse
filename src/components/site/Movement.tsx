import studioDesk from "@/assets/studio-desk.jpg";
import { Reveal } from "./Reveal";

export function Movement() {
  return (
    <section id="studio" className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-end">
        <Reveal>
          <p className="eyebrow mb-6">Movement</p>
          <h2 className="font-display text-[clamp(2.5rem,6vw,5.5rem)]">
            To nie jest
            <br />
            tylko studio.
            <br />
            <span className="text-primary">To movement.</span>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            RapHouse to przestrzeń dla ludzi, którzy kochają muzykę, rap i rozwój. Nagrywamy,
            miksujemy, masterujemy, dzielimy się wiedzą i budujemy społeczność wokół muzyki.
            Zbudowaliśmy miejsce z klimatem, ale wierzymy, że klimat tworzą ludzie.
          </p>
        </Reveal>
      </div>

      <Reveal delay={80} className="mt-16">
        <div className="grain overflow-hidden rounded-lg border border-border">
          <img
            src={studioDesk}
            alt="Realizatorka RapHouse — konsola, interface Apollo Twin i odsłuchy"
            width={1280}
            height={960}
            loading="lazy"
            className="h-[42vh] w-full object-cover md:h-[70vh]"
          />
        </div>
      </Reveal>
    </section>
  );
}
