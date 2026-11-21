raise SystemExit("Insects template (21 November 2026): fit it to Mammals in the media stage before running (docs/UPGRADE-PLAN.md).")
"""Make the small phonics picture cards (300 px RGBA PNG) from the Insects word pictures.
Run from the repository root: python -I scripts/create-sound-cards.py
Then run python -I tools/art/png-to-webp.py: the app shows each card's WebP twin, the mats print the PNG.
Reads letter-pictures.js and sound-pictures.js, so rerun it whenever a picture changes."""
import json, re, pathlib
from PIL import Image
root = pathlib.Path.cwd()
out = root / "assets/topics/insects/sound-cards"; out.mkdir(parents=True, exist_ok=True)
art = {p.stem: p for d in ("core", "optional", "expansion", "families") for p in (root / "assets/topics/insects/artwork" / d).glob("*.png")}
pairs = []
for name, prefix in (("letter-pictures.js", "letter-"), ("sound-pictures.js", "")):
    text = (root / "src/topics" / name).read_text(encoding="utf8")
    pairs += [(prefix + key, word) for key, word in re.findall(r'"?([\w-]+)"?: \["[^"]+", "([\w-]+)"\]', text)]
for card, word in pairs:
    img = Image.open(art[word]).convert("RGBA")
    img = img.crop(img.getbbox()); img.thumbnail((300, 300), Image.LANCZOS)
    img.save(out / f"{card}.png", optimize=True)
print(len(pairs), "cards")
