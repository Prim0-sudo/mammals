# Letter-tile thumbnails for the sound mats and letter cards in Media > Printables (owner, 19 November 2026:
# alphabet and letter pictures, not insects). Run: py -3 scripts/create-sound-mat-covers.py
raise SystemExit("Insects template (21 November 2026): fit it to Mammals in the media stage before running (docs/UPGRADE-PLAN.md).")
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'topics', 'insects', 'sound-mat-covers')
FONT = 'C:/Windows/Fonts/arialbd.ttf'
W, H = 352, 288
INK, TILE, EDGE = (31, 79, 57), (247, 248, 237), (132, 157, 108)
ACCENTS = [(196, 84, 40), (31, 79, 57), (35, 104, 140), (150, 96, 20)]

def tile(d, box, text, colour):
    x0, y0, x1, y1 = box
    d.rounded_rectangle(box, radius=18, fill=TILE, outline=EDGE, width=4)
    size = int((y1 - y0) * .62)
    while True:
        f = ImageFont.truetype(FONT, size)
        l, t, r, b = d.textbbox((0, 0), text, font=f)
        if r - l <= (x1 - x0) * .8 or size < 10: break
        size -= 2
    d.text(((x0 + x1) / 2, (y0 + y1) / 2), text, font=f, fill=colour, anchor='mm')

def cover(name, texts):
    im = Image.new('RGB', (W, H), 'white')
    d = ImageDraw.Draw(im)
    if len(texts) == 1:
        tile(d, (40, 30, W - 40, H - 30), texts[0], INK)
    else:
        g, p = 14, 14
        tw, th = (W - 2 * p - g) / 2, (H - 2 * p - g) / 2
        for i, t in enumerate(texts):
            r, c = divmod(i, 2)
            x, y = p + c * (tw + g), p + r * (th + g)
            tile(d, (x, y, x + tw, y + th), t, ACCENTS[i])
    im.save(os.path.join(OUT, name + '.webp'), 'WEBP', lossless=True, method=6)

os.makedirs(OUT, exist_ok=True)
cover('alphabet', ['Aa', 'Bb', 'Cc', 'Dd'])
cover('blends', ['sp', 'bl', 'tr', 'st'])
cover('families', ['ee', 'ai', 'oa', 'ar'])
cover('letter-cards', ['Aa'])
print(sorted(os.listdir(OUT)))
