import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pin } from "lucide-react";
import { EmptyState, PageLayout } from "@/components/site/PageLayout";
import { LinkList, VideoEmbed } from "@/components/site/Media";
import { Reveal } from "@/components/site/Reveal";
import { useNews } from "@/lib/content";
import { formatDate } from "@/lib/media";
import { cn } from "@/lib/utils";

const title = "Aktualności - RapHouse, studio nagrań Warszawa";
const description = "Nowości ze studia RapHouse: premiery, sesje, transmisje i wydarzenia.";

export const Route = createFileRoute("/aktualnosci")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const { data, isLoading, isError } = useNews();

  // Wpisy dochodzą z bazy po załadowaniu strony, więc #kotwicę trzeba przewinąć ręcznie.
  useEffect(() => {
    if (!data?.length || !location.hash) return;
    document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  }, [data]);

  return (
    <PageLayout
      eyebrow="Aktualności"
      title="Co słychać"
      accent="w studiu."
      intro="Premiery, nowe numery, transmisje i wszystko, co dzieje się w RapHouse."
    >
      <section className="mx-auto max-w-[1000px] px-5 pb-24 md:px-10 md:pb-32">
        {isLoading ? (
          <EmptyState>Ładowanie…</EmptyState>
        ) : isError ? (
          <EmptyState>Nie udało się pobrać aktualności. Spróbuj odświeżyć stronę.</EmptyState>
        ) : !data?.length ? (
          <EmptyState>Na razie nic tu nie ma - zajrzyj wkrótce.</EmptyState>
        ) : (
          <div className="flex flex-col gap-6">
            {data.map((post) => (
              <Reveal key={post.id}>
                <article
                  id={post.id}
                  className={cn(
                    "card-surface flex scroll-mt-28 flex-col gap-6 p-7 md:p-10",
                    post.pinned && "border-primary/50",
                  )}
                >
                  <header>
                    {post.pinned && (
                      <span className="mr-3 inline-flex items-center align-middle gap-1.5 rounded bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground">
                        <Pin className="size-3.5" /> Przypięte
                      </span>
                    )}
                    <time
                      dateTime={post.published_at}
                      className="text-xs font-bold uppercase tracking-[0.22em] text-primary"
                    >
                      {formatDate(post.published_at)}
                    </time>
                    <h2 className="font-display mt-3 text-3xl leading-tight md:text-5xl">
                      {post.title}
                    </h2>
                  </header>
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      loading="lazy"
                      className="max-h-[520px] w-full rounded-md object-cover"
                    />
                  )}
                  {post.body && (
                    <div className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
                      {post.body}
                    </div>
                  )}
                  <VideoEmbed url={post.video_url} title={post.title} />
                  <LinkList links={post.links} />
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </PageLayout>
  );
}
