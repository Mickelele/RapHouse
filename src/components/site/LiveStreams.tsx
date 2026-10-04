import { ArrowRight, Radio } from "lucide-react";
import { liveChannels, liveStream } from "@/data/features";
import { youTubeId } from "@/lib/media";
import { Reveal } from "./Reveal";
import { YouTubeLite } from "./YouTubeLite";

function formatStart(iso: string) {
  return new Date(iso).toLocaleString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LiveStreams() {
  const live = liveStream;
  const preview = live?.platform === "YouTube" && youTubeId(live.url);

  return (
    <section id="live" className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
      <Reveal>
        <p className="eyebrow mb-6">Transmisje live</p>
        <h2 className="font-display max-w-4xl text-[clamp(2.5rem,6vw,5rem)]">
          Na żywo <span className="text-primary">ze studia.</span>
        </h2>
      </Reveal>

      <Reveal delay={100} className="mt-14">
        {live ? (
          <div className="card-surface grid gap-8 border-primary/50 p-7 md:p-10 lg:grid-cols-2 lg:items-center">
            <div className="flex flex-col gap-5">
              <span className="inline-flex w-fit items-center gap-2 rounded bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground">
                <Radio className="size-3.5" /> {live.platform}
              </span>
              <h3 className="font-display text-4xl leading-tight md:text-5xl">{live.title}</h3>
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                {live.startsAt ? formatStart(live.startsAt) : "Wkrótce"}
              </p>
              {live.description && (
                <p className="leading-relaxed text-muted-foreground">{live.description}</p>
              )}
              <a
                href={live.url}
                target="_blank"
                rel="noreferrer"
                className="btn-base btn-accent w-fit"
              >
                Oglądaj na {live.platform} <ArrowRight className="size-4" />
              </a>
            </div>
            {preview && <YouTubeLite video={live.url} title={live.title} />}
          </div>
        ) : (
          <div className="card-surface flex flex-col items-start gap-6 p-7 md:flex-row md:items-center md:justify-between md:p-10">
            <div>
              <p className="font-display text-3xl">Brak zaplanowanej transmisji.</p>
              <p className="mt-3 text-muted-foreground">
                Obserwuj nas, żeby nie przegapić następnego live'a.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {liveChannels.map((c) => (
                <a
                  key={c.url}
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-base btn-ghost-line"
                >
                  {c.platform}
                </a>
              ))}
            </div>
          </div>
        )}
      </Reveal>
    </section>
  );
}
