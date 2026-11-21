# Install a Codex word-art delivery (Meet the Words art redo, docs/word-art-redo/README.md).
# Each delivered <id>.png is trimmed to its subject, centred on a 1024 x 1024 transparent square with a
# 21 px margin on the long side (so the picture fills its box), saved over the current word picture of that
# id (same file name, so saved progress keeps working), and its checksum, size and note are updated in
# whichever artwork manifest lists it. Then run: python -I tools/art/png-to-webp.py
# usage: python -I tools/art/install-word-art.py <delivery folder> [id ...]
import csv, hashlib, json, os, sys
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SIZE, MARGIN = 1024, 21
MANIFESTS = ['docs/asset-pack-131/artwork-manifest.json', 'docs/asset-pack-81/artwork-manifest.json']
NOTE = 'Macro-photo style (Codex word-art redo, {}); anatomy checked against the wave brief.'


def fit(src):
    im = Image.open(src).convert('RGBA')
    box = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    im = im.crop(box)
    scale = (SIZE - 2 * MARGIN) / max(im.size)
    im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.Resampling.LANCZOS)
    out = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    out.paste(im, ((SIZE - im.width) // 2, (SIZE - im.height) // 2))
    return out


def main():
    folder = os.path.abspath(sys.argv[1])
    only = set(sys.argv[2:])
    paths = {r['id']: r['current file'] for r in csv.DictReader(open(os.path.join(ROOT, 'docs/word-art-redo/asset-list.csv'), encoding='utf-8'))}
    manifests = {m: json.load(open(os.path.join(ROOT, m), encoding='utf8')) for m in MANIFESTS}
    label = os.path.relpath(folder, os.path.join(ROOT, 'docs/word-art-redo')).replace('\\', '/')
    done = []
    for f in sorted(os.listdir(folder)):
        wid = f[:-4].removesuffix('-v2')  # briefs name redo files <id>-v2.png
        if not f.endswith('.png') or wid == 'contact-sheet' or (only and wid not in only):
            continue
        rel = paths[wid]
        dest = os.path.join(ROOT, rel)
        fit(os.path.join(folder, f)).save(dest, optimize=True)
        data = open(dest, 'rb').read()
        hit = 0
        for m, entries in manifests.items():
            for e in entries:
                if e.get('path') == rel:
                    e['sha256'] = hashlib.sha256(data).hexdigest()
                    e['dimensions'] = [SIZE, SIZE]
                    e['bytes'] = len(data)
                    if 'qaNotes' in e:
                        e['qaNotes'] = NOTE.format(label)
                    hit += 1
        done.append((wid, rel, hit))
    for m, entries in manifests.items():
        raw = open(os.path.join(ROOT, m), encoding='utf8').read()
        indent = 1 if raw.startswith('[\n {') else 2
        with open(os.path.join(ROOT, m), 'w', encoding='utf8', newline='\n') as fh:
            json.dump(entries, fh, indent=indent, ensure_ascii=False)
            fh.write('\n')
    for wid, rel, hit in done:
        print(f'{wid:28} {rel}  manifest entries: {hit}')
    print(len(done), 'installed')


if __name__ == '__main__':
    main()
