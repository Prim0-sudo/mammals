# WebP twins for every picture the app shows (blueprint v6.1 ART-AND-ANIMATION): quality 85, original size,
# alpha kept. The PNG originals stay for the printable scripts; the build ships only the WebP of a picture
# that has one (scripts/build.mjs). docs/webp-twins.json records the PNG each twin was made from, so
# npm run check fails when a PNG is replaced and its twin is stale.
# Re-run after Codex replaces or adds a PNG: only changed pictures are rewritten.
# usage: python -I tools/art/png-to-webp.py [--force]
import hashlib, json, os, sys
from concurrent.futures import ProcessPoolExecutor
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
RECORD = os.path.join(ROOT, 'docs', 'webp-twins.json')
FOLDERS = ['assets/topics/mammals']
SKIP = ('homeward-trail/', 'landing-animations/')  # already WebP or supplied animation frames


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def convert(png):
    out = png[:-4] + '.webp'
    im = Image.open(png)
    im.load()
    im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
    im.save(out, 'WEBP', quality=85, alpha_quality=100, method=6)
    return png, os.path.getsize(png), os.path.getsize(out)


def main():
    force = '--force' in sys.argv
    record = json.load(open(RECORD, encoding='utf8')) if os.path.exists(RECORD) else {}
    found, todo = {}, []
    for folder in FOLDERS:
        for d, _, files in os.walk(os.path.join(ROOT, folder)):
            for f in sorted(files):
                p = os.path.join(d, f)
                rel = os.path.relpath(p, ROOT).replace('\\', '/')
                if not f.endswith('.png') or any(s in rel for s in SKIP):
                    continue
                h = sha(p)
                found[rel] = h
                w = p[:-4] + '.webp'
                # A twin made before this record existed counts when it is newer than its PNG.
                fresh = os.path.exists(w) and (record.get(rel) == h or (rel not in record and os.path.getmtime(w) >= os.path.getmtime(p)))
                if force or not fresh:
                    todo.append(p)
    before = after = 0
    with ProcessPoolExecutor(max_workers=3) as pool:
        for png, a, b in pool.map(convert, todo):
            before += a; after += b
    with open(RECORD, 'w', encoding='utf8', newline='\n') as fh:
        json.dump(dict(sorted(found.items())), fh, indent=1)
        fh.write('\n')
    print(f'{len(todo)} WebP twins written ({before / 2**20:.1f} MiB of PNG -> {after / 2**20:.1f} MiB); {len(found)} recorded')


if __name__ == '__main__':
    main()
