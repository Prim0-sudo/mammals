# Cut a Codex pose grid into aligned motion frames and a one-row sprite sheet (docs/game-art/BRIEF.md, section 3).
# The grid holds every pose of one animal (2 x 2, read left to right, top row first; or 1 x N / 3-up with --cols/--rows).
# Each pose is cut from its cell by its alpha box, all poses are scaled by ONE factor (so the animal keeps its size),
# then each is centred on the same x and sat on the same ground line in an equal square cell.
# usage: python -I tools/art/grid-to-sprites.py <grid.png> <sheet name> [--frames N] [--cols C] [--rows R] [--cell 512]
#        [--float]   (centre poses vertically instead of on one ground line, for flying animals)
#        [--anchor nose|centre]   (nose, the default: every pose's front edge on one line, since the animals face right)
# writes assets/topics/mammals/games/sprites/<name>.webp and <name>-1..N.webp, and a check sheet next to the grid.
import argparse, os
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ap = argparse.ArgumentParser()
ap.add_argument('grid'); ap.add_argument('name')
ap.add_argument('--frames', type=int, default=4); ap.add_argument('--cols', type=int, default=2); ap.add_argument('--rows', type=int, default=2)
ap.add_argument('--cell', type=int, default=512); ap.add_argument('--float', action='store_true')
ap.add_argument('--anchor', choices=['nose', 'centre'], default='nose')
ap.add_argument('--keep-y', action='store_true')  # keep each pose's height in its grid cell (flyers: the body stays level while the wings move)
ap.add_argument('--rescale', default='')  # per-pose size fixes when the grid drew one pose smaller, e.g. '1:1.2,3:0.95'  # nose: the front edge (head) stays put, so the body moves behind it
a = ap.parse_args()

grid = Image.open(a.grid).convert('RGBA')
cw, ch = grid.width // a.cols, grid.height // a.rows
poses, tops = [], []
for i in range(a.frames):
    r, c = divmod(i, a.cols)
    cell = grid.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
    alpha = cell.getchannel('A').point(lambda v: 255 if v > 24 else 0)
    box = alpha.getbbox()
    if not box:
        raise SystemExit(f'pose {i + 1} is empty')
    pose = cell.crop(box)
    tops.append((box[1], box[3], ch))
    # clear faint specks left outside the animal
    pose.putalpha(pose.getchannel('A').point(lambda v: 0 if v < 6 else v))
    poses.append(pose)

fix = {int(k): float(v) for k, v in (x.split(':') for x in a.rescale.split(',') if x)}
for i in fix:
    p = poses[i - 1]
    poses[i - 1] = p.resize((round(p.width * fix[i]), round(p.height * fix[i])), Image.Resampling.LANCZOS)
margin = round(a.cell * .06)
scale = (a.cell - 2 * margin) / max(max(p.width for p in poses), max(p.height for p in poses))
frames = []
for p in poses:
    p = p.resize((max(1, round(p.width * scale)), max(1, round(p.height * scale))), Image.Resampling.LANCZOS)
    f = Image.new('RGBA', (a.cell, a.cell), (0, 0, 0, 0))
    if a.keep_y:  # the pose's vertical centre, as a share of its grid cell, kept in the frame
        t, b, h = tops[len(frames)]
        y = round((t + b) / 2 / h * a.cell - p.height / 2)
        y = min(max(y, margin // 2), a.cell - margin // 2 - p.height)
    else:
        y = (a.cell - p.height) // 2 if a.float else a.cell - margin - p.height
    x = a.cell - margin - p.width if a.anchor == 'nose' else (a.cell - p.width) // 2
    f.alpha_composite(p, (x, y))
    frames.append(f)

out = os.path.join(ROOT, 'assets/topics/mammals/games/sprites')
os.makedirs(out, exist_ok=True)
sheet = Image.new('RGBA', (a.cell * len(frames), a.cell), (0, 0, 0, 0))
for i, f in enumerate(frames):
    sheet.alpha_composite(f, (i * a.cell, 0))
    f.save(os.path.join(out, f'{a.name}-{i + 1}.webp'), 'WEBP', quality=90, method=6)
sheet.save(os.path.join(out, f'{a.name}.webp'), 'WEBP', quality=90, method=6)

# check sheet: frames on dark and on light, with the ground line and centre line drawn
check = Image.new('RGB', (sheet.width, a.cell * 2), (26, 29, 34))
check.paste(Image.new('RGB', (sheet.width, a.cell), (245, 243, 236)), (0, a.cell))
for row in (0, 1):
    check.paste(sheet, (0, row * a.cell), sheet)
d = ImageDraw.Draw(check)
for row in (0, 1):
    gy = row * a.cell + a.cell - margin
    if not a.float:
        d.line((0, gy, sheet.width, gy), fill=(200, 80, 80), width=1)
    for i in range(len(frames)):
        x = i * a.cell + a.cell // 2
        d.line((x, row * a.cell, x, row * a.cell + a.cell), fill=(80, 140, 200), width=1)
check.save(os.path.join(os.path.dirname(os.path.abspath(a.grid)), f'{a.name}-check.png'))
print(f'{a.name}: {len(frames)} frames of {a.cell}px, scale {scale:.3f}, sheet {sheet.width}x{sheet.height}')
