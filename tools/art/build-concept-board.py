# usage: python -I tools/art/build-concept-board.py .
# Builds docs/topic-games-concepts/concept-board.html, one file with everything inside, from board.src.html:
# IMG(word) becomes a small WebP of that word picture, and GSAP_INLINE becomes GSAP and MotionPathPlugin.
import base64, io, re, sys
from pathlib import Path
from PIL import Image

R = Path(sys.argv[1])
D = R / 'docs/topic-games-concepts'
src = (D / 'board.src.html').read_text(encoding='utf-8')
cache = {}

def img(m):
    w = m.group(1)
    if w not in cache:
        im = Image.open(R / f'assets/topics/mammals/vocabulary/{w}.webp').convert('RGBA')
        im.thumbnail((256, 256))
        buf = io.BytesIO()
        im.save(buf, 'WEBP', quality=80, method=6)
        cache[w] = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
    return cache[w]

out = re.sub(r'IMG\(([a-z-]+)\)', img, src)
js = (R / 'src/vendor/gsap.min.js').read_text(encoding='utf-8') + '\n' + (R / 'src/vendor/MotionPathPlugin.min.js').read_text(encoding='utf-8')
out = out.replace('GSAP_INLINE', js.replace('</script', '<\\/script'))
(D / 'concept-board.html').write_text(out, encoding='utf-8')
print(len(cache), 'pictures,', round(len(out) / 1024), 'KB')
