import { CalendarDays, ExternalLink, Phone } from "lucide-react";
import { contact } from "@/data/raphouse";
import { Reveal } from "./Reveal";

// Publiczny kalendarz wolnych terminów studia (wynajem / samoobsługa).
const CALENDAR_URL = "https://rapapp.base44.app/PublicCalendar";

export function AvailabilityCalendar() {
  return (
    <section
      id="dostepnosc"
      className="mx-auto max-w-[1400px] scroll-mt-20 px-5 pb-24 md:px-10 md:pb-32"
    >
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-6">Wynajem studia</p>
            <h2 className="font-display max-w-3xl text-[clamp(2.25rem,5vw,4rem)]">
              Sprawdź <span className="text-primary">wolne terminy.</span>
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
              Wynajmij studio bez realizatora i nagrywaj po swojemu. Zobacz, kiedy jest wolne, a
              potem zadzwoń i zarezerwuj termin.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={contact.phoneHref} className="btn-base btn-accent">
              <Phone className="size-4" /> Zarezerwuj termin
            </a>
            <a
              href={CALENDAR_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-base btn-ghost-line"
            >
              <ExternalLink className="size-4" /> Otwórz kalendarz
            </a>
          </div>
        </div>
      </Reveal>

      <Reveal delay={100} className="mt-10">
        <div className="card-surface relative overflow-hidden rounded-2xl">
          {/* Widoczne, zanim kalendarz się wczyta (ładuje się dopiero przy przewinięciu). */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 text-muted-foreground">
            <CalendarDays className="size-5" /> Ładowanie kalendarza…
          </div>
          <iframe
            src={CALENDAR_URL}
            title="Studio - dostępność terminów"
            loading="lazy"
            className="relative block h-[640px] w-full border-0 md:h-[700px]"
          />
        </div>
      </Reveal>
    </section>
  );
}
