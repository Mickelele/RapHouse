// Zdjęcia galerii studia. Docelowo dodawane w panelu admina (zakładka Galeria → tabela
// gallery_images). Poniższa lista to placeholdery pokazywane, dopóki w bazie nie ma zdjęć.
// Pliki placeholderów: public/galeria/<file>-640.webp i <file>-1280.webp (scripts/galeria.py).

export type GalleryImage = {
  id: string;
  alt: string;
  // Wymiary największej wersji — potrzebne, żeby strona nie skakała przy ładowaniu.
  width: number;
  height: number;
  src640: string;
  src1280: string;
};

function placeholder(file: string, alt: string, width: number, height: number): GalleryImage {
  return {
    id: file,
    alt,
    width,
    height,
    src640: `/galeria/${file}-640.webp`,
    src1280: `/galeria/${file}-1280.webp`,
  };
}

// TODO: zdjęcia od klienta — placeholdery wycięte z obecnych zdjęć strony.
export const galleryImages: GalleryImage[] = [
  placeholder("placeholder-01", "Kabina nagraniowa RapHouse z mikrofonem", 1280, 960),
  placeholder("placeholder-02", "Mikrofon pojemnościowy w kabinie", 1024, 1280),
  placeholder("placeholder-03", "Stanowisko realizatora w studiu", 1280, 960),
  placeholder("placeholder-04", "Odsłuchy studyjne i adaptacja akustyczna", 1024, 1024),
  placeholder("placeholder-05", "Wnętrze kabiny nagraniowej", 864, 1152),
  placeholder("placeholder-06", "Konsola i monitor realizatora", 960, 960),
  placeholder("placeholder-07", "Mikrofon z filtrem pop", 1024, 768),
  placeholder("placeholder-08", "Detal odsłuchów studyjnych", 640, 640),
];

export function gallerySrc(img: GalleryImage, width: 640 | 1280 = 640) {
  return width === 1280 ? img.src1280 : img.src640;
}

export function gallerySrcSet(img: GalleryImage) {
  // Wersja "1280" przy mniejszym oryginale ma faktyczną szerokość oryginału.
  const small = Math.min(640, img.width);
  const large = Math.min(1280, img.width);
  return large > small
    ? `${img.src640} ${small}w, ${img.src1280} ${large}w`
    : `${img.src640} ${small}w`;
}
