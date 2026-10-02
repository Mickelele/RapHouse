import { ArrowRight } from "lucide-react";
import { contact } from "@/data/raphouse";
import type { Beat } from "@/lib/content";
import { AudioPlayer, LinkList, VideoEmbed } from "./Media";

export function BeatCard({ beat }: { beat: Beat }) {
  return (
    <article className="card-surface flex h-full flex-col gap-5 p-6">
      <div className="flex gap-4">
        {beat.image_url && (
          <img
            src={beat.image_url}
            alt={beat.title}
            loading="lazy"
            className="size-20 shrink-0 rounded-md object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          {beat.category && (
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              {beat.category}
            </p>
          )}
          <h3 className="font-display mt-2 text-2xl leading-tight">{beat.title}</h3>
          <p className="mt-2 flex flex-wrap gap-x-4 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {beat.bpm && <span>{beat.bpm} BPM</span>}
            {beat.price && <span className="text-foreground">{beat.price}</span>}
          </p>
        </div>
      </div>
      {beat.description && (
        <p className="text-sm leading-relaxed text-muted-foreground">{beat.description}</p>
      )}
      <AudioPlayer src={beat.audio_url} title={beat.title} />
      <VideoEmbed url={beat.video_url} title={beat.title} />
      <LinkList links={beat.links} />
      <a
        href={contact.phoneHref}
        className="mt-auto inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary"
      >
        Zapytaj o ten bit <ArrowRight className="size-4" />
      </a>
    </article>
  );
}
