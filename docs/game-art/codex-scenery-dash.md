# Codex brief: Burrow Dash scenery (24 November 2026)

Read `docs/game-art/SCENERY-BRIEF.md` (section 1) first. The owner approved the Bat Night Hunt scenery; this job makes **three backdrops and six objects** for Burrow Dash, a sunny English meadow.

**Work one picture at a time.** If a picture comes out wrong, re-render it whole.

Style references (style only): `docs/game-art/originals/rabbit-hop/grid.png` and `assets/topics/mammals/vocabulary/warren.png`.

## Backdrops (3) → `docs/game-art/originals/scenery/dash/<id>.png`

Make each one a **wide landscape PNG (1536 × 1024, the tool's landscape size)** with real transparent alpha. The scenery fills only the **bottom part**; everything above it is fully transparent (the game draws the sky). Claude cuts it to 2048 × 512 and joins the ends so it repeats, so:

- keep the left and right edges **similar in height and density**, with no big tree, gap or bright spot touching either edge;
- spread the detail evenly along the width, with no single centre feature;
- keep the top line low and gently uneven, never straight.

Prompt for each: the backdrop paragraph, then its subject line.

```text
Scientific educational game backdrop for Mammal Discovery Club, ages 4–7. One wide landscape image with real transparent alpha: the scenery fills only the bottom part of the frame and everything above it is fully transparent, with no sky, clouds, sun, gradient or background colour. A side-on view that runs evenly across the whole width, with similar height and density at the left and right edges so it can repeat, no single centre feature, and nothing important touching either edge. Lifelike photographic summer daytime scene, soft warm sunlight from the upper left, natural greens, slightly softer and less saturated than a foreground animal. No animals, people, buildings, fences, roads, text, watermark or frame.
```

| id | Subject line |
|---|---|
| far-hills | Rolling green English hills in the far distance, soft and hazy, with a few small far hedgerows and rounded trees along them; the hill line rises to about 40% of the image height and is gently uneven. |
| hedge | A nearer hawthorn hedgerow along a meadow edge, with long grass, cow parsley and a few red campion and buttercups at its foot; the hedge rises to about 35% of the image height with a soft uneven top, evenly dense along the whole width. |
| ground | The meadow floor seen side on, like a cut-away: a band of short green grass along the top of the scenery (with a few blades standing up), then brown earth below it with small stones and fine roots, filling the bottom 30% of the image; the grass top line is almost level, with only small blades breaking it. |

## Objects (6) → `docs/game-art/originals/scenery/dash/<id>.png`

1024 × 1024 square, real transparent alpha, one subject, centred, clear margin.

```text
Scientific educational game object for Mammal Discovery Club, ages 4–7. One isolated subject in a square image with real transparent alpha, centred with clear margin, silhouette legible at 120 px. Lifelike photographic cutout, soft warm sunlight from the upper left, natural colours, realistic texture. No outlines, text, watermark, background or cast shadow.
```

| id | Subject line |
|---|---|
| stone | A rounded grey field stone with a little lichen, seen from the side, sitting flat on its base, a few blades of grass at its foot; wider than tall. |
| stone-2 | A different, taller and more angular grey field stone with moss on top, seen from the side, sitting flat on its base, a few blades of grass at its foot. |
| log | A short fallen birch log lying across the view, seen side on, with white papery bark, a cut end showing rings at one side, a little moss, sitting flat on its base; about three times as wide as tall. |
| burrow | A rabbit-hole entrance seen side on: a low mound of grassy earth with a round dark hole opening towards the viewer and a little fan of dug soil in front, sitting flat on its base. Empty, no animal. |
| cloud | A soft white fair-weather cumulus cloud with a flat base and puffy top, lit from the upper left, wider than tall, soft natural edges. |
| cloud-2 | A different, smaller and longer cumulus cloud, wider than tall, soft natural edges. |

## Checks before delivering

- On a dark and on a light background: no matte, halo, grey box or shadow; the backdrops' top is fully transparent.
- Backdrops: nothing big or bright at either edge; heights at the left and right edges roughly match.
- Ground objects (stones, log, burrow) sit flat on their base; the burrow is empty.

## Delivery

- `docs/game-art/originals/scenery/dash/` (9 PNGs, plus `notes.txt` and `prompts.md`).
- Write only inside that folder. Do not edit anything else and do not commit. If a re-run finds a picture already there that passes, keep it and carry on.
