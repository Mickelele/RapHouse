import { Play } from "lucide-react";
import { contact, portfolio } from "@/data/raphouse";
import { Reveal } from "./Reveal";

function Waveform() {
  const bars = Array.from({ length: 34 }, (_, i) => 18 + ((i * 37) % 70));
  return (
    <div className="flex h-10 items-end gap-[3px]">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-border transition-colors duration-300 group-hover:bg-primary/70"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export function Portfolio() {
  return (
    <section id="realizacje" className="surface-deep border-y border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <Reveal>
          <p className="eyebrow mb-6">Realizacje</p>
          <h2 className="font-display max-w-4xl text-[clamp(2.5rem,6vw,5rem)]">
            Co tu <span className="text-primary">powstało.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {portfolio.map((track, i) => (
            <Reveal key={track.title} delay={(i % 4) * 80}>
              <a
                href={contact.youtube}
                target="_blank"
                rel="noreferrer"
                className="card-surface group flex h-full flex-col justify-between gap-8 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                      {track.artist}
                    </p>
                    <h3 className="font-display mt-2 text-2xl leading-tight">{track.title}</h3>
                  </div>
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border transition-colors group-hover:border-primary group-hover:text-primary">
                    <Play className="size-4" />
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{track.desc}</p>
                <Waveform />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
