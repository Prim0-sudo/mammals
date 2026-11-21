# Mammal Discovery Club — upgrade plan (now vs benchmark)

21 November 2026. The benchmark is Little Bug Club (Insects, blueprint v7.0, docs/blueprint-v7.0/INSECTS-BENCHMARK.md in insects-weekly-game). Target date: about 30 November 2026.

**Where it stands.** Mammals now runs the Insects layout screen for screen: the landing, Home with its eight tiles, the Activities folder and its six games, Knowledge & Safety, Media, Topic Games, Phonics & Sight Words, Arts & Crafts, Settings and Teacher. It was checked at 1024 × 768, 768 × 1024, 1366 × 900, 1440 × 900 and 390 × 844 with no sideways scrolling. Wherever Mammals has no content yet, the screen shows a clear "coming soon" in the same place. Commit 299a335.

## 1. Content amounts

| Item | Insects | Mammals now | Gap and fix |
|---|---|---|---|
| Words | 285 in 10 groups (84/31/15/13/15/23/13/27/52/12) | 123 in 10 groups (50/23/10/8/4/12/5/11/0/0) | **About 120–170 words are missing.** Other Animals (neighbours) and Animal Watching have none, and Homes and Survival are thin. Fix: the vocabulary plan (docs/VOCABULARY-PLAN.md), then art for each new word. |
| Group cards | 10 painted group cards | **Done (21 November 2026):** 10 painted group cards in the menu-tile style, approved by the owner. | — |
| Families | 13 (5 or more words each, except the catch-all) | 8: Cats 5, Dogs & foxes 3, Rodents & rabbits 6, Hoofed 13, Monkeys & apes 3, Pouched 3, Sea mammals 9, Other 8 | **Three families have fewer than 5 words.** Fix: the vocabulary plan fills them to 5 or more and adds families for Other Animals (birds, reptiles, amphibians, fish, minibeasts). |
| "A kind of …" links | 72, plus 39 labels | 2 (polar bear → bear, moose → deer), plus 21 labels | Add links as the words arrive (for example, a lion is a kind of cat, a dolphin is a kind of whale). |
| Look-alike pairs | 47 pairs; SHOWS map 114 | 35 pairs; SHOWS 58 | Grow the list with the new words. |
| Part pointers | 28 arrows on Bodies pictures | 0 | Measure the arrows on the final art, after the style is picked. |
| Knowledge questions | 134 (13 safety; 77 with a word picture; 16 teaching scenes) | 52 (6 safety; 38 with a picture; 0 scenes) | **82 questions short.** Fix: the vocabulary plan drafts them per group, then 15 teaching scenes (ks-<id>-v1.webp). |
| Reading practice | 16 cards, 13 narrated | 14 lines, kept from the first Mammals app | Add 2 Say-together and 3 Talk-together cards. |
| Sort It | 5 rules, all playable | 5 rules; **Mammal or not? can't be played yet** (no not-a-mammal words); Home or food is small (3/6) | Fixed by the Other Animals words. Two-way sorts should use symbols (Insects has done this since 19 November); Mammals still uses pictures. |
| Teacher scope | Levels 47/164/74; six lessons; five collections | Levels 52/50/21; six lessons (Mammal or not? 8 words, Watcher 9); five collections | Rebalance once the words are in. |

## 2. Screens and layout

| Screen | Insects | Mammals now | Gap and fix |
|---|---|---|---|
| Landing | 16 painted layers, an emblem and fliers on measured spots | One flat woodland picture, with the rabbit badge as the emblem | Three landing concepts for the owner, then a layered scene. Animals that peek or run would stand in for the fliers. |
| Home | Featured banner, then 8 tiles | Same; the banner leads to the Mammal Games placeholder | Point the banner at the first real Mammal Game once it is built. |
| Activities | 6 games | 6 games, all playable | — |
| Detective | Mosaic, Pixel and Silhouette | **Done:** Mosaic, Pixel and Silhouette. Silhouette outlines the 50 whole-animal cut-outs in Meet the Mammals. | — |
| Picture Pick | Picture Reel, plus a topic container (Bug Jar) and a style switch | Picture Reel only | Design a Mammals container, for example a "burrow" or a "field bag", in the art run. |
| Spelling | The Last Leaf (9 tries) | Homeward Trail (9 tries), kept from the first Mammals app and fitted to the Insects layout | — (8/8 headless checks pass, hop and escape included) |
| Knowledge & Safety | Group picker; scene pictures | Group picker; no scene pictures | See the teaching scenes above. |
| Topic Games | 3 games (2 education, 1 arcade) with a level page, How to play and results | 3 placeholders with a level page and a "being made" page | **The biggest build.** Pick 3 concepts from moving previews, then build them on the shared kit. |
| Phonics | Alphabet, blends and families with picture cards and 4 sound mats | Picture cards use Mammals words; no sound mats | Make the sound mats (media stage). |
| Media | 15 storybooks, 11 mini-lessons, a 131-slide deck and 44 flashcard PDFs | Every shelf shows "coming soon" | Media stage, below. (An empty shelf no longer shows the print-layout selects; fixed 21 November.) |
| Arts & Crafts | 7 worksheets, 3 tracing sets, 30 Draw & Trace pictures, colouring, 6 crafts | Blank page, Draw & Trace (with a note), colouring, and 6 crafts that use word pictures | Worksheets, tracing and outlines in the media stage; craft step paintings in the art run. |
| Settings and Teacher | As Insects | As Insects; the Teacher summary reads "All Mammals words" | — |

**A fault in the benchmark itself:** on "How many words?" the "10 words" label is hidden under the card pictures, in both Insects and Mammals. I left it as is to keep the copy exact. It is reported to the parent session so Insects can be fixed first.

## 3. Art

| Set | Insects | Mammals now | Gap and fix |
|---|---|---|---|
| Word pictures | 285, one style (macro photo), trimmed to fill the box | **Done (21 November 2026):** all 123 redone by Codex as studio-photo cut-outs (owner: scientific themes go realistic; style A picked), trimmed to fill the box, alt text rewritten. Tongue, nose, backbone and water are being remade (redo-fixes-1.md). | Briefs and deliveries in docs/word-art-redo. New words from the vocabulary plan follow the same brief. |
| Menu tiles | 17 | 13 | Add the missing tiles in the chosen style. |
| Teaching scenes | 15 | 0 | After the style is picked. |
| Topic game art | 97 pieces | 0 | Made with each game. |

## 4. Narration

Insects has 2020 clips in Kokoro af_heart. Mammals has none: the manifest is marked "pending" and the narration test is skipped until then. **Ask the owner for one Kokoro voice**, then run `node tools/voice/build.mjs --make` once the words and questions are final, so nothing is recorded twice. The masters folder is `../mammals-audio-masters`.

## 5. Tools and tests

| Item | Insects | Mammals now |
|---|---|---|
| Unit tests | 30 | 28 (27 pass, 1 skipped while the voice is pending) |
| Browser checks | 48 | 26 in the main suite (passing at 1366 × 900, 1024 × 768, 768 × 1024 and 390 × 844), plus 8 Homeward Trail checks, all headless over CDP |
| Generators | 10 scripts | The same 10, as Insects templates. Each stops with a message until the media stage fits it to Mammals. |

## 6. Build order

1. **Vocabulary plan.** About 250 words, families, kinds, sorts and about 134 questions. Owner approval.
2. **Art style.** Side-by-side options, the owner picks, a pilot of about 10 words, then the full library and group cards.
3. **Landing.** Three concepts, then the layered scene.
4. **Topic Games.** Three concepts from previews, then build them.
5. **Phonics sound mats and Media.** Flashcards, slides, worksheets, tracing and Draw & Trace outlines.
6. **Narration** in the chosen voice.
7. **Final pass.** The five edu checkers, two at a time, with every flag confirmed at real sizes. Then push.

**Deadline risk.** Steps 2 and 4 are the long ones. If the style choice is not made by about 23 November, the full art library is unlikely to be ready by 30 November. The fallback is to ship the current 123 pictures cleaned up, and add the rest after launch.
