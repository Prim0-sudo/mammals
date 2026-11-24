# Arcade games scenery: brief (24 November 2026)

The owner played the three arcade games with the new motion frames. The animals are real, but the world around them is still drawn in code: flat hills, grey blobs for stones, brown lines for branches. The owner wants Codex art for the rest. This comes **before** the teaching scenes.

**Style.** Match the animal sprites in `assets/topics/mammals/games/sprites/`: lifelike, natural light, soft upper-left key light, no outlines, no text, labels, frames or drop shadows. Backgrounds can be a little softer and less saturated than the animals, so the animals stand out.

**Two kinds of picture.**

- **Strips** are 2048 × 512 RGBA WebP files with a transparent sky (or a transparent top). They must **tile seamlessly left to right**: the right edge continues straight into the left edge. The game scrolls them at different speeds for depth. Check each one by placing two copies side by side; there should be no visible join.
- **Objects** are 512 × 512 RGBA WebP files with a transparent background. Each one is a single thing, centred, with clear margin and a strict side view unless the brief says otherwise. If it rests on the ground, its base sits on the line y = 481, the same ground line as the sprites.

**How to work.** As before:

- Run Codex one job at a time.
- Keep the originals in `docs/game-art/originals/scenery/`.
- Send contact sheets to the owner's Drive folder (`game-art\`) for approval. For strips, show two copies side by side.
- Main Mammals wires everything in after approval.

Delivery: `assets/topics/mammals/games/scenery/<game>/<file>.webp`.

## 1. Burrow Dash: a sunny meadow (`dash/`)

The sky colour, sun and dusk tint stay in code.

| File | Kind | What |
|---|---|---|
| far-hills.webp | strip | Rolling green English hills in the distance, a few far hedgerows and trees. Transparent above the hill line, which sits in the lower half. |
| hedge.webp | strip | A nearer hedgerow and meadow edge: hawthorn, a few wild flowers, long grass. Transparent above. |
| ground.webp | strip | The meadow floor seen side on: a short grass edge along the top (about 40 px), then a cut-away of brown soil with small stones and roots. |
| stone.webp, stone-2.webp | object | A rounded grey field stone, about knee height to a rabbit. |
| log.webp | object | A short fallen birch or oak log lying across the path, seen side on, cut end towards the viewer. |
| burrow.webp | object | A rabbit-hole entrance in the ground, seen side on: a dark hole with a little mound of dug earth. Empty. |
| cloud.webp, cloud-2.webp | object | A soft white fair-weather cumulus cloud (these may be wider than tall within the square). |

## 2. Otter Dive: a clear river (`otter/`)

The water colour, light rays and surface ripple stay in code.

| File | Kind | What |
|---|---|---|
| far-bank.webp | strip | The far riverbank: alders, willows and grass. Transparent above the trees. |
| near-bank.webp | strip | The near bank at the waterline: reeds, rushes and grass. Transparent above. |
| riverbed.webp | strip | The river floor seen side on and under water: gravel, pebbles, a few larger stones and short water weed. Transparent above the bed. |
| weed.webp, weed-2.webp | object | A tall strand of water crowfoot or pondweed rising from the bed. |
| snag.webp | object | A sunken branch standing up from the bed at a slant, waterlogged, with a little algae. |
| can.webp, bottle.webp, bag.webp | object | Litter in the river: a crushed drinks can, a plastic bottle, a plastic bag. |
| float.webp | object | A small red and white fishing float. |

**Food (owner asked for more kinds).** Fish stay the main catch, but real otters also take crayfish, eels and frogs, which teaches more. All side view, facing right, under water:

| File | What |
|---|---|
| trout.webp | A brown trout. |
| eel.webp | A European eel, gently curved. |
| crayfish.webp | A crayfish walking on the bed, claws forward. |
| frog-swim.webp | A common frog swimming, legs stretched behind. |

## 3. Bat Night Hunt: a moonlit wood (`bat/`)

The owner finds the game a bit plain. The sky gradient and stars stay in code.

| File | Kind | What |
|---|---|---|
| far-trees.webp | strip | A far tree line against the night sky, blue-black, with a faint moonlit rim. Transparent above. |
| near-trees.webp | strip | Nearer oak trunks and undergrowth at the bottom, very dark, with a little rim light. Transparent above. |
| pond.webp | strip | A still woodland pond along the bottom edge, with moonlight on the water and reeds. Transparent above. |
| moon.webp | object | A full moon, lifelike, soft glow included. |
| branch.webp, branch-2.webp, branch-3.webp | object | A bare oak branch with a few twigs, lying **horizontally** across the square, base on the left. The game turns and stretches it to fit each branch, so keep it long and slim. |
| moth.webp, moth-2.webp | object | A night moth seen from above, wings open: a pale buff moth and a brown one. |
| beetle.webp | object | A cockchafer (may bug) in flight, from above, wing cases open. |
| roost.webp | object | An old oak with a hollow, where the bat flies home at dawn. |

The beetle (a rarer catch worth more points) and the roost (the bat flies home at dawn, as the rabbit runs home to its warren) are new ideas that wait for the owner's OK. Make them last.

## Order

1. Bat Night Hunt (the owner called it plain).
2. Burrow Dash.
3. Otter Dive (scenery, then the four foods).
4. Then the teaching scenes (docs/teaching-scenes/BRIEF.md).
