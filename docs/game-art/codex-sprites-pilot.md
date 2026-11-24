# Codex brief: rabbit-hop motion frames (pilot, 24 November 2026)

Read `docs/game-art/BRIEF.md` first (section 3). This pilot makes only the **rabbit-hop** cycle for Burrow Dash, so the owner can approve the method before the other six cycles.

## Why one picture for all four poses

Four separate renders drift: the rabbit's size, colour, markings and light change from frame to frame, and the animation flickers. So draw **all four poses in one picture**, as a 2 × 2 grid of the same rabbit. Claude cuts the grid into frames, lines them up on the ground line and builds the sprite sheet.

## The picture

One 1024 × 1024 (or the tool's square size) PNG with real transparent alpha, divided into four equal quarters with clear transparent space between them. Each quarter holds one pose of the same rabbit, read left to right, top row then bottom row:

1. top left: crouch, about to jump
2. top right: push off, back legs extending, front lifting
3. bottom left: stretched out in the air, all four feet off the ground
4. bottom right: landing, front feet touching down, back legs coming forward

Prompt (use it exactly, plus a line naming the two style references):

```text
Scientific educational sprite reference for Mammal Discovery Club, ages 4–7. One square image with real transparent alpha, divided into four equal quarters with generous empty transparent space between them and no lines, boxes or labels. Each quarter shows the same European wild rabbit (Oryctolagus cuniculus), identical in size, fur colour, markings, ear shape and lighting, in strict side view facing right, the whole animal visible with clear margin inside its quarter. Top left: crouched, gathering to jump. Top right: pushing off, hind legs extending, front of the body rising. Bottom left: stretched out mid-leap, all four feet off the ground. Bottom right: landing, front feet touching down, hind legs swinging forward. Feet at the same height in each quarter, so the four poses share one ground line. Lifelike studio photograph cutout of the real animal, natural fur sheen and microtexture, soft directional studio light from the upper left, neutral colour balance. No ground, grass, shadow, text, watermark or background.
```

Style references (style only, not content): attach `assets/topics/mammals/vocabulary/rabbit.png` if it exists (else `rabbit.webp`) and one other whole-animal word picture such as `hare.png`.

## Checks before delivering

- The same rabbit in all four quarters: same size within about 5%, same brown-grey agouti fur, same white tail flash, same ear length.
- All four face right, in side view, with nothing cut off at a quarter's edge and no part crossing into another quarter.
- On a dark background: no matte, halo, grey box or shadow.
- If a pose comes out wrong, re-render the whole grid rather than patching one quarter, so the rabbit stays the same.

## Delivery

- `docs/game-art/originals/rabbit-hop/grid.png` (the accepted grid at full size).
- `docs/game-art/originals/rabbit-hop/notes.txt` and `prompts.md` (every prompt, including any re-renders and why).
- Write only inside `docs/game-art/originals/rabbit-hop/`. Do not edit anything else and do not commit.
