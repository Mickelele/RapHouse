import { useState } from "react";
import studioMic from "@/assets/studio-mic.jpg";
import studioDetail from "@/assets/studio-detail.jpg";
import { gear } from "@/data/raphouse";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

export function Studio() {
  const [active, setActive] = useState(0);

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
      <div className="grid gap-6 md:grid-cols-12">
        <Reveal className="md:col-span-7">
          <div className="grain overflow-hidden rounded-lg border border-border">
            <img
              src={studioMic}
              alt="Mikrofon pojemnościowy w kabinie nagraniowej RapHouse"
              width={1024}
              height={1280}
              loading="lazy"
              className="h-[55vh] w-full object-cover md:h-[78vh]"
            />
          </div>
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
              przedwzmacniaczami UNISON oraz efektami w czasie rzeczywistym — bez odczuwalnych
              opóźnień. Ślady zostają czyste, więc na miksie masz pełną swobodę.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <ul className="divide-y divide-border border-y border-border">
              {gear.map((g, i) => (
                <li key={g.name}>
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

          <Reveal delay={200}>
            <div className="grain overflow-hidden rounded-lg border border-border">
              <img
                src={studioDetail}
                alt="Odsłuchy studyjne i adaptacja akustyczna w RapHouse"
                width={1024}
                height={1024}
                loading="lazy"
                className="h-56 w-full object-cover md:h-72"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
