import { useState, type ReactNode } from "react";
import { ExternalLink, LogOut, Menu, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import logo from "@/assets/raphouse-logo.webp";

export type AdminSection = {
  value: string;
  label: string;
  icon: LucideIcon;
  group: string;
  // Jedno zdanie pod tytułem: co ta zakładka zmienia na stronie.
  description: string;
  render: () => ReactNode;
};

type Props = {
  sections: AdminSection[];
  active: AdminSection;
  onSelect: (value: string) => void;
  email: string | undefined;
  onSignOut: () => void;
  children: ReactNode;
};

/** Układ zalogowanego panelu: menu boczne (na telefonie wysuwane) + treść zakładki. */
export function AdminShell({ sections, active, onSelect, email, onSignOut, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = (
    <SidebarNav
      sections={sections}
      active={active.value}
      onSelect={(v) => {
        onSelect(v);
        setMenuOpen(false);
      }}
      email={email}
      onSignOut={onSignOut}
    />
  );

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[17rem_1fr]">
      {/* Desktop: stałe menu z lewej. */}
      <aside className="surface-deep sticky top-0 hidden h-screen border-r border-border lg:block">
        {nav}
      </aside>

      {/* Telefon / tablet: górny pasek + wysuwane menu. */}
      <header className="surface-deep sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Otwórz menu panelu"
          className="inline-flex size-10 items-center justify-center rounded-md border border-border"
        >
          <Menu className="size-5" />
        </button>
        <span className="flex items-center gap-2 text-sm font-semibold">
          <active.icon className="size-4 text-primary" />
          {active.label}
        </span>
        <img src={logo} alt="RapHouse" className="h-8 w-auto" />
      </header>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="surface-deep w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu panelu</SheetTitle>
          </SheetHeader>
          {nav}
        </SheetContent>
      </Sheet>

      <main className="min-w-0">
        <div className="mx-auto max-w-5xl px-5 py-8 md:px-10 md:py-12">
          <div className="mb-8 border-b border-border pb-6">
            <p className="eyebrow mb-3">{active.group}</p>
            <h1 className="font-display flex items-center gap-3 text-4xl md:text-5xl">
              {active.label}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {active.description}
            </p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarNav({
  sections,
  active,
  onSelect,
  email,
  onSignOut,
}: {
  sections: AdminSection[];
  active: string;
  onSelect: (value: string) => void;
  email: string | undefined;
  onSignOut: () => void;
}) {
  const groups = [...new Set(sections.map((s) => s.group))];
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <img src={logo} alt="RapHouse" className="h-10 w-auto" />
        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          Panel admina
        </span>
      </div>

      <nav
        aria-label="Sekcje panelu"
        className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:thin]"
      >
        {groups.map((g) => (
          <div key={g} className="mb-5">
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70">
              {g}
            </p>
            <ul className="flex flex-col gap-0.5">
              {sections
                .filter((s) => s.group === g)
                .map((s) => {
                  const isActive = s.value === active;
                  return (
                    <li key={s.value}>
                      <button
                        type="button"
                        onClick={() => onSelect(s.value)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                          isActive
                            ? "bg-primary/12 font-semibold text-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                        )}
                      >
                        {isActive && (
                          <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary" />
                        )}
                        <s.icon className={cn("size-4 shrink-0", isActive && "text-primary")} />
                        {s.label}
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-2 border-t border-border p-4">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ExternalLink className="size-4" /> Otwórz stronę
        </a>
        {email && <p className="truncate px-3 text-xs text-muted-foreground">{email}</p>}
        <Button variant="outline" size="sm" onClick={onSignOut} className="justify-start">
          <LogOut className="size-4" /> Wyloguj
        </Button>
      </div>
    </div>
  );
}

/** Kafelek na pulpicie: liczba wpisów w sekcji, klik przenosi do niej. */
export function StatTile({
  icon: Icon,
  label,
  count,
  hidden,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  count: number | undefined;
  hidden: number | undefined;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card-surface group flex flex-col gap-4 p-5 text-left transition-colors hover:border-primary"
    >
      <span className="inline-flex size-10 items-center justify-center rounded-md bg-primary/12 text-primary">
        <Icon className="size-5" />
      </span>
      <span>
        <span className="font-display block text-4xl tabular-nums">
          {count ?? <span className="text-muted-foreground">–</span>}
        </span>
        <span className="mt-1 block text-sm text-muted-foreground transition-colors group-hover:text-foreground">
          {label}
          {!!hidden && <span className="text-xs"> · {hidden} ukryte</span>}
        </span>
      </span>
    </button>
  );
}
