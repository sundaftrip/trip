#!/usr/bin/env python3
"""
Process trip photos for the /partner page: brightness/contrast/color edit,
crop to a uniform 3:2 landscape, and optimize for web.

Source photos: ~/Downloads/foto-trip-partner/
Output:        ~/sundaftrip/public/trip-photos/trip-1.jpg ... trip-6.jpg

Adjust the per-photo `bright` value to taste, then re-run:
    python3 process_trip_photos.py
"""

import os
from PIL import Image, ImageEnhance, ImageOps

SRC_DIR = os.path.expanduser("~/Downloads/foto-trip-partner")
OUT_DIR = os.path.expanduser("~/sundaftrip/public/trip-photos")

TARGET_W, TARGET_H = 1200, 800  # 3:2 landscape

# bright/contrast/color = enhancement factors (1.0 = unchanged)
# v = vertical crop anchor (0 = keep top, 0.5 = center, 1 = keep bottom)
PHOTOS = [
    {"src": "PHOTO-2026-05-19-04-07-51.jpg",   "out": "trip-1.jpg",
     "bright": 1.18, "contrast": 1.06, "color": 1.08, "v": 0.62},
    {"src": "PHOTO-2026-05-19-04-13-22.jpg",   "out": "trip-2.jpg",
     "bright": 1.05, "contrast": 1.04, "color": 1.06, "v": 0.42},
    {"src": "PHOTO-2026-05-19-04-11-46 2.jpg", "out": "trip-3.jpg",
     "bright": 1.07, "contrast": 1.05, "color": 1.05, "v": 0.50},
    {"src": "PHOTO-2026-05-19-04-08-25.jpg",   "out": "trip-4.jpg",
     "bright": 1.11, "contrast": 1.07, "color": 1.08, "v": 0.85},
    {"src": "PHOTO-2026-05-19-04-09-10.jpg",   "out": "trip-5.jpg",
     "bright": 1.15, "contrast": 1.07, "color": 1.08, "v": 0.72},
    {"src": "PHOTO-2026-05-19-04-11-47 2.jpg", "out": "trip-6.jpg",
     "bright": 1.20, "contrast": 1.05, "color": 1.06, "v": 0.50},
]


def cover_crop(img, tw, th, v_anchor=0.5, h_anchor=0.5):
    w, h = img.size
    scale = max(tw / w, th / h)
    nw, nh = round(w * scale), round(h * scale)
    img = img.resize((nw, nh), Image.LANCZOS)
    x = round((nw - tw) * h_anchor)
    y = round((nh - th) * v_anchor)
    return img.crop((x, y, x + tw, y + th))


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for p in PHOTOS:
        src = os.path.join(SRC_DIR, p["src"])
        img = Image.open(src)
        img = ImageOps.exif_transpose(img)        # honor phone rotation
        img = img.convert("RGB")
        img = ImageEnhance.Brightness(img).enhance(p["bright"])
        img = ImageEnhance.Contrast(img).enhance(p["contrast"])
        img = ImageEnhance.Color(img).enhance(p["color"])
        img = cover_crop(img, TARGET_W, TARGET_H, v_anchor=p["v"])
        out = os.path.join(OUT_DIR, p["out"])
        img.save(out, "JPEG", quality=80, optimize=True, progressive=True)
        kb = os.path.getsize(out) // 1024
        print(f"{p['out']}  {TARGET_W}x{TARGET_H}  {kb} KB  (brightness {p['bright']})")


if __name__ == "__main__":
    main()
