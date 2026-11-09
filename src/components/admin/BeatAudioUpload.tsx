import { useMemo, useState } from "react";
import { CheckCircle2, FileAudio, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { matchBeatsToFiles, type BeatRef } from "@/lib/beat-audio-match";
import { MEDIA_BUCKET, supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Row = { beat: BeatRef; file: string; include: boolean };
type Status = "ok" | "error" | "working";

// Ile plików wysyłamy naraz.
const PARALLEL = 4;

// Plik już w naszym magazynie (Supabase) - taki bit działa i domyślnie go nie ruszamy.
const isStored = (url: string | null) => !!url && url.includes(`/object/public/${MEDIA_BUCKET}/`);

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "bit";

/**
 * Hurtowe podpięcie plików audio do bitów: wybierasz pliki (np. cały folder), narzędzie samo
 * dopasowuje je po nazwie (tytuł bitu albo stara nazwa pliku), pokazuje listę do sprawdzenia
 * i poprawienia, a potem wgrywa pliki i podmienia adresy audio w bitach.
 */
export function BeatAudioUpload({ onDone }: { onDone: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileByName = useMemo(() => new Map(files.map((f) => [f.name, f])), [files]);
  const fileNames = useMemo(
    () => files.map((f) => f.name).sort((a, b) => a.localeCompare(b)),
    [files],
  );

  const pick = async (picked: File[]) => {
    if (!picked.length) return;
    setLoading(true);
    const { data, error } = await supabase!
      .from("beats")
      .select("id, title, audio_url")
      .order("sort_order")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error(`Nie udało się pobrać bitów: ${error.message}`);
      return;
    }
    const beats = data as BeatRef[];
    const matches = matchBeatsToFiles(
      beats,
      picked.map((f) => f.name),
    );
    setFiles(picked);
    setStatus({});
    setRows(
      beats.map((beat) => {
        const file = matches.get(beat.id) ?? "";
        // Domyślnie tylko bity z niedziałającym audio (stary adres albo brak), dla których
        // znalazł się plik.
        return { beat, file, include: !!file && !isStored(beat.audio_url) };
      }),
    );
  };

  const update = (id: string, patch: Partial<Row>) =>
    setRows((rs) => rs?.map((r) => (r.beat.id === id ? { ...r, ...patch } : r)) ?? null);

  const selected = (rows ?? []).filter((r) => r.include && r.file);
  // Plik wybrany przy więcej niż jednym bicie - pewnie pomyłka, ostrzegamy.
  const usedTwice = new Set(
    selected.map((r) => r.file).filter((f, i, all) => all.indexOf(f) !== i),
  );

  const run = async () => {
    setRunning(true);
    const queue = [...selected];
    let failed = 0;
    const worker = async () => {
      for (let r = queue.shift(); r; r = queue.shift()) {
        const row = r;
        setStatus((s) => ({ ...s, [row.beat.id]: "working" }));
        try {
          const file = fileByName.get(row.file)!;
          const path = `audio/beats/${slug(row.beat.title)}-${crypto.randomUUID().slice(0, 8)}.mp3`;
          const up = await supabase!.storage.from(MEDIA_BUCKET).upload(path, file, {
            contentType: file.type || "audio/mpeg",
            cacheControl: "31536000",
          });
          if (up.error) throw up.error;
          const url = supabase!.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
          const { error } = await supabase!
            .from("beats")
            .update({ audio_url: url })
            .eq("id", row.beat.id);
          if (error) throw error;
          setStatus((s) => ({ ...s, [row.beat.id]: "ok" }));
        } catch (e) {
          failed++;
          setStatus((s) => ({ ...s, [row.beat.id]: "error" }));
          toast.error(`${row.beat.title}: ${(e as Error).message}`);
        }
      }
    };
    await Promise.all(Array.from({ length: PARALLEL }, worker));
    setRunning(false);
    onDone();
    const ok = selected.length - failed;
    if (ok) toast.success(`Podpięto audio do ${ok} bitów.`);
  };

  const close = () => {
    if (running) return;
    setRows(null);
    setFiles([]);
    setStatus({});
  };

  const missing = (rows ?? []).filter((r) => !r.file && !isStored(r.beat.audio_url));

  return (
    <>
      <Button variant="outline" asChild disabled={loading}>
        <label className="cursor-pointer">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <FileAudio className="size-4" />}
          Podepnij pliki audio
          <input
            type="file"
            hidden
            multiple
            accept=".mp3,audio/mpeg"
            onChange={(e) => {
              const picked = [...(e.target.files ?? [])];
              e.target.value = "";
              void pick(picked);
            }}
          />
        </label>
      </Button>

      <Dialog open={!!rows} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Podepnij pliki audio do bitów</DialogTitle>
            <DialogDescription>
              Wybrano {files.length} plików. Pliki dopasowały się same po nazwie - sprawdź listę,
              popraw w razie potrzeby i kliknij „Wgraj”. Zaznaczone są bity, których audio nie
              działa; te już podpięte są odznaczone.
            </DialogDescription>
          </DialogHeader>

          {!!missing.length && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
              Bez pliku ({missing.length}): {missing.map((r) => r.beat.title).join(", ")} - wybierz
              plik z listy przy bicie albo zostaw.
            </p>
          )}

          <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
            {rows?.map((r) => {
              const st = status[r.beat.id];
              return (
                <li key={r.beat.id} className="flex items-center gap-3 px-3 py-2">
                  <input
                    type="checkbox"
                    aria-label={`Podepnij: ${r.beat.title}`}
                    checked={r.include}
                    disabled={running || !r.file}
                    onChange={(e) => update(r.beat.id, { include: e.target.checked })}
                    className="size-4 accent-[var(--primary)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{r.beat.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {isStored(r.beat.audio_url) ? "audio podpięte" : "audio nie działa"}
                    </p>
                  </div>
                  <select
                    value={r.file}
                    disabled={running}
                    onChange={(e) =>
                      update(r.beat.id, { file: e.target.value, include: !!e.target.value })
                    }
                    className={cn(
                      "h-8 w-56 max-w-[45%] rounded-md border bg-background px-2 text-xs",
                      usedTwice.has(r.file) && r.include ? "border-destructive" : "border-input",
                    )}
                  >
                    <option value="">- brak pliku -</option>
                    {fileNames.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span className="w-5 shrink-0">
                    {st === "working" && (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    )}
                    {st === "ok" && <CheckCircle2 className="size-4 text-primary" />}
                    {st === "error" && <XCircle className="size-4 text-destructive" />}
                  </span>
                </li>
              );
            })}
          </ul>

          {!!usedTwice.size && (
            <p className="text-sm text-destructive">
              Ten sam plik jest wybrany przy kilku bitach: {[...usedTwice].join(", ")}
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={close} disabled={running}>
              {Object.keys(status).length ? "Zamknij" : "Anuluj"}
            </Button>
            <Button onClick={() => void run()} disabled={running || !selected.length}>
              {running && <Loader2 className="size-4 animate-spin" />}
              {running
                ? `Wgrywanie ${Object.values(status).filter((s) => s !== "working").length}/${selected.length}`
                : `Wgraj i podepnij (${selected.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
