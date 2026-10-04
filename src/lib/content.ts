import { useQuery } from "@tanstack/react-query";
import { galleryImages as staticGallery, type GalleryImage } from "@/data/gallery";
import { gear as staticGear, pricing as staticPricing, type PriceItem } from "@/data/raphouse";
import { supabase } from "./supabase";

export type LinkItem = { label: string; url: string };

export type NewsPost = {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  video_url: string | null;
  links: LinkItem[];
  published: boolean;
  pinned: boolean;
  published_at: string;
  created_at: string;
};

export type Beat = {
  id: string;
  title: string;
  category: string | null;
  bpm: number | null;
  price: string | null;
  description: string;
  audio_url: string | null;
  image_url: string | null;
  video_url: string | null;
  links: LinkItem[];
  published: boolean;
  sort_order: number;
  created_at: string;
};

export type Project = {
  id: string;
  artist: string;
  title: string;
  description: string;
  audio_url: string | null;
  image_url: string | null;
  video_url: string | null;
  links: LinkItem[];
  published: boolean;
  sort_order: number;
  created_at: string;
  // Brak kolumny (przed migracją) = "audio".
  category?: "audio" | "video";
  released_on?: string | null;
};

export type BeatCategory = { id: string; name: string; sort_order: number };

export function useBeatCategories() {
  return useQuery({
    queryKey: ["beat_categories"],
    enabled: !!supabase,
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("beat_categories")
        .select("id, name, sort_order")
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data as BeatCategory[];
    },
  });
}

export function useNews() {
  return useQuery({
    queryKey: ["news"],
    enabled: !!supabase,
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("news")
        .select("*")
        .eq("published", true)
        .order("pinned", { ascending: false })
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data as NewsPost[];
    },
  });
}

export function useBeats() {
  return useQuery({
    queryKey: ["beats"],
    enabled: !!supabase,
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("beats")
        .select("*")
        .eq("published", true)
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Beat[];
    },
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    enabled: !!supabase,
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("projects")
        .select("*")
        .eq("published", true)
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
  });
}

// Najnowsze bity (po dacie dodania) — sekcja na stronie głównej.
export function useLatestBeats(limit = 3) {
  return useQuery({
    queryKey: ["beats", "latest", limit],
    enabled: !!supabase,
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("beats")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        // Bity wgrane jednym zapytaniem mają tę samą datę — wtedy rozstrzyga kolejność.
        .order("sort_order", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as Beat[];
    },
  });
}

type PricingRow = PriceItem & { id: string };

// Cennik z bazy; dopóki baza nie odpowie (albo jest pusta), statyczny z data/raphouse.ts.
export function usePricing(): PriceItem[] {
  const { data } = useQuery({
    queryKey: ["pricing"],
    enabled: !!supabase,
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("pricing")
        .select("id, title, note, lines")
        .eq("published", true)
        .order("sort_order")
        .order("created_at");
      if (error) throw error;
      return data as PricingRow[];
    },
  });
  return data?.length ? data : staticPricing;
}

type GalleryRow = {
  id: string;
  alt: string;
  src_640: string;
  src_1280: string;
  width: number;
  height: number;
};

// Zdjęcia galerii z bazy; dopóki baza nie odpowie (albo jest pusta), placeholdery.
export function useGalleryImages(): GalleryImage[] {
  const { data } = useQuery({
    queryKey: ["gallery_images"],
    enabled: !!supabase,
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("gallery_images")
        .select("id, alt, src_640, src_1280, width, height")
        .eq("published", true)
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as GalleryRow[]).map((r) => ({
        id: r.id,
        alt: r.alt,
        width: r.width,
        height: r.height,
        src640: r.src_640,
        src1280: r.src_1280,
      }));
    },
  });
  return data?.length ? data : staticGallery;
}

export type GearItem = { name: string; tag: string | null };

// Lista sprzętu z bazy; zapasowo statyczna z data/raphouse.ts.
export function useGear(): GearItem[] {
  const { data } = useQuery({
    queryKey: ["gear"],
    enabled: !!supabase,
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("gear")
        .select("name, tag")
        .eq("published", true)
        .order("sort_order")
        .order("created_at");
      if (error) throw error;
      return data as GearItem[];
    },
  });
  return data?.length ? data : staticGear;
}
