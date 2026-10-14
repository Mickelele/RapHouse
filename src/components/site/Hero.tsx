import { useCallback, useEffect, useRef, useState } from "react";
import heroStudio from "@/assets/hero-studio.jpg";
import logo from "@/assets/raphouse-logo.png";
import { cn } from "@/lib/utils";
import { MicSequence } from "./MicSequence";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  // Przy włączonym w systemie ograniczeniu animacji: zwykła sekcja, mikrofon złożony.
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    setAnimate(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Sekcja jest wyższa od ekranu, a jej zawartość przyklejona (sticky) - przewijanie przez ten
  // dodatkowy zakres rozbiera mikrofon (0 = złożony, 1 = rozłożony), potem strona jedzie dalej.
  const getProgress = useCallback(() => {
    const el = sectionRef.current;
    if (!el || !animate) return 0;
    const r = el.getBoundingClientRect();
    const range = r.height - window.innerHeight;
    return range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0;
  }, [animate]);

  return (
    <section id="top" ref={sectionRef} className={cn("relative", animate && "h-[240svh]")}>
      <div className="grain sticky top-0 flex min-h-[100svh] items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroStudio}
            alt="Kabina nagraniowa studia RapHouse w Warszawie"
            width={1536}
            height={1152}
            className="size-full scale-105 object-cover opacity-70"
          />
          <div className="absolute inset-0" style={{ background: "var(--gradient-fade)" }} />
          <div className="absolute inset-0 bg-background/40" />
        </div>

        {/* Mikrofon: na desktopie prawa kolumna, na telefonie w tle za tekstem. */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[70%] items-center justify-center pt-20 opacity-45 sm:w-[55%] lg:w-[46%] lg:opacity-100">
          <div className="absolute size-[60%] rounded-full bg-primary/15 blur-3xl" />
          <MicSequence getProgress={getProgress} className="relative h-[82%] w-full" />
        </div>

        <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-16 pt-32 md:px-10 md:pb-20">
          <div className="lg:max-w-[56%]">
            <p className="eyebrow mb-6">Studio nagrań · Warszawa</p>
            <h1 className="font-display text-[clamp(3rem,11vw,10rem)] lg:text-[clamp(4rem,7vw,7.5rem)]">
              Nagraj to.
              <br />
              <span className="text-primary">Co masz</span> w głowie.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Profesjonalne studio nagrań w Warszawie dla artystów, którzy chcą brzmieć dobrze - od
              pierwszego take'a po finalny master.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#kontakt" className="btn-base btn-accent">
                Zarezerwuj sesję
              </a>
              <a href="#cennik" className="btn-base btn-ghost-line">
                Zobacz cennik
              </a>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            <span>Warszawa / Polska</span>
            <span className="hidden md:inline">Nagrania • Mix • Mastering</span>
            <img src={logo} alt="RapHouse" className="h-8 w-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
