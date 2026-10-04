import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { Clock, Loader2, LogOut } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CollectionEditor, type CollectionConfig } from "@/components/admin/CollectionEditor";
import {
  clearLogoutReason,
  resetActivity,
  takeLogoutReason,
  useIdleLogout,
} from "@/components/admin/useIdleLogout";
import { GalleryBulkUpload } from "@/components/admin/GalleryBulkUpload";
import { removeGalleryFiles } from "@/lib/gallery-upload";
import { formatDate, youTubeId } from "@/lib/media";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import logo from "@/assets/raphouse-logo.png";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Panel admina - RapHouse" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPage,
});

const videoHint = "Link do YouTube lub Vimeo - film pokaże się na stronie.";
const linksHint = "Np. Spotify, YouTube, Instagram, Tidal.";

const collections: { value: string; label: string; config: CollectionConfig }[] = [
  {
    value: "news",
    label: "Aktualności",
    config: {
      table: "news",
      label: "Aktualność",
      pinnable: true,
      orderBy: [
        { column: "pinned", ascending: false },
        { column: "published_at", ascending: false },
      ],
      rowTitle: (r) => r["title"] as string,
      rowSubtitle: (r) => formatDate(r["published_at"] as string),
      fields: [
        { name: "title", label: "Tytuł", type: "text", required: true },
        { name: "body", label: "Treść", type: "textarea" },
        { name: "image_url", label: "Zdjęcie", type: "image" },
        { name: "video_url", label: "Film", type: "url", hint: videoHint },
        { name: "links", label: "Linki", type: "links", hint: linksHint },
        {
          name: "published_at",
          label: "Data publikacji",
          type: "datetime",
          hint: "Puste = teraz.",
        },
        {
          name: "pinned",
          label: "Przypnij na stronie głównej",
          type: "boolean",
          hint: "Poprzednio przypięta zostanie odpięta.",
        },
      ],
    },
  },
  {
    value: "beats",
    label: "Bity",
    config: {
      table: "beats",
      label: "Bit",
      orderBy: [
        { column: "sort_order", ascending: true },
        { column: "created_at", ascending: false },
      ],
      rowTitle: (r) => r["title"] as string,
      rowSubtitle: (r) =>
        [r["category"], r["bpm"] && `${r["bpm"]} BPM`, r["price"]].filter(Boolean).join(" · "),
      fields: [
        { name: "title", label: "Tytuł", type: "text", required: true },
        {
          name: "category",
          label: "Kategoria",
          type: "beat-category",
          hint: "Nowe kategorie dodasz w zakładce „Kategorie bitów”.",
        },
        { name: "bpm", label: "BPM", type: "number" },
        { name: "price", label: "Cena", type: "text", placeholder: "np. 400 PLN" },
        { name: "audio_url", label: "Plik audio (mp3)", type: "audio" },
        { name: "image_url", label: "Okładka", type: "image" },
        { name: "description", label: "Opis", type: "textarea" },
        { name: "video_url", label: "Film", type: "url", hint: videoHint },
        { name: "links", label: "Linki", type: "links", hint: linksHint },
        {
          name: "sort_order",
          label: "Kolejność",
          type: "number",
          hint: "Mniejsza liczba = wyżej na liście.",
        },
      ],
    },
  },
  {
    value: "beat_categories",
    label: "Kategorie bitów",
    config: {
      table: "beat_categories",
      label: "Kategoria bitów",
      noPublish: true,
      alsoInvalidate: [["beats"], ["admin", "beats"]],
      orderBy: [
        { column: "sort_order", ascending: true },
        { column: "name", ascending: true },
      ],
      rowTitle: (r) => r["name"] as string,
      rowSubtitle: (r) => `Kolejność: ${r["sort_order"]}`,
      fields: [
        {
          name: "name",
          label: "Nazwa",
          type: "text",
          required: true,
          placeholder: "np. Drill / UK",
          hint: "Zmiana nazwy przeniesie się na wszystkie bity z tej kategorii.",
        },
        {
          name: "sort_order",
          label: "Kolejność",
          type: "number",
          hint: "Mniejsza liczba = wcześniej na liście filtrów.",
        },
      ],
    },
  },
  {
    value: "pricing",
    label: "Cennik",
    config: {
      table: "pricing",
      label: "Pozycja cennika",
      alsoInvalidate: [["pricing"]],
      orderBy: [
        { column: "sort_order", ascending: true },
        { column: "created_at", ascending: true },
      ],
      rowTitle: (r) => r["title"] as string,
      rowSubtitle: (r) =>
        ((r["lines"] as { label?: string; price: string }[]) ?? [])
          .map((l) => (l.label ? `${l.label}: ${l.price}` : l.price))
          .join(" · "),
      fields: [
        { name: "title", label: "Nazwa usługi", type: "text", required: true },
        { name: "note", label: "Opis", type: "textarea" },
        {
          name: "lines",
          label: "Ceny",
          type: "price-lines",
          hint: "Jedna cena albo kilka wariantów (np. 1h – 2h: 120 PLN/h). Pozycje „Bity z katalogu” i „Bit na zamówienie” pokazują się też na stronie /bity.",
        },
        {
          name: "sort_order",
          label: "Kolejność",
          type: "number",
          hint: "Mniejsza liczba = wcześniej w cenniku.",
        },
      ],
    },
  },
  {
    value: "projects",
    label: "Realizacje (audio)",
    config: {
      table: "projects",
      label: "Realizacja audio",
      filter: { column: "category", value: "audio" },
      orderBy: [
        { column: "sort_order", ascending: true },
        { column: "created_at", ascending: false },
      ],
      rowTitle: (r) => `${r["artist"]} - ${r["title"]}`,
      rowSubtitle: (r) => r["description"] as string,
      fields: [
        { name: "artist", label: "Wykonawca", type: "text", required: true },
        { name: "title", label: "Tytuł numeru", type: "text", required: true },
        { name: "description", label: "Opis", type: "textarea" },
        { name: "audio_url", label: "Plik audio (mp3)", type: "audio" },
        { name: "video_url", label: "Teledysk", type: "url", hint: videoHint },
        { name: "image_url", label: "Okładka", type: "image" },
        { name: "released_on", label: "Data premiery", type: "date", hint: "Opcjonalnie." },
        { name: "links", label: "Linki", type: "links", hint: linksHint },
        {
          name: "sort_order",
          label: "Kolejność",
          type: "number",
          hint: "Mniejsza liczba = wyżej na liście.",
        },
      ],
    },
  },
  {
    value: "clips",
    label: "Klipy (video)",
    config: {
      table: "projects",
      label: "Klip",
      filter: { column: "category", value: "video" },
      alsoInvalidate: [["admin", "projects"]],
      orderBy: [
        { column: "sort_order", ascending: true },
        { column: "created_at", ascending: false },
      ],
      rowTitle: (r) => `${r["artist"]} - ${r["title"]}`,
      rowSubtitle: (r) =>
        r["released_on"] ? formatDate(r["released_on"] as string) : "Bez daty premiery",
      rowImage: (r) => {
        const id = youTubeId(r["video_url"] as string | null);
        return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null;
      },
      fields: [
        { name: "artist", label: "Wykonawca", type: "text", required: true },
        { name: "title", label: "Tytuł klipu", type: "text", required: true },
        {
          name: "video_url",
          label: "Link do YouTube",
          type: "url",
          required: true,
          placeholder: "https://www.youtube.com/watch?v=…",
          hint: "Działa każdy link do filmu (także youtu.be i shorts). Pokaże się w Realizacjach → Video.",
        },
        { name: "released_on", label: "Data premiery", type: "date", hint: "Opcjonalnie." },
        { name: "description", label: "Opis", type: "textarea" },
        { name: "links", label: "Linki", type: "links", hint: linksHint },
        {
          name: "sort_order",
          label: "Kolejność",
          type: "number",
          hint: "Mniejsza liczba = wyżej na liście.",
        },
      ],
    },
  },
  {
    value: "gear",
    label: "Sprzęt",
    config: {
      table: "gear",
      label: "Sprzęt",
      alsoInvalidate: [["gear"]],
      orderBy: [
        { column: "sort_order", ascending: true },
        { column: "created_at", ascending: true },
      ],
      rowTitle: (r) => r["name"] as string,
      rowSubtitle: (r) => (r["tag"] as string | null) ?? "",
      fields: [
        {
          name: "name",
          label: "Nazwa",
          type: "text",
          required: true,
          placeholder: "np. Apollo Twin",
        },
        {
          name: "tag",
          label: "Rodzaj",
          type: "text",
          placeholder: "np. Interface, DAW, Wtyczki",
        },
        {
          name: "sort_order",
          label: "Kolejność",
          type: "number",
          hint: "Mniejsza liczba = wyżej na liście.",
        },
      ],
    },
  },
  {
    value: "gallery",
    label: "Galeria",
    config: {
      table: "gallery_images",
      label: "Zdjęcie galerii",
      alsoInvalidate: [["gallery_images"]],
      orderBy: [
        { column: "sort_order", ascending: true },
        { column: "created_at", ascending: false },
      ],
      rowTitle: (r) => r["alt"] as string,
      rowSubtitle: (r) => `${r["width"]}×${r["height"]} px`,
      rowImage: (r) => r["src_640"] as string,
      toolbar: (refresh) => <GalleryBulkUpload onDone={refresh} />,
      onDelete: (r) => removeGalleryFiles([r["src_640"] as string, r["src_1280"] as string]),
      fields: [
        {
          name: "src_1280",
          label: "Zdjęcie",
          type: "gallery-image",
          required: true,
          hint: "Zostanie zmniejszone do 640 i 1280 px (WebP) - oryginał nie trafia na serwer.",
        },
        {
          name: "alt",
          label: "Opis zdjęcia (alt)",
          type: "text",
          required: true,
          placeholder: "np. Kabina nagraniowa z mikrofonem",
          hint: "Krótko, co widać na zdjęciu - dla niewidomych i dla Google.",
        },
        {
          name: "sort_order",
          label: "Kolejność",
          type: "number",
          hint: "Mniejsza liczba = wcześniej w galerii. Pierwsze 4 pokazują się na stronie głównej.",
        },
      ],
    },
  },
];

function AdminPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(null);
      return;
    }
    supabase!.rpc("is_admin").then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  const { secondsLeft, stayLoggedIn } = useIdleLogout(!!session && isAdmin === true);

  const signOut = () => {
    clearLogoutReason();
    void supabase!.auth.signOut();
  };

  let content: React.ReactNode;
  if (!isSupabaseConfigured) {
    content = (
      <Notice>
        Baza danych nie jest jeszcze podłączona. Uzupełnij <code>VITE_SUPABASE_URL</code> i{" "}
        <code>VITE_SUPABASE_ANON_KEY</code> w pliku <code>.env</code>.
      </Notice>
    );
  } else if (session === undefined || (session && isAdmin === null)) {
    content = <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />;
  } else if (!session) {
    content = <LoginForm />;
  } else if (!isAdmin) {
    content = (
      <Notice>
        Konto {session.user.email} nie ma uprawnień administratora.
        <Button variant="outline" className="mt-6" onClick={signOut}>
          Wyloguj
        </Button>
      </Notice>
    );
  } else {
    content = (
      <Tabs defaultValue="news">
        <TabsList className="mb-8 h-auto flex-wrap justify-start">
          {collections.map((c) => (
            <TabsTrigger key={c.value} value={c.value}>
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {collections.map((c) => (
          <TabsContent key={c.value} value={c.value}>
            <CollectionEditor config={c.config} />
          </TabsContent>
        ))}
      </Tabs>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5">
          <a href="/" className="flex items-center gap-4">
            <img src={logo} alt="RapHouse" className="h-10 w-auto" />
            <span className="eyebrow">Panel admina</span>
          </a>
          {session && (
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="size-4" /> Wyloguj
            </Button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-12">{content}</main>
      {secondsLeft !== null && <IdleWarning seconds={secondsLeft} onStay={stayLoggedIn} />}
      <Toaster />
    </div>
  );
}

function IdleWarning({ seconds, onStay }: { seconds: number; onStay: () => void }) {
  return (
    <div
      role="alertdialog"
      aria-labelledby="idle-title"
      aria-describedby="idle-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
    >
      <div className="card-surface flex w-full max-w-sm flex-col items-center gap-5 p-8 text-center">
        <Clock className="size-8 text-primary" />
        <h2 id="idle-title" className="font-display text-3xl">
          Jesteś tam?
        </h2>
        <p id="idle-desc" className="text-muted-foreground">
          Z powodu braku aktywności wylogujemy Cię za{" "}
          <span className="font-semibold tabular-nums text-foreground">{seconds} s</span>.
        </p>
        <Button autoFocus onClick={onStay} className="w-full">
          Zostań zalogowany
        </Button>
      </div>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-surface mx-auto flex max-w-md flex-col items-center p-8 text-center text-muted-foreground">
      {children}
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice] = useState(takeLogoutReason);

  return (
    <form
      className="card-surface mx-auto flex max-w-sm flex-col gap-5 p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        resetActivity();
        const { error } = await supabase!.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) setError("Nieprawidłowy email lub hasło.");
        else clearLogoutReason();
      }}
    >
      <h1 className="font-display text-4xl">Zaloguj się</h1>
      {notice && (
        <p
          role="status"
          className="rounded border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground"
        >
          {notice}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Hasło</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />} Zaloguj
      </Button>
    </form>
  );
}
