import { ArrowRight, Pin } from "lucide-react";
import { useNews, type NewsPost } from "@/lib/content";
import { formatDate } from "@/lib/media";
import { cn } from "@/lib/utils";
import { LinkList, VideoEmbed } from "./Media";
import { Reveal } from "./Reveal";

export function LatestNews() {
  const { data } = useNews();
  if (!data?.length) return null;

  // Przypięta + 2 najnowsze nieprzypięte; bez przypiętej - 3 najnowsze.
  const pinned = data.find((p) => p.pinned) ?? null;
  const rest = data.filter((p) => p !== pinned).slice(0, pinned ? 2 : 3);

  return (
    <section id="aktualnosci" className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
      <Reveal>
        <p className="eyebrow mb-6">Aktualności</p>
        <h2 className="font-display max-w-4xl text-[clamp(2.5rem,6vw,5rem)]">
          Co słychać <span className="text-primary">w studiu.</span>
        </h2>
      </Reveal>

      <div className="mt-14 flex flex-col gap-4">
        {pinned && (
          <Reveal>
            <FeaturedCard post={pinned} />
          </Reveal>
        )}
        {rest.length > 0 && (
          <div
            className={cn(
              "grid gap-4",
              rest.length >= 2 && "md:grid-cols-2",
              rest.length >= 3 && "xl:grid-cols-3",
            )}
          >
            {rest.map((post, i) => (
              <Reveal key={post.id} delay={i * 80}>
                <NewsCard post={post} wide={rest.length === 1} />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <Reveal delay={120} className="mt-12">
        <a href="/aktualnosci" className="btn-base btn-ghost-line">
          Więcej aktualności <ArrowRight className="size-4" />
        </a>
      </Reveal>
    </section>
  );
}

function PinnedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground">
      <Pin className="size-3.5" /> Przypięte
    </span>
  );
}

function FeaturedCard({ post }: { post: NewsPost }) {
  const hasMedia = !!(post.video_url || post.image_url);
  return (
    <article
      className={cn(
        "card-surface grid gap-8 border-primary/50 p-7 md:p-10",
        hasMedia && "lg:grid-cols-[1.1fr_1fr] lg:items-center",
      )}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <PinnedBadge />
          <time
            dateTime={post.published_at}
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            {formatDate(post.published_at)}
          </time>
        </div>
        <h3 className="font-display text-4xl leading-tight md:text-5xl">{post.title}</h3>
        {post.body && (
          <p className="line-clamp-6 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
            {post.body}
          </p>
        )}
        <LinkList links={post.links} />
        <a
          href={`/aktualnosci#${post.id}`}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary"
        >
          Czytaj więcej <ArrowRight className="size-4" />
        </a>
      </div>
      {post.video_url ? (
        <VideoEmbed url={post.video_url} title={post.title} />
      ) : (
        post.image_url && (
          <img
            src={post.image_url}
            alt={post.title}
            loading="lazy"
            className="aspect-video w-full rounded-md object-cover"
          />
        )
      )}
    </article>
  );
}

function NewsCard({ post, wide }: { post: NewsPost; wide: boolean }) {
  return (
    <a
      href={`/aktualnosci#${post.id}`}
      className={cn(
        "card-surface group flex h-full flex-col gap-5 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary",
        wide && "md:flex-row md:items-center",
      )}
    >
      {post.image_url && (
        <img
          src={post.image_url}
          alt=""
          loading="lazy"
          className={cn("aspect-video w-full rounded-md object-cover", wide && "md:w-2/5")}
        />
      )}
      <div className="flex flex-1 flex-col gap-4">
        <time
          dateTime={post.published_at}
          className="text-xs font-bold uppercase tracking-[0.2em] text-primary"
        >
          {formatDate(post.published_at)}
        </time>
        <h3 className="font-display text-3xl leading-tight">{post.title}</h3>
        {post.body && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.body}</p>
        )}
        <span className="mt-auto inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Czytaj więcej
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </a>
  );
}
