import { useEffect, useState } from "react";
import heroStudio from "@/assets/hero-studio.jpg";
import logo from "@/assets/raphouse-logo.png";

export function Hero() {
  const [offset, setOffset] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  // Napisy rozjeżdżają się szybciej niż przewijanie, żeby efekt był wyraźny.
  // Limit: dalej napisy i tak są poza ekranem, a ogromne przesunięcia tylko obciążają przeglądarkę.
  const slide = reduceMotion ? 0 : Math.min(offset, 1500) * 0.9;

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setOffset(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="top" className="grain relative flex min-h-[100svh] items-end overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroStudio}
          alt="Kabina nagraniowa studia RapHouse w Warszawie"
          width={1536}
          height={1152}
          className="size-full object-cover opacity-70"
          style={{ transform: `translate3d(0, ${offset * 0.15}px, 0) scale(1.08)` }}
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-fade)" }} />
        <div className="absolute inset-0 bg-background/40" />
      </div>

      <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-16 pt-32 md:px-10 md:pb-20">
        <p className="eyebrow mb-6">Studio nagrań · Warszawa</p>
        {/* Przy przewijaniu górna linia ucieka w lewo, dolna w prawo. */}
        <h1 className="font-display text-[clamp(3rem,11vw,10rem)]">
          <span
            className="block will-change-transform"
            style={{ transform: `translate3d(${-slide}px, 0, 0)` }}
          >
            Nagraj to.
          </span>
          <span
            className="block will-change-transform"
            style={{ transform: `translate3d(${slide}px, 0, 0)` }}
          >
            <span className="text-primary">Co masz</span> w głowie.
          </span>
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
    </section>
  );
}
