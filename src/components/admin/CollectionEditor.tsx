import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Pencil, Pin, PinOff, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBeatCategories, type LinkItem } from "@/lib/content";
import { MEDIA_BUCKET, supabase } from "@/lib/supabase";

export type Field = {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "url"
    | "audio"
    | "image"
    | "links"
    | "datetime"
    | "boolean"
    | "price-lines"
    | "beat-category"
    | "select"
    | "date";
  required?: boolean;
  // Dla type "select" — pierwsza opcja jest domyślna przy nowym wpisie.
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
};

export type CollectionConfig = {
  table: "news" | "beats" | "projects" | "beat_categories" | "pricing";
  label: string;
  // Tabela bez kolumny "published" (np. kategorie).
  noPublish?: boolean;
  // Inne zapytania do odświeżenia po zmianie (np. bity po zmianie nazwy kategorii).
  alsoInvalidate?: string[][];
  // Wpisy można przypinać (kolumna "pinned"; baza pilnuje, by przypięty był najwyżej jeden).
  pinnable?: boolean;
  fields: Field[];
  orderBy: { column: string; ascending: boolean }[];
  rowTitle: (row: Row) => string;
  rowSubtitle?: (row: Row) => string;
};

type Row = Record<string, unknown> & { id?: string | undefined; published?: boolean | undefined };

// Kolumny NOT NULL z wartością domyślną w bazie — pustych nie wysyłamy.
const NOT_NULL = new Set([
  "published_at",
  "sort_order",
  "body",
  "description",
  "links",
  "lines",
  "pinned",
]);

type PriceLine = { label: string; price: string };

export function CollectionEditor({ config }: { config: CollectionConfig }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);
  const key = ["admin", config.table];

  const { data, isLoading, error } = useQuery({
    queryKey: key,
    queryFn: async () => {
      let q = supabase!.from(config.table).select("*");
      for (const o of config.orderBy) q = q.order(o.column, { ascending: o.ascending });
      const { data, error } = await q;
      if (error) throw error;
      return data as Row[];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: [config.table] });
    for (const k of config.alsoInvalidate ?? []) qc.invalidateQueries({ queryKey: k });
  };

  const save = useMutation({
    mutationFn: async (row: Row) => {
      const { id, created_at: _c, ...values } = row;
      for (const k of Object.keys(values))
        if (values[k] == null && NOT_NULL.has(k)) delete values[k];
      // Puste wiersze linków / cen nie trafiają do bazy.
      if (Array.isArray(values["links"]))
        values["links"] = (values["links"] as LinkItem[]).filter((l) => l.url.trim());
      if (Array.isArray(values["lines"]))
        values["lines"] = (values["lines"] as PriceLine[]).filter((l) => l.price.trim());
      const res = id
        ? await supabase!.from(config.table).update(values).eq("id", id)
        : await supabase!.from(config.table).insert(values);
      if (res.error) throw res.error;
    },
    onSuccess: () => {
      toast.success("Zapisano");
      setEditing(null);
      refresh();
    },
    onError: (e: Error) => toast.error(`Błąd zapisu: ${e.message}`),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase!.from(config.table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Usunięto");
      refresh();
    },
    onError: (e: Error) => toast.error(`Błąd usuwania: ${e.message}`),
  });

  const newRow = (): Row => {
    const row: Row = config.noPublish ? {} : { published: true };
    for (const f of config.fields)
      row[f.name] =
        f.type === "links"
          ? []
          : f.type === "price-lines"
            ? [{ label: "", price: "" }]
            : f.type === "boolean"
              ? false
              : f.type === "select"
                ? (f.options?.[0]?.value ?? null)
                : null;
    return row;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {data ? `${data.length} wpisów` : isLoading ? "Ładowanie…" : ""}
        </p>
        <Button onClick={() => setEditing(newRow())}>
          <Plus className="size-4" /> Dodaj
        </Button>
      </div>

      {error && <p className="text-destructive">Błąd: {(error as Error).message}</p>}

      <ul className="flex flex-col gap-2">
        {data?.map((row) => (
          <li
            key={row.id}
            className="card-surface flex items-center justify-between gap-4 px-5 py-4"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-semibold">
                {config.pinnable && row["pinned"] === true && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
                    <Pin className="size-3" /> Przypięte
                  </span>
                )}
                <span className="truncate">{config.rowTitle(row)}</span>
              </p>
              {config.rowSubtitle && (
                <p className="truncate text-sm text-muted-foreground">{config.rowSubtitle(row)}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {config.pinnable && (
                <Button
                  variant="ghost"
                  size="icon"
                  title={row["pinned"] ? "Odepnij" : "Przypnij na stronie głównej"}
                  onClick={() => save.mutate({ id: row.id, pinned: !row["pinned"] })}
                >
                  {row["pinned"] ? (
                    <PinOff className="size-4 text-primary" />
                  ) : (
                    <Pin className="size-4 text-muted-foreground" />
                  )}
                </Button>
              )}
              {!config.noPublish && (
                <Button
                  variant="ghost"
                  size="icon"
                  title={row.published ? "Ukryj" : "Opublikuj"}
                  onClick={() => save.mutate({ id: row.id, published: !row.published })}
                >
                  {row.published ? (
                    <Eye className="size-4" />
                  ) : (
                    <EyeOff className="size-4 text-muted-foreground" />
                  )}
                </Button>
              )}
              <Button variant="ghost" size="icon" title="Edytuj" onClick={() => setEditing(row)}>
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Usuń"
                onClick={() => {
                  if (confirm(`Usunąć „${config.rowTitle(row)}”?`)) remove.mutate(row.id!);
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <EditDialog
          config={config}
          initial={editing}
          saving={save.isPending}
          onClose={() => setEditing(null)}
          onSave={(row) => save.mutate(row)}
        />
      )}
    </div>
  );
}

function EditDialog({
  config,
  initial,
  saving,
  onClose,
  onSave,
}: {
  config: CollectionConfig;
  initial: Row;
  saving: boolean;
  onClose: () => void;
  onSave: (row: Row) => void;
}) {
  const [row, setRow] = useState<Row>(initial);
  const set = (name: string, value: unknown) => setRow((r) => ({ ...r, [name]: value }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initial.id ? "Edytuj" : "Dodaj"} — {config.label}
          </DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(row);
          }}
        >
          {config.fields.map((f) => (
            <FieldInput
              key={f.name}
              field={f}
              value={row[f.name]}
              onChange={(v) => set(f.name, v)}
            />
          ))}
          {!config.noPublish && (
            <label className="flex items-center gap-3">
              <Switch checked={!!row.published} onCheckedChange={(v) => set("published", v)} />
              <span className="text-sm">Opublikowane (widoczne na stronie)</span>
            </label>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />} Zapisz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const id = `f-${field.name}`;
  const str = (value as string | null) ?? "";

  let control: React.ReactNode;
  switch (field.type) {
    case "textarea":
      control = (
        <Textarea
          id={id}
          rows={6}
          value={str}
          required={field.required}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case "number":
      control = (
        <Input
          id={id}
          type="number"
          value={str}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      );
      break;
    case "datetime":
      control = (
        <Input
          id={id}
          type="datetime-local"
          value={toLocalInput(str)}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
        />
      );
      break;
    case "audio":
    case "image":
      control = <FileField id={id} kind={field.type} value={str} onChange={onChange} />;
      break;
    case "links":
      control = <LinksField value={(value as LinkItem[]) ?? []} onChange={onChange} />;
      break;
    case "select":
      control = (
        <select
          id={id}
          value={str}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "date":
      control = (
        <Input id={id} type="date" value={str} onChange={(e) => onChange(e.target.value || null)} />
      );
      break;
    case "boolean":
      return (
        <label className="flex items-center gap-3">
          <Switch id={id} checked={value === true} onCheckedChange={(v) => onChange(v)} />
          <span className="text-sm">{field.label}</span>
          {field.hint && <span className="text-xs text-muted-foreground">{field.hint}</span>}
        </label>
      );
    case "price-lines":
      control = <PriceLinesField value={(value as PriceLine[]) ?? []} onChange={onChange} />;
      break;
    case "beat-category":
      control = <CategorySelect id={id} value={str} onChange={onChange} />;
      break;
    default:
      control = (
        <Input
          id={id}
          type={field.type === "url" ? "url" : "text"}
          value={str}
          required={field.required}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {field.label}
        {field.required && <span className="text-primary"> *</span>}
      </Label>
      {control}
      {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
    </div>
  );
}

function CategorySelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string | null) => void;
}) {
  const { data } = useBeatCategories();
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value || null)}
      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <option value="">— bez kategorii —</option>
      {data?.map((c) => (
        <option key={c.id} value={c.name}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

function toLocalInput(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function FileField({
  id,
  kind,
  value,
  onChange,
}: {
  id: string;
  kind: "audio" | "image";
  value: string;
  onChange: (v: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const path = `${kind}/${crypto.randomUUID()}-${safe}`;
    const { error } = await supabase!.storage.from(MEDIA_BUCKET).upload(path, file, {
      contentType: file.type,
    });
    setUploading(false);
    if (error) {
      toast.error(`Nie udało się wgrać pliku: ${error.message}`);
      return;
    }
    onChange(supabase!.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl);
    toast.success("Plik wgrany");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          id={id}
          type="url"
          value={value}
          placeholder="Wgraj plik albo wklej link"
          onChange={(e) => onChange(e.target.value || null)}
        />
        <Button type="button" variant="outline" asChild disabled={uploading}>
          <label className="cursor-pointer">
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Wgraj
            <input
              type="file"
              hidden
              accept={kind === "audio" ? "audio/*" : "image/*"}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
          </label>
        </Button>
      </div>
      {value &&
        (kind === "audio" ? (
          <audio controls src={value} className="w-full" />
        ) : (
          <img src={value} alt="" className="h-32 w-fit rounded-md object-cover" />
        ))}
    </div>
  );
}

function PriceLinesField({
  value,
  onChange,
}: {
  value: PriceLine[];
  onChange: (v: PriceLine[]) => void;
}) {
  const update = (i: number, patch: Partial<PriceLine>) =>
    onChange(value.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  return (
    <div className="flex flex-col gap-2">
      {value.map((l, i) => (
        <div key={i} className="flex gap-2">
          <Input
            className="w-1/2"
            placeholder="Opis (np. 1h – 2h) — opcjonalnie"
            value={l.label ?? ""}
            onChange={(e) => update(i, { label: e.target.value })}
          />
          <Input
            placeholder="Cena (np. 120 PLN/h)"
            value={l.price}
            onChange={(e) => update(i, { price: e.target.value })}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => onChange([...value, { label: "", price: "" }])}
      >
        <Plus className="size-4" /> Dodaj wariant ceny
      </Button>
    </div>
  );
}

function LinksField({ value, onChange }: { value: LinkItem[]; onChange: (v: LinkItem[]) => void }) {
  const update = (i: number, patch: Partial<LinkItem>) =>
    onChange(value.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  return (
    <div className="flex flex-col gap-2">
      {value.map((l, i) => (
        <div key={i} className="flex gap-2">
          <Input
            className="w-1/3"
            placeholder="Nazwa (np. Spotify)"
            value={l.label}
            onChange={(e) => update(i, { label: e.target.value })}
          />
          <Input
            type="url"
            placeholder="https://…"
            value={l.url}
            onChange={(e) => update(i, { url: e.target.value })}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => onChange([...value, { label: "", url: "" }])}
      >
        <Plus className="size-4" /> Dodaj link
      </Button>
    </div>
  );
}
