import { ArrowRight } from "lucide-react";
import { contact } from "@/data/raphouse";
import { trackFeedback } from "@/data/features";
import { Reveal } from "./Reveal";

export function TrackFeedback() {
  const { intro, steps, price, cta } = trackFeedback;

  return (
    <section id="feedback" className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <Reveal>
          <p className="eyebrow mb-6">Feedback</p>
          <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)]">
            Feedback Waszych <span className="text-primary">tracków.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{intro}</p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <a href="#kontakt" className="btn-base btn-accent">
              {cta} <ArrowRight className="size-4" />
            </a>
            <a
              href={contact.phoneHref}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              lub zadzwoń: {contact.phone}
            </a>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <ol className="flex flex-col gap-3">
            {steps.map((step, i) => (
              <li key={step} className="card-surface flex gap-5 p-6">
                <span className="font-display text-3xl text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="leading-relaxed text-muted-foreground">{step}</p>
              </li>
            ))}
          </ol>
          {price && <p className="font-display mt-6 text-2xl text-primary">{price}</p>}
        </Reveal>
      </div>
    </section>
  );
}
