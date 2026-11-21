# Add rows for new words of the approved vocabulary plan (docs/VOCABULARY-PLAN.md, section 6) to
# src/topics/mammals-words.js, once their studio-photo pictures are installed. The definition and
# sentence come from the plan; the picture brief (the alt text) comes from a JSON file of
# {id: alt} written after checking the delivered picture, since the art may differ from the plan.
# usage: python -I tools/art/add-word-rows.py <alts.json> <group key, e.g. neighbours>
import json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PLAN = os.path.join(ROOT, 'docs', 'VOCABULARY-PLAN.md')
WORDS = os.path.join(ROOT, 'src', 'topics', 'mammals-words.js')


def plan_rows():
    text = open(PLAN, encoding='utf8').read()
    sec = text[text.index('## 6. The 145 new words'):text.index('## 7. Sort It')]
    rows = {}
    for line in sec.splitlines():
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if len(cells) != 7 or cells[0] in ('Word', '---') or set(cells[0]) <= set('-'):
            continue
        name, definition, sentence = cells[0], cells[1], cells[2]
        rows[name.replace(' ', '-')] = (name, definition, sentence)
    return rows


def main():
    alts = json.load(open(sys.argv[1], encoding='utf8'))
    key = sys.argv[2]
    plan = plan_rows()
    assert len(plan) == 145, len(plan)
    s = open(WORDS, encoding='utf8', newline='').read()
    nl = '\r\n' if '\r\n' in s else '\n'
    have = set(re.findall(r'^[`\s]*([a-z][a-z -]*)\|', s.replace('\r\n', '\n').replace(' mammals: `', '\n'), re.M))
    lines = []
    for wid, alt in alts.items():
        name, definition, sentence = plan[wid]
        if name in have:
            print('already there:', wid)
            continue
        for part in (definition, alt, sentence):
            assert '|' not in part and '`' not in part, wid
        lines.append(f'{name}|{definition}|{alt}|{sentence}')
    if not lines:
        print('nothing to add')
        return
    block = f' {key}: `' + nl.join(lines) + '`'
    marker = re.search(r'`\r?\n\};', s)
    assert marker, 'end of groups not found'
    s = s[:marker.start() + 1] + ',' + nl + block + s[marker.start() + 1:]
    open(WORDS, 'w', encoding='utf8', newline='').write(s)
    print('added', len(lines), 'rows under', key)


if __name__ == '__main__':
    main()
