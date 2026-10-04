"""
Przygotowanie zdjęć do galerii.

1. Wrzuć oryginały (jpg/png/webp/heic->jpg) do katalogu  galeria-zrodla/  w głównym folderze projektu.
2. Uruchom:  python scripts/galeria.py      (wymaga Pillow:  python -m pip install pillow)
3. Skrypt zapisze wersje WebP 640 px i 1280 px w  public/galeria/  i wypisze wpisy
   do wklejenia w  src/data/gallery.ts  - uzupełnij w nich opis (alt) każdego zdjęcia.

Nazwa pliku wynikowego pochodzi od nazwy oryginału (małe litery, bez polskich znaków i spacji).
"""

import re
import sys
import unicodedata
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "galeria-zrodla"
OUT = ROOT / "public" / "galeria"
WIDTHS = (640, 1280)
QUALITY = 80


def slug(name: str) -> str:
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "zdjecie"


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    files = sorted(
        p for p in SRC.glob("*") if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
    )
    if not files:
        print(f"Brak zdjęć w {SRC}")
        return 1
    OUT.mkdir(parents=True, exist_ok=True)

    entries = []
    for path in files:
        name = slug(path.stem)
        img = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
        for w in WIDTHS:
            target = img if img.width <= w else img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)
            target.save(OUT / f"{name}-{w}.webp", "WEBP", quality=QUALITY, method=6)
        h = round(img.height * min(img.width, WIDTHS[-1]) / img.width)
        entries.append(f'  {{ file: "{name}", alt: "TODO: opis zdjęcia", width: {min(img.width, WIDTHS[-1])}, height: {h} }},')
        print(f"OK  {path.name} -> public/galeria/{name}-{{{','.join(map(str, WIDTHS))}}}.webp")

    print("\nWklej do tablicy galleryImages w src/data/gallery.ts:\n")
    print("\n".join(entries))
    return 0


if __name__ == "__main__":
    sys.exit(main())
