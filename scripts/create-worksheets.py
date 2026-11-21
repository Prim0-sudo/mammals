raise SystemExit("Insects template (21 November 2026): fit it to Mammals in the media stage before running (docs/UPGRADE-PLAN.md).")
"""Little Bug Club worksheets for Arts & Sheets > Worksheets: A4 portrait PDFs built from the game's own pictures.

Writes assets/printables/worksheets/<id>-a4-v1.pdf, insects-worksheets-all-a4-v1.pdf, the A5 versions
(<id>-a5-v1.pdf and insects-worksheets-all-a5-v1.pdf: two copies of a sheet side by side on landscape
A4, cut in half for two children) and src/topics/worksheets.js. Ported from Plants (16 November 2026).
Run from the repository root:  python -I scripts/create-worksheets.py
"""
import io, json, os
from PIL import Image
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

ROOT = os.getcwd()
PICS = 'assets/topics/insects/artwork/core'
V = lambda name: os.path.join(ROOT, PICS, f'{name}.png')
OUTDIR = os.path.join(ROOT, 'assets', 'printables', 'worksheets')
os.makedirs(OUTDIR, exist_ok=True)
W, H = A4
M = 40
INK = (.12, .31, .22)
GREY = (.62, .62, .58)
EDGE = (.72, .8, .64)
_cache = {}

def pic(path, box=900):
    """Crop to the creature, flatten on white; returns the image, its ratio and the crop box."""
    if path not in _cache:
        im = Image.open(path).convert('RGBA')
        bb = im.getchannel('A').point(lambda a: 255 if a > 40 else 0).getbbox() or (0, 0, im.width, im.height)
        im = im.crop(bb)
        im.thumbnail((box, box))
        bg = Image.new('RGB', im.size, 'white'); bg.paste(im, mask=im.getchannel('A'))
        b = io.BytesIO(); bg.save(b, 'JPEG', quality=86); b.seek(0)
        _cache[path] = (ImageReader(b), im.width / im.height, bb)
    return _cache[path]

def draw_pic(c, path, x, y, w, h):
    """Fit a picture inside the box (x, y bottom-left), centred; returns where it landed."""
    img, ratio, _ = pic(path)
    if w / h > ratio: dw, dh = h * ratio, h
    else: dw, dh = w, w / ratio
    c.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
    return x + (w - dw) / 2, y + (h - dh) / 2, dw, dh

def header(c, title, task):
    c.setFillColorRGB(*INK); c.setFont('Helvetica-Bold', 26); c.drawString(M, H - M - 22, title)
    c.setFont('Helvetica', 13); c.drawString(M, H - M - 50, 'Name:')
    c.setStrokeColorRGB(*GREY); c.setLineWidth(1); c.line(M + 44, H - M - 52, M + 280, H - M - 52)
    c.drawString(W - M - 200, H - M - 50, 'Date:'); c.line(W - M - 162, H - M - 52, W - M, H - M - 52)
    c.setFillColorRGB(.25, .25, .23); c.setFont('Helvetica', 15); c.drawString(M, H - M - 82, task)
    return H - M - 100

def footer(c, note='Print on A4 at actual size (100%)'):
    c.setFont('Helvetica', 8); c.setFillColorRGB(.55, .55, .5)
    c.drawString(M, M - 18, 'Little Bug Club · Worksheets'); c.drawRightString(W - M, M - 18, note)

LW, LH = landscape(A4)
S5 = (LW / 2) / W   # A4 portrait scaled to A5 portrait (about 0.707)

def two_up(c, fn):
    """Two A5 portrait copies of one worksheet on a landscape A4 page, with a cut line between."""
    for i in (0, 1):
        c.saveState(); c.translate(i * LW / 2, (LH - H * S5) / 2); c.scale(S5, S5)
        fn(c); footer(c, 'A5 · print on A4 landscape, cut in half'); c.restoreState()
    c.saveState(); c.setStrokeColorRGB(*GREY); c.setLineWidth(.8); c.setDash(5, 4)
    c.line(LW / 2, 14, LW / 2, LH - 14); c.restoreState()
    c.setFont('ZapfDingbats', 11); c.setFillColorRGB(*GREY); c.drawCentredString(LW / 2, LH - 12, '✂')

def word_bank(c, words, y, label='Word bank'):
    c.setFillColorRGB(*INK); c.setFont('Helvetica-Bold', 13); c.drawString(M, y, label)
    x = M; y -= 30
    c.setFont('Helvetica-Bold', 18)
    for w in words:
        tw = c.stringWidth(w, 'Helvetica-Bold', 18) + 28
        if x + tw > W - M: x = M; y -= 44
        c.setStrokeColorRGB(*EDGE); c.setFillColorRGB(.95, .97, .9); c.roundRect(x, y - 8, tw, 32, 10, fill=1, stroke=1)
        c.setFillColorRGB(*INK); c.drawCentredString(x + tw / 2, y + 2, w); x += tw + 12

def scissors_line(c, y):
    c.setDash(6, 5); c.setStrokeColorRGB(*GREY); c.line(M, y, W - M, y); c.setDash()
    c.setFont('Helvetica', 10); c.setFillColorRGB(*GREY); c.drawString(M, y + 4, 'Cut along the dashed line')

def cut_cards(c, cards, y, cols=4):
    """A row (or two) of cut-out picture cards under the scissors line, filling down to the margin."""
    rows = (len(cards) + cols - 1) // cols
    cw = (W - 2 * M - (cols - 1) * 10) / cols; ch = (y - 14 - M - (rows - 1) * 10) / rows
    for i, (name, label) in enumerate(cards):
        x = M + (i % cols) * (cw + 10); yy = y - 14 - (i // cols + 1) * ch - (i // cols) * 10
        c.setDash(4, 4); c.setStrokeColorRGB(*GREY); c.rect(x, yy, cw, ch); c.setDash()
        draw_pic(c, V(name), x + 8, yy + 22, cw - 16, ch - 30)
        c.setFillColorRGB(*INK); c.setFont('Helvetica-Bold', 11); c.drawCentredString(x + cw / 2, yy + 7, label)

def label_insect(c):
    top = header(c, 'Label the insect', 'Write the name of each part on the lines.')
    ix, iy, iw, ih = draw_pic(c, V('ant'), M + 150, 210, W - 2 * M - 300, top - 230)
    _, _, (bx, by, bx2, by2) = pic(V('ant'))
    c.setStrokeColorRGB(*GREY); c.setFillColorRGB(*INK); c.setLineWidth(1.2)
    # points on ant.png in its own pixels (1254 square): antennae, head, thorax, legs, abdomen
    marks = [((420, 248), 'left'), ((625, 400), 'right'), ((625, 590), 'right'), ((452, 650), 'left'), ((625, 930), 'right')]
    for (ox, oy), side in marks:
        px = ix + (ox - bx) / (bx2 - bx) * iw; py = iy + ih * (1 - (oy - by) / (by2 - by))
        c.circle(px, py, 3.5, fill=1, stroke=0)
        end = W - M if side == 'right' else M
        mid = W - M - 130 if side == 'right' else M + 130
        c.line(px, py, mid, py); c.setLineWidth(1.6); c.line(mid, py, end, py); c.setLineWidth(1.2)
    word_bank(c, ['head', 'thorax', 'abdomen', 'legs', 'antennae'], 150)

def life_cycle(c):
    top = header(c, 'Butterfly life cycle', 'Cut out the pictures. Stick them in order, starting at 1.')
    s = (W - 2 * M - 30) / 2
    for i, (x, y) in enumerate([(M, top - s), (M + s + 30, top - s), (M + s + 30, top - 2 * s - 30), (M, top - 2 * s - 30)]):
        c.setStrokeColorRGB(*EDGE); c.setLineWidth(2); c.roundRect(x, y, s, s * .78, 14)
        c.setFillColorRGB(*INK); c.setFont('Helvetica-Bold', 22); c.drawString(x + 12, y + s * .78 - 28, str(i + 1))
    c.setFont('Helvetica-Bold', 30); c.setFillColorRGB(.55, .7, .45)
    c.drawCentredString(W / 2, top - s * .45, '>'); c.drawCentredString(W / 2, top - s - 30 - s * .45, '<')
    c.drawCentredString(M + s * 1.5 + 30, top - s - 10, 'v')
    y = top - 2 * s - 30 - 40
    scissors_line(c, y + 22)
    cut_cards(c, [('chrysalis', 'chrysalis'), ('butterfly', 'butterfly'), ('egg', 'egg'), ('caterpillar', 'caterpillar')], y + 14)

def count_legs(c):
    top = header(c, 'Count the legs', 'Count the legs on each minibeast. Write the number in the box.')
    items = ['ant', 'spider', 'woodlouse', 'ladybug', 'snail', 'beetle']
    cw = (W - 2 * M - 20) / 2; rh = (top - M - 10) / 3
    for i, name in enumerate(items):
        x = M + (i % 2) * (cw + 20); y = top - (i // 2 + 1) * rh
        c.setStrokeColorRGB(*EDGE); c.setLineWidth(2); c.roundRect(x, y + 6, cw, rh - 12, 14)
        draw_pic(c, V(name), x + 12, y + 34, cw - 120, rh - 58)
        c.setFillColorRGB(*INK); c.setFont('Helvetica-Bold', 14); c.drawCentredString(x + (cw - 96) / 2, y + 16, name)
        c.setStrokeColorRGB(*INK); c.setLineWidth(2); c.roundRect(x + cw - 92, y + rh / 2 - 34, 72, 72, 12)
        c.setFont('Helvetica', 10); c.setFillColorRGB(*GREY); c.drawCentredString(x + cw - 56, y + rh / 2 - 50, 'legs')

def insect_or_not(c):
    top = header(c, 'Insect or not?', 'Insects have six legs. Cut out the pictures and stick each one in the right box.')
    half = (W - 2 * M - 20) / 2
    bh = top - 300
    for i, label in enumerate(['Insect', 'Not an insect']):
        x = M + i * (half + 20)
        c.setStrokeColorRGB(*EDGE); c.setLineWidth(2); c.roundRect(x, top - bh, half, bh, 14)
        c.setFillColorRGB(*INK); c.setFont('Helvetica-Bold', 22); c.drawCentredString(x + half / 2, top - 32, label)
    y = top - bh - 22
    scissors_line(c, y)
    cut_cards(c, [('bee', 'bee'), ('spider', 'spider'), ('ladybug', 'ladybug'), ('snail', 'snail'),
                  ('woodlouse', 'woodlouse'), ('butterfly', 'butterfly'), ('worm', 'worm'), ('ant', 'ant')], y)

def match_words(c):
    top = header(c, 'Match the words', 'Draw a line from each picture to its word.')
    items = ['bee', 'snail', 'ladybug', 'spider', 'butterfly', 'ant']
    words = ['spider', 'ant', 'bee', 'butterfly', 'snail', 'ladybug']
    row = (top - M - 20) / 6
    for i, (name, w) in enumerate(zip(items, words)):
        y = top - (i + 1) * row
        draw_pic(c, V(name), M, y + 6, 130, row - 12)
        c.setFillColorRGB(*INK); c.circle(M + 150, y + row / 2, 5, fill=1, stroke=0)
        c.circle(W - M - 190, y + row / 2, 5, fill=1, stroke=0)
        c.setFont('Helvetica-Bold', 26); c.drawString(W - M - 170, y + row / 2 - 9, w)

def trace_words(c):
    top = header(c, 'Trace the words', 'Trace each word, then write it on your own.')
    items = ['ant', 'bee', 'web', 'moth', 'snail', 'worm']
    row = (top - M - 10) / 6
    for i, w in enumerate(items):
        y = top - (i + 1) * row
        draw_pic(c, V(w), M, y + 8, 90, row - 16)
        base = y + row / 2 - 4
        c.setStrokeColorRGB(.8, .8, .76); c.setLineWidth(.8)
        for dy in (0, 34): c.line(M + 110, base + dy, W - M, base + dy)
        c.setDash(2, 3); c.line(M + 110, base + 17, W - M, base + 17); c.setDash()
        t = c.beginText(M + 120, base + 1); t.setFont('Helvetica', 44); t.setTextRenderMode(1)
        c.setStrokeColorRGB(.6, .6, .56); c.setLineWidth(1); c.setDash(3, 3); t.textOut(w); c.drawText(t); c.setDash()

def draw_label(c):
    top = header(c, 'Draw your own insect', 'Draw an insect. Give it six legs and three body parts, then label them.')
    c.setStrokeColorRGB(*EDGE); c.setLineWidth(2); c.roundRect(M, 200, W - 2 * M, top - 210, 16)
    c.setStrokeColorRGB(.55, .4, .3); c.setLineWidth(3); c.line(M + 20, 260, W - M - 20, 260)
    c.setFont('Helvetica', 10); c.setFillColorRGB(*GREY); c.drawString(M + 24, 246, 'ground')
    word_bank(c, ['head', 'thorax', 'abdomen', 'legs', 'antennae', 'wings', 'eyes'], 170)

SHEETS = [
    ('label-the-insect', 'Label the insect', 'Easy', 'ant', label_insect),
    ('count-the-legs', 'Count the legs', 'Easy', 'spider', count_legs),
    ('match-the-words', 'Match the words', 'Easy', 'ladybug', match_words),
    ('trace-the-words', 'Trace the words', 'Easy', 'bee', trace_words),
    ('butterfly-life-cycle', 'Butterfly life cycle', 'Medium', 'chrysalis', life_cycle),
    ('insect-or-not', 'Insect or not?', 'Medium', 'woodlouse', insect_or_not),
    ('draw-your-own-insect', 'Draw your own insect', 'Hard', 'beetle', draw_label),
]

listed = []
ALL4 = 'insects-worksheets-all-a4-v1.pdf'; ALL5 = 'insects-worksheets-all-a5-v1.pdf'
allc = canvas.Canvas(os.path.join(OUTDIR, ALL4), pagesize=A4)
allc.setTitle('Little Bug Club worksheets'); allc.setAuthor('Little Bug Club')
for sid, title, level, cover, fn in SHEETS:
    path = os.path.join(OUTDIR, f'{sid}-a4-v1.pdf')
    c = canvas.Canvas(path, pagesize=A4); c.setTitle(f'Little Bug Club worksheet: {title}'); c.setAuthor('Little Bug Club')
    fn(c); footer(c); c.showPage(); c.save()
    fn(allc); footer(allc); allc.showPage()
    listed.append({'id': sid, 'title': title, 'level': level, 'cover': f'{PICS}/{cover}.webp',
                   'path': f'assets/printables/worksheets/{os.path.basename(path)}', 'bytes': os.path.getsize(path)})
    print(path, os.path.getsize(path) // 1024, 'KB')
allc.save()
pack = {'title': 'All worksheets', 'path': f'assets/printables/worksheets/{ALL4}', 'bytes': os.path.getsize(os.path.join(OUTDIR, ALL4)), 'pageCount': len(SHEETS)}

# A5: two copies of each sheet on landscape A4.
all5 = canvas.Canvas(os.path.join(OUTDIR, ALL5), pagesize=landscape(A4))
all5.setTitle('Little Bug Club worksheets (A5)'); all5.setAuthor('Little Bug Club')
for entry, (sid, title, level, cover, fn) in zip(listed, SHEETS):
    path = os.path.join(OUTDIR, f'{sid}-a5-v1.pdf')
    c = canvas.Canvas(path, pagesize=landscape(A4)); c.setTitle(f'Little Bug Club worksheet (A5): {title}'); c.setAuthor('Little Bug Club')
    two_up(c, fn); c.showPage(); c.save()
    two_up(all5, fn); all5.showPage()
    entry['a5Path'] = f'assets/printables/worksheets/{os.path.basename(path)}'; entry['a5Bytes'] = os.path.getsize(path)
    print(path, os.path.getsize(path) // 1024, 'KB')
all5.save()
pack['a5Path'] = f'assets/printables/worksheets/{ALL5}'; pack['a5Bytes'] = os.path.getsize(os.path.join(OUTDIR, ALL5))
js = ('// Generated by scripts/create-worksheets.py; run it again when a worksheet changes.\n'
      f'export const worksheets = {json.dumps(listed, indent=2)};\nexport const worksheetsPack = {json.dumps(pack, indent=2)};\n')
open(os.path.join(ROOT, 'src', 'topics', 'worksheets.js'), 'w', encoding='utf-8', newline='\n').write(js)
