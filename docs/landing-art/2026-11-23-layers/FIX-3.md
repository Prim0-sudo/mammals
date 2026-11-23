# Fix 3 — bottom-left corner seams (23 November 2026)

Owner spotted layer seams in the bottom-left corner (about x 0–0.30 W, y 0.72–1.0 H).

1. `foreground.png`: the bottom-left primrose/clover clump is cut off by a STRAIGHT HORIZONTAL LINE across
   its top (about y 0.84 H, x 0.03–0.15 W); the top primroses are sliced in half. Repaint that clump with
   a natural, irregular top: whole primrose flowers, leaves and grass tips against transparency, no
   straight edge anywhere.
2. `bank.png`: the bank's bottom edge ends in a flat, hard-edged lip on the meadow. Make the base melt into
   the meadow: grass blades and soft tufts overlapping downward, feathered alpha, no visible line.

Change nothing else in either layer, nor any other layer. Clean alpha, no fringe. Check on black and white.
Redo preview-stacked.png, preview-phone.png and holes.png (hole centres unchanged). Also save
`corner-check.png`: the stacked preview's bottom-left corner (x 0–0.35 W, y 0.65–1.0 H) at full size.
Report when done.
