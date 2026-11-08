import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, GripVertical, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { youTubeId } from "@/lib/media";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Entry = {
  id: string;
  table: "projects" | "promo_materials";
  kind: "Klip" | "Rolka" | "Grafika";
  title: string;
  image: string | null;
  movement_order: number;
};

type ProjectRow = {
  id: string;
  artist: string;
  title: string;
  video_url: string | null;
  movement_order: number | null;
  created_at: string;
};
type PromoRow = {
  id: string;
  kind: "rolka" | "grafika";
  artist: string | null;
  title: string;
  image_url: string | null;
  video_url: string | null;
  movement_order: number | null;
  created_at: string;
};

const KEY = ["admin", "movement"];

function thumb(image: string | null, video: string | null) {
  if (image) return image;
  const id = youTubeId(video);
  return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null;
}

/**
 * Zakładka "Sekcja Ruch": wszystko, co ma gwiazdkę (klipy, rolki, grafiki), w jednej pionowej
 * liście. Kolejność tutaj = kolejność w przewijanym pasku na stronie głównej.
 */
export function MovementOrderEditor() {
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const [clips, promo] = await Promise.all([
        supabase!
          .from("projects")
          .select("id, artist, title, video_url, movement_order, created_at")
          .eq("category", "video")
          .eq("in_movement", true),
        supabase!
          .from("promo_materials")
          .select("id, kind, artist, title, image_url, video_url, movement_order, created_at")
          .eq("in_movement", true),
      ]);
      if (clips.error) throw clips.error;
      if (promo.error) throw promo.error;
      const entries: (Entry & { created_at: string })[] = [
        ...(clips.data as ProjectRow[]).map((r) => ({
          id: r.id,
          table: "projects" as const,
          kind: "Klip" as const,
          title: `${r.artist} - ${r.title}`,
          image: thumb(null, r.video_url),
          movement_order: r.movement_order ?? 0,
          created_at: r.created_at,
        })),
        ...(promo.data as PromoRow[]).map((r) => ({
          id: r.id,
          table: "promo_materials" as const,
          kind: r.kind === "grafika" ? ("Grafika" as const) : ("Rolka" as const),
          title: r.artist ? `${r.artist} - ${r.title}` : r.title,
          image: thumb(r.image_url, r.video_url),
          movement_order: r.movement_order ?? 0,
          created_at: r.created_at,
        })),
      ];
      return entries.sort(
        (a, b) => a.movement_order - b.movement_order || b.created_at.localeCompare(a.created_at),
      );
    },
  });

  const refresh = () => {
    for (const k of [
      KEY,
      ["projects"],
      ["promo_materials"],
      ["admin", "projects"],
      ["admin", "promo_materials"],
    ])
      qc.invalidateQueries({ queryKey: k });
  };

  const reorder = useMutation({
    mutationFn: async (rows: Entry[]) => {
      const changed = rows
        .map((r, i) => ({ r, order: i + 1 }))
        .filter(({ r, order }) => r.movement_order !== order);
      const results = await Promise.all(
        changed.map(({ r, order }) =>
          supabase!.from(r.table).update({ movement_order: order }).eq("id", r.id),
        ),
      );
      const failed = results.find((res) => res.error);
      if (failed?.error) throw failed.error;
    },
    onMutate: (rows) => {
      qc.setQueryData(
        KEY,
        rows.map((r, i) => ({ ...r, movement_order: i + 1 })),
      );
    },
    onSuccess: refresh,
    onError: (e: Error) => {
      toast.error(`Błąd zmiany kolejności: ${e.message}`);
      refresh();
    },
  });

  const unstar = useMutation({
    mutationFn: async (r: Entry) => {
      const { error } = await supabase!.from(r.table).update({ in_movement: false }).eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Usunięto z sekcji Ruch");
      refresh();
    },
    onError: (e: Error) => toast.error(`Błąd: ${e.message}`),
  });

  const move = (from: number, to: number) => {
    if (!data || from === to || to < 0 || to >= data.length) return;
    const next = [...data];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    reorder.mutate(next);
  };

  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  return (
    <div>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Tu jest wszystko, co ma gwiazdkę w zakładkach „Klipy (video)” i „Oprawa wydania”. Ułóż
        kolejność przeciąganiem albo strzałkami - tak samo przewija się pasek w sekcji Ruch na
        stronie głównej. Bez żadnej gwiazdki pasek pokazuje 3 losowe rolki, klipy i grafiki.
      </p>

      {error && <p className="text-destructive">Błąd: {(error as Error).message}</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Ładowanie…</p>}
      {data && !data.length && (
        <p className="card-surface p-6 text-sm text-muted-foreground">
          Nic nie jest jeszcze wybrane - kliknij gwiazdkę przy klipie, rolce albo grafice.
        </p>
      )}

      <ol className="flex flex-col gap-2">
        {data?.map((r, index) => (
          <li
            key={`${r.table}-${r.id}`}
            draggable
            onDragStart={(e) => {
              setDragFrom(index);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              if (dragFrom === null) return;
              e.preventDefault();
              setDragOver(index);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragFrom !== null) move(dragFrom, index);
              setDragFrom(null);
              setDragOver(null);
            }}
            onDragEnd={() => {
              setDragFrom(null);
              setDragOver(null);
            }}
            className={cn(
              "card-surface flex items-center gap-4 px-5 py-3 transition-colors",
              dragFrom === index && "opacity-50",
              dragOver === index && dragFrom !== index && "border-primary",
            )}
          >
            <div className="-ml-2 flex shrink-0 items-center gap-0.5">
              <GripVertical
                className="size-4 cursor-grab text-muted-foreground active:cursor-grabbing"
                aria-hidden
              />
              <div className="flex flex-col">
                <button
                  type="button"
                  aria-label="Przesuń w górę"
                  disabled={index === 0 || reorder.isPending}
                  onClick={() => move(index, index - 1)}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-25"
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Przesuń w dół"
                  disabled={index === data.length - 1 || reorder.isPending}
                  onClick={() => move(index, index + 1)}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-25"
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>
            </div>
            <span className="w-6 shrink-0 text-right text-sm text-muted-foreground">
              {index + 1}.
            </span>
            {r.image ? (
              <img
                src={r.image}
                alt=""
                loading="lazy"
                className="size-12 shrink-0 rounded object-cover"
              />
            ) : (
              <span className="size-12 shrink-0 rounded bg-secondary" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                {r.kind}
              </p>
              <p className="truncate font-semibold">{r.title}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              title="Usuń z sekcji Ruch"
              onClick={() => unstar.mutate(r)}
            >
              <Star className="size-4 fill-primary text-primary" />
            </Button>
          </li>
        ))}
      </ol>
    </div>
  );
}
