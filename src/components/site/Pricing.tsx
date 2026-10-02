import { usePricing } from "@/lib/content";
import { Reveal } from "./Reveal";

export function Pricing() {
  const pricing = usePricing();
  return (
    <section id="cennik" className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
      <Reveal>
        <p className="eyebrow mb-6">Cennik</p>
        <h2 className="font-display max-w-3xl text-[clamp(2.5rem,6vw,5rem)]">
          Bez gwiazdek.
          <br />
          <span className="text-primary">Bez ukrytych kosztów.</span>
        </h2>
      </Reveal>

      {/* Flex zamiast grida: ostatni rząd rozciąga się na całą szerokość niezależnie od liczby kart. */}
      <div className="mt-14 flex flex-wrap gap-4">
        {pricing.map((item, i) => (
          <Reveal
            key={item.title}
            delay={(i % 4) * 80}
            className="grow basis-full md:basis-[calc(50%-0.5rem)] xl:basis-[calc(25%-0.75rem)]"
          >
            <div className="card-surface flex h-full flex-col justify-between p-7 transition-colors duration-300 hover:border-primary">
              <div>
                <h3 className="font-display text-2xl">{item.title}</h3>
                {item.note && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.note}</p>
                )}
              </div>
              <ul className="mt-8 space-y-2 border-t border-border pt-5">
                {item.lines.map((line) => (
                  <li
                    key={line.price + (line.label ?? "")}
                    className="flex items-baseline justify-between gap-4"
                  >
                    {line.label && (
                      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {line.label}
                      </span>
                    )}
                    <span className="font-display text-2xl text-primary">{line.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120} className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-border pt-10">
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            Dokładna wycena mixu/masteringu następuje po otrzymaniu plików i referencji — cena
            zaczyna się od 350 PLN.
          </p>
          <a href="#kontakt" className="btn-base btn-accent">
            Rezerwuj teraz
          </a>
        </div>
      </Reveal>
    </section>
  );
}
