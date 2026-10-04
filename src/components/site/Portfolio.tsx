import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Play, X } from "lucide-react";
import { contact, portfolio } from "@/data/raphouse";
import { useProjects, type Project } from "@/lib/content";
import { formatDate } from "@/lib/media";
import { cn } from "@/lib/utils";
import { AudioPlayer, LinkList, VideoEmbed } from "./Media";
import { Reveal } from "./Reveal";
import { YouTubeLite } from "./YouTubeLite";

type Category = "audio" | "video";

const TABS: { value: Category; label: string }[] = [
  { value: "audio", label: "Audio" },
  { value: "video", label: "Video" },
];

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

type AudioItem = Pick<
  Project,
  "id" | "artist" | "title" | "description" | "audio_url" | "image_url" | "video_url" | "links"
>;

export function Portfolio() {
  const { data } = useProjects();
  // Kategoria trzymana w URL (?kategoria=video), żeby dało się podlinkować zakładkę Video.
  const { kategoria } = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const category: Category = kategoria === "video" ? "video" : "audio";

  const setCategory = (c: Category) =>
    navigate({
      search: ({ kategoria: _, ...rest }) =>
        c === "video" ? { ...rest, kategoria: "video" } : rest,
      replace: true,
      resetScroll: false,
    });

  // Dopóki baza nie jest podpięta (albo jest pusta), w Audio pokazujemy statyczną listę.
  const audio: AudioItem[] =
    data && data.length
      ? data.filter((p) => p.category !== "video")
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
  const video = (data ?? []).filter((p) => p.category === "video");

  return (
    <section id="realizacje" className="surface-deep border-y border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <Reveal>
          <p className="eyebrow mb-6">Realizacje</p>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <h2 className="font-display max-w-4xl text-[clamp(2.5rem,6vw,5rem)]">
              Co tu <span className="text-primary">powstało.</span>
            </h2>
            <div
              role="tablist"
              aria-label="Kategoria realizacji"
              className="grid w-full grid-cols-2 rounded-md border border-border p-1 sm:w-auto"
            >
              {TABS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="tab"
                  id={`realizacje-tab-${t.value}`}
                  aria-selected={category === t.value}
                  aria-controls="realizacje-panel"
                  onClick={() => setCategory(t.value)}
                  className={cn(
                    "min-h-11 rounded px-6 text-xs font-bold uppercase tracking-[0.18em] transition-colors",
                    category === t.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div
          id="realizacje-panel"
          role="tabpanel"
          aria-labelledby={`realizacje-tab-${category}`}
          className="mt-14"
        >
          {category === "audio" ? <AudioGrid items={audio} /> : <VideoGrid items={video} />}
        </div>
      </div>
    </section>
  );
}

function AudioGrid({ items }: { items: AudioItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                  alt={`${track.artist} - ${track.title}`}
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
              <p className="text-sm leading-relaxed text-muted-foreground">{track.description}</p>
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
  );
}

export function VideoGrid({ items }: { items: Project[] }) {
  if (!items.length) {
    return (
      <div className="card-surface flex flex-col items-center gap-6 p-10 text-center text-muted-foreground">
        <p>Pierwsze klipy już wkrótce.</p>
        <a
          href={contact.youtube}
          target="_blank"
          rel="noreferrer"
          className="btn-base btn-ghost-line"
        >
          Zobacz nasz YouTube
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((clip, i) => (
        <Reveal key={clip.id} delay={(i % 3) * 80}>
          <article className="card-surface flex h-full flex-col gap-5 p-5 md:p-6">
            <YouTubeLite video={clip.video_url} title={`${clip.artist} - ${clip.title}`} />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                {clip.artist}
              </p>
              <h3 className="font-display mt-2 text-2xl leading-tight">{clip.title}</h3>
              {clip.released_on && (
                <time
                  dateTime={clip.released_on}
                  className="mt-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground"
                >
                  {formatDate(clip.released_on)}
                </time>
              )}
            </div>
            {clip.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">{clip.description}</p>
            )}
            <LinkList links={clip.links} />
          </article>
        </Reveal>
      ))}
    </div>
  );
}
