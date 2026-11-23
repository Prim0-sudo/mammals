# usage: python -I tools/art/build-bank-lip.py <repo>  -- rebuild bank-lip.png (and its WebP) from bank.png.
# Keep HOLES in step with LANDING_PEEKS in src/topics/painted-art.js.
# Per hole: in each column of the animal's canvas, the lip starts at the opening's lower rim. Beside the
# opening the rim line is carried on from the nearest opening column, smoothed, with a soft top edge, so
# it never cuts a square notch out of the animal.
import sys
import numpy as np
from PIL import Image
R = sys.argv[1]
L = f'{R}/docs/landing-art/2026-11-23-layers/layers'
HOLES = [('rabbit', 148, 1066, 200), ('fox', 528, 1262, 300), ('badger', 295, 1515, 360), ('mouse', 2300, 1560, 190)]
bank = np.array(Image.open(f'{L}/bank.png').convert('RGBA'))
al = bank[..., 3]
H, W = al.shape
cover = np.zeros(al.shape, np.float32)
FEATHER = 8
MARGIN = 20
for name, x, edge, w in HOLES:
    mid = int(edge - 0.3 * w)
    low = int(edge + 0.32 * w)
    c0, c1 = max(0, x - w // 2 - 10), min(W - 1, x + w // 2 + 10)
    cols = np.arange(c0, c1 + 1)
    start = np.full(cols.size, np.nan)
    for i, c in enumerate(cols):
        col = al[mid:low, c]
        if col[0] <= 128:
            opaque = np.where(col > 128)[0]
            start[i] = mid + (opaque[0] if opaque.size else low - mid)
    ok = ~np.isnan(start)
    if not ok.any():
        print(name, 'no opening found'); continue
    # carry the rim line out from the nearest opening column
    idx = np.where(ok)[0]
    keep = np.zeros(cols.size, bool)
    keep[max(0, idx.min() - MARGIN):idx.max() + MARGIN + 1] = True  # never reach over a neighbour's head
    for i in range(cols.size):
        if not ok[i]:
            start[i] = start[idx[np.argmin(np.abs(idx - i))]]
    k = 15
    sm = np.convolve(np.pad(start, k, mode='edge'), np.ones(2 * k + 1) / (2 * k + 1), mode='same')[k:-k]
    start = np.maximum(sm, start - 4)  # smoothing must not lift the line far above the real rim
    for i, c in enumerate(cols):
        if not keep[i]:
            continue
        s = int(start[i])
        ramp = np.clip((np.arange(s - FEATHER, low) - (s - FEATHER)) / FEATHER, 0, 1)
        cover[s - FEATHER:low, c] = np.maximum(cover[s - FEATHER:low, c], ramp)
    print(name, 'opening columns', int(ok.sum()), 'rim rows', int(start.min()), int(start.max()))
lip = bank.copy()
lip[..., 3] = (al * cover).astype(np.uint8)
Image.fromarray(lip).save(f'{L}/bank-lip.png')
Image.fromarray(lip).save(f'{R}/assets/painted/landing/bank-lip.webp', quality=85, method=6)
print('saved')
