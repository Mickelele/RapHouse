import { ExternalLink } from "lucide-react";
import type { LinkItem } from "@/lib/content";
import { toEmbedUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

export function VideoEmbed({ url, title }: { url: string | null; title: string }) {
  const embed = toEmbedUrl(url);
  if (!embed) return null;
  return (
    <div className="aspect-video w-full overflow-hidden rounded-md border border-border bg-black">
      <iframe
        src={embed}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="size-full"
      />
    </div>
  );
}

export function AudioPlayer({ src, className }: { src: string | null; className?: string }) {
  if (!src) return null;
  return (
    <audio controls preload="none" src={src} className={cn("w-full", className)}>
      Twoja przeglądarka nie obsługuje odtwarzania audio.
    </audio>
  );
}

export function LinkList({ links }: { links: LinkItem[] | null | undefined }) {
  const items = (links ?? []).filter((l) => l.url);
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((l) => (
        <a
          key={l.url}
          href={l.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded border border-border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:border-primary hover:text-primary"
        >
          {l.label || "Link"}
          <ExternalLink className="size-3.5" />
        </a>
      ))}
    </div>
  );
}
