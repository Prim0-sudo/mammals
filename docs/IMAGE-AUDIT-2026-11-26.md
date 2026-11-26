# Mammals app image audit (26 Nov 2026)

Repo: E:/Projects/Codex/mammals-weekly-game. Read-only. Source of truth is `assets/` (dist/ is built from it and drops PNGs that have a WebP twin). Counts come from a script that read the live topic data and code (src/topics/mammals.js, crafts.js, draw-trace-pictures.js, painted-art.js, the three arcade games) and stat-ed every file. Image dimensions were read from file headers; pictures were not looked at.

## Headline

- Slots the app asks for right now: 485. Done: 434. Missing: 51. About **90% complete**.
- If you also count art the plans say is still to come but no code asks for yet (4 more menu tiles, the Picture Pick container, 4 sound-mat covers = 10), it is 434 of 495, about **88%**.
- Zero broken files (none empty, none unreadable). No duplicate word pictures. All 268 word pictures are 1024 x 1024 with PNG + WebP twins.

## By kind

| Kind | Needed | Done | Missing | Placeholder | Notes |
|---|---|---|---|---|---|
| Animal and word pictures (268 words, 10 groups) | 268 | 268 | 0 | 0 | All 268 on disk. Docs still say 123, they are stale. |
| Group cards | 10 | 10 | 0 | 0 | |
| Menu tiles | 14 | 14 | 0 | 0 | 13 tiles plus the Otter banner. Target is 17, so 4 not yet coded. |
| Landing / banner (11 layers, 20 peek poses, badge, backdrop) | 32 | 32 | 0 | 0 | Owner: finished, do not touch. |
| Game menu cards (6 games + 3 Arts) | 9 | 9 | 0 | 0 | |
| Game art (sprites, 12 homes, bat/dash/otter scenery, hind) | 54 | 54 | 0 | 0 | All owner-approved. |
| Homeward Trail (spelling) | 13 | 13 | 0 | 0 | |
| Draw & Trace / colouring outlines | 30 | 30 | 0 | 0 | |
| Detective, result stars | 4 | 4 | 0 | 0 | |
| Teaching scenes (Knowledge & Safety) | 15 | 0 | 15 | 0 | 134 questions, 0 have a scene picture. |
| Craft paintings (6 crafts x (1 finished + 5 steps)) | 36 | 0 | 36 | 36 | Every craft shows the animal's word picture as a stand-in (`art` is false). |
| Badges | 0 | 0 | 0 | 0 | No achievement badges exist in the code. Only the club badges (done). |
| Printables art | n/a | | | | 6 tracing PDFs exist. Worksheets, flashcards, slide deck, sound mats and videos are "coming soon" (they are generated files, not painted art). |

## Missing (exact paths)

Teaching scenes, 1200 x 800 WebP planned (folder does not exist yet):
`assets/teaching-scenes/ks-` plus each of: wild-big, mother-near, hedgehog-touch, seal-pup-alone, cows-field, jellyfish-beach, bee-near, baby-alone, quiet, feed-wild, hands, warren-what, plant-eaters, hedgehog-winter, staying-safe, then `-v1.webp`. The topic code does not point at them yet (sceneImage is null on all 134 questions).

Crafts, 36 files (folder `assets/crafts/` does not exist): for each of paper-plate-lion, tube-rabbit, paper-plate-hedgehog, kangaroo-pouch, paper-whale, sock-elephant: `assets/crafts/<id>-v1.webp` and `assets/crafts/<id>-step-1..5-v1.webp`. Switching on `art: true` in src/topics/crafts.js makes the app request them.

## Placeholders and stand-ins

- All 6 crafts use word pictures for the finished craft and every step (src/topics/crafts.js).
- Picture Pick has the Reel style only. The Insects jar style is switched off in code (PICK_STYLES in src/core/game-engine.js). `assets/menu/bug-jar-open-v1.webp` and `bug-jar-lid-v1.webp` are named in code but do not exist. They are not requested at runtime today, so nothing breaks, but they would 404 if a second style were turned on.
- Bat Night Hunt beetle was drawn in code earlier. Art's version is now in (`scenery/bat/beetle.webp`). The otter's mussel is still drawn in code (HANDOFF says Art could paint one).

## Orphans: 36 files on disk that nothing uses

- 25 sprite frame files in `assets/topics/mammals/games/sprites/` (`*-1..4.webp`). The games load the joined sheets, so these are the source frames.
- 4 in `assets/topics/mammals/generated/`: `woodland-clearing-flat` and `woodland-coast-empty`, each PNG and WebP (unused backdrops).
- 5 in `assets/topics/mammals/landing-animations/` (bat-flight, hedgehog-walk, squirrel-acorn-run, squirrel-idle webp and mouse-run.png). Replaced by the peeking animals.
- 2 in `assets/topics/mammals/menu/`: `story.png` and `story.webp` (Story Book tile is locked).
The build ships all of them, so they add weight but nothing else.

## Other facts

- Word pictures: every PNG has a WebP twin and docs/webp-twins.json matches. One stray PNG with no twin (`landing-animations/mouse-run.png`, an orphan).
- Trackers are stale. IMAGE-CHECKLIST.md, IMAGE-REQUEST.md, COVERAGE.md and README still say 123 words (and HANDOFF line 162-170 says 132 pending). Real count is 268. docs/asset-manifest.json "vocabulary" list is the 123 originals. The HANDOFF top section is current and says word art is done.
- Open to-dos the docs themselves list (HANDOFF "What's left" and UPGRADE-PLAN):
  1. Teaching scenes, 15 (ask Art).
  2. Part pointers: 28 arrows on the Bodies pictures (`partPointers` is empty in src/topics/mammals.js). These are drawn marks, not Codex art.
  3. Menu tiles: 4 more to reach 17, plus a Picture Pick container.
  4. Phonics sound mats and covers (`soundMats` is empty), Media (flashcards, slides, worksheets), videos.
  5. Craft step paintings.
  6. Reading practice: 5 more cards (text, not art).
  7. Plan gaps for phonics picture cards: no picture word for q, u, x, y (and several blends); cards fall back to text only.
- Teacher review and the "Scenery next" brief have been delivered; the arcade scenery is all in.

## Quick wins

1. Teaching scenes: one Codex batch of 15 pictures plus a short wiring change. Biggest visible gap, brief already written (docs/teaching-scenes/BRIEF.md).
2. Craft paintings: 36 pictures, or cut to the 6 finished crafts only (6 pictures) and keep the word picture for the steps.
3. Delete or move the 36 orphans out of `assets/` (do not ship the 25 frame sources).
4. Refresh the stale trackers (`node scripts/image-request.mjs` is named in HANDOFF, but the script does not exist in scripts/, so a manual rewrite is needed).
5. Remove the dead bug-jar paths from game-engine.js, or draw the jar, so no missing path remains in code.

## Decisions for the owner

- Crafts: 36 paintings (6 finished + 30 steps) or finished crafts only?
- Picture Pick: keep Reel only, or commission a Mammals container (burrow or field bag) so the style switch comes back?
- Menu tiles: still want 17, or stay at 13 plus the Otter banner?
- Teaching scenes: confirm go and style (realistic, same as word pictures).
- Orphans: delete, or keep the sources outside assets/?
- Mussel in Otter Dive: paint it, or leave it drawn in code?

## Confidence

- High: word pictures (268), group, menu, landing, game cards, game art, Homeward Trail, line art, stars, Detective. Counts from the live data plus file stat.
- High: teaching scenes and crafts missing (folders do not exist; code asks for them only after a flag is flipped).
- Medium: game art slot count (54) is the names I listed from the three arcade view files, not a full parse; the arcade games were not run. Orphan count assumes no dynamic string building I missed (basename search in src found none).
- Not checked: how the art looks, style consistency across the 145 newer words, whether the PDFs and audio are complete.
