import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageLayout } from "@/components/site/PageLayout";
import { LinkList, VideoEmbed } from "@/components/site/Media";
import { Reveal } from "@/components/site/Reveal";
import { useNews } from "@/lib/content";
import { formatDate } from "@/lib/media";

const title = "Aktualności — RapHouse, studio nagrań Warszawa";
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
          <EmptyState>Na razie nic tu nie ma — zajrzyj wkrótce.</EmptyState>
        ) : (
          <div className="flex flex-col gap-6">
            {data.map((post) => (
              <Reveal key={post.id}>
                <article className="card-surface flex flex-col gap-6 p-7 md:p-10">
                  <header>
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
