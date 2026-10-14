"""
Film z mikrofonem na białym tle -> 144 klatki PNG z przezroczystym tłem (do mikrofon-zrodla/).

Użycie:  python scripts/mikrofon-z-filmu.py ŚCIEŻKA_DO_FILMU.mp4
Wymaga:  python -m pip install opencv-python numpy
Potem wersje na stronę (przycięte, 760 px, WebP) idą do public/mikrofon/frame_001…144.webp.

1. Dekodowanie i zmniejszenie do 1080x1920 (INTER_AREA - przy okazji tłumi szum kompresji).
2. 122 -> 144 klatek: brakujące pozycje z interpolacji ruchu (optical flow DIS), nie z dublowania.
3. Usuwanie tła:
   - "obiekt" = piksel wyraźnie różny od koloru tła;
   - białe obszary połączone z krawędzią kadru = tło;
   - zamknięte białe "wyspy": otoczone ciemnym (prześwit przez uchwyt, oczka siatki) = tło,
     otoczone jasnym metalem (błysk na kapsule) = część mikrofonu;
   - miękkie krawędzie + usunięcie białej poświaty z półprzezroczystych pikseli.
"""

import os
import sys

import cv2
import numpy as np

ARGS = [a for a in sys.argv[1:] if not a.isdigit()]
SRC = ARGS[0] if ARGS else "mikrofon.mp4"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "mikrofon-zrodla")
W, H = 1080, 1920
TARGET = 144

# Progi (odległość koloru od tła, skala 0-441).
HARD = 22  # powyżej: na pewno obiekt
SOFT_LO, SOFT_HI = 7, 70  # miękka krawędź
RING_DARK = 120  # średnia jasność otoczenia wyspy poniżej = prześwit (tło)
MIN_SPECK = 40  # drobne plamki szumu kompresji (px) usuwane


def read_frames():
    cap = cv2.VideoCapture(SRC)
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        frames.append(cv2.resize(f, (W, H), interpolation=cv2.INTER_AREA))
    return frames


def interpolate(a, b, t, dis):
    """Klatka pośrednia a->b w czasie t (0..1) przez wzajemne zawinięcie wg optical flow."""
    if t < 0.02:
        return a
    if t > 0.98:
        return b
    small = (W // 2, H // 2)
    ga = cv2.cvtColor(cv2.resize(a, small), cv2.COLOR_BGR2GRAY)
    gb = cv2.cvtColor(cv2.resize(b, small), cv2.COLOR_BGR2GRAY)
    f_ab = cv2.resize(dis.calc(ga, gb, None), (W, H)) * 2
    f_ba = cv2.resize(dis.calc(gb, ga, None), (W, H)) * 2
    gx, gy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    # piksel klatki pośredniej pobierany z a (cofnięty o t) i z b (cofnięty o 1-t)
    wa = cv2.remap(a, gx - f_ab[..., 0] * t, gy - f_ab[..., 1] * t, cv2.INTER_LINEAR,
                   borderMode=cv2.BORDER_REPLICATE)
    wb = cv2.remap(b, gx - f_ba[..., 0] * (1 - t), gy - f_ba[..., 1] * (1 - t), cv2.INTER_LINEAR,
                   borderMode=cv2.BORDER_REPLICATE)
    return cv2.addWeighted(wa, 1 - t, wb, t, 0)


def background_plate(img):
    """Lokalny kolor tła w każdym punkcie: tło ma cienie (np. w środku uchwytu ~238 zamiast 252),
    więc zamiast jednego koloru liczona jest gładka "plansza" z jasnych, szarych pikseli wokół."""
    small = cv2.resize(img, (W // 4, H // 4), interpolation=cv2.INTER_AREA).astype(np.float32)
    hsv = cv2.cvtColor(small.astype(np.uint8), cv2.COLOR_BGR2HSV)
    lum = small.mean(axis=2)
    cand = ((lum > 218) & (hsv[..., 1] < 22)).astype(np.float32)
    num = cv2.GaussianBlur(small * cand[..., None], (0, 0), 9)
    den = cv2.GaussianBlur(cand, (0, 0), 9)[..., None]
    border = np.concatenate([small[:3].reshape(-1, 3), small[-3:].reshape(-1, 3)])
    fallback = np.median(border, axis=0)
    plate = np.where(den > 0.03, num / np.maximum(den, 1e-6), fallback)
    return cv2.resize(plate, (W, H), interpolation=cv2.INTER_LINEAR).astype(np.float32)


def matte(img):
    bg = background_plate(img)
    f = img.astype(np.float32)
    dist = np.linalg.norm(f - bg, axis=2)
    lum = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)

    obj = (dist > HARD).astype(np.uint8)
    # drobny szum kompresji wokół krawędzi
    n, lab, stats, _ = cv2.connectedComponentsWithStats(obj, 8)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] < MIN_SPECK:
            obj[lab == i] = 0

    # białe obszary: połączone z krawędzią = tło; zamknięte = ocena po otoczeniu
    white = (1 - obj).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(white, 4)
    solid = obj.copy()
    # Otoczenie mierzone w pasku 4-12 px od wyspy - za wygładzoną (jasnoszarą) krawędzią.
    k_in = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
    k_out = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))
    for i in range(1, n):
        x, y, w, h, area = stats[i]
        if x == 0 or y == 0 or x + w >= W or y + h >= H:
            continue  # dotyka krawędzi kadru -> tło
        x0, y0 = max(0, x - 14), max(0, y - 14)
        x1, y1 = min(W, x + w + 14), min(H, y + h + 14)
        comp = (lab[y0:y1, x0:x1] == i).astype(np.uint8)
        ring = cv2.dilate(comp, k_out) - cv2.dilate(comp, k_in)
        ring_lum = lum[y0:y1, x0:x1][ring > 0]
        if ring_lum.size and np.median(ring_lum) >= RING_DARK:
            solid[y0:y1, x0:x1][comp > 0] = 1  # błysk na jasnym metalu -> część mikrofonu
        # inaczej: prześwit otoczony ciemnym -> zostaje przezroczysty

    # alfa: wnętrze pełne, krawędzie miękkie wg odległości od koloru tła
    soft = np.clip((dist - SOFT_LO) / (SOFT_HI - SOFT_LO), 0, 1)
    inner = cv2.erode(solid, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    near = cv2.dilate(solid, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    alpha = np.where(inner > 0, 1.0, soft) * (near > 0)
    # wyspy uznane za metal: pełne krycie (inaczej byłyby półprzezroczyste)
    alpha = np.maximum(alpha, (solid > 0) & (obj == 0)).astype(np.float32)
    alpha = cv2.GaussianBlur(alpha, (3, 3), 0)

    # usunięcie białej poświaty: C = a*F + (1-a)*B  ->  F = (C - (1-a)*B) / a
    a = alpha[..., None]
    fg = np.where(a > 0.03, (f - (1 - a) * bg) / np.maximum(a, 0.03), f)
    fg = np.clip(fg, 0, 255)
    rgba = np.dstack([fg, alpha * 255]).astype(np.uint8)
    return rgba  # BGRA


def main():
    os.makedirs(OUT, exist_ok=True)
    frames = read_frames()
    n = len(frames)
    print("klatki źródłowe:", n, flush=True)
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    only = [int(a) for a in sys.argv[1:] if a.isdigit()]  # opcjonalnie: tylko wybrane klatki
    for k in range(TARGET):
        if only and k not in only:
            continue
        pos = k * (n - 1) / (TARGET - 1)
        i = int(pos)
        t = pos - i
        src = frames[i] if i + 1 >= n else interpolate(frames[i], frames[i + 1], t, dis)
        # cv2.imwrite po cichu nie zapisuje przy polskich znakach w ścieżce (Windows)
        ok, buf = cv2.imencode(".png", matte(src))
        with open(os.path.join(OUT, f"frame_{k + 1:03d}.png"), "wb") as fh:
            fh.write(buf.tobytes())
        if k % 12 == 0:
            print(f"{k + 1}/{TARGET}", flush=True)
    print("gotowe", flush=True)


if __name__ == "__main__":
    main()
