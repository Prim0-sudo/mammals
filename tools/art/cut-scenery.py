# Cut Codex scenery originals into game files (docs/game-art/SCENERY-BRIEF.md).
# strip:  python -I tools/art/cut-scenery.py strip <original.png> <out.webp> --height 300 [--overlap 160]
#   Crops the scenery band (first opaque row to the bottom) and scales it to --height px, sitting on the bottom of a
#   2048 x 512 strip with transparent space above. It finds the pair of end columns that match best, cross-fades the
#   right end over the left end so the picture loops, repeats the loop as often as fits 2048 px and evens it out to
#   exactly 2048 (a slight horizontal stretch at most). Writes <original>-seam.png: two copies side by side on night
#   blue, to check the join.
# object: python -I tools/art/cut-scenery.py object <original.png> <out.webp> [--fill 0.9] [--ground]
#   Crops to the alpha box, scales into 512 x 512 (longest side = fill x 512), centred; --ground sits the base on y = 481.
import argparse, os
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument('kind', choices=['strip', 'object']); ap.add_argument('src'); ap.add_argument('out')
ap.add_argument('--height', type=int, default=300); ap.add_argument('--overlap', type=int, default=160)
ap.add_argument('--search', type=int, default=100)  # how far in from each end to look for the best join
ap.add_argument('--fill', type=float, default=.9); ap.add_argument('--ground', action='store_true')
ap.add_argument('--bg', default='14,20,38')
a = ap.parse_args()
bg = tuple(int(v) for v in a.bg.split(','))

im = Image.open(a.src).convert('RGBA')
im.putalpha(im.getchannel('A').point(lambda v: 0 if v < 6 else v))
box = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
if not box:
    raise SystemExit('empty picture')
os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)


def premul(img):
    arr = np.asarray(img).astype(np.float32) / 255
    return arr[..., :3] * arr[..., 3:], arr[..., 3:]


def unpremul(rgb, al):
    col = np.where(al > 1e-4, rgb / np.maximum(al, 1e-4), 0)
    return Image.fromarray((np.concatenate([col, al], 2) * 255 + .5).clip(0, 255).astype(np.uint8), 'RGBA')


if a.kind == 'strip':
    W, H, ov, bh = 2048, 512, a.overlap, a.height
    band = im.crop((0, box[1], im.width, im.height))
    band = band.resize((round(band.width * bh / band.height), bh), Image.Resampling.LANCZOS)
    rgb, al = premul(band)
    w = band.width
    # best join: the tail window ending at x1 should look like the head window starting at x0
    best = None
    for x0 in range(0, a.search, 4):
        head = rgb[:, x0:x0 + ov]
        for x1 in range(w - a.search, w + 1, 4):
            d = float(np.abs(rgb[:, x1 - ov:x1] - head).mean())
            if best is None or d < best[0]:
                best = (d, x0, x1)
    _, x0, x1 = best
    rgb, al = rgb[:, x0:x1], al[:, x0:x1]
    P = rgb.shape[1] - ov  # one loop
    t = np.linspace(0, 1, ov, dtype=np.float32)[None, :, None]  # 0 at the left edge: all tail
    lrgb, lal = rgb[:, :P].copy(), al[:, :P].copy()
    lrgb[:, :ov] = rgb[:, P:] * (1 - t) + rgb[:, :ov] * t
    lal[:, :ov] = al[:, P:] * (1 - t) + al[:, :ov] * t
    n = max(1, round(W / P))
    loop = unpremul(np.concatenate([lrgb] * n, 1), np.concatenate([lal] * n, 1))
    loop = loop.resize((W, bh), Image.Resampling.LANCZOS)
    res = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    res.alpha_composite(loop, (0, H - bh))
    res.save(a.out, 'WEBP', quality=88, method=6)
    seam = Image.new('RGBA', (W * 2, H), bg + (255,))
    seam.alpha_composite(res, (0, 0)); seam.alpha_composite(res, (W, 0))
    seam.convert('RGB').save(os.path.splitext(os.path.abspath(a.src))[0] + '-seam.png')  # next to the original
    print(f'{a.out}: band {bh}px high, loop {P}px x {n} -> stretch {W / (P * n):.2f}, join cols {x0}..{x1}, diff {best[0]:.4f}')
else:
    C = 512
    obj = im.crop(box)
    s = C * a.fill / max(obj.width, obj.height)
    obj = obj.resize((max(1, round(obj.width * s)), max(1, round(obj.height * s))), Image.Resampling.LANCZOS)
    f = Image.new('RGBA', (C, C), (0, 0, 0, 0))
    y = 481 - obj.height if a.ground else (C - obj.height) // 2
    f.alpha_composite(obj, ((C - obj.width) // 2, max(0, y)))
    f.save(a.out, 'WEBP', quality=88, method=6)
    print(f'{a.out}: object {obj.width}x{obj.height} in {C}x{C}')
