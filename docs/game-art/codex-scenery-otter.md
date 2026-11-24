# Codex brief: Otter Dive scenery and foods (24 November 2026)

Read `docs/game-art/SCENERY-BRIEF.md` (section 2) first. The owner approved the Bat Night Hunt and Burrow Dash scenery. This job makes **three backdrops, seven objects and four foods** for Otter Dive, a clear English river.

**Work one picture at a time.** If a picture comes out wrong, re-render it whole.

Style references (style only): `docs/game-art/originals/otter-swim/grid.png` and `assets/topics/mammals/vocabulary/holt.png` (or `otter.png`).

## Backdrops (3) → `docs/game-art/originals/scenery/otter/<id>.png`

Make each one a **wide landscape PNG (1536 × 1024, the tool's landscape size)** with real transparent alpha. The scenery fills only the **bottom part**; everything above it is fully transparent (the game draws the sky, the water colour and the light rays). Claude cuts it to 2048 × 512 and joins the ends so it repeats, so:

- keep the left and right edges **similar in height and density**, with no big tree, gap or bright spot touching either edge;
- spread the detail evenly along the width, with no single centre feature;
- keep the top line low and gently uneven, never straight.

Prompt for each: the backdrop paragraph, then its subject line.

```text
Scientific educational game backdrop for Mammal Discovery Club, ages 4–7. One wide landscape image with real transparent alpha: the scenery fills only the bottom part of the frame and everything above it is fully transparent, with no sky, water colour, gradient or background colour. A side-on view that runs evenly across the whole width, with similar height and density at the left and right edges so it can repeat, no single centre feature, and nothing important touching either edge. Lifelike photographic scene, soft daylight from the upper left, natural colours, slightly softer and less saturated than a foreground animal. No animals, people, buildings, boats, text, watermark or frame.
```

| id | Subject line |
|---|---|
| far-bank | The far bank of an English river seen across the water: alders and willows with grass along their foot, ending at the bottom in a straight, level bank edge (where the water starts); the trees rise to about 40% of the image height with a soft uneven top. |
| near-bank | The near riverbank at the waterline: common reeds, bulrushes and rushes in loose clumps with grass between them, their bases ending at a level waterline along the bottom; the reeds rise to about 35% of the image height, evenly spread. |
| riverbed | The bed of a clear river seen side on from under water: a band of gravel and rounded pebbles with a few larger mossy stones and short tufts of water weed, filling the bottom 25% of the image, soft cool underwater light, a gently uneven top. |

## Objects (7) → `docs/game-art/originals/scenery/otter/<id>.png`

1024 × 1024 square, real transparent alpha, one subject, centred, clear margin. Everything is under water except the float.

```text
Scientific educational game object for Mammal Discovery Club, ages 4–7. One isolated subject in a square image with real transparent alpha, centred with clear margin, silhouette legible at 120 px. Lifelike photographic cutout, soft daylight from the upper left, natural colours, realistic texture. No outlines, text, watermark, background, water colour or cast shadow.
```

| id | Subject line |
|---|---|
| weed | A tall strand of water crowfoot rising straight up from a small root clump at the bottom, fine feathery green leaves with a few small white flowers near the top; taller than wide, base at the bottom. |
| weed-2 | A different tall strand of pondweed (curled pondweed) rising from a small root clump at the bottom, wavy translucent green leaves; taller than wide, base at the bottom. |
| snag | A sunken waterlogged branch standing up at a slant from the bottom left towards the upper right, dark wet bark with a little green algae, two short broken side branches; base at the bottom. |
| can | A crushed aluminium drinks can lying on its side, plain unbranded silver and red, dented. |
| bottle | A plain clear plastic drinks bottle lying on its side, unbranded, slightly crumpled, a blue cap. |
| bag | A torn white plastic carrier bag drifting under water, loosely spread, unbranded. |
| float | A small red and white fishing float (a slim stick float with a red tip), upright. |

## Foods (4) → `docs/game-art/originals/scenery/otter/<id>.png`

Same object paragraph, then the subject line. All **strict side view, facing right**, the whole animal, under water.

| id | Subject line |
|---|---|
| trout | A brown trout, golden-brown with dark and red spots, swimming, fins spread, facing right. |
| eel | A European eel, long and slim, olive-brown above and yellowish below, the body in one gentle S curve, facing right. |
| crayfish | A white-clawed crayfish walking, side view facing right, claws held forward, legs below, tail straight behind. |
| frog-swim | A common frog swimming under water, side view facing right, front legs tucked, hind legs stretched straight out behind, olive-brown with dark blotches. |

## Checks before delivering

- On a dark and on a light background: no matte, halo, grey box or shadow; the backdrops' top is fully transparent.
- Backdrops: nothing big or bright at either edge; heights at the left and right edges roughly match.
- Litter has no brand names or text. Foods face right, whole animal.

## Delivery

- `docs/game-art/originals/scenery/otter/` (14 PNGs, plus `notes.txt` and `prompts.md`).
- Write only inside that folder. Do not edit anything else and do not commit. If a re-run finds a picture already there that passes, keep it and carry on.
