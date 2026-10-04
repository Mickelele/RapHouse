import { ArrowRight } from "lucide-react";
import { services } from "@/data/raphouse";
import { Reveal } from "./Reveal";

function Wave() {
  return (
    <div className="flex h-8 items-end gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <span
          key={i}
          className="wave-bar w-1 rounded-full bg-primary"
          style={{ height: "100%", animationDelay: `${i * 0.09}s` }}
        />
      ))}
    </div>
  );
}

export function Services() {
  return (
    <section id="oferta" className="surface-deep border-y border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <Reveal>
          <p className="eyebrow mb-6">Usługi</p>
          <h2 className="font-display max-w-3xl text-[clamp(2.5rem,6vw,5rem)]">
            Co możesz tu zrobić.
          </h2>
        </Reveal>

        {/* Flex zamiast grida: przy nieparzystej liczbie kart ostatnia rozciąga się na całą szerokość. */}
        <div className="mt-14 flex flex-wrap gap-4">
          {services.map((s, i) => (
            <Reveal
              key={s.no}
              delay={(i % 4) * 90}
              className="grow basis-full md:basis-[calc(50%-0.5rem)]"
            >
              <a
                href={s.href ?? "#kontakt"}
                className="card-surface group flex h-full flex-col justify-between gap-10 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary md:p-10"
              >
                <div className="flex items-start justify-between gap-6">
                  <span className="font-display text-5xl text-muted-foreground transition-colors group-hover:text-primary">
                    {s.no}
                  </span>
                  <Wave />
                </div>
                <div>
                  <h3 className="font-display text-3xl md:text-4xl">{s.title}</h3>
                  <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">{s.desc}</p>
                  {s.items && (
                    <ul
                      className="mt-6 flex flex-wrap gap-2"
                      aria-label={`W ramach usługi ${s.title}`}
                    >
                      {s.items.map((item) => (
                        <li
                          key={item}
                          className="rounded border border-border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {s.price && <p className="font-display mt-6 text-2xl text-primary">{s.price}</p>}
                  <span className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                    {s.cta}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
