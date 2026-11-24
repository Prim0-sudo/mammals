# Codex brief: Bat Night Hunt scenery (24 November 2026)

Read `docs/game-art/SCENERY-BRIEF.md` (section 3) first. The owner approved making the scenery, starting with Bat Night Hunt. This job makes **three backdrops and six objects**. The beetle and the roost are **not** part of this job.

**Work one picture at a time.** If a picture comes out wrong, re-render it whole.

Style references (style only): `docs/game-art/originals/bat-fly/grid.png` and `assets/topics/mammals/vocabulary/pond.png`.

## Backdrops (3) → `docs/game-art/originals/scenery/bat/<id>.png`

Make each one a **wide landscape PNG (1536 × 1024, the tool's landscape size)** with real transparent alpha. The scenery fills only the **bottom half or less**; everything above it is fully transparent (the game draws the night sky behind it). Claude cuts it to 2048 × 512 and joins the ends so it repeats, so:

- keep the left and right edges **similar in height and density**, with no big tree, gap or bright spot touching either edge;
- spread the detail evenly along the width, with no single centre feature;
- keep the horizon or top line low and gently uneven, never straight.

Prompt for each: the backdrop paragraph, then its subject line.

```text
Scientific educational game backdrop for Mammal Discovery Club, ages 4–7. One wide landscape image with real transparent alpha: the scenery fills only the bottom part of the frame and everything above it is fully transparent, with no sky, stars, gradient, glow or background colour. A side-on view that runs evenly across the whole width, with similar height and density at the left and right edges so it can repeat, no single centre feature, and nothing important touching either edge. Lifelike photographic night scene, soft cool moonlight from the upper left, deep blue-black and dark green tones, slightly softer and less saturated than a foreground animal. No animals, people, buildings, text, watermark or frame.
```

| id | Subject line |
|---|---|
| far-trees | A far English woodland tree line, oaks and ash in silhouette, blue-black, with a faint silver moonlit rim on the tops; the tree line rises to about 45% of the image height and is softly uneven. |
| near-trees | Nearer oak trunks and undergrowth along the bottom: three or four thick dark trunks spaced evenly across the width (none at the edges), with brambles, ferns and bracken at their feet, very dark with a little cool rim light; the trunks rise to the top of the scenery band (about 50% of the image height) and are cut off there in a soft fade to transparent, the undergrowth about 20%. |
| pond | A still woodland pond along the bottom edge: dark water filling the bottom 15% of the image with a soft silver moonlight shimmer, reeds and rushes growing in loose clumps along it to about 30% height, evenly spread. |

## Objects (6) → `docs/game-art/originals/scenery/bat/<id>.png`

1024 × 1024 square, real transparent alpha, one subject, centred, clear margin.

```text
Scientific educational game object for Mammal Discovery Club, ages 4–7. One isolated subject in a square image with real transparent alpha, centred with clear margin, silhouette legible at 120 px. Lifelike photographic cutout, soft cool moonlight from the upper left, natural colours, realistic texture. No outlines, text, watermark, background, ground or shadow.
```

| id | Subject line |
|---|---|
| moon | A full moon, lifelike with its real grey maria and craters, filling about 70% of the square, with a soft pale glow fading to transparent around it. |
| branch | A long, slim bare oak branch lying horizontally across the whole square, thick base at the left edge tapering to the right, with a few short side twigs, dark bark lit by moonlight from above. |
| branch-2 | A different long, slim bare oak branch, horizontal, base at the left, gently bent with a fork near the right end. |
| branch-3 | A different long, slim bare branch, horizontal, base at the left, almost straight with two or three short twigs pointing up. |
| moth | A pale buff night moth (a buff ermine or similar) seen from directly above with wings open flat, filling about 60% of the square. |
| moth-2 | A brown night moth (a large yellow underwing or similar, forewings brown) seen from directly above with wings open flat, filling about 60% of the square. |

## Checks before delivering

- On a dark navy background: no matte, halo, grey box or shadow; the backdrops' top is fully transparent.
- Backdrops: nothing big or bright at either edge; heights at the left and right edges roughly match.
- Branches: horizontal, base on the left, long and slim.

## Delivery

- `docs/game-art/originals/scenery/bat/` (9 PNGs, plus `notes.txt` and `prompts.md`).
- Write only inside that folder. Do not edit anything else and do not commit. If a re-run finds a picture already there that passes, keep it and carry on.
