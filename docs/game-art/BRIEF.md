# Topic Games art: brief (24 November 2026)

The owner played the six Topic Games and approved them, with three art changes. This brief covers those changes. The teaching scenes (docs/teaching-scenes/BRIEF.md) come after this.

**Style.** Use the realistic look of the Mammals word pictures in `assets/topics/mammals/vocabulary/` (1024 × 1024 RGBA WebP with a transparent background, the subject centred and filling most of the square). New pictures must sit beside them without standing out. Use no text, labels or frames.

**How to work.**

- Run Codex one job at a time. The codex.exe is under %LOCALAPPDATA%\OpenAI\Codex\bin.
- Keep the originals in `docs/game-art/originals/`.
- Send contact sheets to the owner's Drive folder (`G:\My Drive\1.   Coding Hardware Software\Mammals rebuild 2026-11-21\game-art\`) for approval before anything goes into the game.
- Main Mammals wires the pictures in after approval. Don't edit game code.

## 1. Empty homes for Home Before Dark (12 pictures)

The game's homes are the word pictures now, and they show the animal inside. The child's job is to pick the home, so the homes must be **empty**: no animal, no face at the entrance, no tracks or droppings that give the answer away. The entrance should be clear and inviting, as if waiting for its owner.

| File | Home |
|---|---|
| warren.webp | A rabbit warren: two or three burrow holes in a grassy bank |
| sett.webp | A badger sett: a large hole under tree roots, with a spoil heap of earth |
| drey.webp | A squirrel drey: a ball of twigs and leaves in a tree fork |
| holt.webp | An otter holt: a hole among riverbank tree roots at the water's edge |
| lodge.webp | A beaver lodge: a dome of sticks and mud in a pond |
| den.webp | A fox den: an earth hole in a woodland bank |
| roost.webp | A bat roost: a wooden bat box on a tree trunk |
| nest.webp | A harvest mouse nest: a woven ball of grass on stems |
| tree-hollow.webp | A tree hollow: a round hole in an old tree trunk |
| stable.webp | A stable: a wooden stable door, top half open, with straw inside |
| kennel.webp | A dog kennel: a wooden kennel with an empty doorway |
| hutch.webp | A hutch: a wooden hutch with a wire front and straw |

Delivery: `assets/topics/mammals/games/homes/<file>`. These are game pictures only; the word pictures keep their animals, because there they teach whose home it is.

## 2. Lone babies (11 word pictures, 1 game picture)

The baby word pictures show the mother too, which gives the Nursery Round-up answer away and makes it hard to tell which animal the word means. Make each baby **alone**, with no adult and no part of one in the frame.

**Replaces word pictures** in `assets/topics/mammals/vocabulary/`:
- joey: a joey on its own, sitting in the grass, not in a pouch
- calf
- lamb
- foal
- kid (a young goat)
- piglet
- kitten
- puppy
- pup (a seal pup, white or grey, on rocks or sand)
- cub (a bear cub)
- fawn (spotted)

**New game picture:** `assets/topics/mammals/games/hind.webp`, a red deer hind (adult female, no antlers). The deer word picture is a stag, and a mother with antlers teaches the wrong thing, so Nursery needs her before deer and fawn can come back.

When the babies are installed, the picture descriptions in src/topics/mammals-words.js (the third column, for example "A white lamb standing beside its woolly mother sheep.") need rewriting to match. Main Mammals does that.

## 3. Motion frames for the arcade games

The arcade animals slide about as single still photos. Each needs a short cycle of poses.

- **Format:** every frame is the same animal, the same size, the same light and the same side view, facing **right**. Use a transparent background, with the frames in one sprite sheet (one row, equal cells), plus each frame saved on its own.
- **Pilot first:** do the rabbit hop alone. Check that the frames are one animal and line up, then show the owner before doing the rest.
- **Hand the first frame of each cycle in with the sheet**, so the game can show it when the animal is still.

| Sheet | Frames | Game |
|---|---|---|
| rabbit-hop | 4: crouch, push off, stretched in the air, landing | Burrow Dash |
| rabbit-run | 4: a gallop cycle along the ground | Burrow Dash |
| otter-swim | 4: an underwater swim cycle (body wave, tail and feet) | Otter Dive |
| bat-fly | 4: wings up, half, down, half (seen from the side, pipistrelle-like) | Bat Night Hunt |
| owl-fly | 3: glide, wings up, wings down (barn owl) | Bat Night Hunt |
| eagle-fly | 2: soaring with wings spread, swooping down with wings tucked | Burrow Dash |
| fox-trot | 4: a trot cycle | Burrow Dash |

Delivery: `assets/topics/mammals/games/sprites/<sheet>.webp` and `<sheet>-1.webp` … `<sheet>-N.webp`. Main Mammals wires the frames into the canvas games.

## Order

1. The rabbit hop pilot, for the owner.
2. The empty homes and the lone babies (these unblock the education games).
3. The rest of the motion frames.
4. The teaching scenes.
