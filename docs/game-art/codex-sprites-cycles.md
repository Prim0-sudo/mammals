# Codex brief: six motion cycles (24 November 2026)

Read `docs/game-art/BRIEF.md` (section 3) and `docs/game-art/codex-sprites-pilot.md` first. The owner approved the rabbit-hop pilot (`docs/game-art/originals/rabbit-hop/grid.png`); use the **same method** for the six cycles below: **all poses of one cycle in one picture**, so the animal stays identical, and Claude cuts the picture into frames.

**Work one cycle (one picture) at a time.** If a pose comes out wrong, re-render the whole picture rather than patching one cell.

## Layout of each picture

One square PNG (the tool's size) with real transparent alpha, divided into equal cells with generous empty transparent space between them and no lines, boxes or labels. Poses read left to right, top row first.

- 4 poses: a 2 × 2 grid.
- 3 poses: a 2 × 2 grid with the bottom-right cell left empty.
- 2 poses: two cells side by side (left half, right half), each animal vertically centred.

Every pose: the **same individual animal**, identical in size, colours, markings and light (soft studio light from the upper left), **strict side view facing right**, the whole animal inside its cell with clear margin, nothing crossing into another cell. Lifelike studio photograph cutout of the real animal, natural fur or feather sheen and microtexture, neutral colour balance. No ground, water, sky, grass, shadow, text, watermark or background.

Ground animals (rabbit-run, fox-trot): feet that touch the ground sit at the same height in every cell. Swimming and flying animals (otter-swim, bat-fly, owl-fly, eagle-fly): the body is vertically centred in every cell.

Style references (style only): `docs/game-art/originals/rabbit-hop/grid.png` and the animal's own word picture in `assets/topics/mammals/vocabulary/` where one exists (`rabbit.png`, `otter.png`, `bat.png`, `owl.png`, `eagle.png`, `fox.png`).

## The six pictures

Each prompt is the layout paragraph below, then the subject line.

```text
Scientific educational sprite reference for Mammal Discovery Club, ages 4–7. One square image with real transparent alpha, divided into equal cells (LAYOUT) with generous empty transparent space between them and no lines, boxes or labels. Each cell shows the same individual animal, identical in size, colours, markings and lighting, in strict side view facing right, the whole animal visible with clear margin inside its cell. Lifelike studio photograph cutout of the real animal, natural sheen and microtexture, soft directional studio light from the upper left, neutral colour balance. No ground, water, sky, shadow, text, watermark or background.
```

| File | LAYOUT | Subject line |
|---|---|---|
| `rabbit-run/grid.png` | a 2 × 2 grid | The same European wild rabbit as the pilot, in a fast run (gallop) cycle along the ground. Top left: hind feet planted ahead of the front feet, body bunched. Top right: hind legs driving back, front legs reaching forward, body stretching. Bottom left: fully stretched, front feet about to touch down. Bottom right: front feet down, hind legs swinging forward under the body. Feet that touch the ground at one height. |
| `otter-swim/grid.png` | a 2 × 2 grid | A Eurasian otter swimming underwater, long and streamlined, legs tucked, in a body-wave cycle. Top left: straight and long, tail straight back. Top right: the body curving gently up through the middle, tail bending down, hind feet paddling. Bottom left: straight again, front paws tucked. Bottom right: the body curving gently down through the middle, tail bending up. A few tiny silver air bubbles on the fur only. Body vertically centred. |
| `bat-fly/grid.png` | a 2 × 2 grid | A common pipistrelle bat in flight, seen from the side, small brown furry body, dark thin wing membranes and big ears. Top left: wings raised high above the body. Top right: wings level, half way down. Bottom left: wings swept fully down below the body. Bottom right: wings level, half way up. Body vertically centred. |
| `owl-fly/grid.png` | a 2 × 2 grid, bottom-right cell empty | A barn owl in flight, seen from the side, white face and underparts, golden-buff and grey back, broad rounded wings. Top left: gliding with wings spread level. Top right: wings raised high. Bottom left: wings swept down. Body vertically centred. |
| `eagle-fly/grid.png` | two cells side by side | A golden eagle in flight, seen from the side, dark brown with golden nape. Left: soaring with long broad wings spread wide and level, fingered wingtips. Right: swooping down at a steep angle, wings half tucked against the body, talons forward. Body vertically centred. |
| `fox-trot/grid.png` | a 2 × 2 grid | A red fox trotting, orange-red coat, white chest and tail tip, black legs. Top left: near front leg and far hind leg forward, the other pair back. Top right: legs passing under the body. Bottom left: far front leg and near hind leg forward, the other pair back. Bottom right: legs passing under the body again. Bushy tail held level. Feet that touch the ground at one height. |

## Checks before delivering

- One animal in every cell: size within about 5%, the same colours and markings.
- Facing right, side view, nothing cut off or crossing a cell edge; the empty cell (owl) is fully transparent.
- On a dark background: no matte, halo, grey box or shadow.

## Delivery

- `docs/game-art/originals/<cycle>/grid.png` for each of the six, plus one `notes.txt` and one `prompts.md` in `docs/game-art/originals/cycles-notes/`.
- Write only inside those folders. Do not edit anything else and do not commit. If a re-run finds a grid already there that passes, keep it and carry on.
