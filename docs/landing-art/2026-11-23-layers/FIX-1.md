# Fix 1 — repaint bank.png and tunnels.png only (23 November 2026)

Keep every other layer exactly as delivered. Overwrite only `layers/bank.png`, `layers/tunnels.png`,
then redo `layers/preview-stacked.png`, `layers/preview-phone.png` and `layers/holes.png`.
Same size (3344 x 1882), same rules as BRIEF.md.

Problems with the first bank:
1. It reads as a FACE: two round holes side by side on top and a big one under them look like eyes and
   a mouth. The neat ringed rims look cartoonish.
2. It became a tall pillar against the left edge instead of the low, sloping, grassy earth bank of
   `reference-concept-a.png`.
3. The cut-out has bright red, yellow and green fringe speckles along its edges.

Paint it again:
- A wide, low, natural grassy bank rising from the meadow on the left and sloping down towards the
  centre, like the reference. It may run from the left edge to about x 0.27 W; its top no higher than
  about y 0.30 H at the left edge, lower towards the right.
- Three openings STAGGERED along the slope at clearly different heights and sizes, never in a pair-above-
  one arrangement: the badger sett lowest and largest at the bottom-left with its fresh soil heap; the
  fox den mid-slope further right, medium; the rabbit burrow smallest, higher up and offset left. The
  openings are irregular, natural earth holes with roots and grass hanging over the top edge, no neat
  rings or outlines.
- Keep the small phone hole (H4) and its hump where they are now, but give it the same natural look.
- Holes cut out to transparency with a soft earth rim; tunnels.png has a dark shadowy oval behind each,
  a little larger than its opening.
- Alpha must be clean: no coloured fringe, halo or speckle anywhere. Check by compositing on pure black
  and on pure white; edges must be plain natural foliage and earth colour.
- No animals, no faces of any kind, no text.

Report the new hole centres in holes.png (H1 rabbit, H2 fox, H3 badger, H4 small) and anything unhappy with.
