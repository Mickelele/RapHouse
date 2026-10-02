import { useQuery } from "@tanstack/react-query";
import { pricing as staticPricing, type PriceItem } from "@/data/raphouse";
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
