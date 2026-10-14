import { useCallback, useEffect, useRef, useState } from "react";
import heroStudio from "@/assets/hero-studio.jpg";
import logo from "@/assets/raphouse-logo.png";
import { MicSequence } from "./MicSequence";
import { Reveal } from "./Reveal";

/**
 * Dwie kolumny: po lewej zwykle przewijana treść (wstęp + "To nie jest tylko studio"),
 * po prawej mikrofon przyklejony do ekranu (sticky), rozbierany w rytm przewijania sekcji.
 * Na telefonie mikrofon stoi w tle za tekstem.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  // Przy włączonym w systemie ograniczeniu animacji mikrofon zostaje złożony.
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    setAnimate(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // 0 = złożony (początek sekcji), 1 = rozłożony (koniec sekcji).
  const getProgress = useCallback(() => {
    const el = sectionRef.current;
    if (!el || !animate) return 0;
    const r = el.getBoundingClientRect();
    const range = r.height - window.innerHeight;
    return range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0;
  }, [animate]);

  return (
    <section id="top" ref={sectionRef} className="grain relative">
      {/* Zdjęcie studia tylko pod pierwszym ekranem. */}
      <div className="absolute inset-x-0 top-0 h-[100svh] overflow-hidden lg:right-[46%]">
        <img
          src={heroStudio}
          alt=""
          width={1536}
          height={1152}
          className="size-full scale-105 object-cover opacity-70"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-fade)" }} />
        <div className="absolute inset-0 bg-background/40" />
        {/* Desktop: zdjęcie płynnie znika w stronę mikrofonu (prawa strona = zwykłe tło strony). */}
        <div className="absolute inset-y-0 right-0 hidden w-48 bg-gradient-to-r from-transparent to-background lg:block" />
      </div>

      <div className="relative mx-auto grid max-w-[1400px] px-5 md:px-10 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
        {/* Mikrofon: prawa kolumna na desktopie, tło za tekstem na telefonie. */}
        <div className="pointer-events-none absolute inset-0 lg:relative lg:inset-auto lg:order-2">
          <div className="sticky top-0 ml-auto flex h-[100svh] w-[70%] items-center justify-center pt-16 opacity-45 sm:w-[55%] lg:w-full lg:opacity-100">
            <div className="absolute size-[60%] rounded-full bg-primary/15 blur-3xl lg:hidden" />
            {/* Canvas maluje tło kolorem strony (patrz MicSequence); na telefonie brzegi wygaszone maską. */}
            <MicSequence
              getProgress={getProgress}
              className="relative h-[94%] w-full max-lg:[mask-image:radial-gradient(closest-side,black_65%,transparent)]"
            />
          </div>
        </div>

        <div className="relative lg:order-1">
          {/* 1. Wstęp */}
          <div className="flex min-h-[100svh] flex-col justify-end pb-16 pt-32 md:pb-20">
            <p className="eyebrow mb-6">Studio nagrań · Warszawa</p>
            <h1 className="font-display text-[clamp(3rem,11vw,10rem)] lg:text-[clamp(3.5rem,5.8vw,5.5rem)]">
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

            <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              <span>Warszawa / Polska</span>
              <span className="hidden md:inline">Nagrania • Mix • Mastering</span>
              <img src={logo} alt="RapHouse" className="h-8 w-auto" />
            </div>
          </div>

          {/* 2. To nie jest tylko studio (dawna osobna sekcja "Ruch") */}
          <div
            id="studio"
            className="flex min-h-[100svh] scroll-mt-20 flex-col justify-center py-24"
          >
            <Reveal>
              <p className="eyebrow mb-6">Ruch</p>
              <h2 className="font-display text-[clamp(2.5rem,6vw,5.5rem)]">
                To nie jest
                <br />
                tylko studio.
                <br />
                <span className="text-primary">To ruch.</span>
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                RapHouse to przestrzeń dla ludzi, którzy kochają muzykę, rap i rozwój. Nagrywamy,
                miksujemy, masterujemy, dzielimy się wiedzą i budujemy społeczność wokół muzyki.
                Zbudowaliśmy miejsce z klimatem, ale wierzymy, że klimat tworzą ludzie.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
