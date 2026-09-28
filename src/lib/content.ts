import { useQuery } from "@tanstack/react-query";
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

export const BEAT_CATEGORIES = [
  "Bangery / Mroczne",
  "RnB / Pop / Club / 80s",
  "Spokojne / Klimatyczne",
];

export function useNews() {
  return useQuery({
    queryKey: ["news"],
    enabled: !!supabase,
    queryFn: async () => {
      const { data, error } = await supabase!
        .from("news")
        .select("*")
        .eq("published", true)
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
