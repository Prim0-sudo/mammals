# Continue here — 24 November 2026

Mammals is being rebuilt to the Insects benchmark (blueprint v7.0); the gap table is docs/UPGRADE-PLAN.md. Deadline about **30 November 2026**.

## Where it stands

- **Topic Games: the owner approved all six on 24 Nov** ("these are great"), subject to these changes:
  - **Art** (brief: docs/game-art/BRIEF.md): **all done, owner approved and wired in on 24 Nov.**
    - Home Before Dark shows the 12 empty homes (games/homes/), Nursery has the 11 lone babies and the hind, so deer and fawn are back (f22c127).
    - Motion frames (assets/topics/mammals/games/sprites/, drawn by src/core/games/sprites.js): rabbit hop and gallop, fox trot and eagle soar/swoop in Burrow Dash; otter swim in Otter Dive; bat and barn owl flight in Bat Night Hunt. Frame 0 is the still pose before a round and under reduced motion. The bat and owl are anchored by the eye, keeping a fifth of the bat's natural body rise.
    - The Art session (Ludimi group) did the pictures.
  - **Owner, 24 Nov, after playing:** fish heads were cut off in Otter Dive (fixed, f76f719); Bat Night Hunt must not show unlit moths or branches at all (fixed, f76f719); the bat game was a bit plain, so it now has a **beetle** (a cockchafer crosses now and then, 30 points, counts in the streak) and a **dawn flight home to the roost** at the end (owner said "add both"). The beetle is drawn in code and the roost uses homes/roost.webp until Art's scenery lands.
  - **Bat Night Hunt scenery is in** (owner approved, Art fe628f8; wired in after): far trees, near trees and pond strips, the moon, bark branches and two moths. Art's cockchafer and oak roost are in too (owner approved, Art fc23b13): the beetle flies head first with a wing whirr, and at dawn the bat flies home into the hollow of an old oak standing on the bank (narrower on a phone). **Burrow Dash scenery is in too** (owner approved after it reached main in 4206575): far hills, hedge and ground strips, two stones (round and standing), the birch log, the burrow mound and two clouds; the deep soil below the strip on a phone is a gradient from the strip's own colour. Otter scenery comes next on Art's branch art/otter-scenery (Art now keeps unapproved art off main and names the branch to merge).
  - **Scenery next (Art):** the owner wants Codex art for everything still drawn in code in the three arcade games. Brief: docs/game-art/SCENERY-BRIEF.md (strips, objects, four new otter foods: trout, eel, crayfish, swimming frog). Order: bat, dash, otter. Wire each in after the owner approves it; the otter foods need game logic too. Then Art does the teaching scenes.
  - **Voice:** the education games now speak every status line, and tapping an animal, home, baby or mother says its name. All 441 game lines are in src/topics/narration-lines.js, and tests/games-voice.test.js checks them.
    - **Recorded:** the owner picked Heart (af_heart, as in Insects). All 2,257 clips are in assets/audio/heart (49 MB) and the manifest is complete. The headless check finds no missing line in any of the three games at 1366 or 390. Re-run `node tools/voice/build.mjs --make` (in the background, about 50 minutes on the CPU, and it only records new lines) whenever spoken text changes.
  - Code is under src/topics/games, src/core/games and src/styles/games, with a test file per game. Committed locally.
  - **Otter Dive scenery and foods are in** (owner approved, Art 30a0f19; wired in after). The far and near banks, the riverbed (it grows on a phone so the gravel reaches the bottom edge; muddy water browns it), swaying weed strands, the snag (its picture is fitted to the snag's own hit line), the can, bottle and bag, and the stick float on the fishing line. A quarter of spawns are now other foods: trout and eel (20 points), frog and crayfish (15; the crayfish walks on the riverbed). Toasts name them ("Trout! ×2 +40"), and the results say what was caught ("39 fish, 4 trout, an eel and 2 crayfish"). Star marks were re-simulated: easy 200/500/900, medium 250/550/950, hard 200/500/800.
  - **Otter Dive extras (owner, 25 Nov):** the holt at the end is the empty one (games/homes/holt.webp), standing at the far right, and the otter swims into its door. **Air bubbles** wobble up from the riverbed now and then (every 15/13/11 s by level): swim into one and the air is full, so the dive combo lives on. A **mussel** on the riverbed (its own timer, about every 20 s; drawn in code with a soft glow, Art could paint one) gives a 6-second speed burst: faster swimming, a rushing river, snags and litter pushed aside ("Whoosh!") with no life lost. Stars re-simulated: easy 250/600/1050, medium 300/700/1200, hard 250/550/900.
  - **Bat Night Hunt owl on Medium (owner, 25 Nov):** Medium felt easy with only branches, so a slower, rarer owl glides across there too (owlSpeed 0.11 against Hard's 0.15, every 22 s against 16). Medium stars re-simulated: 200/500/850.
  - **Nursery Round-up variety (owner, 25 Nov):** there are 11 pairs and rounds were fully random, so on Hard about half came back. Now the next round takes the pairs the last one left out first: Easy and Medium rounds are all new, Hard brings back one.
  - **Confetti for Plants and Insects:** two side sessions (plants-confetti, insects-confetti) are porting src/core/confetti.js into those repos, committing locally only.
  - **Pushed to 5780329** (otter scenery and foods, confetti, bat extras, tracing). Before that, **7360b66** (bat and dash scenery wired in). Local only: 30a0f19 (Art's otter art), the confetti upgrade, Art's bat extras, tracing, and the otter wiring; push when the owner says so.
  - **New confetti** (src/core/confetti.js): one canvas engine on the GSAP ticker replaces the old DOM confetti for every caller. Two-sided paper that flips and glints, mixed shapes (strips, dots, curly ribbons, paw prints, leaves, stars), gold and silver. Three tiers by count: pop (40 or fewer) is a small burst; cheer (41 to 99) adds two cannons from the bottom corners and a soft pop sound (AudioManager.pop); finale (100 or more) fires a second volley. Results screens fire from the stars (0/1/2/3 stars: none, 40, 75, 120; Topic Games use gold on a new best). Reduced motion: no pop at all, still fading sparkles for cheer and finale.
  - Hard levels end early for a careful simulated player in about half the runs (Bat, Otter and Dash). The owner has played them.
  - Play-test tool (scratchpad; copy it into tools/test if kept): play-arcade.mjs rewrites main.js in flight to expose window.__game, so the game's own botInput drives the real screen.
- **origin/main** has tonight's landing push.
- **Live:** the next 6-hourly Ludimi auto-release carries tonight's landing. Don't hand-deploy.
- **Word art:** all 268 words have pictures; nothing waits.
- **Checks (24 Nov):** npm test 73/73 including narration, check and build pass. The menu cards lost their light corner lines on hover (a7246cb).

## Landing: finished, do not touch

Owner, 23 Nov (night): after mirroring the mouse hump and resizing the mouse and fox, "we arent touching the landing page again". This replaces the earlier plan to redo it. Leave it as it is.

What it is:
- Burrow Bank layers in assets/painted/landing (sky, distant, middle, tunnels, bank, bank-lip, foreground, 3 clouds).
- Four animals peek: rabbit, fox (drawn 350 wide), badger, and the mouse (130 wide). The mouse's hump at x 2300 was mirrored so its opening faces the middle of the scene.
- bank-lip.png is the bank's own lower rim round each opening, drawn in front of the animals. Rebuild it with `python -I tools/art/build-bank-lip.py .` if a hole or animal width ever changes; keep HOLES in step with LANDING_PEEKS.
- The round rabbit badge fills the Explore button.

## Next
Finish item 2, Topic Games:
1. Push the bat and otter fixes once the owner says so.
2. Wire in the scenery art as Art delivers and the owner approves it (SCENERY-BRIEF.md).

---

## Live

- A push does **not** start a Pages build. ludimi.org/mammals updates through the 6-hourly Ludimi auto-release in Prim0-sudo/ludimi-field-guide (cron `17 */6 * * *` UTC), which moves the `mammals-weekly-game` pin to main. mammals-weekly-game.pages.dev redirects there. **Never hand-deploy.**
- Batches 6–9 went live with the releases of 22–23 November; all 268 words are live.

## How to work here

- **Install word art:** these steps take a delivered batch into the game.
  1. Check the batch on dark.
  2. Write alt text from the pictures into a JSON file of id → alt.
  3. Run `python -I tools/art/install-word-art.py <folder> [ids]`.
  4. Run `python -I tools/art/add-word-rows.py <alts.json> <new block key>`. The definition and sentence come from VOCABULARY-PLAN section 6. Use a new key each run.
  5. Run `python -I tools/art/png-to-webp.py`.
  6. Bump the counts in tests/logic.test.js, then update the look-alikes.
- **Browser suites:** run `npm start` (port 4186), then `node tools/test/run-browser.mjs tests/browser.html`, and the same for `tests/homeward.html` and `tests/layout.html`. layout.html never prints PASS: it runs the full 3 minutes and prints "Layout — …", or "OVERFLOW — …" on a fault. The runner uses the CDP helper in E:/Projects/Codex/hunt-club/docs/deck/tools/cdp.mjs.
- **"Push" means:** `npm test`, `npm run check`, `npm run build` and the three browser suites, then push main. Commit messages end with the Co-Authored-By line.
- **House rules:**
  - No visible Pause button.
  - Popouts are centred, and a short last row is centred.
  - Pictures fill their box.
  - Use GSAP for coordinated animation, with reduced-motion support.
  - Run Codex one batch at a time.
  - Owner files go to `G:\My Drive\1.   Coding Hardware Software\Mammals rebuild 2026-11-21\`.

## What's left (build order from docs/UPGRADE-PLAN.md section 6)

1. **Landing: finished** (see the top). The owner does not want it touched again.
2. **Topic Games:** six games, in progress (see the top). The Home banner is Otter Dive.
3. **Teaching scenes:** 15 `ks-<id>-v1.webp` scenes, listed in VOCABULARY-PLAN section 10, for 14 questions plus the staying-safe card. Ask Art.
4. **Part pointers:** 28 arrows on the Bodies pictures, measured on the final art.
5. **Menu tiles:** 4 more to reach 17, plus a Picture Pick container (for example a burrow or a field bag).
6. **Phonics sound mats and Media:** flashcards, slides, worksheets, tracing and Draw & Trace outlines. The generator scripts are under scripts/; each stops with a message until it is fitted to Mammals. **Tracing is fitted (24 November 2026):** scripts/create-tracing-pdfs.py is the Insects trace-and-colour sheet (owner pick S3: "Trace and colour" badge, name pill, name line, colour guide, the picture as big as the page in black dashes, the word in dotted lowercase on handwriting lines; wide pictures A4 landscape; A5 is two halves on A4 landscape). It writes assets/printables/tracing/mammals-tracing-<level>-a4-v2.pdf and -a5-v2.pdf, reads the double-quoted picture list, and with no ready pictures writes an empty list. When outlines arrive: give each picture with a name of more than one word a `word: "..."` (the one word a child traces), add it to READY, check the sheets with a contact image, then run the script. Draw & Trace uses path look D (soft road, bold dashes in the step's colour, the rest as light grey dashes); the Media tracing hint and layouts match Insects.
7. **Reading practice:** add 2 Say-together and 3 Talk-together cards.
8. **Teacher scope:** rebalance the levels and lessons now that all the words are in. Check that the Sort It "Mammal or not?" sort can now be played with the Other Animals words.
9. **Narration:** ask the owner to pick one Kokoro voice, then run `node tools/voice/build.mjs`. The narration test un-skips once the clips are in.
10. **Final pass:** the five edu checkers, two at a time, with every flag confirmed at real sizes. Then push.

**Owner decisions pending:** the Kokoro voice, and the game art contact sheets.

---
# Current release — mammals-only topic, 6 October 2026

The user confirmed that fish content was accidentally clipped from the next theme. The active game now contains 123 words in five categories (50/23/22/20/8), 13 knowledge questions and 15 Read, Draw & Talk cards. Eight fish species and gills, their nine runtime PNGs, three comparison questions, one reading card and the fish comparison objective were removed. Marine mammals remain. Every vocabulary activity uses the same reduced bank.

Current manifests, coverage, vocabulary/image handoff, art brief, README and master blueprint v4.2 reflect this scope. Scripts derive active counts from the topic. Original archive names and earlier records remain historical provenance.

Validation: 22/22 Node checks, 21/21 gameplay browser checks, content/checksum validation and build passed. The build contains 123 vocabulary PNGs, with the removed images absent. The normal preview shows the five current categories and All 123 words. Native devices and a new live deployment were not verified.

Publication: committed and pushed to main at the user's request. The existing Cloudflare automatic build is triggered by the push; no separate manual deployment was performed.

---
# Current release — 6 October 2026

This release updates the landing implementation and master blueprint v4.1. It supersedes the older landing descriptions below; those sections remain historical records.

- Rabbit intro/Home badge and a 1672 × 940 flat woodland clearing with clean rocks.
- Consecutive squirrel peek, three-second mouse dash, bat flight, squirrel run and second bat flight; no hedgehog or idle gaps.
- Straight ground lane, grounded foot registration/contact shadows, corrected left-rock base mask and raised right-side bat descent. Mouse body registration and gait timing are separate from its fast travel.
- Blueprint guidance now explores the art style best suited to each new theme, aims for variety across the collection and allows some games to share a style.
- New image prompts and checksums: docs/landing-generated-artwork.json and linked artwork notes. Active landing assets are included in content validation and the asset manifest.

Validation: 21/21 Node unit checks, content/checksum validation, build and Git whitespace check passed. The landing browser fixture passed 6/6 at 1280 × 800, covering a full encounter cycle, masked endpoints, cover mapping, simulated visibility/reduced-motion changes and twelve navigation returns. Ordinary preview placement and grounding were visually inspected during development. No new physical-device, native OS-motion or live-deployment certification is claimed.

Publication: this release is committed and pushed to main at the user's request. Cloudflare's existing automatic build is triggered by the push; its completion has not been verified. No separate manual deployment was requested or performed.

---

## Local artwork integration — 5 October 2026

All 132 vocabulary PNGs from Mammal_Discovery_Club_132_Game_Assets.zip are installed byte-for-byte with verified delivery checksums, 1024 × 1024 RGBA canvases and transparency. Category cards reuse suitable pictures, reading cards include illustrations, and quiz sets use pictures only when all three choices have matching artwork. Existing learning, sorting, identification, spelling, Flip and Wheel markers consume the same vocabulary assets. Detective code and artwork were not changed for this import. Source records: docs/supplied-artwork.json and docs/supplied-artwork-manifest.json. The larger Complete_132 archive in Downloads was not readable as a complete ZIP; the game-assets archive contains the full 132-picture delivery. Local verification: 11 Node tests, 20 browser tests, checksum/content checks and build passed. This update has not been published.

# Mammal Discovery Club handoff

## Publication request — 6 October 2026

User requested committing and pushing the current implementation for later refinement. Final Node checks: 19/19; content/build and whitespace checks passed. Remote main was fetched before committing. The push triggers the existing Cloudflare Pages workflow; a verified push does not certify deployment success. Earlier local-only statements below record the status before this request. Landing animation art remains open to later visual refinement; the squirrel cross-screen run is inactive.

## Latest local update — supplied landing animations, 5 October 2026

Integrated the supplied 48-frame pack. Active cycles are squirrel peek/retreat, hedgehog walk and bat flight; the squirrel cross-screen acorn run was removed after the user's visual review. The pack's original files and checksums are preserved. Four lossless delivery atlases total 658,354 bytes; three are active. Routes protect actual badge and toolbar rectangles, with smaller animals on short screens. One RAF owner separates continuous travel from pose timing, preloads active assets, suspends hidden-tab work, omits animals under reduced motion and cancels RAF/ResizeObserver/media/visibility handlers on exit.

Checks: 19/19 Node tests, 21/21 regression browser checks and 5/5 landing fixture checks. Landing fixture repeated at 1280×720, 1024×600, 768×1024 and 360×800; all pass. Cycle progression, reduced motion and hidden-document signals in this fixture are simulated. Normal live movement was also visually inspected. No physical-device or OS-motion preference test. Existing launch page may scroll slightly vertically; decorations add no document flow. Source/delivery details and visual limitations: [LANDING-ANIMATIONS.md](docs/LANDING-ANIMATIONS.md). No commit, push or deployment. Preview remains http://127.0.0.1:4186/.

## Current local update — Homeward Trail, 5 October 2026

Latest interface refinement: doubled the clue picture to 128 px (96 px on phones), moved nine chance tokens to the right of the centered scene, and removed the idle instruction and visible numerical counter. Remaining chances retain a screen-reader-only count; animation lock/outcome status remains available. Short screens show tokens as a compact 3×3 group. Rechecked 1280×720, 1024×600, 768×1024 and 360×800 with Hippopotamus; no horizontal/vertical overflow after projector spacing adjustment. Build passed. Evidence: `test-results/homeward-large-picture-*.png`.

Layout refinement: word picture now sits beside the answer boxes below the scene. Scene, answer row and keyboard share the page center line. Production-style fixture checks at 1280×720, 1024×600, 768×1024 and 360×800 with Hippopotamus showed no horizontal or vertical overflow. Build passed; preview refreshed. Evidence: `test-results/homeward-centered-*.png`. This refinement changes layout only.

Homeward Trail replaces the active spelling presentation using all 13 supplied scene assets. Nine unique misses cause loss; distinct correct letters cause one registered hop each. Wrong letters also make small hops, advancing up to the midpoint and hopping in place thereafter. Final win enters behind a foreground burrow mask before scoring; loss brings the fox from the right and sends the rabbit fully left before revealing the answer. Preload, visible input locks, reduced-motion settling, hidden-document pausing and cancellation on restart/next/exit are implemented. Existing 132-word collection, six category totals (50/8/24/22/20/8), other activities and navigation are preserved. Curriculum review remains outstanding.

**Local only: not committed, pushed or deployed.** Preview remains running at http://127.0.0.1:4186/. Existing production deployment is separate and predates this change. All original PNG bytes are retained and checked; lossless WebP delivery is about 4.7 MB.

Checks: 16/16 Node tests, 21/21 existing browser fixture checks and 8/8 dedicated scene fixture checks pass; content/asset check and build pass. Normal RAF hops, three entry poses, masked disappearance and fox/escape were visually inspected. Production-style layouts checked at 1280×720, 1024×600, 768×1024 and 360×800, including long/multi-word labels. No horizontal overflow; phone scrolls vertically. Browser keyboard H revealed both Hedgehog H letters with one hop. Inspected preview had no console warnings/errors or broken images. Reduced motion and document visibility were simulated in fixtures; no actual OS motion preference or physical device was tested.

See [HOMEWARD-TRAIL.md](docs/HOMEWARD-TRAIL.md) for changed files, timing/coordinates, precise checks and visual limitations; [asset audit](docs/homeward-trail-assets.json) for checksum and registration details. Evidence is in ignored `test-results/homeward-*` files. Earlier sections below are historical and do not describe the current spelling skin or supplied-art status.

## Latest visual update — 4 October 2026

### Publication verified — 4 October 2026, Asia/Bangkok

- Public GitHub repository created and initial commit `9cd4570c203f4c9e5325bc384d50f80db3042f99` pushed to `main`. GitHub's visible latest commit matched the local commit.
- Cloudflare Pages project `mammals-weekly-game` created in the user's existing account with the existing GitHub connection. Automatic production deployments are enabled for `main`; framework None, command `npm run build`, output `dist`, root `/`.
- Cloudflare reported successful production deployment `b8364495-0adb-4b44-8984-d0001a60759c` of that commit. Public URL: https://mammals-weekly-game.pages.dev/. Immutable first-deployment URL: https://b8364495.mammals-weekly-game.pages.dev/.
- Public landing background and launch-to-menu control visually inspected. All eight menu cards appeared with Sound Detective locked. Console inspection found no errors or warnings at that point.
- All 15 served production files matched the local build: HTML/JS/CSS comparisons normalised Git CRLF/LF conversion; the background matched byte-for-byte. Evidence: `test-results/deployment-verification.json`. Repeat with `node scripts/verify-deployment.mjs` after building.
- Current pre-publication checks: 8/8 Node logic checks, content/asset reconciliation and build passed; 16/16 production-engine browser fixture checks passed. Fixture-selected Wheel exhaustion and simulated reduced-motion/keyboard signals remain as described below.
- Unused generated animal drafts were archived under ignored `docs/generated-originals/`; the only published image asset is the animal-free background. Local preview continues running at http://127.0.0.1:4186/.

The documentation update recording these results is a later commit and triggers the same automatic Pages build; it does not change the verified game files.

Landing panel and complete eight-card menu now centre vertically below the toolbar. Tall phone menus scroll naturally. The animal-free woodland/coast background is installed; its URL resolves against the page, correcting the stylesheet-relative loading failure. Menu icons and front-page controls currently use CSS. No static animals are displayed on the landing page.

Use [IMAGE-REQUEST.md](docs/IMAGE-REQUEST.md) for the current complete art handoff: 132 vocabulary pictures, 16 reserved interface-art slots covered by CSS/text, and one installed background (149 mapped slots total). This supersedes the older all-149-missing count below. Vocabulary content remains the existing unapproved draft; the user is developing it separately. Regenerate the handoff with `node scripts/image-request.mjs` after approved vocabulary changes. The earlier verification results below predate this visual update.

**Current status, 4 October 2026:** user authorised creation of the GitHub repository and Cloudflare Pages deployment. Repository: https://github.com/Prim0-sudo/mammals-weekly-game. Production target: https://mammals-weekly-game.pages.dev/. Push and live deployment are verified separately. Local source is in `E:\Projects\Codex\mammals-weekly-game`; preview: http://127.0.0.1:4186/. Existing games are preserved.

## Content

132 = **50 + 8 + 24 + 22 + 20 + 8** across Mammals, Fish, Bodies, Places & Food, Actions, Young. One collection, no K1/K2/K3 assignments. 16 knowledge questions, 16 reading/talking cards, 132 per-word example sentences, six mapped objectives. Every entry has a reachable learning/category/All Words route. All vocabulary, artwork suitability, drafted language and safety phrasing need teacher review. The source's live-birth generalisation was corrected for egg-laying mammals; air-breathing alone is not treated as a sufficient mammal definition. See CONTENT.md for sources and specialist support.

132 pending vocabulary image paths + 16 reserved CSS/text interface slots + one installed animal-free background = **149 mappings**. Zero approved vocabulary illustrations supplied or active. Unused generated animal drafts remain archived locally and are excluded from Git and published assets. The original curriculum PNG is a reference, not an in-game animal asset. Its original and retained-copy SHA-256 matched: `f85a6a5e92b6bf307852e3df054463e165d5bd66508219499f42682e2ecbe190`. Optional scene, results and question art is separate from those totals. The fish comparison category remains unchanged pending the user's content decision.

## Actual checks performed

- `npm test`: **8/8 pass**. Content uniqueness/completeness, exact group counts, full vocabulary eligibility/objective mapping, non-repeating short cycles and restoration, Flip pair construction including 8/10/20/30 words, Wheel 1/8/12/13/132 boundaries and pointer math, spelling character handling, supplied reading phrases.
- `npm run check`: pass. Valid topic contract, bank equality, all 132 objective references, exact counts; generated vocabulary, coverage, image checklist and manifest agree. This validates missing-art metadata, not image decoding or scientific accuracy of future images.
- `npm run build`: pass. Current source and assets copied to `dist`; tests, curriculum reference image, screenshots, docs and logs are excluded.
- `/tests/browser.html`: **16/16 pass** using production styles, production GameEngine and the active Field Notes adapter. Coverage: all 132 teaching routes; all category/All paths; all reading cards; full sort/identify/knowledge completion and results; retry/score-once/explanation; queue interruption; independent picture toggles; normal spelling locks and distinct endings; reduced-motion spelling; exit during a lock; Flip 10/20/30, eight-word completion, teacher-paced mismatches and restoration; a real-duration Wheel spin and silent reveal; all 132 Wheel removals; M/F letter handling, Escape, mute and 12 repeated Home transitions; different six-item/two-category synthetic pack with changed title/assets and four-try configuration. The synthetic test exercises the same supported skin, not a second implementation.
- Wheel full-pool exhaustion deliberately uses **fixture-selected items**, not 132 real-duration spins. Reduced motion is a **fixture override of the engine predicate**, not a verified OS setting change. Keyboard events in that suite are simulated; production buttons were also clicked through browser automation.
- Flip layout fixture, all 10/20/30 boards, at **1280×720, 1024×600, 1366×900, 768×1024, 360×800**. No horizontal overflow in these measurements. Short-projector board bottoms: approximately 617 px at 1280×720, 497 px at 1024×600. Large phone boards intentionally scroll vertically (about 1128/1568 px before the final phone Home/button-size refinements). Text and dimensions were inspected; vocabulary picture sizing still needs rechecking after art import.
- Layout fixture for launch/menu/learn/sort/identify/knowledge/spelling/Wheel at **1024×600, 768×1024, 360×800**. A reading-fixture routing error was found and fixed separately from production. Rechecked reading at 1024×600. Fixed short-projector overflow in launch/sort/spelling, an inherited menu decoration that obscured titles, and the hidden mobile Home label. Rechecked the affected 1024×600 pages: no horizontal or vertical overflow. Phone menu and larger activities may scroll vertically.
- Visual inspection: settled 60-tile short-projector board with long and multi-word labels; desktop menu; long-word spelling on projector and phone; production mobile menu/Home; production Wheel during normal rotation and its settled text-only reveal. Flip was observed during its normal transform and after settling. Field Notes has short input locks and static outcome panels; there is no animal animation to certify.
- Production launch/menu/Wheel navigation and fullscreen state transition checked in the in-app browser. Production console inspection returned no warnings/errors at inspection time. Missing asset paths are not fetched, so zero failed runtime images does **not** mean artwork is complete.
- Repository reference: authenticated browser displayed GitHub latest `063f04c26522e1066e2127d256fceea012a9145c`, matching the local Little Bug Club HEAD. Its live launch and fixed menu were inspected. No pull or remote mutation performed; deployment commit identity was not independently verified.

Evidence is in `test-results/browser.txt`, `test-results/flip-layouts.json`, and menu screenshots. Fixtures are in `tests/` and use both production stylesheets. Run `node scripts/fixtures.mjs` after changing entry HTML. Preview logs are local only.

## Remaining limits and next work

- Supply and review the art described in IMAGE-CHECKLIST.md and ART-DIRECTION.md. The draft's text placeholders and text Flip/Wheel markers do not meet the final illustrated-learning acceptance requirement. No artwork accuracy, alpha, decoding or animal-motion clearance can be certified yet.
- Teacher approval of the expanded vocabulary, curriculum mapping, age fit and preferred terms is outstanding. Translation language was not supplied; translation practice stays teacher-led.
- No approved sound collection or sound-quiz adapter; Sound Detective stays locked.
- No real device testing, formal accessibility audit, actual offline-network test, real OS reduced-motion change or real background-tab lifecycle test was performed. CSS reduces motion and pauses decorative animation while hidden; navigation cancels scoped callbacks/effects. There is no idle scenery loop or sprite controller.
- Fairness queues persist only within the current page session; reloading starts fresh. All Words does not reset short-session queues; learning/Wheel begin fresh scope runs as documented in README.
- Importing art will require fresh layout checks, especially Flip image sizes, long labels, category cards, full phone pages and final Next controls. Do not reuse these text-only layout checks as proof of future artwork fit.

Keep the new game local until the user requests a specific external action. A later push and a verified deployment must be recorded as separate results.


## Menu thumbnails wired in (25 November 2026)

Codex painted 15 thumbnails from `docs/menu-art/codex-thumbnails.md` (originals, prompts and notes in `docs/menu-art/originals/`); the owner approved them.
- Game cards: `assets/painted/games/card-<id>.webp`, listed in READY in `src/topics/painted-art.js`. The Otter Dive banner on Home uses card-otter.
- Home tiles: `menu/home-activities.webp` and `menu/home-games.webp` (Activities no longer reuses the sort tile; Mammal Games no longer uses the cheetah photo).
- Arts & Crafts cards: `assets/painted/arts/card-*.webp` via `art:` in ARTS_SECTIONS.
- Result stars: `assets/menu/result-star-full-v1.webp` and `-empty-v1.webp`, the paths game-engine.js already asked for (they were 404 before).
- The wicker basket and lid (pick-basket-open/lid) are not used: Picture Pick only has the reel style. They are kept in originals for a basket picker later.

## Draw & Trace outlines and step plans (25 November 2026)

Codex drew 30 outlines from `docs/line-art/` (originals, prompts and notes in `docs/line-art/originals/`). The owner approved 29: all but **hard-04-beaver-lodge**, a redraw still waiting for a yes. The 29 are in READY in `src/topics/draw-trace-pictures.js`; the beaver's webp is in assets/line-art but hidden. Tracing PDFs for the 29 are in `assets/printables/tracing/` (`src/topics/tracing-printables.js`). When the beaver is approved, add it to READY and rebuild the PDFs.
- **Step plans (owner, 25 Nov: "randomly drawing different parts"):** without a plan the converter grouped lines by colour ("Draw the brown parts"), mixing walls, beams and bats. Every picture now has a hand-set plan in `src/topics/draw-trace-plans.js`: 3 steps on Easy, 6 on Medium, 10 on Hard, each a real part ("Draw the barn roof", "Hang the first bat"). A place is a box, a colour box, a `path` or a `ring` (paths and rings win over boxes near them; use them where one joined line runs through several parts, as in the monkeys' trunk and branches).
- **Converter fix** (`src/core/line-art.js`): lines were smoothed after being thinned to a few points, so every square corner (a barn wall meeting the floor) was pulled up to 115 px into a long diagonal. Now they are smoothed first, then thinned.
- **Check tool:** `/tools/art/plan-preview.html` converts each planned picture and colours every step, with stroke counts; it flags empty steps and wrong step counts. `?ids=a,b` picks pictures, `&big` shows one large panel.
- Insects' line-art.js probably has the same corner bug (not fixed there; that's another repo).
