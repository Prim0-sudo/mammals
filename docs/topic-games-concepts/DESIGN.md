# Mammal Games: design for all six (23 November 2026)

The owner liked all six concepts on the concept board and said to build them all. The board is concept-board.html, built from board.src.html. Six games, three education and three arcade, go in the Mammal Games folder as two rows of three. Otter Dive is the Home banner.

**How this gets approved.** The detailed preview is the game itself, playable in the app with the word pictures standing in for the final art. The owner approves movement and layout from recorded clips (Easy, Medium and Hard at desktop size, plus a phone clip). After that come the painted backgrounds and poses, a second approval, and the push. Nothing goes to `main` on GitHub before the owner approves, because the live site follows `main`.

## Shared rules (all six)

- **Built on the kit.** Every game extends `TopicGameView` in `src/core/topic-games-kit.js`, which gives it:
  - the level page (Easy, Medium and Hard cards, each with the best result, or "Not played yet");
  - the How to play popout and the centred results popout;
  - holds (Teacher, popouts, a hidden tab);
  - tracked tweens (`this.to`, `this.timeline`, `this.fromTo`) and `this.after(ms, fn)`, never bare timers;
  - `flyBetween`.
- **Back.** From the level page, Back goes to the Mammal Games folder. From play, Back goes to Levels. The kit does this.
- **Files for each game.** Each game owns its own files. Shared files are wired once by Main Mammals.
  - `src/topics/games/<id>.js`: the data, the per-level settings table (`SETTINGS`), a pure round builder `buildRound(level, rand)` and the pure rule helpers. No DOM.
  - `src/topics/games/<id>-rules.js`: `RULES`, an array of `{ title, items }` sections (How to play / Levels / Stars, plus Controls for arcade games). The level numbers come from `SETTINGS`, never typed in.
  - `src/core/games/<id>-view.js`: `export class View extends TopicGameView`. It implements `levelArt(level)`, `levelNote(level)` and `play()`, plus `bestText(b)` for arcade games, which keep their best points.
  - `src/styles/games/<id>.css`: every selector starts with `.ig-card--<id>`.
  - `tests/games-<id>.test.js`: `node:test` tests for the round builder and rules. Rounds are seeded with `seeded(n)` from `src/topics/topic-games.js`, so they replay exactly.
- **Rounds.** Round builders take `rand`. A round never contains two answers that could both be right: partly true answers are never scored, so the builder leaves out any visitor, home or mother that would be ambiguous.
- **Stars.**
  - Education games use `roundStars(slips, two)`: 3 stars with no slips.
  - Arcade games score points. Their star thresholds per level come from a play simulation written as a test, not from guesses. They keep the best points: `game.saveGameBest(id, level, points)`.
- **Results.** `showResults({ title, stars, lines, best, bestLine })`, with a game-specific heading, such as "Super vet!" or "Everyone is home!".
- **Words.** Word pictures come from `this.art(id)`, which uses the word ids in `src/topics/mammals.js`. A game names a word only if the word list has it. A word the child taps or sees in a label is spoken with the app's word audio when it exists: `this.game.say?.(id)` or the engine's existing speech call.
- **Input.** Each game has three ways to play: tap or click, keyboard, and drag where it makes sense. A drag always has a tap-then-tap path too. Focus rings must be visible. Keyboard and screen readers get `role` and `aria-label` on every control.
- **Phone (390 × 844 portrait).**
  - No sideways scrolling, and words at least 14 px.
  - Primary controls sit next to the timer or count, above the playfield, never below it.
  - Arcade stages letterbox inside the card; they are not stretched.
- **Reduced motion.** No travel tweens: things jump to their end state, with a short fade at most. Arcade games still play, with movement driven by input only and no camera shake or zoom.
- **Look.** Topic-game colours and results styling differ from the core games on purpose. Each game has a background tint of its own until its painted scene arrives. `this.layered(host, key)` mounts it when it is READY.
- **No visible Pause.** The kit's holds cover Teacher, popouts and hidden tabs.

## 1. Mammal Check-up (education) — id `checkup`

- **Goal.** Know the three signs of a mammal: hair or fur, breathing air, and feeding babies milk. Animals that live in water can be mammals; animals that lay eggs can be too.
- **Picture.** A vet's room. A visitor stands on the exam table. Three check buttons stand to the side: Hair or fur? (the `fur` picture), Breathes air? (`lungs`) and Milk for babies? (`milk`). There is a check card, and two stamps: Mammal and Not a mammal.
- **Actions.**
  1. Tap a check. The check runs on the visitor, and its answer appears on the card with a short reason, such as "Feathers, not fur" or "Breathes through its blowhole".
  2. After all three checks, the stamps unlock. Tap one.
- **Right answer.** A mammal gets yes to all three, and anything else gets "Not a mammal". The card stamps, the visitor says thank you and leaves, and the next visitor comes in.
- **Wrong stamp.** It costs one slip. The card says why ("A whale breathes air and feeds its calf milk. It is a mammal."), and the visitor stays until it is stamped right.
- **Visitor data.** Each visitor has `{ id, mammal, hair: [yes, reason], air: [yes, reason], milk: [yes, reason], tricky }`. The pool:
  - **Mammals:** dog, cow, rabbit, horse, elephant, kangaroo (all plain); whale, dolphin, seal (sea); bat (flies); hedgehog (its spines are stiff hairs); platypus and echidna (they lay eggs but feed milk).
  - **Not mammals:** frog, duck, chicken, fish, goldfish, snake, lizard, tortoise (plain); penguin, shark, crocodile, turtle, owl (tricky).
- **Levels.**

  | Level | Visitors | Mix | Help |
  |---|---|---|---|
  | Easy | 4 | 2 mammals and 2 not, all plain | The next check glows |
  | Medium | 6 | 3 mammals (one from the sea) and 3 not (one from the sea) | Reasons are shown |
  | Hard | 6 | Mostly tricky: platypus or echidna, bat or hedgehog, whale or dolphin; penguin, shark, crocodile | No glow |

- **Stars.** `roundStars(slips, 1)`.
- **Input.** Tap a check, then tap a stamp. With the keyboard, Tab moves through the checks and stamps, and Enter presses. Keys 1, 2 and 3 run the checks; M and N stamp.
- **Phone.** The visitor fills the top half. Under it, the three checks sit in a row, each showing its answer once run. The two stamps are wide buttons under them, and the card's reason line sits above the stamps.
- **Animation (GSAP).**
  - The visitor slides in.
  - Running a check moves a small tool picture along a MotionPath curve to the visitor, gives a short pulse, and drops the answer onto the card.
  - The stamp lands with back.out.
  - With reduced motion, answers and the stamp appear with no movement.

## 2. Home Before Dark (education) — id `homes`

- **Goal.** Know the home words: warren, sett, drey, holt, lodge, den, roost, nest and tree hollow. Farm homes on Hard: stable, kennel and hutch.
- **Picture.** A path network at dusk. Walkers enter at the start and come to switches where the path splits in two. The home pictures stand at the ends, each labelled.
- **Actions.**
  - Tap a switch to flip it up or down. Each walker follows the switches.
  - A switch locks while a walker is on its junction.
- **Right home.** The walker goes in, says "Home in its warren!", and one star of the dusk sky lights up.
- **Wrong home.** It costs one slip. The walker sniffs, says "This is a sett. A rabbit lives in a warren.", then walks back to the start and tries again.
- **Pairs.**
  - **Wild:** rabbit–warren, badger–sett, red squirrel or squirrel–drey, otter–holt, beaver–lodge, fox–den, bat–roost, harvest mouse–nest, pine marten–tree hollow.
  - **Farm (Hard only):** horse–stable, dog–kennel, guinea pig–hutch.
  - A round never pairs one walker with two homes on the board.
- **Network.** A full binary tree from the left, with the homes on the right:
  - 3 homes: 2 switches (1 then 1).
  - 5 homes: 4 switches.
  - 7 homes: 6 switches.
  - The builder chooses which homes are on the board and where. Every home on the board gets at least one walker.
- **Levels.**

  | Level | Homes | Walkers in the round | On the paths at once | Help | Dusk |
  |---|---|---|---|---|---|
  | Easy | 3 | 5 | 1 | A thought bubble shows the home's picture | 90 s |
  | Medium | 5 | 7 | 2, staggered | Names only | 100 s |
  | Hard | 7 | 9 | 3 | Wild and farm homes mixed | 110 s |

  When dusk ends, walkers still out go home on their own. They count as missed, but not as slips.
- **Stars.** `roundStars(slips + missed, 2)`.
- **Input.** Tap or click a switch. With the keyboard, Tab or the arrow keys move between switches and Space flips. A walker's name is read out when it enters.
- **Phone.** The tree turns to run top to bottom: the start is at the top and the homes are along the bottom. Seven homes sit in two staggered rows of 4 and 3, so labels stay at 14 px or more. Switches are 44 px touch targets.
- **Animation.**
  - Walkers move along MotionPath on the real path data, at constant speed.
  - The switch arrow rotates and the active branch lights.
  - The sky darkens over the round, and the stars come out.
  - With reduced motion, walkers step from node to node with a short fade, and the sky changes in steps.

## 3. Nursery Round-up (education) — id `nursery`

- **Goal.** Know the young-animal words: joey, calf, lamb, foal, kid, piglet, fawn, kitten, puppy, pup and cub. Mothers feed their babies milk.
- **Picture.** A meadow. The babies wander gently in the top half. The mothers stand along the bottom, with their names.
- **Actions.**
  - Tap a baby to select it, then tap its mother. You can also drag the baby onto its mother.
  - With the keyboard, Tab through the babies and press Enter, then Tab or the arrow keys through the mothers and press Enter. Esc drops the selection.
- **Right mother.** The baby runs to her along a MotionPath curve, and a line plays, such as "A joey drinks milk in its mother's pouch". On Easy the baby's name is spoken.
- **Wrong mother.** It costs one slip. The mother says who she is ("I'm a sheep. A calf's mother is a cow."), the baby goes back, and the selection clears.
- **Pairs.** kangaroo–joey, cow–calf, sheep–lamb, horse–foal, goat–kid, pig–piglet, deer–fawn, cat–kitten, dog–puppy, seal–pup and bear–cub. The lion–cub and elephant–calf pairs are left out: they give "cub" and "calf" two mothers. A round never holds two mothers whose babies share a name.
- **Levels.**

  | Level | Pairs | How babies show |
  |---|---|---|
  | Easy | 3 | Picture and name |
  | Medium | 5 | Picture and name |
  | Hard | 6 | Name card only, no picture, so the child reads "foal" and finds the horse |

- **Stars.** `roundStars(slips, 2)`.
- **Phone.** The meadow sits on top, with the babies in a 3-across grid. The mothers sit under it in a 3-across grid: two rows on Medium and Hard. The whole card fits 390 × 844 with no scrolling.
- **Animation.**
  - The babies bob gently, each with a different timing, using tracked tweens.
  - A selected baby gets a ring.
  - The run home follows a MotionPath arc, and the mother gives a small nuzzle.
  - With reduced motion there is no bob, and the baby appears beside its mother.

## 4. Otter Dive (arcade, Home banner) — id `otter`

- **Goal.** Feel that mammals breathe air even in water. Words: swim, dive, breathe, whiskers and holt.
- **Picture.** A side-on river. Sky and bank show above the surface line, at about 22% of the stage height, with the riverbed at the bottom. The otter stays near 25% of the width and moves up and down; the river scrolls left.
- **Air.**
  - The air bar drains under water and fills again in one second at the surface.
  - When the air runs out, the otter is lifted to the surface with "Out of breath! Up for air." and loses one life. It never drowns.
- **Things in the river.**
  - **Fish:** worth 10 points each. Each extra fish caught on the same dive raises the dive combo, up to ×4.
  - **Snags (branches) and litter:** bumping one loses a life, gives a short blink, and breaks the combo.
  - **Fishing line (Hard):** a thin vertical line that moves across the river slowly.
- **Lives.** 3. The round ends at the holt when the time is up, or when the lives run out.
- **Levels.**

  | Level | River speed | Full breath | Snags and litter | Water | Time |
  |---|---|---|---|---|---|
  | Easy | slow | 12 s | few | clear | 60 s |
  | Medium | medium | 9 s | more | clear | 75 s |
  | Hard | fast | 7 s | many, plus a fishing line | muddy | 90 s |

  In muddy water only a whisker ring round the otter shows the fish; everything else is faint.
- **Stars and best.** Points, with star thresholds per level from a simulation test. The best points are kept.
- **Controls.** Arrow Up and Down or W and S, the mouse's height over the stage, or a touch drag anywhere on the stage (the otter follows your finger).
- **Phone.** The stage is about 390 × 480, deeper than wide. The air bar, lives and points sit above it.
- **Animation.**
  - The loop runs on `gsap.ticker`, added on play and removed in `onReset`, and it stops while a hold is on.
  - The river layers scroll at different speeds.
  - With reduced motion the background doesn't scroll; obstacles still move.

## 5. Burrow Dash (arcade) — id `dash`

- **Goal.** Words: predator, prey, hide, burrow, warren and plant-eater. A rabbit is prey, and hiding keeps it safe.
- **Picture.** A side-on meadow. The rabbit runs right at a steady speed (the world scrolls). Burrow holes, stones and leaves come along.
- **Actions.**
  - **Hop** (Space or tap) jumps a stone or log.
  - **Hide** (Down, a swipe down, or the Hide button) works only near a burrow; a ring shows the hole is close. The rabbit stays in the burrow until the danger passes, then pops out on its own.
  - Leaves are worth 10 points each.
- **Dangers.**
  - **Eagle:** a cry and a growing shadow give the warning; then the eagle swoops.
  - **Fox (Medium and Hard):** it trots in from the right, crouched.
  - Not hiding in time loses a life. Bumping a stone loses a life too.
- **Lives.** 3. The round ends at dusk.
- **Levels.**

  | Level | Warning | Gap between burrows | Dangers | Time |
  |---|---|---|---|---|
  | Easy | 3 s | about 4 s | eagle only | 60 s |
  | Medium | 2.2 s | about 5 s | eagle and fox | 75 s |
  | Hard | 1.6 s | about 6 s | eagle and fox, faster run | 90 s |

- **Stars and best.** Points; thresholds from a simulation.
- **Phone.** A landscape stage, letterboxed. Hop and Hide buttons sit beside the points, above the stage.
- **Animation.** The loop runs on `gsap.ticker`. A hop is a tracked tween arc. With reduced motion there is no parallax, and the hop is a quick up-and-down.

## 6. Bat Night Hunt (arcade) — id `bat`

- **Goal.** Words: nocturnal, listen, bat and fly. Bats find food by sound.
- **Picture.** A dark wood at night with a moon. The bat flies freely in two dimensions. Moths and branches are almost invisible.
- **Echo.** Space, a tap of the Echo button, or a double-tap on the stage sends rings out from the bat. Things the rings pass light up, then fade over the "seen" time. Echo has a cooldown of 1.2 s.
- **Moths.** Worth 10 points each. A streak builds within one echo, up to ×3.
- **Dangers.**
  - **Branches (Medium and Hard):** they stay put; bumping one loses a life.
  - **Owl (Hard):** it glides slowly across. Bumping it loses a life.
- **Lives.** 3. The round ends at dawn.
- **Levels.**

  | Level | Seen for | Moth speed | Dangers | Help | Night |
  |---|---|---|---|---|---|
  | Easy | 2.5 s | slow | none | An automatic echo every 3 s, as well as your own | 60 s |
  | Medium | 1.8 s | medium | branches | — | 75 s |
  | Hard | 1.2 s | fast | branches and an owl | — | 90 s |

- **Stars and best.** Points; thresholds from a simulation.
- **Controls.** Arrow keys or W A S D; the mouse (the bat flies toward the pointer); a touch drag. Space or the Echo button sends an echo.
- **Phone.** A stage of about 390 × 480. The Echo button sits beside the points and lives, above the stage.
- **Animation.** The loop runs on `gsap.ticker`, and the rings are tracked tweens. With reduced motion the rings are drawn at full size and fade, with no growing.
