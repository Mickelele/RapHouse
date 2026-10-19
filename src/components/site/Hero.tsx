import { useCallback, useEffect, useRef, useState } from "react";
import heroStudio from "@/assets/hero-studio.webp";
import logo from "@/assets/raphouse-logo.webp";
import { MicSequence } from "./MicSequence";
import { Reveal } from "./Reveal";

/**
 * Desktop: dwie kolumny - po lewej zwykle przewijana treść (wstęp + "To nie jest tylko studio"),
 * po prawej mikrofon przyklejony do ekranu (sticky), rozbierany w rytm przewijania sekcji.
 * Telefon: mikrofon to osobny blok między wstępem a "Ruchem", rozkładany, gdy przejeżdża przez
 * ekran - bez sticky, z którym przeglądarki w aplikacjach (Messenger, Instagram) na iOS
 * dublują i przesuwają treść.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const micRef = useRef<HTMLDivElement>(null);
  // Przy włączonym w systemie ograniczeniu animacji mikrofon zostaje złożony.
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    setAnimate(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // 0 = złożony, 1 = rozłożony.
  const getProgress = useCallback(() => {
    if (!animate) return 0;
    const vh = window.innerHeight;
    if (window.matchMedia("(min-width: 1024px)").matches) {
      // Desktop: cała sekcja (mikrofon przyklejony obok przewijanej treści).
      const r = sectionRef.current?.getBoundingClientRect();
      const range = r ? r.height - vh : 0;
      return r && range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0;
    }
    // Telefon: blok z mikrofonem - start, gdy wjeżdża od dołu (80% ekranu),
    // koniec, gdy jego góra dojeżdża prawie do góry ekranu.
    const r = micRef.current?.getBoundingClientRect();
    if (!r || r.height === 0) return 0;
    return Math.min(1, Math.max(0, (0.8 * vh - r.top) / (0.75 * vh)));
  }, [animate]);

  return (
    <section id="top" ref={sectionRef} className="relative">
      {/* Zdjęcie studia tylko na desktopie, pod pierwszym ekranem (telefon go nie pobiera). */}
      <div className="absolute inset-x-0 top-0 hidden h-[100svh] overflow-hidden lg:right-[46%] lg:block">
        <picture>
          <source media="(min-width: 1024px)" srcSet={heroStudio} />
          <img
            src="data:image/gif;base64,R0lGODlhAQABAAAAACw="
            alt=""
            width={1536}
            height={1152}
            className="size-full scale-105 object-cover opacity-70"
          />
        </picture>
        <div className="absolute inset-0" style={{ background: "var(--gradient-fade)" }} />
        <div className="absolute inset-0 bg-background/40" />
        {/* Desktop: zdjęcie płynnie znika w stronę mikrofonu (prawa strona = zwykłe tło strony). */}
        <div className="absolute inset-y-0 right-0 hidden w-48 bg-gradient-to-r from-transparent to-background lg:block" />
      </div>

      <div className="relative mx-auto grid max-w-[1400px] px-5 md:px-10 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
        <div className="relative">
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

          {/* Mikrofon. Telefon: osobny blok w treści. Desktop: wyniesiony do prawej kolumny
              (obok lewej, na całą wysokość sekcji), w środku przyklejony do ekranu. */}
          <div
            ref={micRef}
            className="pointer-events-none relative h-[78svh] lg:absolute lg:inset-y-0 lg:left-[calc(100%+2.5rem)] lg:h-auto lg:w-[87%]"
          >
            <div className="flex h-full items-center justify-center lg:sticky lg:top-0 lg:h-[100svh] lg:pl-[12%] lg:pt-16">
              {/* Canvas maluje tło kolorem strony (patrz MicSequence), więc nie ma prostokąta. */}
              <MicSequence
                getProgress={getProgress}
                className="relative h-full w-full lg:h-[94%]"
              />
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
