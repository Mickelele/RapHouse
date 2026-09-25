import { Phone, Navigation, Instagram, Youtube } from "lucide-react";
import { contact } from "@/data/raphouse";
import { Reveal } from "./Reveal";

export function Contact() {
  return (
    <section id="kontakt" className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
      <Reveal>
        <p className="eyebrow mb-6">Kontakt</p>
        <h2 className="font-display max-w-4xl text-[clamp(2.5rem,7vw,6rem)]">
          Masz numer?
          <br />
          <span className="text-primary">Nagrajmy go.</span>
        </h2>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Nie odkładaj kolejnego numeru na później.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-4 lg:grid-cols-2">
        <Reveal>
          <div className="card-surface flex h-full flex-col justify-between gap-10 p-8 md:p-10">
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

        <Reveal delay={120}>
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
    </section>
  );
}
