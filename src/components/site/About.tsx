import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { stats } from "@/data/raphouse";
import { useTeam, type TeamMember } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { Skeleton } from "./Skeleton";

// Szerokość karty: telefon - jedna z "zajawką" następnej, tablet - dwie, desktop - trzy.
const CARD = "w-[82%] max-w-80 sm:w-[calc(50%-0.5rem)] sm:max-w-none lg:w-[calc(33.333%-0.667rem)]";

export function About() {
  // Ekipa z panelu admina (zakładka "O nas (ekipa)").
  const team = useTeam();
  const scroller = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  // Która karta jest pierwsza z lewej + czy strzałki mają dokąd przewijać.
  useEffect(() => {
    const el = scroller.current;
    if (!el || !team?.length) return;
    const update = () => {
      const first = el.children[0] as HTMLElement | undefined;
      const step = first ? first.offsetWidth + 16 : 1;
      setActive(Math.min(team.length - 1, Math.round(el.scrollLeft / step)));
      setEdges({
        start: el.scrollLeft <= 4,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
      });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [team?.length]);

  const goTo = (i: number) => {
    const el = scroller.current;
    const card = el?.children[i] as HTMLElement | undefined;
    const first = el?.children[0] as HTMLElement | undefined;
    if (el && card && first)
      el.scrollTo({ left: card.offsetLeft - first.offsetLeft, behavior: "smooth" });
  };
  const count = team?.length ?? 0;

  return (
    <section id="o-nas" className="surface-deep overflow-x-clip border-y border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="eyebrow mb-6">O nas</p>
              <h2 className="font-display max-w-4xl text-[clamp(2.5rem,6vw,5rem)]">
                Stworzone przez artystów
                <br />
                <span className="text-primary">Dla artystów</span>
              </h2>
            </div>
            {count > 1 && (
              <div className="flex items-center gap-4">
                <span className="font-display text-xl tabular-nums text-muted-foreground">
                  <span className="text-foreground">{String(active + 1).padStart(2, "0")}</span> /{" "}
                  {String(count).padStart(2, "0")}
                </span>
                <div className="flex gap-2">
                  <ArrowButton
                    label="Poprzednia osoba"
                    disabled={edges.start}
                    onClick={() => goTo(Math.max(0, active - 1))}
                  >
                    <ChevronLeft className="size-5" />
                  </ArrowButton>
                  <ArrowButton
                    label="Następna osoba"
                    disabled={edges.end}
                    onClick={() => goTo(Math.min(count - 1, active + 1))}
                  >
                    <ChevronRight className="size-5" />
                  </ArrowButton>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={100} className="mt-14">
          <ul
            ref={scroller}
            aria-label="Ekipa RapHouse"
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {!team &&
              [0, 1, 2].map((i) => (
                <li key={i} className={cn("shrink-0", CARD)}>
                  <Skeleton className="aspect-[4/5] w-full" />
                </li>
              ))}
            {team?.map((person) => (
              <li key={person.id} className={cn("flex shrink-0 snap-start", CARD)}>
                <PersonCard person={person} />
              </li>
            ))}
          </ul>

          {count > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {team?.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`Pokaż: ${p.name}`}
                  aria-current={i === active}
                  onClick={() => goTo(i)}
                  className="group flex h-6 items-center"
                >
                  <span
                    className={cn(
                      "block h-1.5 rounded-full transition-all duration-300",
                      i === active
                        ? "w-8 bg-primary"
                        : "w-3 bg-border group-hover:bg-muted-foreground",
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <div className="card-surface h-full p-7">
                <p className="font-display text-3xl text-primary">{stat.value}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Karta osoby: duże zdjęcie z imieniem i rolą na dole, pod nim opis (skrócony, z rozwinięciem). */
function PersonCard({ person }: { person: TeamMember }) {
  const bio = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  // "Czytaj więcej" tylko wtedy, gdy opis naprawdę się nie mieści.
  const [overflows, setOverflows] = useState(false);
  useLayoutEffect(() => {
    const el = bio.current;
    if (el && !expanded) setOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [person.bio, expanded]);

  return (
    <article className="card-surface group flex w-full flex-col overflow-hidden">
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        {person.image_url ? (
          <img
            src={person.image_url}
            alt={person.name}
            loading="lazy"
            decoding="async"
            className="size-full object-cover grayscale-[35%] transition-all duration-700 group-hover:scale-[1.04] group-hover:grayscale-0"
          />
        ) : (
          <span className="font-display flex size-full items-center justify-center text-[8rem] text-muted-foreground/40">
            {person.name.charAt(0)}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6 pt-24">
          {person.role && (
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              {person.role}
            </p>
          )}
          <h3 className="font-display mt-1 text-4xl text-white md:text-5xl">{person.name}</h3>
        </div>
      </div>
      {person.bio && (
        <div className="flex flex-1 flex-col p-6">
          <p
            ref={bio}
            className={cn(
              "whitespace-pre-line leading-relaxed text-muted-foreground",
              !expanded && "line-clamp-5",
            )}
          >
            {person.bio}
          </p>
          {(overflows || expanded) && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              className="mt-3 self-start text-xs font-bold uppercase tracking-[0.18em] text-primary hover:underline"
            >
              {expanded ? "Zwiń" : "Czytaj więcej"}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

function ArrowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-12 items-center justify-center rounded-full border border-border transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}
