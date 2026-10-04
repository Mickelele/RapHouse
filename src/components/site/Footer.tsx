import { Phone, Navigation, Instagram, Youtube } from "lucide-react";
import logo from "@/assets/raphouse-logo.png";
import { contact, navLinks } from "@/data/raphouse";

export function Footer() {
  return (
    <footer className="surface-deep border-t border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1fr_auto]">
          <img src={logo} alt="RapHouse" className="w-[clamp(10rem,30vw,20rem)] h-auto" />

          <nav className="flex flex-col gap-3">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-2">
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

          <div className="card-surface h-full min-h-[22rem] overflow-hidden">
            <iframe
              title="Mapa dojazdu do studia RapHouse, ul. Łojewska 22 w Warszawie"
              src={contact.mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="size-full min-h-[22rem] border-0 grayscale-[35%]"
            />
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          <span>Warszawa / Polska</span>
          <span className="flex items-center gap-6">
            <span>© {new Date().getFullYear()} RapHouse</span>
            <a href="/admin" className="transition-colors hover:text-foreground">
              Zaloguj
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
