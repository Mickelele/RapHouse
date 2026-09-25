import { crew, stats } from "@/data/raphouse";
import { Reveal } from "./Reveal";

export function About() {
  return (
    <section id="o-nas" className="surface-deep border-y border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <Reveal>
          <p className="eyebrow mb-6">O nas</p>
          <h2 className="font-display max-w-4xl text-[clamp(2.5rem,6vw,5rem)]">
            Built by artists.
            <br />
            <span className="text-primary">For artists.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {crew.map((person, i) => (
            <Reveal key={person.name} delay={i * 110}>
              <div className="card-surface h-full p-8 md:p-10">
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
