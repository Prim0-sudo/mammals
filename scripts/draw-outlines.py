# Draws the Draw & Trace pictures that are made by hand rather than converted from art (owner, 19 November 2026:
# "just draw it yourself"). Each picture is a list of steps; each step is a list of lines in 1024 x 768 picture
# coordinates. The script writes the outline picture (.webp, used for colouring and tracing sheets) and a .json
# twin with the same lines in Draw & Trace's 1000 x 750 drawing space, so the tracing order is the one written
# here instead of one guessed from pixels.  Run:  py -3 scripts/draw-outlines.py
raise SystemExit("Insects template (21 November 2026): fit it to Mammals in the media stage before running (docs/UPGRADE-PLAN.md).")
import json, math, os
from PIL import Image, ImageDraw

OUT = 'assets/line-art'
IW, IH, INK = 1024, 768, 17                      # house size and line width
S = min((1000 - 72) / IW, (750 - 72) / IH)       # how line-art.js fits a picture into its drawing space
OX, OY = (1000 - IW * S) / 2, (750 - IH * S) / 2

BROWN, GREEN, GOLD, ORANGE, RED, BLUE, BLACK = (138, 90, 59), (47, 125, 62), (217, 162, 27), (224, 102, 42), (200, 50, 60), (47, 111, 181), (43, 43, 40)


def dense(pts, gap=6):
    out = [pts[0]]
    for a, b in zip(pts, pts[1:]):
        n = max(1, int(math.dist(a, b) / gap))
        out += [(a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n) for k in range(1, n + 1)]
    return out


def line(*pts):
    return dense(list(pts))


def curve(*pts, closed=False):
    """Catmull-Rom curve through the points."""
    p = list(pts)
    ext = [p[-1]] + p + p[:2] if closed else [p[0]] + p + [p[-1]]
    out = []
    for i in range(1, len(ext) - 2):
        p0, p1, p2, p3 = ext[i - 1], ext[i], ext[i + 1], ext[i + 2]
        n = max(2, int(math.dist(p1, p2) / 6))
        for k in range(n):
            t = k / n
            out.append(tuple(.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t
                                   + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t ** 3) for j in (0, 1)))
    out.append(p[0] if closed else p[-1])
    return out


def oval(cx, cy, rx, ry, rot=0, a0=-90, a1=270):
    r = math.radians(rot)
    n = max(12, int(abs(a1 - a0) / 360 * 2 * math.pi * max(rx, ry) / 6))
    pts = []
    for k in range(n + 1):
        a = math.radians(a0 + (a1 - a0) * k / n)
        x, y = rx * math.cos(a), ry * math.sin(a)
        pts.append((cx + x * math.cos(r) - y * math.sin(r), cy + x * math.sin(r) + y * math.cos(r)))
    return pts


def hexagon(cx, cy, r):
    return line(*[(cx + r * math.cos(math.radians(-90 + 60 * k)), cy + r * math.sin(math.radians(-90 + 60 * k))) for k in range(7)])


def L(rgb, pts):
    return (rgb, pts)


# ---- the bee and the ant, reused ------------------------------------------------------------------------------
def bee(tx, ty, k=1.3):
    """A bee facing left, three body parts, six bent legs from the thorax. Returns (body, face, wings_and_legs)."""
    P = lambda x, y: (tx + k * x, ty + k * y)
    O = lambda x, y, rx, ry, **kw: oval(*P(x, y), rx * k, ry * k, **kw)
    body = [L(GOLD, O(116, 4, 80, 58, a0=180, a1=540)), L(GOLD, O(0, 0, 38, 36)), L(GOLD, O(-70, -6, 34, 34))]
    face = []
    for x in (94, 138):
        h = 58 * math.sqrt(1 - ((x - 116) / 80) ** 2) - 8
        face.append(L(BLACK, curve(P(x, 4 - h), P(x + 8, 4), P(x, 4 + h))))
    face += [L(BLACK, O(-84, -14, 5, 5)), L(BLACK, O(-74, -2, 13, 11, a0=40, a1=140)),
             L(BLACK, curve(P(-80, -38), P(-96, -64), P(-118, -76))), L(BLACK, curve(P(-60, -40), P(-60, -72), P(-76, -90)))]
    wings = [L(BLUE, O(-4, -80, 26, 44, rot=-32)), L(BLUE, O(74, -76, 28, 46, rot=30))]
    legs = []
    for i, a in enumerate((150, 128, 106, 74, 52, 30)):
        kx = -66 + 26 * i
        legs.append(L(BLACK, line(P(38 * math.cos(math.radians(a)), 36 * math.sin(math.radians(a))), P(kx, 58), P(kx + 16, 78))))
    return body, face, wings + legs


def ant(tx, ty, facing=1, k=1.3):
    """An ant, three body parts, six bent legs from the thorax, elbowed feelers. facing 1 = right, -1 = left.
    (tx, ty) is the middle of the thorax; the feet stand 78 * k below it."""
    P = lambda x, y: (tx + facing * k * x, ty + k * y)
    body = [L(RED, oval(*P(-86, 2), 54 * k, 36 * k)), L(RED, oval(*P(0, 0), 34 * k, 22 * k)), L(RED, oval(*P(68, -10), 30 * k, 30 * k))]
    legs = []
    for a, kx, fx in zip((160, 135, 110, 70, 45, 20), (-100, -62, -24, 24, 62, 100), (-122, -80, -36, 36, 80, 122)):
        legs.append(L(BLACK, line(P(34 * math.cos(math.radians(a)), 22 * math.sin(math.radians(a))), P(kx, 52), P(fx, 78))))
    face = [L(BLACK, oval(*P(78, -16), 5 * k, 5 * k)),
            L(BLACK, line(P(70, -38), P(80, -76), P(112, -90))),
            L(BLACK, line(P(54, -36), P(48, -74), P(74, -100)))]
    return body, legs + face


# ---- the pictures ------------------------------------------------------------------------------------------------
def honeycomb():
    r, cx = 66, 280
    w = r * math.sqrt(3)
    rows = [(300, (-1, 0, 1)), (399, (-1.5, -.5, .5, 1.5)), (498, (-1, 0, 1))]
    cells = [[L(GOLD, hexagon(cx + c * w, y, r)) for c in cols] for y, cols in rows]
    branch = [L(BROWN, curve((30, 186), (200, 174), (400, 180), (560, 172))), L(BROWN, curve((430, 179), (466, 146), (510, 128)))]
    stalks = [L(GOLD, line((cx + c * w, 234), (cx + c * w, 182))) for c in (-1, 0, 1)]
    drip = [L(ORANGE, curve((268, 566), (272, 590), (262, 612), (280, 632), (298, 612), (288, 590), (292, 566)))]
    b1, b2 = bee(700, 262), bee(690, 584)
    return [
        ('Draw the branch', branch),
        ('Draw the top row of cells', stalks + cells[0]),
        ('Draw the middle row of cells', cells[1]),
        ('Draw the bottom row and a drip of honey', cells[2] + drip),
        ("Draw the first bee's body", b1[0]),
        ('Add its stripes, face and feelers', b1[1]),
        ('Add its wings and six legs', b1[2]),
        ("Draw the second bee's body", b2[0]),
        ('Add its stripes, face and feelers', b2[1]),
        ('Add its wings and six legs', b2[2]),
    ]


def slug():
    body = curve((200, 594), (460, 594), (720, 594), (860, 590), (900, 556), (906, 506), (880, 462), (832, 432),
                 (760, 414), (640, 390), (520, 398), (400, 436), (290, 520), closed=True)
    mantle = oval(620, 452, 124, 44)
    stalks = [L(ORANGE, curve((836, 434), (842, 390), (846, 346))), L(ORANGE, oval(848, 330, 16, 16)),
              L(ORANGE, curve((866, 450), (892, 406), (916, 368))), L(ORANGE, oval(924, 354, 16, 16)),
              L(ORANGE, curve((902, 530), (930, 534), (952, 530))), L(ORANGE, curve((898, 556), (924, 568), (944, 582)))]
    face = [L(BLACK, oval(852, 500, 22, 18, a0=30, a1=150)), L(BROWN, curve((70, 618), (400, 614), (700, 618), (970, 612))),
            L(GREEN, line((70, 616), (58, 574))), L(GREEN, line((82, 616), (90, 566))), L(GREEN, line((94, 616), (120, 580)))]
    return [
        ("Draw the slug's body", [L(ORANGE, body), L(ORANGE, mantle)]),
        ('Add the eye stalks and feelers', stalks),
        ('Add a smile and the ground', face),
    ]


def ant_nest():
    ground = [L(BROWN, curve((40, 250), (240, 252), (380, 250), (430, 214), (470, 182), (494, 170))),
              L(BROWN, curve((530, 170), (556, 182), (596, 214), (640, 250), (820, 252), (990, 250)))]
    door = [L(BROWN, curve((512, 186), (500, 240), (520, 290), (504, 332))),
            L(BROWN, curve((504, 332), (440, 352), (380, 380), (344, 396))),
            L(BROWN, curve((504, 332), (548, 354), (580, 372)))]
    top = [L(BROWN, oval(232, 404, 110, 56)), L(BROWN, oval(700, 386, 120, 56))]
    low = [L(BROWN, curve((240, 460), (226, 500), (262, 530), (300, 552))),
           L(BROWN, curve((716, 442), (740, 490), (730, 530), (752, 566))),
           L(BROWN, oval(330, 612, 120, 58)), L(BROWN, oval(770, 622, 110, 56)),
           L(BROWN, curve((450, 616), (520, 640), (590, 604), (660, 624)))]
    eggs = [L(GOLD, oval(x, 414, 22, 16)) for x in (176, 232, 288)]
    grubs = [L(GOLD, oval(276, 620, 38, 22)), L(GOLD, line((262, 600), (262, 640))),
             L(GOLD, oval(388, 616, 38, 22)), L(GOLD, line((374, 596), (374, 636)))]
    a1, a2 = ant(216, 250 - 78 * 1.3, 1), ant(806, 250 - 78 * 1.3, -1)
    grass = [L(GREEN, line((410, 232), (398, 196))), L(GREEN, line((422, 226), (432, 188))),   # on the anthill's slopes
             L(GREEN, line((598, 222), (590, 186))), L(GREEN, line((610, 230), (620, 194)))]
    shift = lambda lines: [(rgb, [(x, y + 34) for x, y in pts]) for rgb, pts in lines]   # room above for the bigger ants
    ground, door, top, low, eggs, grubs, grass = map(shift, (ground, door, top, low, eggs, grubs, grass))
    a1, a2 = [shift(part) for part in a1], [shift(part) for part in a2]
    return [
        ('Draw the ground and the anthill', ground),
        ('Draw the tunnels from the door', door),
        ('Draw the top rooms', top),
        ('Dig down to the bottom rooms', low),
        ('Add the eggs', eggs),
        ('Add the baby ants (larvae)', grubs),
        ('Draw an ant on top', a1[0]),
        ('Give it six legs and feelers', a1[1]),
        ('Draw another ant', a2[0]),
        ('Give it six legs, feelers and some grass', a2[1] + grass),
    ]


PICTURES = {'hard-06-honeycomb-bees-v2': honeycomb, 'easy-11-slug-v1': slug, 'hard-11-ant-nest-v1': ant_nest}


def render(steps, path):
    k = 2
    im = Image.new('RGB', (IW * k, IH * k), 'white')
    g = ImageDraw.Draw(im)
    for _, lines in steps:
        for rgb, pts in lines:
            q = [(x * k, y * k) for x, y in pts]
            g.line(q, fill=rgb, width=INK * k, joint='curve')
            for x, y in (q[0], q[-1]):
                g.ellipse([x - INK * k / 2, y - INK * k / 2, x + INK * k / 2, y + INK * k / 2], fill=rgb)
    im.resize((IW, IH), Image.LANCZOS).save(path, 'WEBP', lossless=True, method=6)


def to_json(steps):
    out = []
    for title, lines in steps:
        out.append({'title': title, 'rgb': list(lines[0][0]),
                    'lines': [{'rgb': list(rgb), 'pts': [[round(OX + x * S, 1), round(OY + y * S, 1)] for x, y in pts]} for rgb, pts in lines]})
    return {'steps': out}


if __name__ == '__main__':
    for name, make in PICTURES.items():
        steps = make()
        render(steps, os.path.join(OUT, name + '.webp'))
        with open(os.path.join(OUT, name + '.json'), 'w', encoding='utf-8', newline='\n') as fh:
            json.dump(to_json(steps), fh, separators=(',', ':'))
        print(name, len(steps), 'steps')
