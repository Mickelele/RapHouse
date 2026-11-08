import type { ReactNode } from "react";
import { ArrowRight, BadgePercent, Info } from "lucide-react";
import { usePricing } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { Skeleton } from "./Skeleton";

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
        {!pricing &&
          Array.from({ length: 8 }, (_, i) => (
            <Skeleton
              key={i}
              className="h-72 grow basis-full md:basis-[calc(50%-0.5rem)] xl:basis-[calc(25%-0.75rem)]"
            />
          ))}
        {pricing?.map((item, i) => (
          <Reveal
            key={item.title}
            delay={(i % 4) * 80}
            className="grow basis-full md:basis-[calc(50%-0.5rem)] xl:basis-[calc(25%-0.75rem)]"
          >
            <PriceCard link={item.link}>
              <div>
                <h3 className="font-display text-2xl">{item.title}</h3>
                {item.note && (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {item.note}
                  </p>
                )}
              </div>
              <ul className="mt-8 space-y-3 border-t border-border pt-5">
                {item.lines.map((line) => {
                  // Wariant z wyróżnieniem (np. pakiet) dostaje własną ramkę.
                  const featured = !!line.badge?.trim();
                  return (
                    <li
                      key={line.price + (line.label ?? "")}
                      className={cn(
                        featured && "-mx-3 rounded-md border border-primary/40 bg-primary/5 p-3",
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        {line.label && (
                          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            {line.label}
                          </span>
                        )}
                        <span className="font-display ml-auto text-2xl text-primary">
                          {line.price}
                        </span>
                      </div>
                      {featured && (
                        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
                          <BadgePercent className="size-3.5" />
                          {line.badge}
                        </span>
                      )}
                      {line.note?.trim() && (
                        <p className="mt-2 flex gap-1.5 text-xs leading-relaxed text-muted-foreground">
                          <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
                          {line.note}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
              {item.link && (
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  {item.link_label || "Zobacz więcej"}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </PriceCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// Karta z odnośnikiem (ustawianym w panelu admina) jest w całości klikalna.
function PriceCard({ link, children }: { link?: string | null | undefined; children: ReactNode }) {
  const className =
    "card-surface group flex h-full flex-col justify-between p-7 transition-colors duration-300 hover:border-primary";
  if (!link) return <div className={className}>{children}</div>;
  const external = /^https?:\/\//.test(link);
  return (
    <a
      href={link}
      className={`${className} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
