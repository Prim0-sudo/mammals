# Codex brief: Mammals word pictures, full redo in studio photo (21 November 2026)

The owner picked **A, studio photo** from the three-style pilot on 21 November 2026. All 123 current word pictures are being replaced in that style. The eight pilot subjects are already done: `lion`, `whale`, `hedgehog`, `kangaroo`, `zebra`, `bat`, `paw` and `burrow` (`2026-11-21-style-pilot/*-studio.png`). That leaves **115 pictures in 4 batches**, listed in `redo-list.csv`. The exact prompt for every picture is in `redo-batch-1.md` to `redo-batch-4.md`.

| Batch | Pictures | What |
|---|---|---|
| 1 | 20 | Pets, farm and woodland mammals |
| 2 | 24 | Wild, Australian and water mammals |
| 3 | 32 | Body parts and young |
| 4 | 39 | Food, homes, movement, survival and habitats |

## The look

Match `2026-11-21-style-pilot/*-studio.png`. Each picture should look like a studio photograph of the real animal, cut out cleanly. Use real fur and skin texture, natural colour and sheen, soft directional studio light and a gentle depth of field.

## Rules for every picture

- **True anatomy** for the species, with the right numbers of legs, toes, ears, eyes, horns and tails.
- **The game reads it out.** The subject paragraph is what the game reads out, so the picture must show it.
- **Nothing extra.** No faces, smiles, eyelashes, human poses, people, props or text beyond what the paragraph names. A small rock, branch, ice slab or earth patch named in the paragraph stays small, under or beside the animal.
- **Calm animals only.** No snarling, no open jaws (except `tooth`, which stays gentle), no prey, no blood.
- **No drawn marks.** No arrows, circles, labels, speed lines, motion trails or panels. Show movement through the pose.
- **Focus words.** These are body parts on a whole animal or a head. The named part stays sharp and in full colour, and the rest is a little softer and paler.
- **Close-ups.** Any part of the animal outside the frame fades softly into transparency, never a hard straight cut.
- **Scene words.** These are small natural scenes cut out like a diorama piece, with soft, irregular edges and no frame, sky or horizon.
- **Look-alike pairs must be easy to tell apart.** The pairs are bear and polar bear, seal and sea lion, dolphin and porpoise, manatee and dugong, cheetah and leopard, monkey and chimpanzee, and hedgehog and echidna.
- **Transparent background.** Every pixel outside the subject has alpha zero, including the gaps between legs. There must be no matte, halo or drop shadow. Clean any faint matte with a follow-up edit.
- **Framing.** The subject is centred and about 85% of the square along its longest side, with nothing cut off. It must read at 120 px.

## Delivery

- PNG, 1024 × 1024, RGBA, transparent background, named `<id>.png` as in the list.
- Folders: `docs/word-art-redo/2026-11-21-redo/batch-1/` to `batch-4/`.
- With each batch, add three files: `notes.txt` (anything you could not match), `prompts.md` (your exact prompts and any follow-up edits) and `contact-sheet.png`.
- Write only inside the batch folder. Do not change any other file, and do not commit.
