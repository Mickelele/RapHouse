import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Phone } from "lucide-react";
import { BookingCalendar } from "@/components/site/BookingCalendar";
import { PageLayout } from "@/components/site/PageLayout";
import { contact } from "@/data/raphouse";
import { PUBLIC_CALENDAR_URL } from "@/lib/availability";

const title = "Rezerwacja - wolne terminy studia RapHouse | Warszawa";
const description =
  "Sprawdź wolne terminy studia nagrań RapHouse w Warszawie - widok miesięczny i tygodniowy. Wynajem studia i sesje z realizatorem.";

export const Route = createFileRoute("/rezerwacja")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: BookingPage,
});

function BookingPage() {
  return (
    <PageLayout
      eyebrow="Rezerwacja"
      title="Sprawdź"
      accent="wolne terminy."
      intro="Wynajem studia albo sesja z realizatorem - zobacz, kiedy studio jest wolne, i zadzwoń, żeby zarezerwować termin."
    >
      <section className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10 md:pb-32">
        <div className="mb-8 flex flex-wrap gap-3">
          <a href={contact.phoneHref} className="btn-base btn-accent">
            <Phone className="size-4" /> {contact.phone}
          </a>
          <a
            href={PUBLIC_CALENDAR_URL}
            target="_blank"
            rel="noreferrer"
            className="btn-base btn-ghost-line"
          >
            <ExternalLink className="size-4" /> Kalendarz RapApp
          </a>
        </div>
        <BookingCalendar />
      </section>
    </PageLayout>
  );
}
