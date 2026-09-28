import logo from "@/assets/raphouse-logo.png";
import { contact, nav } from "@/data/raphouse";

export function Footer() {
  return (
    <footer className="surface-deep border-t border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1fr_auto_auto]">
          <img src={logo} alt="RapHouse" className="w-[clamp(10rem,30vw,20rem)] h-auto" />

          <nav className="flex flex-col gap-3">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <a
              href={contact.instagram}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Instagram
            </a>
            <a
              href={contact.youtube}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              YouTube
            </a>
            <a
              href={contact.phoneHref}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {contact.phone}
            </a>
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
