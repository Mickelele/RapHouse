// Zdjęcia galerii studia. Pliki: public/galeria/<file>-640.webp i <file>-1280.webp
// (generuje je scripts/galeria.py z oryginałów wrzuconych do galeria-zrodla/).
// width/height = wymiary największej wersji — potrzebne, żeby strona nie skakała przy ładowaniu.

export type GalleryImage = {
  file: string;
  alt: string;
  width: number;
  height: number;
};

export const GALLERY_WIDTHS = [640, 1280] as const;

// TODO: zdjęcia od klienta — poniższe to placeholdery wycięte z obecnych zdjęć strony.
export const galleryImages: GalleryImage[] = [
  {
    file: "placeholder-01",
    alt: "Kabina nagraniowa RapHouse z mikrofonem",
    width: 1280,
    height: 960,
  },
  {
    file: "placeholder-02",
    alt: "Mikrofon pojemnościowy w kabinie",
    width: 1024,
    height: 1280,
  },
  { file: "placeholder-03", alt: "Stanowisko realizatora w studiu", width: 1280, height: 960 },
  {
    file: "placeholder-04",
    alt: "Odsłuchy studyjne i adaptacja akustyczna",
    width: 1024,
    height: 1024,
  },
  { file: "placeholder-05", alt: "Wnętrze kabiny nagraniowej", width: 864, height: 1152 },
  { file: "placeholder-06", alt: "Konsola i monitor realizatora", width: 960, height: 960 },
  { file: "placeholder-07", alt: "Mikrofon z filtrem pop", width: 1024, height: 768 },
  { file: "placeholder-08", alt: "Detal odsłuchów studyjnych", width: 640, height: 640 },
];

export function gallerySrc(img: GalleryImage, width: number = GALLERY_WIDTHS[0]) {
  return `/galeria/${img.file}-${width}.webp`;
}

export function gallerySrcSet(img: GalleryImage) {
  // Plik "-1280" przy mniejszym oryginale ma faktyczną szerokość oryginału.
  const seen = new Set<number>();
  return GALLERY_WIDTHS.flatMap((w) => {
    const real = Math.min(w, img.width);
    if (seen.has(real)) return [];
    seen.add(real);
    return [`${gallerySrc(img, w)} ${real}w`];
  }).join(", ");
}
