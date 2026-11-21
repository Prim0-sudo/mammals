raise SystemExit("Insects template (21 November 2026): fit it to Mammals in the media stage before running (docs/UPGRADE-PLAN.md).")
"""Little Bug Club phonics sound mats for Media > Printables, from the Insects phonics picture words.

node scripts/export-printable-source.mjs <source.json>
python -I scripts/create-sound-mats.py --source <source.json>

Writes to assets/printables/sound-mats/:
  insects-<mat>-mat-a4-v1.pdf     one A4 portrait mat (alphabet, blends, families)
  insects-<mat>-mat-a5-v1.pdf     the same mat twice on landscape A4 (A5 each), cut in half
  insects-letter-cards-a4-v1.pdf  cut-out letter cards, 6 per A4 page
and src/topics/sound-mats.js. Sounds come from src/topics/shared-foundations.json; pictures are the
full-size word art (sharper on paper than the small phonics cards). A sound with no Insects picture
yet prints as the sound alone.
"""
import argparse, io, json, os, re
from PIL import Image
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

parser = argparse.ArgumentParser()
parser.add_argument('--source', required=True)
args = parser.parse_args()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = json.load(open(args.source, encoding='utf8'))
OUTDIR = os.path.join(ROOT, 'assets', 'printables', 'sound-mats')
os.makedirs(OUTDIR, exist_ok=True)
W, H = A4
LW, LH = landscape(A4)
S5 = (LW / 2) / W
M = 34
INK = (.15, .24, .19)
GREEN = (.12, .31, .22)
RED = (.75, .22, .17)
GREY = (.62, .62, .58)
PALE = (1, .98, .93)
FONT = 'Helvetica-Bold'

IMAGE = {w['id']: w['image'] for w in SRC['words']}
DATA = json.load(open(os.path.join(ROOT, 'src', 'topics', 'shared-foundations.json'), encoding='utf8'))


def entry(source):
    """[marked word, picture id] -> (marked word, image path), or (None, None) when there is no picture."""
    if not source:
        return None, None
    marked, pid = source
    return marked, IMAGE[pid]


# Each item: (glyph, marked word or None, picture or None). [brackets] mark the red letters.
ALPHABET = [(l.upper() + l, *entry(SRC['letterSources'].get(l))) for l in (chr(c) for c in range(ord('a'), ord('z') + 1))]
SOUNDS = {**SRC['blendSources'], **SRC['familySources']}
BLENDS = [(s['label'], *entry(SOUNDS.get(s['id']))) for s in DATA['blends']]
FAMILIES = [(s['label'], *entry(SOUNDS.get(s['id']))) for s in DATA['families']]

_cache = {}


def pic(path):
    if path not in _cache:
        im = Image.open(os.path.join(ROOT, path)).convert('RGBA')
        flat = Image.new('RGB', im.size, 'white')
        flat.paste(im, mask=im.getchannel('A'))
        bb = flat.convert('L').point(lambda v: 255 if v < 238 else 0).getbbox()
        if bb:
            flat = flat.crop(bb)
        flat.thumbnail((600, 600))
        b = io.BytesIO()
        flat.save(b, 'JPEG', quality=85)
        b.seek(0)
        _cache[path] = (ImageReader(b), flat.width / flat.height)
    return _cache[path]


def draw_pic(c, path, x, y, w, h):
    img, ratio = pic(path)
    dw, dh = (h * ratio, h) if w / h > ratio else (w, w / ratio)
    c.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)


def fit(c, text, size, width):
    while size > 6 and c.stringWidth(text, FONT, size) > width:
        size -= .5
    return size


def draw_word(c, marked, cx, y, size, width):
    """Word centred on cx, the [bracketed] letters in red, shrunk to fit width."""
    plain = marked.replace('[', '').replace(']', '')
    size = fit(c, plain, size, width)
    x = cx - c.stringWidth(plain, FONT, size) / 2
    c.setFont(FONT, size)
    for i, part in enumerate(re.split(r'[\[\]]', marked)):
        c.setFillColorRGB(*(RED if i % 2 else INK))
        c.drawString(x, y, part)
        x += c.stringWidth(part, FONT, size)


def box(c, item, x, y, w, h, big, word_size, border=1.6, radius=10):
    """One square: sound left, picture and word right (sound alone when there is no picture)."""
    glyph, word, source = item
    glyph, _, note = glyph.partition(' (')   # "oo (long)": "oo" big, "long" small underneath
    note = note.rstrip(')')
    c.setFillColorRGB(*PALE)
    c.setStrokeColorRGB(*GREEN)
    c.setLineWidth(border)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)
    c.setFillColorRGB(*INK)

    def label(cx, width):
        size = fit(c, glyph, big, width)
        c.setFont(FONT, size)
        lift = size * .3 if note else 0
        c.drawCentredString(cx, y + h / 2 - size * .35 + lift, glyph)
        if note:
            c.setFont('Helvetica', size * .45)
            c.drawCentredString(cx, y + h / 2 - size * .35 - size * .35, note)

    if word:
        label(x + w * .27, w * .46)
        pad = h * .1
        draw_pic(c, source, x + w * .52, y + pad + word_size * 1.6, w * .44, h - 2 * pad - word_size * 1.6)
        c.setFillColorRGB(*INK)
        draw_word(c, word, x + w * .74, y + pad, word_size, w * .46)
    else:
        label(x + w / 2, w * .9)


def footer(c, note):
    c.setFont('Helvetica', 8)
    c.setFillColorRGB(.55, .55, .5)
    c.drawString(M, M - 18, 'Little Bug Club · Sound mats')
    c.drawRightString(W - M, M - 18, note)


def mat(c, title, items, cols, rows, big, word_size, note):
    c.setFillColorRGB(*INK)
    c.setFont(FONT, 24)
    c.drawCentredString(W / 2, H - M - 18, title)
    gap = 6
    top = H - M - 40
    cw = (W - 2 * M - gap * (cols - 1)) / cols
    ch = (top - M - gap * (rows - 1)) / rows
    for i, item in enumerate(items):
        r, col = divmod(i, cols)
        in_row = min(cols, len(items) - r * cols)
        x0 = M + (W - 2 * M - (in_row * cw + (in_row - 1) * gap)) / 2   # centre the short last row
        box(c, item, x0 + col * (cw + gap), top - (r + 1) * ch - r * gap, cw, ch, big, word_size)
    footer(c, note)


def write_mat(slug, title, items, cols, rows, big, word_size):
    a4 = os.path.join(OUTDIR, f'insects-{slug}-mat-a4-v1.pdf')
    c = canvas.Canvas(a4, pagesize=A4)
    c.setTitle(f'Little Bug Club {title.lower()} (A4)')
    mat(c, title, items, cols, rows, big, word_size, 'Print on A4 at actual size (100%)')
    c.showPage()
    c.save()
    a5 = os.path.join(OUTDIR, f'insects-{slug}-mat-a5-v1.pdf')
    c = canvas.Canvas(a5, pagesize=landscape(A4))
    c.setTitle(f'Little Bug Club {title.lower()} (A5, two per page)')
    for i in (0, 1):
        c.saveState()
        c.translate(i * LW / 2, (LH - H * S5) / 2)
        c.scale(S5, S5)
        mat(c, title, items, cols, rows, big, word_size, 'A5 · print on A4 landscape, cut in half')
        c.restoreState()
    c.saveState()
    c.setStrokeColorRGB(*GREY)
    c.setLineWidth(.8)
    c.setDash(5, 4)
    c.line(LW / 2, 14, LW / 2, LH - 14)
    c.restoreState()
    c.setFont('ZapfDingbats', 11)
    c.setFillColorRGB(*GREY)
    c.drawCentredString(LW / 2, LH - 12, '✂')
    c.showPage()
    c.save()
    return a4, a5


rel = lambda p: os.path.relpath(p, ROOT).replace('\\', '/')
cards = 'assets/topics/insects/sound-cards/'
covers = 'assets/topics/insects/sound-mat-covers/'  # letter tiles, made by create-sound-mat-covers.py
packs = []
for slug, title, items, cols, rows, big, word_size, noun, cover in [
    ('alphabet', 'Alphabet sound mat', ALPHABET, 4, 7, 30, 11, 'letters', covers + 'alphabet.webp'),
    ('blends', 'Consonant blends mat', BLENDS, 5, 8, 24, 9, 'blends', covers + 'blends.webp'),
    ('families', 'Sound families mat', FAMILIES, 6, 9, 20, 8, 'sounds', covers + 'families.webp'),
]:
    a4, a5 = write_mat(slug, title, items, cols, rows, big, word_size)
    packs.append({'id': f'{slug}-mat', 'title': title, 'detail': f'{len(items)} {noun} · 1 page', 'cover': cover,
                  'path': rel(a4), 'bytes': os.path.getsize(a4),
                  'a5Detail': f'{len(items)} {noun} · 2 mats per page', 'a5Path': rel(a5), 'a5Bytes': os.path.getsize(a5)})

# Letter cards: 6 per page, dashed cut edges
p = os.path.join(OUTDIR, 'insects-letter-cards-a4-v1.pdf')
c = canvas.Canvas(p, pagesize=A4)
c.setTitle('Little Bug Club letter cards (A4, 6 per page)')
cols, rows = 2, 3
cw, ch = (W - 2 * M) / cols, (H - 2 * M) / rows
pages = 0
for start in range(0, len(ALPHABET), cols * rows):
    pages += 1
    for i, item in enumerate(ALPHABET[start:start + cols * rows]):
        r, col = divmod(i, cols)
        x, y = M + col * cw, H - M - (r + 1) * ch
        c.saveState()
        c.setStrokeColorRGB(*GREY)
        c.setLineWidth(.6)
        c.setDash(4, 3)
        c.rect(x, y, cw, ch)
        c.restoreState()
        box(c, item, x + 12, y + 12, cw - 24, ch - 24, 64, 22, border=3, radius=16)
    footer(c, 'Print on A4 at actual size (100%) · cut along the dashed lines')
    c.showPage()
c.save()
packs.append({'id': 'letter-cards', 'title': 'Letter cards', 'detail': f'26 cards · {pages} pages',
              'cover': covers + 'letter-cards.webp', 'path': rel(p), 'bytes': os.path.getsize(p)})

with open(os.path.join(ROOT, 'src', 'topics', 'sound-mats.js'), 'w', encoding='utf8', newline='\n') as f:
    f.write('// Generated by scripts/create-sound-mats.py from the Insects phonics picture words; run it again when they change.\n')
    f.write('export const soundMats = ' + json.dumps(packs, indent=2) + ';\n')
print([(x['id'], x['bytes'] // 1024) for x in packs], 'KB')
