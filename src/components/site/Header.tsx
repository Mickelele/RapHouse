import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import logo from "@/assets/raphouse-logo.png";
import { nav, type NavLink } from "@/data/raphouse";
import { cn } from "@/lib/utils";

const linkClass =
  "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-5 md:px-10">
        <a href="/" aria-label="RapHouse — strona główna">
          <img src={logo} alt="RapHouse" className="h-12 w-auto" />
        </a>

        <nav aria-label="Menu główne" className="hidden items-center gap-8 lg:flex">
          {nav.map((item) =>
            "children" in item ? (
              <NavDropdown key={item.label} label={item.label} links={item.children} />
            ) : (
              <a key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <a href="/#kontakt" className="btn-base btn-accent hidden sm:inline-flex">
            Rezerwuj sesję
          </a>
          <button
            type="button"
            aria-label={open ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-11 items-center justify-center rounded border border-border lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="max-h-[calc(100svh-5rem)] overflow-y-auto border-t border-border bg-background/98 backdrop-blur-xl lg:hidden">
          <nav aria-label="Menu" className="mx-auto flex max-w-[1400px] flex-col px-5 py-4">
            {nav.map((item) =>
              "children" in item ? (
                <div key={item.label} className="border-b border-border py-4">
                  <p className="eyebrow mb-2">{item.label}</p>
                  <div className="flex flex-col">
                    {item.children.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="font-display py-1.5 text-2xl"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="font-display border-b border-border py-4 text-3xl"
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

// Grupa w menu: otwiera się po najechaniu, kliknięciu lub z klawiatury; Esc i klik obok zamykają.
function NavDropdown({ label, links }: { label: string; links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Otwarcie strzałką w dół przenosi fokus na pierwszy link, gdy lista jest już widoczna.
  const focusFirst = useRef(false);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (open && focusFirst.current) {
      focusFirst.current = false;
      wrap.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    }
  }, [open]);

  return (
    <div
      ref={wrap}
      className="relative"
      onMouseEnter={() => {
        clearTimeout(closeTimer.current);
        setOpen(true);
      }}
      // Krótka zwłoka, żeby menu nie znikało przy przejeżdżaniu kursorem do listy.
      onMouseLeave={() => {
        closeTimer.current = setTimeout(() => setOpen(false), 120);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (open) {
              wrap.current?.querySelector<HTMLAnchorElement>("a")?.focus();
            } else {
              focusFirst.current = true;
              setOpen(true);
            }
          }
        }}
        className={cn(linkClass, "inline-flex items-center gap-1.5", open && "text-foreground")}
      >
        {label}
        <ChevronDown
          className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <div id={id} hidden={!open} className="absolute left-1/2 top-full -translate-x-1/2 pt-4">
        <ul className="card-surface min-w-48 border-border bg-popover py-2">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:bg-secondary hover:text-primary focus-visible:bg-secondary focus-visible:text-primary focus-visible:outline-none"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
