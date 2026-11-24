# Codex brief: empty homes and lone babies (24 November 2026)

Read `docs/game-art/BRIEF.md` first (sections 1 and 2). The owner approved the Topic Games and the rabbit-hop pilot; this job makes the pictures that unblock Home Before Dark and Nursery Round-up.

**Look.** Match the realistic Mammals word pictures in `assets/topics/mammals/vocabulary/` (attach two per picture as style-only references: `warren.png` and `drey.png` for the homes; `rabbit.png` and `hare.png` for the babies and the hind, not the current baby pictures, which show a mother). The homes are small "island" cut-outs, like the batch 9 habitat pictures: the home and a little of its ground, ending in a soft natural edge. The babies are whole-animal studio cut-outs.

**Work one picture at a time.** Each prompt is three paragraphs: the opening paragraph, the look line, then the subject line from the tables below.

**Opening paragraph (all 24):**

```text
Scientific educational word picture for Mammal Discovery Club, ages 4–7. One isolated subject in a 1024 × 1024 square with real transparent alpha. Center the complete intended subject, roughly 85% of the square along its longest dimension, with clear margin and a silhouette legible at 120 px. True natural forms, faithful natural colors, realistic texture, no ink outlines, anthropomorphism, text, watermark, background or ground shadow.
```

**Look line, homes:**

```text
Lifelike studio photograph cutout of a small natural diorama, soft directional studio light, neutral colour balance, subtle optical depth of field; the ground ends in a soft, natural, irregular edge.
```

**Look line, babies and hind:**

```text
Lifelike studio photograph cutout of the real animal, natural fur sheen and microtexture, soft directional studio light, neutral colour balance, subtle optical depth of field on whiskers and fur tips.
```

## 1. Empty homes (12) → `docs/game-art/originals/homes/<id>.png`

Every home must be **empty**: no animal, no part of one, no eyes or face in the dark, no tracks, droppings, fur or feathers. The entrance is clear, dark and inviting, as if waiting for its owner.

| id | Subject line |
|---|---|
| warren | A rabbit warren: two or three round burrow holes in a low grassy earth bank, with a little loose soil at each entrance. Empty, no animal. |
| sett | A badger sett: one large, wide D-shaped hole dug under thick tree roots, with a spoil heap of fresh earth in front. Empty, no animal. |
| drey | A squirrel drey: a round ball of twigs and dry leaves wedged in the fork of a short section of tree branch. Empty, no animal. |
| holt | An otter holt: a dark hole among tangled riverbank tree roots right at the water's edge, with a strip of still water in front. Empty, no animal. |
| lodge | A beaver lodge: a rounded dome of piled sticks and mud rising from a small patch of pond water, with reeds at one side. Empty, no animal. |
| den | A fox den: a single oval earth hole in a woodland bank, with dead leaves and a little dug-out soil around it. Empty, no animal. |
| roost | A bat roost: a wooden bat box with a narrow slot at the bottom, fixed to a short section of tree trunk. Empty, no bats. |
| nest | A harvest mouse nest: a small round ball woven from living green grass leaves, held up on tall grass and wheat stems. Empty, no mouse. |
| tree-hollow | A tree hollow: a round dark hole in a short section of old, mossy tree trunk. Empty, no animal. |
| stable | A stable: a wooden stable front with a split door, the top half open onto a dim inside with golden straw on the floor. Empty, no horse. |
| kennel | A dog kennel: a wooden kennel with a pitched roof and an empty arched doorway, a little straw inside. Empty, no dog. |
| hutch | A rabbit hutch: a wooden hutch on short legs with a wire-mesh front and fresh straw inside. Empty, no rabbit. |

## 2. Lone babies (11) → `docs/game-art/babies/<id>.png`, and the hind → `docs/game-art/originals/hind.png`

Each baby is **alone**: no adult, and no part of one (no legs, no flank, no shadow of one) anywhere in the frame. Young proportions: big head and eyes, short body, long legs where the species has them.

| id | Subject line |
|---|---|
| joey | A young red kangaroo joey sitting alone on a small patch of grass, out of the pouch, big ears up. |
| calf | A young dairy calf, black and white, standing alone on a small patch of grass. |
| lamb | A young white lamb standing alone on a small patch of grass. |
| foal | A young chestnut foal with long thin legs standing alone on a small patch of grass. |
| kid | A young goat kid, brown and white with small ear flaps, standing alone on a small patch of grass. |
| piglet | A young pink piglet standing alone on a little straw. |
| kitten | A young tabby kitten sitting alone, looking at the viewer. |
| puppy | A young golden retriever puppy sitting alone, looking at the viewer. |
| pup | A white fluffy grey seal pup lying alone on a small patch of sand and pebbles. |
| cub | A young brown bear cub standing alone on all fours on a small patch of grass. |
| fawn | A spotted roe deer fawn with clear white spots standing alone in a small patch of long grass. |
| hind | An adult female red deer (hind) standing in side view, facing right, with no antlers, reddish-brown coat and pale rump. |

## Checks before delivering

- On a dark background: no matte, halo, grey box or ground shadow.
- Homes: zoom into every entrance and confirm nothing is inside.
- Babies: confirm there is no adult or part of one; the hind has no antlers.
- 1024 × 1024 RGBA PNG, transparent outside the subject.

## Delivery

- Homes: `docs/game-art/originals/homes/` (12 PNGs, plus `notes.txt`, `prompts.md`, `contact-sheet.png`).
- Babies: `docs/game-art/babies/` (11 PNGs, plus `notes.txt`, `prompts.md`, `contact-sheet.png`).
- Hind: `docs/game-art/originals/hind.png`.
- Write only inside those places. Do not edit anything else and do not commit. If a re-run finds pictures already there, keep the ones that pass and carry on.
