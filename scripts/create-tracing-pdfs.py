"""Tracing sheets for Draw & Trace (Arts & Crafts), for children without tablets.

Trace-and-colour sheet (owner pick S3, 24 November 2026, to match good printed trace-and-colour sheets):
a "Trace and colour" badge with the picture's name, a name line, a colour guide box (the full model and each
colour named), the picture as big as the page allows (trimmed to its lines) in bold black dashes along the centre
of every line, and the word in dotted lowercase letters on handwriting lines with a red start dot.
Tall and square pictures get an A4 portrait page; wide ones (twice as wide as tall or more) an A4 landscape page.
Same script as Insects (24 November 2026): thinning without numpy, pages drawn with Pillow and saved as PDF.
Levels with no ready pictures are skipped; with none at all the printables list is written empty.
Writes assets/printables/tracing/mammals-tracing-<level>-a4-v2.pdf (one per page), -a5-v2.pdf (two A5 halves per
A4 landscape page, a landscape sheet turned on its side) and src/topics/tracing-printables.js.
Run from the repository root:  py -3 scripts/create-tracing-pdfs.py
"""
import io, json, os, re, sys, zlib
from collections import deque
from PIL import Image, ImageDraw
from PIL import ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIST = os.path.join(ROOT, 'src', 'topics', 'draw-trace-pictures.js')
ART = os.path.join(ROOT, 'assets', 'line-art')
OUT = os.path.join(ROOT, 'assets', 'printables', 'tracing')
PALETTE = [('brown', '#8A5A3B'), ('green', '#2F7D3E'), ('gold', '#D9A21B'), ('orange', '#E0662A'), ('red', '#C8323C'),
           ('pink', '#D9487A'), ('purple', '#8046A0'), ('blue', '#2F6FB5'), ('black', '#2B2B28')]
PAL = [(n, tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))) for n, h in PALETTE]
DASH, GAP, SCALE, DOT = 10, 7, 3, 6   # dash and gap along the line (px of the outline), output scale, dot radius at output scale
INK = (43, 43, 40)

src = open(LIST, encoding='utf-8').read()
levels, redo, words = [], {}, {}
# Mammals writes its picture list with double quotes: read them as single, an apostrophe inside as ’.
src = re.sub(r'"([^"\n]*)"', lambda q: "'" + q.group(1).replace("'", "’") + "'", src)
for m in re.finditer(r"\{ id: '(\w+)', label: '([^']+)', pictures: \[(.*?)\] \}", src, re.S):
    entries = []
    for obj in re.findall(r"\{ (id: '[\w-]+'[^}]*)\}", m.group(3)):
        pid = re.search(r"id: '([\w-]+)'", obj).group(1); name = re.search(r"name: '([^']+)'", obj).group(1)
        v = re.search(r"version: '(v\d+)'", obj)
        if v: redo[pid] = v.group(1)
        wd = re.search(r"word: '([^']+)'", obj)
        words[pid] = wd.group(1) if wd else name.lower()
        entries.append((pid, name))
    levels.append((m.group(1), m.group(2), entries))
# Only pictures in READY (their outline file is in) go on the sheets; levels may hold any number.
if len(levels) != 3: sys.exit('Could not read the Draw & Trace levels from draw-trace-pictures.js')
if 'const READY' in src:
    ready = set(re.findall(r"'([\w-]+)'", src[src.index('const READY'):src.index(']);', src.index('const READY'))]))
    levels = [(lid, label, [p for p in pics if p[0] in ready]) for lid, label, pics in levels]
levels = [lv for lv in levels if lv[2]]  # a level with no ready pictures gets no sheets
if not levels: print('No Draw & Trace pictures are ready yet: writing an empty printables list.')

def colours_in(im):
    small = im.convert('RGB').resize((256, 192), Image.NEAREST)
    counts = {}
    for px in small.get_flattened_data():
        if sum(px) > 690: continue
        name, d = min(((n, sum((a - b) ** 2 for a, b in zip(px, c))) for n, c in PAL), key=lambda t: t[1])
        if d < 3000: counts[name] = counts.get(name, 0) + 1
    return [n for n, _ in PALETTE if counts.get(n, 0) >= 25]

NB = [(-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1), (-1, -1)]   # P2..P9 clockwise from north


def thin(fg):
    """Zhang-Suen thinning on a set of (y, x) line pixels: the one-pixel centre line of every stroke.
    Plain Python (no numpy on the work PC); only line pixels are visited, so it stays quick."""
    fg = set(fg)
    changed = True
    while changed:
        changed = False
        for step in (0, 1):
            gone = []
            for y, x in fg:
                n = [(y + dy, x + dx) in fg for dy, dx in NB]
                b = sum(n)
                if b < 2 or b > 6: continue
                if sum((not n[i]) and n[(i + 1) % 8] for i in range(8)) != 1: continue
                P2, P4, P6, P8 = n[0], n[2], n[4], n[6]
                if step == 0 and (P2 and P4 and P6 or P4 and P6 and P8): continue
                if step == 1 and (P2 and P4 and P8 or P2 and P6 and P8): continue
                gone.append((y, x))
            if gone: fg.difference_update(gone); changed = True
    return fg


def centre_line(fg):
    """Distance along the one-pixel centre line of every stroke, from each stroke's first pixel."""
    sk = thin(fg); dist = {}
    for s_ in sorted(sk):
        if s_ in dist: continue
        dist[s_] = 0; q = deque([s_])
        while q:
            y, x = q.popleft()
            for dy, dx in NB:
                t = (y + dy, x + dx)
                if t in sk and t not in dist:
                    dist[t] = dist[(y, x)] + 1; q.append(t)
    return dist


def trim(im, pad=12):
    """The picture cut down to its lines, so it fills its box on the page."""
    box = im.convert('L').point(lambda v: 255 if v < 200 else 0).getbbox(); w, h = im.size
    return im.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(w, box[2] + pad), min(h, box[3] + pad)))


def dashed(im):
    """The picture as bold black dashes along the centre of each line."""
    g = im.convert('L'); w, h = g.size; px = g.load()
    dist = centre_line((y, x) for y in range(h) for x in range(w) if px[x, y] < 200)
    out = Image.new('RGB', (w * SCALE, h * SCALE), 'white'); d = ImageDraw.Draw(out)
    for (y, x), k in dist.items():
        if k % (DASH + GAP) < DASH:
            d.ellipse([x * SCALE - DOT, y * SCALE - DOT, x * SCALE + DOT, y * SCALE + DOT], fill=INK)
    return out


DPI = 200
K = DPI / 72                       # layout is in points (1/72 inch), drawn at 200 dpi
W, H = 842, 595                    # A4 landscape in points
M = 28
FONT = {False: 'C:/Windows/Fonts/arial.ttf', True: 'C:/Windows/Fonts/arialbd.ttf'}
GREEN, LEAF, MUTED, RULE = (30, 86, 49), (217, 236, 230), (140, 140, 128), (153, 153, 140)
KID = 'C:/Windows/Fonts/comicbd.ttf'   # child-friendly letters (single-storey a and g) for the badge and the word
font = lambda size, bold=False: ImageFont.truetype(FONT[bold], round(size * K))
kid = lambda size: ImageFont.truetype(KID, round(size * K))
pt = lambda *v: [round(x * K) for x in v]
os.makedirs(OUT, exist_ok=True)
packs = []


def dotted_word(word, size):
    """The word in dotted letters at font size `size` (points): an RGBA image and its baseline (px)."""
    f = kid(size); w = round(f.getlength(word)) + 30; h = round(size * 1.4 * K)
    im = Image.new('L', (w, h), 255); ImageDraw.Draw(im).text((15, h * .8), word, font=f, fill=0, anchor='ls')
    px = im.load(); dist = centre_line((y, x) for y in range(h) for x in range(w) if px[x, y] < 140)
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(out)
    for (y, x), k in dist.items():
        if k % 15 == 0: d.ellipse([x - 5, y - 5, x + 5, y + 5], fill=INK + (255,))
    return out, h * .8


def fit(im, w, h):
    s = min(w / im.width, h / im.height)
    return im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)


def sheet(pid, name, label):
    """One trace-and-colour sheet: A4 portrait, or A4 landscape for a wide picture."""
    im = trim(Image.open(os.path.join(ART, f'{pid}-{redo.get(pid, "v1")}.webp')).convert('RGB'))
    order = colours_in(im)
    W, H = (842, 595) if im.width >= 2 * im.height else (595, 842)
    M = 24
    page = Image.new('RGB', pt(W, H), 'white'); d = ImageDraw.Draw(page)
    d.rounded_rectangle(pt(M - 10, M - 10, W - M + 10, H - M + 10), radius=round(18 * K), outline=GREEN, width=round(2.2 * K))
    # Badge, name and the child's name line, top left.
    d.rounded_rectangle(pt(M + 6, M + 6, M + 236, M + 58), radius=round(26 * K), fill=LEAF, outline=GREEN, width=round(1.6 * K))
    d.text(pt(M + 121, M + 42), 'Trace and colour', font=kid(21), fill=GREEN, anchor='ms')
    size = 22
    while d.textlength(name, font=font(size, True)) / K > 220: size -= 1
    nf = font(size, True); tw = d.textlength(name, font=nf) / K + 40
    d.rounded_rectangle(pt(M + 121 - tw / 2, M + 68, M + 121 + tw / 2, M + 102), radius=round(17 * K), fill=GREEN)
    d.text(pt(M + 121, M + 92), name, font=nf, fill=(255, 255, 255), anchor='ms')
    d.text(pt(M + 8, M + 130), 'Name:', font=font(12), fill=INK, anchor='ls')
    d.line(pt(M + 50, M + 132, M + 236, M + 132), fill=RULE, width=round(K))
    # Colour guide, top right: the full model and each colour by name.
    bx0, by0, bx1, by1 = W - M - 250, M + 6, W - M - 6, M + 140
    d.rounded_rectangle(pt(bx0, by0, bx1, by1), radius=round(14 * K), fill='white', outline=GREEN, width=round(1.6 * K))
    d.rounded_rectangle(pt(bx0 + 10, by0 + 8, bx1 - 10, by0 + 30), radius=round(11 * K), fill=LEAF)
    d.text(pt((bx0 + bx1) / 2, by0 + 25), 'Colour guide', font=font(13, True), fill=GREEN, anchor='ms')
    model = fit(im, *pt(124, 92))
    page.paste(model, (round((bx0 + 72) * K - model.width / 2), round((by0 + 86) * K - model.height / 2)))
    # Up to four colours in one column; more go in two columns so the names never crowd.
    cols = 1 if len(order) <= 4 else 2
    rows = -(-len(order) // cols); gap = 22 if cols == 1 else (19 if rows <= 4 else 17)
    dot, fs, xs = (11, 11, [bx0 + 148]) if cols == 1 else (9, 9.5, [bx0 + 136, bx0 + 189])
    y = by0 + 40 + (96 - gap * rows) / 2 + 4
    for i, n in enumerate(order):
        x, yy = xs[i // rows], y + (i % rows) * gap
        d.ellipse(pt(x, yy, x + dot, yy + dot), fill=dict(PAL)[n])
        d.text(pt(x + dot + 4, yy + dot - 1), n.capitalize(), font=font(fs, True), fill=INK, anchor='ls')
    # The word on handwriting lines (top, dashed middle, baseline), with a red dot where to start.
    word_h, base_y = 54, H - M - 40
    x0, x1, xh = M + 20, W - M - 20, word_h * .52
    d.line(pt(x0, base_y - word_h, x1, base_y - word_h), fill=(170, 190, 175), width=round(.8 * K))
    for xx in range(round(x0), round(x1), 8):
        d.line(pt(xx, base_y - xh, xx + 4, base_y - xh), fill=(150, 170, 155), width=round(.8 * K))
    d.line(pt(x0, base_y, x1, base_y), fill=GREEN, width=round(1.4 * K))
    word, base = dotted_word(words[pid], word_h * .98)
    room = (x1 - x0 - 30) * K
    if word.width > room:
        s_ = room / word.width; word = word.resize((round(word.width * s_), round(word.height * s_))); base *= s_
    page.paste(word, (round(W * K / 2 - word.width / 2), round(base_y * K - base)), word)
    sx = W / 2 - word.width / K / 2 + 4
    d.ellipse(pt(sx, base_y - 22, sx + 8, base_y - 14), fill=(200, 50, 60))
    # The picture as big as the space between the header and the word allows.
    top, bottom = M + 152, base_y - word_h - 22
    art = fit(dashed(im), *pt(W - 2 * M - 20, bottom - top))
    page.paste(art, (round(W * K / 2 - art.width / 2), round((top + bottom) / 2 * K - art.height / 2)))
    f8 = font(8)
    d.text(pt(M + 4, H - M + 2), f'Mammal Discovery Club · Draw & Trace · {label}', font=f8, fill=MUTED, anchor='ls')
    d.text(pt(W - M - 4, H - M + 2), 'Print at actual size (100%)', font=f8, fill=MUTED, anchor='rs')
    return page


def save(pages, path, title):
    """A small PDF writer: one Flate-compressed image per page (Pillow's own PDF output is uncompressed)."""
    NL = chr(10)
    objs = []
    add = lambda b: objs.append(b) or len(objs)
    def stream(dict_, data):
        return dict_.replace('>>', f' /Length {len(data)} >>').encode() + (NL + 'stream' + NL).encode() + data + (NL + 'endstream').encode()
    cat, root = add(None), add(None)
    kids = []
    for page in pages:
        rgb = page.convert('RGB')
        img = add(stream(f'<< /Type /XObject /Subtype /Image /Width {rgb.width} /Height {rgb.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode >>', zlib.compress(rgb.tobytes(), 9)))
        w, h = rgb.width * 72 / DPI, rgb.height * 72 / DPI
        content = add(stream('<< >>', f'q {w:.2f} 0 0 {h:.2f} 0 0 cm /Im0 Do Q'.encode()))
        kids.append(add(f'<< /Type /Page /Parent {root} 0 R /MediaBox [0 0 {w:.2f} {h:.2f}] /Resources << /XObject << /Im0 {img} 0 R >> >> /Contents {content} 0 R >>'.encode()))
    objs[cat - 1] = f'<< /Type /Catalog /Pages {root} 0 R >>'.encode()
    objs[root - 1] = f'<< /Type /Pages /Kids [{" ".join(f"{k} 0 R" for k in kids)}] /Count {len(kids)} >>'.encode()
    info = add(f'<< /Title ({title}) /Author (Ludimi Mammal Discovery Club) >>'.encode('latin-1', 'replace'))
    out = bytearray(('%PDF-1.4' + NL).encode()); offsets = []
    for i, o in enumerate(objs, 1):
        offsets.append(len(out)); out += f'{i} 0 obj{NL}'.encode() + o + f'{NL}endobj{NL}'.encode()
    xref = len(out)
    out += f'xref{NL}0 {len(objs) + 1}{NL}0000000000 65535 f {NL}'.encode() + b''.join(f'{x:010d} 00000 n {NL}'.encode() for x in offsets)
    out += f'trailer{NL}<< /Size {len(objs) + 1} /Root {cat} 0 R /Info {info} 0 R >>{NL}startxref{NL}{xref}{NL}%%EOF{NL}'.encode()
    open(path, 'wb').write(out)


for level_id, label, pics in levels:
    sheets = [sheet(pid, name, label) for pid, name in pics]
    path = os.path.join(OUT, f'mammals-tracing-{level_id}-a4-v2.pdf')
    save(sheets, path, f'Mammal Discovery Club tracing sheets: {label}')
    # Two per page: landscape A4 cut in half gives two A5 portrait sheets, each a different picture.
    PW, PH = round(W * K), round(H * K)
    halves = []
    for i in range(0, len(sheets), 2):
        page = Image.new('RGB', (PW, PH), 'white'); d = ImageDraw.Draw(page)
        for j, sh in enumerate(sheets[i:i + 2]):
            if sh.width > sh.height: sh = sh.rotate(90, expand=True)
            small = sh.resize((PW // 2, round(sh.height * (PW // 2) / sh.width)), Image.LANCZOS)
            page.paste(small, (j * (PW // 2), (PH - small.height) // 2))
        for y0 in range(round(14 * K), PH - round(14 * K), round(8 * K)):
            d.line((PW // 2, y0, PW // 2, y0 + round(4 * K)), fill=(179, 179, 166), width=max(1, round(.6 * K)))
        halves.append(page)
    a5 = os.path.join(OUT, f'mammals-tracing-{level_id}-a5-v2.pdf')
    save(halves, a5, f'Mammal Discovery Club tracing sheets: {label} (A5, two per page)')
    packs.append({'level': level_id, 'title': f'Tracing sheets: {label}', 'paper': 'A4', 'pageCount': len(pics),
                  'bytes': os.path.getsize(path), 'path': f'assets/printables/tracing/{os.path.basename(path)}',
                  'a5PageCount': len(halves), 'a5Bytes': os.path.getsize(a5), 'a5Path': f'assets/printables/tracing/{os.path.basename(a5)}',
                  'cover': f'assets/line-art/{pics[0][0]}-{redo.get(pics[0][0], "v1")}.webp'})
    print(path, os.path.getsize(path) // 1024, 'KB;', a5, os.path.getsize(a5) // 1024, 'KB', flush=True)

js = ('// Generated by scripts/create-tracing-pdfs.py from the Draw & Trace pictures; run it again when they change.\n'
      f'export const tracingPrintables = {json.dumps(packs, indent=2)};\n')
open(os.path.join(ROOT, 'src', 'topics', 'tracing-printables.js'), 'w', encoding='utf-8', newline='\n').write(js)
