import { Youtube, Instagram } from "lucide-react";
import { contact } from "@/data/raphouse";
import { Reveal } from "./Reveal";

export function Community() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="eyebrow mb-6">Społeczność</p>
          <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)]">
            Więcej niż
            <br />
            <span className="text-primary">nagrania.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Muzyka to dopiero początek. Na naszym kanale publikujemy najlepsze numery, robimy
            transmisje live, słuchamy Waszych tracków i dajemy feedback, który realnie pcha do
            przodu.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={contact.youtube}
              target="_blank"
              rel="noreferrer"
              className="btn-base btn-accent"
            >
              <Youtube className="size-4" /> Wbijaj na YouTube
            </a>
            <a
              href={contact.instagram}
              target="_blank"
              rel="noreferrer"
              className="btn-base btn-ghost-line"
            >
              <Instagram className="size-4" /> Instagram
            </a>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: "Numery z RapHouse", tag: "Video" },
              { title: "Transmisje live", tag: "Transmisja" },
              { title: "Feedback Waszych tracków", tag: "Na żywo" },
              { title: "Kulisy sesji", tag: "Kulisy" },
            ].map((card) => (
              <a
                key={card.title}
                href={contact.youtube}
                target="_blank"
                rel="noreferrer"
                className="card-surface group flex aspect-video flex-col justify-between p-6 transition-colors hover:border-primary"
              >
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {card.tag}
                </span>
                <span className="font-display text-2xl transition-colors group-hover:text-primary">
                  {card.title}
                </span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
