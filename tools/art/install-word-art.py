# Install a Codex word-art delivery (Mammals studio-photo redo, docs/word-art-redo/codex-redo-brief.md).
# Each delivered picture is trimmed to its subject, centred on a 1024 x 1024 transparent square with a
# 21 px margin on the long side (so the picture fills its box), and saved over the current word picture of
# that id (same file name, so saved progress keeps working). Its checksum, size and note are updated in
# docs/supplied-artwork.json, which npm run check verifies. Then run: python -I tools/art/png-to-webp.py
# Delivered names may be <id>.png or <id>-<style>.png (the style pilot); pass --style studio for the latter.
# usage: python -I tools/art/install-word-art.py <delivery folder> [--style studio] [id ...]
import hashlib, json, os, sys
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SIZE, MARGIN = 1024, 21
MANIFEST = os.path.join(ROOT, 'docs', 'supplied-artwork.json')
NOTE = 'Studio-photo style (Codex word-art redo, {}); checked against docs/word-art-redo/codex-redo-brief.md.'


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
    args = sys.argv[1:]
    folder = os.path.abspath(args.pop(0))
    style = None
    if '--style' in args:
        i = args.index('--style')
        style = args[i + 1]
        del args[i:i + 2]
    only = set(args)
    manifest = json.load(open(MANIFEST, encoding='utf8'))
    by_id = {e['id']: e for e in manifest['entries']}
    label = os.path.relpath(folder, os.path.join(ROOT, 'docs/word-art-redo')).replace('\\', '/')
    done = []
    for f in sorted(os.listdir(folder)):
        if not f.endswith('.png') or f.startswith('contact-sheet'):
            continue
        stem = f[:-4]
        if style:
            if not stem.endswith('-' + style):
                continue
            stem = stem[:-len(style) - 1]
        wid = stem.removesuffix('-v2')
        if (only and wid not in only) or wid not in by_id:
            if wid not in by_id:
                print('skipped (no such word):', f)
            continue
        e = by_id[wid]
        dest = os.path.join(ROOT, e['path'])
        fit(os.path.join(folder, f)).save(dest, optimize=True)
        data = open(dest, 'rb').read()
        e.update(sha256=hashlib.sha256(data).hexdigest(), bytes=len(data), dimensions=[SIZE, SIZE], mode='RGBA',
                 iccProfile=False, qaNotes=NOTE.format(label))
        done.append(wid)
    with open(MANIFEST, 'w', encoding='utf8', newline='\n') as fh:
        json.dump(manifest, fh, indent=2, ensure_ascii=False)
        fh.write('\n')
    print(len(done), 'installed:', ' '.join(done))


if __name__ == '__main__':
    main()
