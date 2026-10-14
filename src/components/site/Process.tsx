import { process } from "@/data/raphouse";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { Reveal } from "./Reveal";

export function Process() {
  // Wiersze rozkładają się, gdy lista wjeżdża od dołu ekranu do ~40% jego wysokości.
  const list = useScrollProgress<HTMLDivElement>({ start: 0.95, end: 0.4 });
  return (
    <section className="surface-deep border-y border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <Reveal>
          <p className="eyebrow mb-6">Proces</p>
          <h2 className="font-display max-w-4xl text-[clamp(2.5rem,6vw,5rem)]">
            Od pierwszego take'a
            <br />
            <span className="text-primary">do finalnego masteru.</span>
          </h2>
        </Reveal>

        <div ref={list} className="fold-list mt-16 divide-y divide-border border-y border-border">
          {process.map((step, i) => (
            <div
              key={step.no}
              className="bg-[var(--surface-deep)]"
              style={{ "--i": i, "--dir": i % 2 ? -1 : 1 } as React.CSSProperties}
            >
              <div className="group grid gap-3 py-8 transition-colors md:grid-cols-[6rem_18rem_1fr] md:items-baseline md:gap-8">
                <span className="font-display text-4xl text-muted-foreground transition-colors group-hover:text-primary">
                  {step.no}
                </span>
                <h3 className="font-display text-3xl md:text-4xl">{step.title}</h3>
                <p className="max-w-xl leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
