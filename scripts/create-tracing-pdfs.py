raise SystemExit("Insects template (21 November 2026): fit it to Mammals in the media stage before running (docs/UPGRADE-PLAN.md).")
"""Tracing sheets for Draw & Trace (Arts & Crafts), for children without tablets.

One A4 landscape page per picture: a name line, the picture's name, a small full-colour model,
the colour order to trace in, and the picture itself big, drawn as grey dashes along the centre of every line to trace over
(owner pick, 2026-11-15: dashes are real tracing).
Ported from Plants on 19 November 2026 (owner: "why are there no tracing sheets?"); thinning rewritten without numpy, and pages drawn with Pillow and saved as PDF (no reportlab on the work PC).
Writes assets/printables/tracing/insects-tracing-<level>-a4-v1.pdf (one per page), -a5-v1.pdf (two per page) and src/topics/tracing-printables.js.
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
DASH, GAP, GREY, SCALE, DOT = 9, 7, (150, 150, 150), 2, 4   # dash and gap along the line (px), dash colour, output scale, pen radius

src = open(LIST, encoding='utf-8').read()
levels, redo = [], {}
for m in re.finditer(r"\{ id: '(\w+)', label: '([^']+)', pictures: \[(.*?)\] \}", src, re.S):
    entries = []
    for obj in re.findall(r"\{ (id: '[\w-]+'[^}]*)\}", m.group(3)):
        pid = re.search(r"id: '([\w-]+)'", obj).group(1); name = re.search(r"name: '([^']+)'", obj).group(1)
        v = re.search(r"version: '(v\d+)'", obj)
        if v: redo[pid] = v.group(1)
        entries.append((pid, name))
    levels.append((m.group(1), m.group(2), entries))
# Only pictures in READY (their outline file is in) go on the sheets; levels may hold any number.
ready = set(re.findall(r"'([\w-]+)'", src[src.index('const READY'):src.index(']);', src.index('const READY'))]))
levels = [(lid, label, [p for p in pics if p[0] in ready]) for lid, label, pics in levels]
if len(levels) != 3 or any(not p for _, _, p in levels): sys.exit('Could not read the Draw & Trace levels from draw-trace-pictures.js')

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


def dashed(im):
    """The picture as grey dashes along the centre of each line."""
    g = im.convert('L'); w, h = g.size; px = g.load()
    sk = thin((y, x) for y in range(h) for x in range(w) if px[x, y] < 200)
    dist = {}
    for s in sorted(sk):
        if s in dist: continue
        dist[s] = 0; q = deque([s])
        while q:
            y, x = q.popleft()
            for dy, dx in NB:
                t = (y + dy, x + dx)
                if t in sk and t not in dist:
                    dist[t] = dist[(y, x)] + 1; q.append(t)
    out = Image.new('RGB', (w * SCALE, h * SCALE), 'white'); d = ImageDraw.Draw(out)
    for (y, x), k in dist.items():
        if k % (DASH + GAP) < DASH:
            d.ellipse([x * SCALE - DOT, y * SCALE - DOT, x * SCALE + DOT, y * SCALE + DOT], fill=GREY)
    return out


DPI = 200
K = DPI / 72                       # layout is in points (1/72 inch), drawn at 200 dpi
W, H = 842, 595                    # A4 landscape in points
M = 28
FONT = {False: 'C:/Windows/Fonts/arial.ttf', True: 'C:/Windows/Fonts/arialbd.ttf'}
INK, MUTED, RULE = (36, 79, 59), (102, 102, 97), (153, 153, 140)
font = lambda size, bold=False: ImageFont.truetype(FONT[bold], round(size * K))
pt = lambda *v: [round(x * K) for x in v]
os.makedirs(OUT, exist_ok=True)
packs = []


def sheet(pid, name, label):
    """One tracing sheet as an A4-landscape page image."""
    im = Image.open(os.path.join(ART, f'{pid}-{redo.get(pid, "v1")}.webp')).convert('RGB')
    order = colours_in(im)
    page = Image.new('RGB', (round(W * K), round(H * K)), 'white'); d = ImageDraw.Draw(page)
    d.text(pt(M, M + 18), name, font=font(22, True), fill=INK, anchor='ls')
    d.text(pt(M, M + 40), 'Name:', font=font(13), fill=INK, anchor='ls')
    d.line(pt(M + 44, M + 42, M + 300, M + 42), fill=RULE, width=round(K))
    f12 = font(12); d.text(pt(M, M + 64), 'Trace in this order:', font=f12, fill=INK, anchor='ls'); x = M + 112
    for i, n in enumerate(order):
        d.ellipse(pt(x, M + 53, x + 14, M + 67), fill=dict(PAL)[n])
        t = n + ('  >' if i < len(order) - 1 else '')
        d.text(pt(x + 18, M + 64), t, font=f12, fill=(51, 51, 51), anchor='ls')
        x += 30 + d.textlength(n + '  >', font=f12) / K
    mw, mh = 150, 112.5
    d.rounded_rectangle(pt(W - M - mw - 6, M - 6, W - M + 6, M + mh + 6), radius=round(8 * K), outline=(204, 199, 166), width=round(K))
    page.paste(im.resize(pt(mw, mh), Image.LANCZOS), pt(W - M - mw, M))
    d.text(pt(W - M - mw / 2, M + mh + 18), 'Look', font=font(9), fill=MUTED, anchor='ms')
    top = M + mh + 26
    bh = min((W - 2 * M) * 3 / 4, H - top - M - 14); bw = bh * 4 / 3
    page.paste(dashed(im).resize(pt(bw, bh), Image.LANCZOS), pt((W - bw) / 2, H - M - 12 - bh))
    f8 = font(8)
    d.text(pt(M, H - M + 10), f'Little Bug Club · Draw & Trace · {label}', font=f8, fill=(140, 140, 128), anchor='ls')
    d.text(pt(W - M, H - M + 10), 'Print at actual size (100%)', font=f8, fill=(140, 140, 128), anchor='rs')
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
    info = add(f'<< /Title ({title}) /Author (Ludimi Little Bug Club) >>'.encode('latin-1', 'replace'))
    out = bytearray(('%PDF-1.4' + NL).encode()); offsets = []
    for i, o in enumerate(objs, 1):
        offsets.append(len(out)); out += f'{i} 0 obj{NL}'.encode() + o + f'{NL}endobj{NL}'.encode()
    xref = len(out)
    out += f'xref{NL}0 {len(objs) + 1}{NL}0000000000 65535 f {NL}'.encode() + b''.join(f'{x:010d} 00000 n {NL}'.encode() for x in offsets)
    out += f'trailer{NL}<< /Size {len(objs) + 1} /Root {cat} 0 R /Info {info} 0 R >>{NL}startxref{NL}{xref}{NL}%%EOF{NL}'.encode()
    open(path, 'wb').write(out)


for level_id, label, pics in levels:
    sheets = [sheet(pid, name, label) for pid, name in pics]
    path = os.path.join(OUT, f'insects-tracing-{level_id}-a4-v1.pdf')
    save(sheets, path, f'Little Bug Club tracing sheets: {label}')
    # Two per page: portrait A4 cut in half gives two A5 landscape sheets, each a different picture.
    PW, PH = round(H * K), round(W * K)
    halves = []
    for i in range(0, len(sheets), 2):
        page = Image.new('RGB', (PW, PH), 'white'); d = ImageDraw.Draw(page)
        for j, sh in enumerate(sheets[i:i + 2]):
            small = sh.resize((PW, round(sh.height * PW / sh.width)), Image.LANCZOS)
            page.paste(small, (0, 0 if j == 0 else PH // 2))
        for x0 in range(round(14 * K), PW - round(14 * K), round(8 * K)):
            d.line((x0, PH // 2, x0 + round(4 * K), PH // 2), fill=(179, 179, 166), width=max(1, round(.6 * K)))
        halves.append(page)
    a5 = os.path.join(OUT, f'insects-tracing-{level_id}-a5-v1.pdf')
    save(halves, a5, f'Little Bug Club tracing sheets: {label} (A5, two per page)')
    packs.append({'level': level_id, 'title': f'Tracing sheets: {label}', 'paper': 'A4', 'pageCount': len(pics),
                  'bytes': os.path.getsize(path), 'path': f'assets/printables/tracing/{os.path.basename(path)}',
                  'a5PageCount': len(halves), 'a5Bytes': os.path.getsize(a5), 'a5Path': f'assets/printables/tracing/{os.path.basename(a5)}',
                  'cover': f'assets/line-art/{pics[0][0]}-{redo.get(pics[0][0], "v1")}.webp'})
    print(path, os.path.getsize(path) // 1024, 'KB;', a5, os.path.getsize(a5) // 1024, 'KB', flush=True)

js = ('// Generated by scripts/create-tracing-pdfs.py from the Draw & Trace pictures; run it again when they change.\n'
      f'export const tracingPrintables = {json.dumps(packs, indent=2)};\n')
open(os.path.join(ROOT, 'src', 'topics', 'tracing-printables.js'), 'w', encoding='utf-8', newline='\n').write(js)
