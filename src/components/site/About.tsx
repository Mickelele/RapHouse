import { stats } from "@/data/raphouse";
import { useTeam } from "@/lib/content";
import { Reveal } from "./Reveal";

export function About() {
  // Ekipa z panelu admina (zakładka "O nas (ekipa)").
  const team = useTeam();
  return (
    <section id="o-nas" className="surface-deep border-y border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <Reveal>
          <p className="eyebrow mb-6">O nas</p>
          <h2 className="font-display max-w-4xl text-[clamp(2.5rem,6vw,5rem)]">
            Stworzone przez artystów.
            <br />
            <span className="text-primary">Dla artystów.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {team.map((person, i) => (
            <Reveal key={person.id} delay={(i % 2) * 110}>
              <div className="card-surface flex h-full flex-col gap-6 p-6 sm:flex-row md:p-8">
                {person.image_url && (
                  <img
                    src={person.image_url}
                    alt={person.name}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/5] w-full shrink-0 rounded-md object-cover sm:w-40 lg:w-48"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-display text-4xl">{person.name}</h3>
                    {person.role && (
                      <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                        {person.role}
                      </span>
                    )}
                  </div>
                  {person.bio && (
                    <p className="mt-5 whitespace-pre-line leading-relaxed text-muted-foreground">
                      {person.bio}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
