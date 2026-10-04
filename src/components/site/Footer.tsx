import {
  ArrowUpRight,
  Facebook,
  Instagram,
  MapPin,
  Navigation,
  Phone,
  Youtube,
} from "lucide-react";
import logo from "@/assets/raphouse-logo.png";
import { contact, nav, type NavLink } from "@/data/raphouse";

const socials = [
  { label: "Instagram", href: contact.instagram, Icon: Instagram },
  { label: "YouTube", href: contact.youtube, Icon: Youtube },
  { label: "Facebook", href: contact.facebook, Icon: Facebook },
];

// Kolumny linków z grup menu; pojedyncze pozycje (bez "Kontakt" - to ta stopka) jako "Na skróty".
const linkColumns: { title: string; links: NavLink[] }[] = [
  ...nav.flatMap((item) =>
    "children" in item ? [{ title: item.label, links: item.children }] : [],
  ),
  {
    title: "Na skróty",
    links: nav.flatMap((item) =>
      "children" in item || item.href.endsWith("#kontakt") ? [] : [item],
    ),
  },
];

const linkClass =
  "text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none";

// Stopka jest jednocześnie sekcją kontaktu (#kontakt) na każdej stronie.
export function Footer() {
  return (
    <footer
      id="kontakt"
      className="surface-deep relative scroll-mt-20 overflow-hidden border-t border-border"
    >
      {/* Zielona poświata u góry stopki. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] max-w-full -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      {/* pb-28 na telefonie: miejsce na przyklejony pasek "Rezerwuj sesję" (MobileCta). */}
      <div className="relative mx-auto max-w-[1400px] px-5 pb-28 pt-16 sm:pb-10 md:px-10 md:pt-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Marka */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <a href="/" aria-label="RapHouse - strona główna" className="w-fit">
              <img src={logo} alt="RapHouse" className="h-24 w-auto md:h-28" />
            </a>
            <p className="max-w-xs leading-relaxed text-muted-foreground">
              Studio nagrań rap i hip-hop na warszawskim Targówku. Nagrania, mix, mastering i bity.
            </p>
            <ul className="flex gap-3">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="inline-flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Icon className="size-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Linki */}
          <nav aria-label="Stopka" className="grid grid-cols-3 gap-6 sm:gap-8 lg:col-span-4">
            {linkColumns.map((col) => (
              <div key={col.title}>
                <p className="eyebrow mb-4">{col.title}</p>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className={linkClass}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Kontakt */}
          <div className="flex flex-col gap-5 lg:col-span-4">
            <p className="eyebrow">Kontakt</p>
            <a
              href={contact.phoneHref}
              className="font-display w-fit text-4xl text-primary transition-opacity hover:opacity-80 md:text-5xl"
            >
              {contact.phone}
            </a>
            <a
              href={contact.maps}
              target="_blank"
              rel="noreferrer"
              className="group flex w-fit items-start gap-3 text-muted-foreground transition-colors hover:text-foreground"
            >
              <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
              <span>
                {contact.street}
                <br />
                {contact.city}
              </span>
              <ArrowUpRight className="mt-0.5 size-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
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
            </div>
          </div>
        </div>

        {/* Mapa - filtr zamienia jasną mapę Google na ciemną, dopasowaną do strony. */}
        <div className="mt-14 overflow-hidden rounded-lg border border-border">
          <iframe
            title="Mapa dojazdu do studia RapHouse, ul. Łojewska 22 w Warszawie"
            src={contact.mapEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-64 w-full border-0 [filter:invert(0.92)_hue-rotate(180deg)_grayscale(0.35)_contrast(0.9)] md:h-80"
          />
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} RapHouse · NIP {contact.nip}
          </span>
          <span className="flex items-center gap-6">
            <span>Warszawa / Polska</span>
            <a href="/admin" className="transition-colors hover:text-foreground">
              Zaloguj
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
