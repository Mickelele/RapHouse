import { useState } from "react";
import { Play, X } from "lucide-react";
import { contact, portfolio } from "@/data/raphouse";
import { useProjects } from "@/lib/content";
import { AudioPlayer, LinkList, VideoEmbed } from "./Media";
import { Reveal } from "./Reveal";

function Waveform() {
  const bars = Array.from({ length: 34 }, (_, i) => 18 + ((i * 37) % 70));
  return (
    <div className="flex h-10 items-end gap-[3px]">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-border transition-colors duration-300 group-hover:bg-primary/70"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export function Portfolio() {
  const { data } = useProjects();
  const [openId, setOpenId] = useState<string | null>(null);

  // Dopóki baza nie jest podpięta (albo jest pusta), pokazujemy statyczną listę.
  const items =
    data && data.length
      ? data
      : portfolio.map((p) => ({
          id: p.title,
          artist: p.artist,
          title: p.title,
          description: p.desc,
          audio_url: null,
          image_url: null,
          video_url: null,
          links: [],
        }));

  return (
    <section id="realizacje" className="surface-deep border-y border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <Reveal>
          <p className="eyebrow mb-6">Realizacje</p>
          <h2 className="font-display max-w-4xl text-[clamp(2.5rem,6vw,5rem)]">
            Co tu <span className="text-primary">powstało.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((track, i) => {
            const open = openId === track.id;
            const hasVideo = !!track.video_url;
            return (
              <Reveal
                key={track.id}
                delay={(i % 4) * 80}
                className={open && hasVideo ? "md:col-span-2" : ""}
              >
                <div className="card-surface group flex h-full flex-col justify-between gap-6 p-7 transition-all duration-300 hover:border-primary">
                  {track.image_url && !open && (
                    <img
                      src={track.image_url}
                      alt={`${track.artist} — ${track.title}`}
                      loading="lazy"
                      className="aspect-square w-full rounded-md object-cover"
                    />
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                        {track.artist}
                      </p>
                      <h3 className="font-display mt-2 text-2xl leading-tight">{track.title}</h3>
                    </div>
                    {hasVideo ? (
                      <button
                        type="button"
                        aria-label={open ? "Zamknij wideo" : `Odtwórz ${track.title}`}
                        onClick={() => setOpenId(open ? null : track.id)}
                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary"
                      >
                        {open ? <X className="size-4" /> : <Play className="size-4" />}
                      </button>
                    ) : (
                      !track.audio_url && (
                        <a
                          href={contact.youtube}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Kanał RapHouse na YouTube"
                          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary"
                        >
                          <Play className="size-4" />
                        </a>
                      )
                    )}
                  </div>
                  {open && <VideoEmbed url={track.video_url} title={track.title} />}
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {track.description}
                  </p>
                  {track.audio_url ? (
                    <AudioPlayer src={track.audio_url} title={track.title} />
                  ) : (
                    !open && <Waveform />
                  )}
                  <LinkList links={track.links} />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
