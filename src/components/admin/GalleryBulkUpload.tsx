import { useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadGalleryImage } from "@/lib/gallery-upload";
import { supabase } from "@/lib/supabase";

// "IMG_2034 kabina.jpg" -> "IMG 2034 kabina" - tymczasowy opis do poprawienia w edycji.
function altFromName(name: string) {
  return (
    name
      .replace(/\.[^.]+$/, "")
      .replace(/[_-]+/g, " ")
      .trim() || "Zdjęcie studia"
  );
}

// 1 zdjęcie, 2–4 zdjęcia, 5+ zdjęć (ale 22–24 zdjęcia).
function photos(n: number) {
  if (n === 1) return "zdjęcie";
  const d = n % 10;
  const t = n % 100;
  return d >= 2 && d <= 4 && (t < 12 || t > 14) ? "zdjęcia" : "zdjęć";
}

export function GalleryBulkUpload({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const uploadAll = async (files: File[]) => {
    setProgress({ done: 0, total: files.length });
    let failed = 0;
    for (const [i, file] of files.entries()) {
      try {
        const img = await uploadGalleryImage(file);
        const { error } = await supabase!
          .from("gallery_images")
          .insert({ ...img, alt: altFromName(file.name) });
        if (error) throw error;
      } catch (e) {
        failed++;
        toast.error(`${file.name}: ${(e as Error).message}`);
      }
      setProgress({ done: i + 1, total: files.length });
    }
    setProgress(null);
    onDone();
    const ok = files.length - failed;
    if (ok) toast.success(`Wgrano ${ok} ${photos(ok)} - uzupełnij opisy (alt).`);
  };

  return (
    <Button variant="outline" asChild disabled={!!progress}>
      <label className="cursor-pointer">
        {progress ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Wgrywanie {progress.done}/{progress.total}
          </>
        ) : (
          <>
            <ImagePlus className="size-4" /> Wgraj wiele zdjęć
          </>
        )}
        <input
          type="file"
          hidden
          multiple
          accept="image/*"
          disabled={!!progress}
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            e.target.value = "";
            if (files.length) void uploadAll(files);
          }}
        />
      </label>
    </Button>
  );
}
