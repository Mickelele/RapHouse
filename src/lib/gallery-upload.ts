import { MEDIA_BUCKET, supabase } from "./supabase";

const SIZES = [640, 1280] as const;
const QUALITY = 0.8;

export type UploadedGalleryImage = {
  src_640: string;
  src_1280: string;
  width: number;
  height: number;
};

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Nie udało się przetworzyć zdjęcia."))),
      "image/webp",
      QUALITY,
    ),
  );
}

// Zmniejsza zdjęcie w przeglądarce do 640 i 1280 px (WebP) i wgrywa obie wersje do bucketu
// "media". Oryginał nie trafia na serwer.
export async function uploadGalleryImage(file: File): Promise<UploadedGalleryImage> {
  // imageOrientation: zdjęcia z telefonu obracają się zgodnie z EXIF.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const id = crypto.randomUUID();
  const urls: Record<number, string> = {};
  let width = 0;
  let height = 0;

  try {
    for (const size of SIZES) {
      const scale = Math.min(1, size / bitmap.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await toBlob(canvas);
      // Starsze Safari nie koduje WebP i zwraca PNG — rozszerzenie zgodne z faktycznym typem.
      const ext = blob.type === "image/webp" ? "webp" : "png";
      const path = `gallery/${id}-${size}.${ext}`;
      const { error } = await supabase!.storage
        .from(MEDIA_BUCKET)
        .upload(path, blob, { contentType: blob.type });
      if (error) throw error;
      urls[size] = supabase!.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
      width = canvas.width;
      height = canvas.height;
    }
  } finally {
    bitmap.close();
  }

  return { src_640: urls[640]!, src_1280: urls[1280]!, width, height };
}

// Usuwa pliki zdjęcia z bucketu (przy usuwaniu wpisu galerii).
export async function removeGalleryFiles(urls: (string | null | undefined)[]) {
  const marker = `/object/public/${MEDIA_BUCKET}/`;
  const paths = urls
    .filter((u): u is string => !!u && u.includes(marker))
    .map((u) => decodeURIComponent(u.split(marker)[1]!));
  if (paths.length) await supabase!.storage.from(MEDIA_BUCKET).remove(paths);
}
