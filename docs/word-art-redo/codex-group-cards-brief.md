# Codex brief: 10 painted group cards (21 November 2026)

Approved by the owner on 21 November 2026 ("Yes, paint them").

Mammal Discovery Club is a science app about mammals for children aged about 4 to 7. Its words sit in 10 groups, and each group needs its own card picture, the thumbnail a child taps to open the group. The word pictures are becoming realistic. The cards stay **painted, in the exact style of the Home menu tiles** in `reference/menu-tiles/`, so they match Home and the Activities folder. The Insects sister app does the same.

## Style (match the menu tiles)

- A warm storybook naturalist painting: soft watercolour and gouache, fine fur detail and gentle ink edges.
- An autumn woodland palette of moss green, oak brown, warm orange and cream, with small oak leaves, ferns and moss as accents, as on the tiles.
- Animals are true to life in shape and colour, gentle and appealing, but not cartoons. No human clothes, no human poses, and no talking or smiling faces.
- Each card has one clear grouping of things, centred, on a real transparent background, and reads at about 120 px.
- No text, letters or numbers, except where a card is an object that naturally carries none.

## Prompt recipe

Each card's prompt is two paragraphs: the shared paragraph, word for word, then the card paragraph.

```text
Group card picture for Mammal Discovery Club, ages 4–7, painted in exactly the same storybook naturalist watercolour-and-gouache style as the attached Home menu tiles: fine fur detail, gentle ink edges, warm autumn woodland palette with small oak leaves, ferns and moss accents. One centred composition filling about 85% of a 1024 × 1024 square with real transparent alpha, clear margin, nothing cut off, legible at 120 px. True-to-life animals with no clothes, human poses or cartoon faces; no text.
```

## The 10 cards

1. `mammals` (Meet the Mammals): a small friendly line-up showing the range of mammals, from a mouse to a whale. Show a red squirrel, a fox, a rabbit and a hedgehog in front, and the back and tail of a small whale rising behind them on a little wave. Keep it compact and readable.
2. `body` (Bodies Up Close): a large brass magnifying glass over a fox's face and whiskers, seen in close-up through the lens. A paw print sits on an oak leaf beside it.
3. `life-cycle` (Mothers & Young): a mother red deer nuzzling her spotted fawn, standing on a moss patch.
4. `food` (Food & Feeding): a red squirrel sitting up and holding an acorn, with a small pile of hazelnuts, berries and an apple at its feet.
5. `homes` (Homes & Shelters): a rabbit peeping out of a round burrow in a grassy bank under tree roots.
6. `movement` (On the Move): a hare in full leap across a few grass tufts. Its body is stretched out and all four feet are off the ground.
7. `survival` (Senses & Survival): a mammal, not a bird: a fox sitting alert with its ears up, sniffing the air, with a few autumn leaves blowing past.
8. `habitats` (Habitats & Seasons): a round vignette split into four seasons (spring blossom, summer meadow, autumn oak and winter snow), with a small mammal in each: a rabbit, a hedgehog, a squirrel and a deer.
9. `neighbours` (Other Animals): animals that are **not** mammals, side by side on a moss patch: a robin, a frog, a snail, a goldfish in a little water drop and a ladybird. There are no mammals in this card.
10. `watching` (Animal Watching): a pair of binoculars and an open field notebook with a pencil, on a mossy log, with a squirrel watching from the end of the log.

## Rules

- Real transparent background: every pixel outside the composition has alpha zero, with no matte, halo or drop shadow. A small moss or ground patch under the subject, as on the tiles, is allowed.
- Correct animals: right numbers of legs, ears, eyes and tails. Calm animals only, with no teeth, prey or blood.
- The 10 cards must look like one set, and like a set with the menu tiles.

## Delivery

- PNG, 1024 × 1024, RGBA, transparent background.
- Names: `<id>.png`, for example `homes.png`.
- Folder: `docs/word-art-redo/2026-11-21-group-cards/`.
- In the same folder:
  - `notes.txt`: anything you could not match;
  - `prompts.md`: your exact prompts;
  - `contact-sheet.png`: the 10 cards in a 5 × 2 grid with their ids.
