# Codex brief: realistic word pictures, three-style pilot (21 November 2026)

Mammal Discovery Club is a science app about mammals for children aged about 4 to 7. The owner wants its word pictures to look real, as they do in its sister app Little Bug Club (insects). The 123 current pictures are watercolour paintings (`reference/mammals-painted/`), and they are all being replaced. The landing page, menu tiles and game art are not part of this brief.

This pilot makes **8 subjects in 3 realistic styles (24 pictures)** so the owner can pick one style for the whole library of about 268 words. The three styles must look **clearly different** from each other side by side; in the insects pilot the two levels came out nearly the same, so push each one to its own look.

## The three styles

- **A, Studio photo (`-studio`).** This is the Little Bug Club house style, carried over to mammals. It should look like a studio photograph of the real animal, cut out cleanly. Show natural fur sheen and texture, soft directional studio light, a neutral colour balance, and a slight optical depth of field on fine details such as whiskers and fur tips. Match the look of `reference/insects-macro/` (the owner called these perfect).
- **B, Wildlife photo (`-wildlife`).** It should look like a nature-documentary photograph taken outdoors with a long lens, then cut out. Use warm natural daylight from one side, real outdoor colour and contrast, and a lively but calm pose. It is still one isolated subject with no background.
- **C, Field-guide plate (`-fieldguide`).** This is a photo-real natural-history illustration, like the best field-guide or museum plates. Give it true anatomy and real colours, with even, shadow-light lighting and crisp edges. Detail is slightly simplified, so it reads very clearly at small sizes. There are no ink outlines, and at a glance it could pass for a photograph.

## Prompt for each picture

Each prompt has three paragraphs:

1. The shared opening paragraph below, word for word.
2. The style line for A, B or C, below.
3. The subject paragraph.

**Shared opening paragraph**

```text
Scientific educational word picture for Mammal Discovery Club, ages 4–7. One isolated subject in a 1024 × 1024 square with real transparent alpha. Center the complete intended subject, roughly 85% of the square along its longest dimension, with clear margin and a silhouette legible at 120 px. True species anatomy, faithful natural colors, realistic fur and skin texture, no ink outlines, anthropomorphism, text, watermark, background or ground shadow.
```

**Style lines**

- A: `Lifelike studio photograph cutout of the real animal, natural fur sheen and microtexture, soft directional studio light, neutral colour balance, subtle optical depth of field on whiskers and fur tips.`
- B: `Lifelike wildlife documentary photograph cutout, taken outdoors with a long lens, warm natural side daylight, real outdoor colour and contrast, calm natural pose, isolated with no scenery.`
- C: `Photo-real natural-history field-guide plate, true colours, even soft shadowless lighting, crisp clean edges, detail slightly simplified so it reads clearly when small, no outlines.`

## Subjects (they cover the hard cases)

1. `lion`: an adult male African lion with a full mane, whole animal, standing in side or three-quarter view, mouth closed, calm.
2. `whale`: a humpback whale, whole animal, side view, swimming level. Show the long pectoral flippers, the tail flukes and the throat grooves. Just the whale: no inset, circle, water or splash.
3. `hedgehog`: a European hedgehog, whole animal, walking, three-quarter view. Show the spines, its face and all four small feet. It must look clearly different from an echidna.
4. `kangaroo`: an adult red or eastern grey kangaroo standing upright on its big back feet with its tail on the ground, side view. **No joey showing**, because joey is its own word.
5. `zebra`: a plains zebra, whole animal, standing, side view. Show the true stripe pattern, which runs down onto the legs, and the upright mane.
6. `bat`: a fruit bat (flying fox) in flight, seen from below, wings fully spread. Show the finger bones in the wings and the thin wing skin.
7. `paw`: a close-up of one dog paw seen from below. Show the four toe pads, the large central pad and short claws. Just the paw and a little leg fur, cut off softly at the wrist.
8. `burrow`: a scene word. Show a rabbit at the mouth of its burrow, a round hole in a small mound of earth and grass. The earth patch is the subject here, so it may fill the lower part of the square. Keep it a cut-out on transparent ground with no sky.

## Rules for every picture

- The real animal: the right number of legs, toes, ears and eyes, and true proportions for the species.
- No faces, smiles or eyelashes added to the animal, no human poses, props or text.
- Calm animals only: no snarling, open jaws, teeth, prey or blood.
- Real transparent background. Every pixel outside the subject (and the burrow's earth patch) has alpha zero, including gaps between legs and around the fur. No matte, halo, glow or drop shadow. If a result has a faint matte, clean it with a follow-up edit.
- Nothing cut off at the edges except the paw at the wrist.
- Each picture must still read at 120 px.

## Delivery

- PNG, 1024 × 1024, RGBA, transparent background.
- Names: `<id>-studio.png`, `<id>-wildlife.png` and `<id>-fieldguide.png`, for example `lion-wildlife.png`.
- Folder: `docs/word-art-redo/2026-11-21-style-pilot/`.
- In the same folder, add three more files:
  - `notes.txt`: anything you could not match;
  - `prompts.md`: your exact prompts and any follow-up edits;
  - `contact-sheet.png`: the 24 pictures in a grid, one row per subject and one column per style.

The owner picks one style from this pilot. The full library follows in waves, with the eight pilot pictures in the chosen style included.
