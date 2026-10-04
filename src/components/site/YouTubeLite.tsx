import { useState } from "react";
import { Play } from "lucide-react";
import { youTubeId } from "@/lib/media";

// Najpierw sama miniatura; iframe (youtube-nocookie.com) ładuje się dopiero po kliknięciu,
// więc lista klipów nie ściąga na starcie kilku odtwarzaczy YouTube.
export function YouTubeLite({ video, title }: { video: string | null; title: string }) {
  const [playing, setPlaying] = useState(false);
  const id = youTubeId(video);
  if (!id) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border bg-black">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Odtwórz klip: ${title}`}
          className="group absolute inset-0 size-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
        >
          <img
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            srcSet={`https://i.ytimg.com/vi/${id}/mqdefault.jpg 320w, https://i.ytimg.com/vi/${id}/hqdefault.jpg 480w`}
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-100"
          />
          <span className="absolute left-1/2 top-1/2 inline-flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-1 size-7 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
}
