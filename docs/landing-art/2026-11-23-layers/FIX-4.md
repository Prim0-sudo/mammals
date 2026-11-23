# Fix 4 — the middle of the landing and the hedgehog's leaf pile (23 November 2026)

The owner, on the live landing: "the middle is a heavy miss, especially the hedgehog". Compare
`preview-stacked.png` (now) with `reference-concept-a.png` (the concept the owner chose):

- The middle of the meadow is one flat, bright lime lawn running to a straight row of hills. Nothing
  leads the eye in. The reference has a worn path into a deep view, varied greens and a full tree line.
- The hedgehog's leaf pile is a small flat patch on the lawn, like a sticker: no shadow, no grass in
  front, no hollow. The hedgehog peek could only float on top of it.
- The hedgehog peek itself is a round, plush, front-on face; the reference hedgehog is a real hedgehog
  nosing out from under the leaves.

Change only the files named below. Same canvas (3344 x 1882), camera, light (sunny, upper right), palette
and gouache/watercolour storybook look as the other layers. All BRIEF.md shared rules still hold: no
animals or insects in any layer, overscan, hidden backing, RGBA with clean soft alpha, no halo, no
painted checkerboard. Check every changed layer on black and on white.

## 1. `layers/middle.png` — repaint (opaque to the bottom, as before)

- A soft, worn earth-and-grass path starts at the bottom of the canvas between the small burrow hump
  (H4, about x 1410) and the leaf pile (about x 1880), winds back through the meadow and disappears into
  the far tree line a little right of centre. It narrows with distance. Gentle, not a road.
- Grass: varied sage, meadow and yellow-green, not one lime. Darker and richer towards the bottom,
  paler and hazier towards the back. Long, soft, dappled oak shade across the lower third. Small
  scattered daisies and buttercups thinning with distance.
- Far edge of the meadow: a fuller, nearer hedgerow and clumps of trees with the blossom bushes and
  bluebell drifts, as in the reference, so the view has depth (they sit in front of `distant.png`'s
  hills; leave that layer as it is).
- Keep: behind the title (x 0.29–0.71 W, y 0.16–0.38 H) pale and even; around the Explore button
  (x 0.38–0.62 W, y 0.40–0.66 H) calm and low in contrast. No big dark shapes there.
- Paint the ground solid behind the bank and behind the leaf pile, as before.

## 2. `layers/foreground.png` — repaint the leaf pile only

- Replace the flat leaf patch with a deep, rounded drift of dry oak leaves (browns, russet, a few
  yellow), centred at about x 1880, spanning about x 1560–2200, its top at about y 1480. It is tucked
  against a low clump of ferns and long grass at its back right, sits in its own soft shadow on the
  grass, and has grass blades and a few clover heads overlapping its front edge.
- In the middle of its front, leaves arch over a dark opening: CUT the opening OUT to transparency
  (soft, leafy rim, no hard edge), about 300 px wide and 200 px tall, its centre at about x 1880,
  its lower rim at about y 1700. Leaves in front of the opening (its lower rim) stay on this layer.
- Leave everything else in this layer exactly as it is (the oaks, branches, bottom flowers and grass,
  the bluebells at right).

## 3. `layers/leaf-hollow.png` — new

Only the dark inside of the leaf pile's opening: a soft dark warm-brown, shadowy oval a bit larger than
the opening (about 380 x 270 px, centred at x 1880, y 1610), so no meadow shows through round the
edge. Everything else transparent. It sits right behind the foreground.

## 4. The hedgehog peek — repaint all five poses

Save to `../2026-11-23-peeks/peeks/`: `hedgehog-ahead.png`, `hedgehog-left.png`, `hedgehog-right.png`,
`hedgehog-blink.png`, `hedgehog-sniff.png` (overwrite). Follow the peek BRIEF.md shared rules (512 x 512
RGBA, all five line up exactly, only the named detail changes) with these changes:

- A real European hedgehog like the one in the reference, nosing out of a hollow: long pointed snout
  forward and a little down, small dark eyes, small rounded ears, the crown of brown-and-cream spines
  rising behind the head. Realistic, friendly, not plush or round-faced.
- Facing the viewer, a little three-quarter, centred. Low and wide: the spine crown top about 110 px
  from the top of the canvas.
- The lower body fades into deep warm-brown shadow and is fully transparent by the bottom 60 px.
- Poses: ahead; left and right (snout turned a little each way); blink (eyes closed); sniff (snout
  raised a little).

## Also deliver

- Redo `layers/preview-stacked.png` (now with the leaf hollow under the foreground) and
  `layers/preview-phone.png`, as in BRIEF.md.
- Redo `layers/holes.png`, adding H5 for the leaf-pile opening: mark its centre and its lower-rim line.
- `layers/middle-check.png`: the stacked preview's middle band (y 0.55–1.0 H, full width) at full size,
  with one hedgehog pose placed in the opening, drawn between the leaf hollow and the foreground, to
  show it sitting inside the pile.
- `../2026-11-23-peeks/peeks/hedgehog-sheet.png`: the five new hedgehog poses in a row on mid-green.

When finished, list anything skipped or unhappy with, and say if any layer doesn't line up.

## Outcome (23 November 2026)

The owner rejected the leaf pile and its hedgehog. The pile was cut out of `layers/foreground.png`; the leaf hollow, the seating check and the hedgehog peek were removed. The repainted middle stays. `preview-stacked.png`, `preview-phone.png` and `holes.png` still show the pile.
