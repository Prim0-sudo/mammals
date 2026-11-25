# Codex brief: Mammals menu thumbnails (25 November 2026)

The owner asked for every thumbnail the app still lacks. Today these slots borrow a vocabulary photo, reuse another tile, or point at a missing file. This job makes **15 pictures**.

**Work one picture at a time.** If a picture comes out wrong, re-render the whole picture.

## Style

Match the Mammals menu tiles (style only, never copy their subjects):

- `assets/topics/mammals/menu/learn.png`
- `assets/topics/mammals/menu/sort.png`
- `assets/topics/mammals/menu/story.png`

They are painted storybook objects: warm watercolour and coloured-pencil texture, soft natural light from the upper left, rich but gentle colours, and lifelike British wildlife with true markings.

Every picture is a 1024 × 1024 square with real transparent alpha. It shows one small group, centred, with a clear margin, and must read at 120 px. Prompt: the style paragraph, then the subject line.

```text
Painted storybook menu illustration for Mammal Discovery Club, a learning game for ages 4–7. One small isolated group in a square image with real transparent alpha, centred with clear margin, legible at 120 px. Warm watercolour and coloured-pencil texture, soft natural light from the upper left, gentle natural colours, lifelike animals with true markings and friendly but not cartoon faces. No outlines around the group, no text, letters, numbers or watermark, no background, frame or cast shadow beyond a soft contact shadow.
```

## Pictures

### A. Mammal Games cards (`games/`): the game chooser and the Home banner

| id | Subject line |
|---|---|
| card-checkup | A European hedgehog sitting on a small wooden vet's examination mat, beside a coiled stethoscope, a clipboard showing three empty tick boxes (no writing) and a little magnifying glass. |
| card-homes | A grassy bank at dusk with a rabbit-warren entrance, a winding earth path leading to it with a small wooden path-switch lever beside the path, a wild rabbit hopping home along the path, and a pale crescent moon low above. |
| card-nursery | A ewe and her young lamb nose to nose on a small round patch of spring meadow with daisies and clover. |
| card-otter | A Eurasian otter diving down through a small vignette of clear green river water after a silver roach, a trail of bubbles rising behind it, with a few pebbles and a strand of water weed below. |
| card-dash | A wild rabbit dashing towards a burrow hole in a small grassy bank with clover and a dandelion, and the soft shadow shape of a soaring eagle on the grass behind it. |
| card-bat | A common pipistrelle bat in flight chasing a pale moth, with three thin pale echo rings curving out in front of the bat, a pale crescent moon and a few dark oak leaves, as a small deep-blue night vignette with soft, fading edges. |

### B. Home tiles (`menu/`)

| id | Subject line |
|---|---|
| home-activities | A child's wooden puzzle tray with chunky puzzle pieces painted with a red fox, a hedgehog and a whale, a few mammal picture cards fanned out beside it and a brass magnifying glass. |
| home-games | A cosy pile of game things: a wooden spinner painted with small mammal pictures, two wooden dice with paw prints instead of dots, and a little carved wooden rabbit game piece. |

### C. Arts & Crafts cards (`arts/`)

| id | Subject line |
|---|---|
| card-arts-sheets | A colouring sheet of a zebra, half coloured in, lying slightly turned, with three wax crayons and a pencil beside it. |
| card-draw-trace | A sheet with a large dotted outline of an elephant, a pencil part-way along tracing the dots, and two crayons. |
| card-crafts | A paper-plate lion mask with a fluffy orange yarn mane and eye holes, child's safety scissors and a glue stick beside it. |

### D. Results stars (`menu/`): the results screen of every activity (the files are missing now)

| id | Subject line |
|---|---|
| result-star-full | One plump, glossy golden-yellow five-point star with softly rounded points, gently painted, and a tiny harvest mouse peeking over the top of one point. The star fills about 80% of the square. |
| result-star-empty | The same plump five-point star shape and size, empty: pale cream with a soft warm-grey edge, flat and calm, no animal. |

### E. Picture Pick container (`menu/`): two layers that fit together

| id | Subject line |
|---|---|
| pick-basket-open | An open, empty wicker field basket with a green-checked cloth lining folded over its rim, seen from the front and slightly above, the lid removed. It sits low in the square with its opening in the upper half. |
| pick-basket-lid | Only the matching wicker lid of that basket, alone, seen from the same angle and at the same scale, with a small wooden knob on top, placed where it would sit on the basket's rim. |

Draw the lid in the same position it would take in `pick-basket-open`, so the two images line up when stacked.

## Checks before delivering

- Check every picture on both a white and a dark navy background: no matte, halo, grey box or background.
- Animals must be real British or named species with correct markings, with no clothes and no human hands.
- There must be no letters or numbers anywhere, including the clipboard, the cards and the dice.
- The two stars must be the same shape and size, and the basket and lid must line up when stacked.

## Delivery

- Save each picture as `docs/menu-art/originals/<id>.png`, using the ids above.
- Make a contact sheet of all 15, called `docs/menu-art/originals/contact.png`. Put them in a grid on a light cream background, each labelled with its id under the picture. This sheet is the only image that may have text.
- Add every prompt to `docs/menu-art/originals/prompts.md`, and a short note of anything re-rendered to `notes.txt` in the same folder.
- Write only inside `docs/menu-art/originals/`. Do not edit anything else and do not commit.
