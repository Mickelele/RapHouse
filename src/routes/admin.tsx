import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import {
  Clapperboard,
  Clock,
  Disc3,
  Headphones,
  Images,
  LayoutDashboard,
  Loader2,
  Megaphone,
  Music,
  Newspaper,
  Receipt,
  Route as RouteIcon,
  ScrollText,
  Sparkles,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CollectionEditor, type CollectionConfig } from "@/components/admin/CollectionEditor";
import {
  clearLogoutReason,
  resetActivity,
  takeLogoutReason,
  useIdleLogout,
} from "@/components/admin/useIdleLogout";
import { useServerSession } from "@/components/admin/useServerSession";
import { GalleryBulkUpload } from "@/components/admin/GalleryBulkUpload";
import { MovementOrderEditor } from "@/components/admin/MovementOrderEditor";
import { AdminShell, StatTile, type AdminSection } from "@/components/admin/AdminShell";
import { removeGalleryFiles } from "@/lib/gallery-upload";
import { formatDate, youTubeId } from "@/lib/media";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import logo from "@/assets/raphouse-logo.webp";

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
      sortable: "top",
      orderBy: [
        { column: "sort_order", ascending: true },
        { column: "created_at", ascending: false },
      ],
      rowImage: (r) => (r["image_url"] as string | null) ?? null,
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
        {
          name: "description",
          label: "Opis",
          type: "textarea",
          hint: "Enter = nowa linia (na stronie też będzie w nowej linii).",
        },
        { name: "video_url", label: "Film", type: "url", hint: videoHint },
        { name: "links", label: "Linki", type: "links", hint: linksHint },
      ],
    },
  },
  {
    value: "beat_categories",
    label: "Kategorie bitów",
    config: {
      table: "beat_categories",
      label: "Kategoria bitów",
      sortable: "end",
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
      ],
    },
  },
  {
    value: "pricing",
    label: "Cennik",
    config: {
      table: "pricing",
      label: "Pozycja cennika",
      sortable: "end",
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
        {
          name: "note",
          label: "Opis",
          type: "textarea",
          hint: "Enter = nowa linia (na stronie też będzie w nowej linii).",
        },
        {
          name: "lines",
          label: "Ceny",
          type: "price-lines",
          hint: "Jedna cena albo kilka wariantów (np. 1h – 2h: 120 PLN/h). Wyróżnienie pokaże się jako zielona plakietka przy cenie, a warunek - drobnym drukiem pod nią.",
        },
        {
          name: "link",
          label: "Odnośnik z karty",
          type: "text",
          placeholder: "np. /rezerwacja, /bity#katalog, /realizacje?filtr=klipy",
          hint: "Puste = karta nieklikalna. Podstrona (/bity), sekcja (/bity#na-zamowienie) albo pełny adres (https://…).",
        },
        {
          name: "link_label",
          label: "Tekst odnośnika",
          type: "text",
          placeholder: "np. Sprawdź wolne terminy",
          hint: "Puste = „Zobacz więcej”.",
        },
      ],
    },
  },
  {
    value: "projects",
    label: "Utwory (audio)",
    config: {
      table: "projects",
      label: "Realizacja audio",
      sortable: "top",
      filter: { column: "category", value: "audio" },
      orderBy: [
        { column: "sort_order", ascending: true },
        { column: "created_at", ascending: false },
      ],
      rowImage: (r) => (r["image_url"] as string | null) ?? null,
      rowTitle: (r) => `${r["artist"]} - ${r["title"]}`,
      rowSubtitle: (r) => r["description"] as string,
      fields: [
        { name: "artist", label: "Wykonawca", type: "text", required: true },
        { name: "title", label: "Tytuł numeru", type: "text", required: true },
        {
          name: "description",
          label: "Opis",
          type: "textarea",
          hint: "Enter = nowa linia (na stronie też będzie w nowej linii).",
        },
        { name: "audio_url", label: "Plik audio (mp3)", type: "audio" },
        { name: "video_url", label: "Teledysk", type: "url", hint: videoHint },
        { name: "image_url", label: "Okładka", type: "image" },
        { name: "released_on", label: "Data premiery", type: "date", hint: "Opcjonalnie." },
        { name: "links", label: "Linki", type: "links", hint: linksHint },
      ],
    },
  },
  {
    value: "clips",
    label: "Klipy (video)",
    config: {
      table: "projects",
      label: "Klip",
      sortable: "top",
      movementToggle: true,
      filter: { column: "category", value: "video" },
      alsoInvalidate: [["admin", "projects"]],
      orderBy: [
        { column: "sort_order", ascending: true },
        { column: "created_at", ascending: false },
      ],
      rowTitle: (r) => `${r["artist"]} - ${r["title"]}`,
      rowSubtitle: (r) =>
        `${r["in_movement"] ? "★ W sekcji Ruch · " : ""}${
          r["released_on"] ? formatDate(r["released_on"] as string) : "Bez daty premiery"
        }`,
      rowImage: (r) => {
        const id = youTubeId(r["video_url"] as string | null);
        return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null;
      },
      fields: [
        {
          name: "in_movement",
          label: "Pokaż w sekcji Ruch",
          type: "boolean",
          hint: "Przewijany pasek na stronie głównej (to samo co gwiazdka na liście). Kolejność w pasku ułożysz w zakładce „Sekcja Ruch”.",
        },
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
        {
          name: "description",
          label: "Opis",
          type: "textarea",
          hint: "Enter = nowa linia (na stronie też będzie w nowej linii).",
        },
        { name: "links", label: "Linki", type: "links", hint: linksHint },
      ],
    },
  },
  {
    value: "roadmap",
    label: "Ścieżka procesu",
    config: {
      table: "roadmap_steps",
      label: "Krok ścieżki",
      sortable: "end",
      alsoInvalidate: [["roadmap_steps"]],
      orderBy: [
        { column: "sort_order", ascending: true },
        { column: "created_at", ascending: true },
      ],
      rowTitle: (r) => `${r["alternative"] ? "↳ albo " : ""}${r["label"] as string}`,
      rowSubtitle: (r) => (r["link"] as string | null) ?? "Bez odnośnika",
      fields: [
        {
          name: "label",
          label: "Nazwa kroku",
          type: "text",
          required: true,
          placeholder: "np. Mix / Master",
        },
        {
          name: "link",
          label: "Odnośnik",
          type: "text",
          placeholder: "np. /rezerwacja, /bity, /#cennik",
          hint: "Gdzie przenosi kliknięcie w krok. Puste = krok nieklikalny.",
        },
        {
          name: "alternative",
          label: "Alternatywa dla poprzedniego kroku",
          type: "boolean",
          hint: "Ścieżka się rozwidla (np. Wynajem studia albo Sesja nagraniowa). Najwyżej 2 kroki obok siebie.",
        },
      ],
    },
  },
  {
    value: "regulations",
    label: "Regulaminy",
    config: {
      table: "regulations",
      label: "Regulamin",
      sortable: "end",
      alsoInvalidate: [["regulations"]],
      orderBy: [
        { column: "sort_order", ascending: true },
        { column: "created_at", ascending: true },
      ],
      rowTitle: (r) => r["title"] as string,
      rowSubtitle: (r) => `Aktualizacja: ${formatDate(r["updated_at"] as string)}`,
      fields: [
        {
          name: "title",
          label: "Tytuł",
          type: "text",
          required: true,
          placeholder: "np. Regulamin wynajmu studia",
        },
        {
          name: "body",
          label: "Treść",
          type: "textarea",
          hint: "Enter = nowa linia, pusta linia = nowy akapit. Pokaże się na stronie /regulaminy.",
        },
      ],
    },
  },
  {
    value: "promo",
    label: "Oprawa wydania",
    config: {
      table: "promo_materials",
      label: "Oprawa wydania",
      sortable: "top",
      movementToggle: true,
      alsoInvalidate: [["promo_materials"]],
      orderBy: [
        { column: "sort_order", ascending: true },
        { column: "created_at", ascending: false },
      ],
      rowTitle: (r) =>
        `${r["kind"] === "grafika" ? "Grafika" : "Rolka"}: ${r["artist"] ? `${r["artist"] as string} - ` : ""}${r["title"] as string}`,
      rowSubtitle: (r) =>
        `${r["in_movement"] ? "★ W sekcji Ruch · " : ""}${(r["video_url"] as string | null) ?? ""}`,
      rowImage: (r) => {
        if (r["image_url"]) return r["image_url"] as string;
        const id = youTubeId(r["video_url"] as string | null);
        return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null;
      },
      fields: [
        {
          name: "in_movement",
          label: "Pokaż w sekcji Ruch",
          type: "boolean",
          hint: "Przewijany pasek na stronie głównej (to samo co gwiazdka na liście). Kolejność w pasku ułożysz w zakładce „Sekcja Ruch”.",
        },
        {
          name: "kind",
          label: "Rodzaj",
          type: "select",
          options: [
            { value: "rolka", label: "Rolka (pionowe wideo)" },
            { value: "grafika", label: "Grafika / okładka" },
          ],
        },
        { name: "title", label: "Tytuł", type: "text", required: true },
        { name: "artist", label: "Wykonawca", type: "text", hint: "Opcjonalnie." },
        {
          name: "video_url",
          label: "Link do rolki (YouTube Shorts)",
          type: "url",
          placeholder: "https://www.youtube.com/shorts/…",
          hint: "Tylko rolki. Gra sama, bez dźwięku, na stronie głównej i w Realizacjach - miniatury nie trzeba wgrywać.",
        },
        {
          name: "image_url",
          label: "Okładka / grafika (opcjonalnie)",
          type: "image",
          hint: "Grafika: wgraj obrazek z dysku. Rolka z YouTube: niepotrzebna (weźmiemy klatkę z filmu).",
        },
        {
          name: "description",
          label: "Opis",
          type: "textarea",
          hint: "Opcjonalnie, pod rolką na /realizacje.",
        },
        { name: "links", label: "Linki", type: "links", hint: linksHint },
      ],
    },
  },
  {
    value: "team",
    label: "O nas (ekipa)",
    config: {
      table: "team_members",
      label: "Osoba",
      sortable: "end",
      alsoInvalidate: [["team_members"]],
      orderBy: [
        { column: "sort_order", ascending: true },
        { column: "created_at", ascending: true },
      ],
      rowTitle: (r) => r["name"] as string,
      rowSubtitle: (r) => (r["role"] as string | null) ?? "",
      rowImage: (r) => (r["image_url"] as string | null) ?? null,
      fields: [
        { name: "name", label: "Imię / ksywka", type: "text", required: true },
        { name: "role", label: "Rola", type: "text", placeholder: "np. Realizator, Producent" },
        {
          name: "image_url",
          label: "Zdjęcie",
          type: "image",
          hint: "Najlepiej pionowe albo kwadratowe.",
        },
        {
          name: "bio",
          label: "Opis",
          type: "textarea",
          hint: "Enter = nowa linia (na stronie też będzie w nowej linii).",
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
      sortable: "end",
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
      ],
    },
  },
  {
    value: "gallery",
    label: "Galeria",
    config: {
      table: "gallery_images",
      label: "Zdjęcie galerii",
      sortable: "top",
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
      ],
    },
  },
];

// Wygląd i opis każdej zakładki panelu (menu boczne, nagłówek, pulpit).
const META: Record<string, { icon: LucideIcon; group: string; description: string }> = {
  beats: {
    icon: Music,
    group: "Muzyka",
    description: "Katalog bitów na stronie /bity i „Najnowsze bity” na stronie głównej.",
  },
  beat_categories: {
    icon: Tags,
    group: "Muzyka",
    description: "Filtry nad katalogiem bitów. Zmiana nazwy przenosi się na wszystkie bity.",
  },
  projects: {
    icon: Disc3,
    group: "Muzyka",
    description: "Utwory nagrane i zmiksowane w studiu - /realizacje (filtr Utwory).",
  },
  clips: {
    icon: Clapperboard,
    group: "Wideo i promo",
    description:
      "Teledyski na /realizacje (filtr Klipy). Gwiazdka = klip w przewijanym pasku w sekcji Ruch.",
  },
  promo: {
    icon: Megaphone,
    group: "Wideo i promo",
    description:
      "Rolki (YouTube Shorts) i grafiki: filtr „Oprawa wydania” na /realizacje i pasek w sekcji Ruch.",
  },
  pricing: {
    icon: Receipt,
    group: "Strona",
    description: "Karty w sekcji Cennik. Odnośnik z karty sprawia, że cała karta jest klikalna.",
  },
  roadmap: {
    icon: RouteIcon,
    group: "Strona",
    description: "Wężyk procesu na samej górze strony: kroki, ich odnośniki i rozwidlenia.",
  },
  team: {
    icon: Users,
    group: "Strona",
    description: "Osoby w sekcji „O nas” - zdjęcie, rola i opis.",
  },
  gear: {
    icon: Headphones,
    group: "Strona",
    description: "Lista sprzętu na stronie głównej i na podstronie /sprzet (grupowana po rodzaju).",
  },
  gallery: {
    icon: Images,
    group: "Strona",
    description: "Zdjęcia studia na /galeria. Pierwsze 5 pokazuje się też w sekcji Sprzęt.",
  },
  news: {
    icon: Newspaper,
    group: "Treści",
    description: "Wpisy na /aktualnosci. Przypięty wpis jest też na stronie głównej.",
  },
  regulations: {
    icon: ScrollText,
    group: "Treści",
    description: "Regulaminy na /regulaminy - każdy pojawia się też w stopce.",
  },
};

const GROUP_ORDER = ["Start", "Muzyka", "Wideo i promo", "Strona", "Treści"];

// Pulpit: liczba wpisów (i ukrytych) w każdej zakładce.
function Dashboard({ onSelect }: { onSelect: (value: string) => void }) {
  const { data } = useQuery({
    queryKey: ["admin", "counts"],
    queryFn: async () => {
      const entries = await Promise.all(
        collections.map(async (c) => {
          const base = () => {
            let q = supabase!.from(c.config.table).select("id", { count: "exact", head: true });
            if (c.config.filter) q = q.eq(c.config.filter.column, c.config.filter.value);
            return q;
          };
          const [all, hidden] = await Promise.all([
            base(),
            c.config.noPublish ? Promise.resolve({ count: 0 }) : base().eq("published", false),
          ]);
          return [c.value, { count: all.count ?? undefined, hidden: hidden.count ?? 0 }] as const;
        }),
      );
      return Object.fromEntries(entries);
    },
  });

  return (
    <div className="flex flex-col gap-10">
      {GROUP_ORDER.filter((g) => g !== "Start").map((g) => (
        <div key={g}>
          <p className="eyebrow mb-4">{g}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {collections
              .filter((c) => META[c.value]?.group === g)
              .map((c) => (
                <StatTile
                  key={c.value}
                  icon={META[c.value]!.icon}
                  label={c.label}
                  count={data?.[c.value]?.count}
                  hidden={data?.[c.value]?.hidden}
                  onClick={() => onSelect(c.value)}
                />
              ))}
            {g === "Wideo i promo" && (
              <StatTile
                icon={Sparkles}
                label="Sekcja Ruch"
                count={undefined}
                hidden={undefined}
                onClick={() => onSelect("movement")}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  // Otwarta zakładka w adresie (#beats…), żeby odświeżenie strony jej nie gubiło.
  const [activeValue, setActiveValue] = useState("start");

  useEffect(() => {
    const fromHash = window.location.hash.slice(1);
    if (fromHash) setActiveValue(fromHash);
  }, []);

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

  const adminActive = !!session && isAdmin === true;
  const { secondsLeft, stayLoggedIn, expired, resetExpired, logOut } = useIdleLogout(adminActive);
  // Serwer też pilnuje bezczynności (endpoint logout_idle_admins wołany przez cron).
  useServerSession(adminActive && !expired, () => void logOut());
  // Po upływie czasu bezczynności panel znika od razu, nawet zanim serwer potwierdzi wylogowanie.
  const loggedIn = !!session && !expired;

  const signOut = () => {
    clearLogoutReason();
    void supabase!.auth.signOut();
  };

  const select = (value: string) => {
    setActiveValue(value);
    history.replaceState(null, "", value === "start" ? "/admin" : `#${value}`);
    window.scrollTo({ top: 0 });
  };

  const sections: AdminSection[] = [
    {
      value: "start",
      label: "Pulpit",
      icon: LayoutDashboard,
      group: "Start",
      description:
        "Wszystko, co możesz zmienić na stronie. Kliknij kafelek, żeby przejść do edycji.",
      render: () => <Dashboard onSelect={select} />,
    },
    ...collections.map((c) => ({
      value: c.value,
      label: c.label,
      icon: META[c.value]?.icon ?? LayoutDashboard,
      group: META[c.value]?.group ?? "Inne",
      description: META[c.value]?.description ?? "",
      render: () => <CollectionEditor key={c.value} config={c.config} />,
    })),
    {
      value: "movement",
      label: "Sekcja Ruch",
      icon: Sparkles,
      group: "Wideo i promo",
      description:
        "Kolejność przewijanego paska z rolkami, klipami i grafikami w sekcji Ruch na stronie głównej.",
      render: () => <MovementOrderEditor />,
    },
  ].sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group));
  const active = sections.find((s) => s.value === activeValue) ?? sections[0]!;

  let screen: React.ReactNode = null;
  if (!isSupabaseConfigured) {
    screen = (
      <Notice>
        Baza danych nie jest jeszcze podłączona. Uzupełnij <code>VITE_SUPABASE_URL</code> i{" "}
        <code>VITE_SUPABASE_ANON_KEY</code> w pliku <code>.env</code>.
      </Notice>
    );
  } else if (session === undefined || (loggedIn && isAdmin === null)) {
    screen = <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />;
  } else if (!loggedIn) {
    screen = <LoginForm onLoggedIn={resetExpired} />;
  } else if (!isAdmin) {
    screen = (
      <Notice>
        Konto {session?.user.email} nie ma uprawnień administratora.
        <Button variant="outline" className="mt-6" onClick={signOut}>
          Wyloguj
        </Button>
      </Notice>
    );
  }

  return (
    <>
      {screen ? (
        // Logowanie i komunikaty: środek ekranu z zieloną poświatą.
        <div className="relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden bg-background px-5 py-16 text-foreground">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/3 h-[36rem] w-[36rem] max-w-full -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_14%,transparent),transparent)]"
          />
          <a href="/" className="relative flex flex-col items-center gap-3">
            <img src={logo} alt="RapHouse" className="h-20 w-auto" />
            <span className="eyebrow">Panel admina</span>
          </a>
          <div className="relative w-full">{screen}</div>
        </div>
      ) : (
        <AdminShell
          sections={sections}
          active={active}
          onSelect={select}
          email={session?.user.email}
          onSignOut={signOut}
        >
          {active.render()}
        </AdminShell>
      )}
      {secondsLeft !== null && <IdleWarning seconds={secondsLeft} onStay={stayLoggedIn} />}
      <Toaster />
    </>
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

function LoginForm({ onLoggedIn }: { onLoggedIn: () => void }) {
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
        else {
          clearLogoutReason();
          onLoggedIn();
        }
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
