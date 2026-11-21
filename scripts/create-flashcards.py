raise SystemExit("Insects template (21 November 2026): fit it to Mammals in the media stage before running (docs/UPGRADE-PLAN.md).")
"""Little Bug Club picture flashcards in four A4 layouts; no network or paid services.

node scripts/export-printable-source.mjs <source.json>
python -I scripts/create-flashcards.py --source <source.json>
Writes assets/printables/insects-flashcards-<scope>-a4-<n>-v1.pdf and src/topics/flashcards.js.
"""
import argparse, io, json, math
from pathlib import Path
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab import rl_config

rl_config.useA85 = 0  # binary pictures keep the one-card pack well under 25 MiB
parser = argparse.ArgumentParser()
parser.add_argument('--source', required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
source = json.loads(Path(args.source).read_text(encoding='utf-8'))
out = root / 'assets' / 'printables'
out.mkdir(parents=True, exist_ok=True)
bold = Path('C:/Windows/Fonts/arialbd.ttf')
if not bold.exists():
    bold = Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
pdfmetrics.registerFont(TTFont('Bug-Bold', str(bold)))
band_colour = HexColor('#1f4f39')
honey = HexColor('#d3ae48')
trim_colour = HexColor('#697568')
images = {}


def picture(item, pixels, quality):
    key = (item['id'], pixels, quality)
    if key not in images:
        im = Image.open(root / item['image']).convert('RGBA')
        # The drawn area: not transparent and not near-white paper.
        flat = Image.new('RGB', im.size, 'white')
        flat.paste(im, mask=im.getchannel('A'))
        box = flat.convert('L').point(lambda v: 255 if v < 238 else 0).getbbox()
        if box:  # crop to the drawn picture so it fills the card
            pad = int(max(im.size) * .03)
            im = im.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad)))
        im.thumbnail((pixels, pixels), Image.Resampling.LANCZOS)
        page = Image.new('RGB', im.size, 'white')
        page.paste(im, mask=im.getchannel('A'))
        data = io.BytesIO()
        page.save(data, format='JPEG', quality=quality, optimize=True)
        images[key] = (ImageReader(io.BytesIO(data.getvalue())), page.size)
    return images[key]


def ladybird(pdf, cx, cy, r):
    """A small ladybird badge in the header corner."""
    pdf.setFillColor(HexColor('#c9372c'))
    pdf.circle(cx, cy, r, stroke=0, fill=1)
    pdf.setFillColor(HexColor('#1b1b1b'))
    pdf.circle(cx, cy + r * .78, r * .45, stroke=0, fill=1)
    pdf.setStrokeColor(HexColor('#1b1b1b'))
    pdf.setLineWidth(max(.5, r * .08))
    pdf.line(cx, cy - r, cx, cy + r * .5)
    for dx, dy in ((-.45, .1), (.45, .1), (-.4, -.45), (.4, -.45)):
        pdf.circle(cx + dx * r, cy + dy * r, r * .16, stroke=0, fill=1)


def flashcard(pdf, item, x, y, width, height, pixels, quality, trim):
    frame = 5
    if trim:
        pdf.setStrokeColor(trim_colour)
        pdf.setLineWidth(.45)
        pdf.setDash(3, 2)
        pdf.rect(x, y, width, height, stroke=1, fill=0)
        pdf.setDash()
    fx, fy, fw, fh = x + frame, y + frame, width - 2 * frame, height - 2 * frame
    radius = min(13, width * .055)
    band = max(32, min(86, fh * .16))
    pdf.saveState()
    clip = pdf.beginPath()
    clip.roundRect(fx, fy, fw, fh, radius)
    pdf.clipPath(clip, stroke=0)
    pdf.setFillColor(HexColor('#ffffff'))
    pdf.rect(fx, fy, fw, fh, stroke=0, fill=1)
    pdf.setFillColor(band_colour)
    pdf.rect(fx, fy + fh - band, fw, band, stroke=0, fill=1)
    pdf.setFillColor(honey)
    pdf.rect(fx, fy + fh - band - 2.2, fw, 2.2, stroke=0, fill=1)
    pdf.restoreState()
    pdf.setStrokeColor(band_colour)
    pdf.setLineWidth(2.4 if width > 240 else 2)
    pdf.roundRect(fx, fy, fw, fh, radius, stroke=1, fill=0)
    r = band * .17
    ladybird(pdf, fx + fw - r - band * .22, fy + fh - band / 2, r)
    label = item['name']
    size = min(52, band * .54, fw * .14)
    size *= min(1, (fw - 24 - 6 * r) / pdfmetrics.stringWidth(label, 'Bug-Bold', size))
    pdf.setFillColor(HexColor('#ffffff'))
    pdf.setFont('Bug-Bold', size)
    pdf.drawCentredString(fx + fw / 2, fy + fh - band / 2 - size * .35, label)
    reader, (iw, ih) = picture(item, pixels, quality)
    bottom, room = fy + 14, fh - band - 26
    scale = min((fw - 22) / iw, room / ih)
    dw, dh = iw * scale, ih * scale
    pdf.drawImage(reader, x + (width - dw) / 2, bottom + (room - dh) / 2, dw, dh)


# columns, rows, picture pixels, JPEG quality. Eight upright cards use landscape A4.
layouts = {1: (1, 1, 900, 70), 2: (1, 2, 700, 80), 4: (2, 2, 540, 80), 8: (4, 2, 540, 80)}
instructions = {1: 'Print the full A4 sheet at actual size.',
                2: 'Print at actual size and cut along the dashed midpoint.',
                4: 'Print at actual size and trim along the dashed card edges.',
                8: 'Print at actual size and trim along the dashed card edges.'}


def pack(category, count):
    columns, rows, pixels, quality = layouts[count]
    scope = category['id'] if category else 'all'
    title = category['label'] if category else 'All Insects words'
    words = [w for w in source['words'] if category is None or w['categoryId'] == scope]
    name = f'insects-flashcards-{scope}-a4-{count}-v1.pdf'
    size = landscape(A4) if count == 8 else A4
    pdf = canvas.Canvas(str(out / name), pagesize=size, pageCompression=1)
    pdf.setTitle(f'Little Bug Club flashcards - {title} - {count} per A4 sheet')
    pdf.setAuthor('Little Bug Club')
    pdf.setSubject(instructions[count])
    pdf.setViewerPreference('PrintScaling', 'None')
    width, height = size
    margin, gutter = 7 * mm, (14 if count == 2 else 4) * mm
    cw = (width - 2 * margin - (columns - 1) * gutter) / columns
    ch = (height - 2 * margin - (rows - 1) * gutter) / rows
    for start in range(0, len(words), count):
        for i, item in enumerate(words[start:start + count]):
            row, column = divmod(i, columns)
            flashcard(pdf, item, margin + column * (cw + gutter), height - margin - ch - row * (ch + gutter), cw, ch, pixels, quality, count >= 4)
        if count == 2:
            pdf.setStrokeColor(trim_colour)
            pdf.setLineWidth(.65)
            pdf.setDash(4, 3)
            pdf.line(margin, height / 2, width - margin, height / 2)
            pdf.setDash()
        pdf.showPage()
    pdf.save()
    return {'scopeId': scope, 'title': title, 'cardsPerSheet': count, 'paper': 'A4',
            'orientation': 'landscape' if count == 8 else 'portrait', 'wordCount': len(words),
            'pageCount': math.ceil(len(words) / count), 'bytes': (out / name).stat().st_size,
            'path': f'assets/printables/{name}'}


packs = [pack(c, n) for n in layouts for c in [None] + source['categories']]
(root / 'src/topics/flashcards.js').write_text(
    '// Generated by scripts/create-flashcards.py; run it again when words or pictures change.\n'
    'export const insectsFlashcards = ' + json.dumps(packs, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
print(f'{len(packs)} packs, {sum(p["bytes"] for p in packs) / 1048576:.1f} MiB, largest {max(p["bytes"] for p in packs) / 1048576:.1f} MiB')
