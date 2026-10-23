import { useState } from "react";
import { Play, X } from "lucide-react";
import { contact } from "@/data/raphouse";
import type { AudioItem, Project } from "@/lib/content";
import { formatDate } from "@/lib/media";
import { AudioPlayer, LinkList, VideoEmbed } from "./Media";
import { ScatterGrid } from "./ScatterGrid";
import { YouTubeLite } from "./YouTubeLite";

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

export function AudioGrid({ items }: { items: AudioItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ScatterGrid className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((track) => {
        const open = openId === track.id;
        const hasVideo = !!track.video_url;
        return (
          <div key={track.id} className={open && hasVideo ? "md:col-span-2" : ""}>
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
          </div>
        );
      })}
    </ScatterGrid>
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
    <ScatterGrid className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((clip) => (
        <div key={clip.id}>
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
        </div>
      ))}
    </ScatterGrid>
  );
}
