import type { ReactNode } from "react";
import { ArrowRight, Clapperboard, Instagram, Music2 } from "lucide-react";
import { contact } from "@/data/raphouse";
import { useLatestBeats, useProjects } from "@/lib/content";
import { AudioPlayer } from "./Media";
import { YouTubeLite } from "./YouTubeLite";

/**
 * Próbka tego, co robimy, w bloku "Ruch": najnowszy teledysk, najnowszy bit i rolki.
 * Teledysk i bit z bazy (panel admina); dopóki ich nie ma - odnośniki do YouTube / katalogu bitów.
 */
export function MovementShowcase() {
  const { data: projects } = useProjects();
  const { data: beats } = useLatestBeats(1);
  const clip = projects?.find((p) => p.category === "video" && p.video_url);
  const beat = beats?.[0];

  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-2">
      <Tile
        className="sm:col-span-2"
        icon={<Clapperboard className="size-4" />}
        kind="Teledysk"
        href="/klipy"
        more="Wszystkie klipy"
      >
        {clip ? (
          <>
            <YouTubeLite video={clip.video_url} title={`${clip.artist} - ${clip.title}`} />
            <p className="mt-4 text-sm">
              <span className="font-bold text-primary">{clip.artist}</span> - {clip.title}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Klipy od koncepcji po montaż - zobacz, co nakręciliśmy.
          </p>
        )}
      </Tile>

      <Tile icon={<Music2 className="size-4" />} kind="Bit" href="/bity" more="Katalog bitów">
        {beat ? (
          <>
            <p className="font-display mb-3 text-xl leading-tight">{beat.title}</p>
            <AudioPlayer src={beat.audio_url} title={beat.title} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Bity z katalogu albo robione od zera pod Twój numer.
          </p>
        )}
      </Tile>

      <Tile
        icon={<Instagram className="size-4" />}
        kind="Rolka"
        href={contact.instagram}
        more="Rolki na Instagramie"
        external
      >
        <p className="text-sm text-muted-foreground">
          Kulisy sesji, fragmenty numerów i życie studia - na bieżąco na naszym Instagramie.
        </p>
      </Tile>
    </div>
  );
}

function Tile({
  icon,
  kind,
  href,
  more,
  external,
  className,
  children,
}: {
  icon: ReactNode;
  kind: string;
  href: string;
  more: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      className={`card-surface flex flex-col p-5 transition-colors hover:border-primary ${className ?? ""}`}
    >
      <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
        {icon} {kind}
      </p>
      <div className="flex-1">{children}</div>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
      >
        {more} <ArrowRight className="size-3.5" />
      </a>
    </article>
  );
}
