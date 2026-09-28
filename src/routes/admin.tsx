import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { Loader2, LogOut } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CollectionEditor, type CollectionConfig } from "@/components/admin/CollectionEditor";
import { BEAT_CATEGORIES } from "@/lib/content";
import { formatDate } from "@/lib/media";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import logo from "@/assets/raphouse-logo.png";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Panel admina — RapHouse" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPage,
});

const videoHint = "Link do YouTube lub Vimeo — film pokaże się na stronie.";
const linksHint = "Np. Spotify, YouTube, Instagram, Tidal.";

const collections: { value: string; label: string; config: CollectionConfig }[] = [
  {
    value: "news",
    label: "Aktualności",
    config: {
      table: "news",
      label: "Aktualność",
      orderBy: [{ column: "published_at", ascending: false }],
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
          type: "text",
          suggestions: BEAT_CATEGORIES,
          hint: "Wybierz z listy albo wpisz nową.",
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
    value: "projects",
    label: "Realizacje",
    config: {
      table: "projects",
      label: "Realizacja",
      orderBy: [
        { column: "sort_order", ascending: true },
        { column: "created_at", ascending: false },
      ],
      rowTitle: (r) => `${r["artist"]} — ${r["title"]}`,
      rowSubtitle: (r) => r["description"] as string,
      fields: [
        { name: "artist", label: "Wykonawca", type: "text", required: true },
        { name: "title", label: "Tytuł numeru", type: "text", required: true },
        { name: "description", label: "Opis", type: "textarea" },
        { name: "video_url", label: "Teledysk", type: "url", hint: videoHint },
        { name: "audio_url", label: "Plik audio (mp3)", type: "audio" },
        { name: "image_url", label: "Okładka", type: "image" },
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
        <Button variant="outline" className="mt-6" onClick={() => supabase!.auth.signOut()}>
          Wyloguj
        </Button>
      </Notice>
    );
  } else {
    content = (
      <Tabs defaultValue="news">
        <TabsList className="mb-8">
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
            <Button variant="ghost" size="sm" onClick={() => supabase!.auth.signOut()}>
              <LogOut className="size-4" /> Wyloguj
            </Button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-12">{content}</main>
      <Toaster />
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

  return (
    <form
      className="card-surface mx-auto flex max-w-sm flex-col gap-5 p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error } = await supabase!.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) setError("Nieprawidłowy email lub hasło.");
      }}
    >
      <h1 className="font-display text-4xl">Zaloguj się</h1>
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
