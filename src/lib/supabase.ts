import { createClient } from "@supabase/supabase-js";

const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const anonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Bez skonfigurowanych kluczy strona działa dalej na treściach statycznych.
export const supabase = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: typeof window !== "undefined" },
    })
  : null;

export const MEDIA_BUCKET = "media";
