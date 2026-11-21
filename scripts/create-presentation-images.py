raise SystemExit("Insects template (21 November 2026): fit it to Mammals in the media stage before running (docs/UPGRADE-PLAN.md).")
"""Slide pictures for the Little Bug Club presentation: one 640 px JPEG per word and group card.

node scripts/export-printable-source.mjs <source.json>
python -I scripts/create-presentation-images.py --source <source.json>
Writes assets/presentation/<word id>.jpg and assets/presentation/group-<group id>.jpg.
"""
import argparse, json, os
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('--source', required=True)
args = parser.parse_args()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = json.load(open(args.source, encoding='utf8'))
out = os.path.join(ROOT, 'assets', 'presentation')
os.makedirs(out, exist_ok=True)


def save(path, name, crop=True):
    im = Image.open(os.path.join(ROOT, path)).convert('RGBA')
    flat = Image.new('RGB', im.size, 'white')
    flat.paste(im, mask=im.getchannel('A'))
    if crop:  # trim the white paper so the picture fills its slide frame
        box = flat.convert('L').point(lambda v: 255 if v < 238 else 0).getbbox()
        if box:
            pad = int(max(flat.size) * .03)
            flat = flat.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(flat.width, box[2] + pad), min(flat.height, box[3] + pad)))
    flat.thumbnail((640, 640), Image.Resampling.LANCZOS)
    flat.save(os.path.join(out, name), 'JPEG', quality=82, optimize=True, progressive=True)


for w in src['words']:
    save(w['image'], f"{w['id']}.jpg")
for c in src['categories']:
    save(c['image'], f"group-{c['id']}.jpg", crop=False)
total = sum(os.path.getsize(os.path.join(out, f)) for f in os.listdir(out))
print(len(os.listdir(out)), 'pictures', round(total / 1048576, 1), 'MiB')
