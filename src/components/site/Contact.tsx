import { Phone, Navigation, Instagram, Youtube } from "lucide-react";
import { contact, crew, stats } from "@/data/raphouse";
import { Reveal } from "./Reveal";

// O nas + Kontakt w jednej sekcji: po lewej zespół i liczby, po prawej dane kontaktowe i mapa.
export function Contact() {
  return (
    <section id="kontakt" className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
      <Reveal>
        <p className="eyebrow mb-6">O nas i kontakt</p>
        <h2 className="font-display max-w-4xl text-[clamp(2.5rem,7vw,6rem)]">
          Masz numer?
          <br />
          <span className="text-primary">Nagrajmy go.</span>
        </h2>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Studio stworzone przez artystów, dla artystów. Nie odkładaj kolejnego numeru na później.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-4 lg:grid-cols-2">
        {/* Kotwica dla linku "O nas" w menu. */}
        <div id="o-nas" className="flex scroll-mt-24 flex-col gap-4">
          {crew.map((person, i) => (
            <Reveal key={person.name} delay={i * 110}>
              <div className="card-surface p-8 md:p-10">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-4xl">{person.name}</h3>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    {person.role}
                  </span>
                </div>
                <p className="mt-6 leading-relaxed text-muted-foreground">{person.bio}</p>
              </div>
            </Reveal>
          ))}

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 80}>
                <div className="card-surface h-full p-6">
                  <p className="font-display text-2xl text-primary md:text-3xl">{stat.value}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Reveal>
            <div className="card-surface flex flex-col gap-10 p-8 md:p-10">
              <div>
                <p className="eyebrow">Studio</p>
                <p className="font-display mt-4 text-3xl leading-tight">
                  {contact.street}
                  <br />
                  {contact.city}
                </p>
                <a
                  href={contact.phoneHref}
                  className="font-display mt-8 block text-3xl text-primary md:text-4xl"
                >
                  {contact.phone}
                </a>
                <p className="mt-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  NIP {contact.nip}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={contact.phoneHref} className="btn-base btn-accent">
                  <Phone className="size-4" /> Zadzwoń
                </a>
                <a
                  href={contact.maps}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-base btn-ghost-line"
                >
                  <Navigation className="size-4" /> Nawiguj
                </a>
                <a
                  href={contact.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-base btn-ghost-line"
                >
                  <Instagram className="size-4" /> Instagram
                </a>
                <a
                  href={contact.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-base btn-ghost-line"
                >
                  <Youtube className="size-4" /> YouTube
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="flex-1">
            <div className="card-surface h-full min-h-[22rem] overflow-hidden">
              <iframe
                title="Mapa dojazdu do studia RapHouse, ul. Łojewska 22 w Warszawie"
                src={contact.mapEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="size-full min-h-[22rem] border-0 grayscale-[35%]"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
