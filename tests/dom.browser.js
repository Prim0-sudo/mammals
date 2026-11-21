import { topic } from "../src/topics/mammals.js";
import { GameEngine } from "../src/core/game-engine.js";
import { applyTheme } from "../src/core/theme.js";
import { assetPaths } from "../src/core/topic-validator.js";
import { getSkin } from "../src/core/skins/index.js";
import { eligible } from "../src/core/logic.js";
import { sortingRules, sortingGroup, sortingPool } from "../src/topics/sorting.js";
const eligibleCount = (mode) => eligible(topic, mode).length;
// Mammals: groups with no words yet are "Coming soon" cards (topic.showEmptyGroups), not choices.
const liveGroups = topic.categories.filter((c) => topic.items.some((x) => x.categoryId === c.id)).length;
const report = document.getElementById("report"),
  results = [];
const assert = (condition, message) => {
  if (!condition) throw Error(message);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (condition) => {
  const end = performance.now() + 6000;
  while (!condition()) {
    if (performance.now() > end) throw Error("Timed out waiting for UI");
    await wait(30);
  }
};
const q = (selector) => document.querySelector(selector),
  qa = (selector) => [...document.querySelectorAll(selector)];
const click = (selector) => {
  const el = q(selector);
  assert(el, "Missing " + selector);
  assert(!el.disabled, "Disabled " + selector);
  el.click();
};
const test = async (name, fn) => {
  // Each check starts without saved rounds, so one check never resumes another.
  if (typeof game !== "undefined") Object.assign(game.progress.data, { rounds: {}, learn: {} });
  try {
    await fn();
    results.push("PASS " + name);
  } catch (e) {
    results.push("FAIL " + name + ": " + e.message);
  }
  report.textContent = results.join("\n");
};
applyTheme(topic);
try { localStorage.removeItem("ludimi.mammals-test.progress.v1"); } catch {}
const game = new GameEngine(topic, { progressId: "mammals-test" });
game.init();
game.audio.muted = true;
game.reduced = () => true;
await getSkin("homeward-trail").prepare(topic.modeSkins.spelling);
await test("Launch, v6.1 Home, Activities folder and Home button", () => {
  assert(qa(".home-tile").length === 0, "Menu shown on launch");
  // Mammals launch (21 November 2026): the rabbit badge is the emblem until the layered landing is painted.
  assert(q(".launch-emblem-image")?.src.includes("club-badge-rabbit"), "Rabbit badge emblem missing");
  const launchButton = q(".launch-explore");
  assert(launchButton?.tagName === "BUTTON", "Explore is not a real button");
  assert(launchButton.querySelector(".launch-emblem, .launch-emblem-image") && launchButton.querySelector("strong").textContent === "Explore", "Explore label or emblem missing");
  assert(q(".launch-tagline")?.textContent === topic.subject, "Tagline pill missing");
  assert(!q(".launch-badge") && !q(".field-note"), "Old launch card still shown");
  click('[data-action="launch"]');
  assert(qa(".home-grid .home-tile").length === 8, "Home needs eight tiles");
  assert(q(".featured-game"), "Featured banner missing");
  click('.home-grid [data-tile="activities"]');
  assert(qa(".folder-tile").map((x) => x.dataset.mode).join() === "sort,detective,identify,spelling,flip,wheel", "Activities folder order");
  click('[data-mode="detective"]');
  assert(q("h1").textContent === "Choose your picture clues" && q(".back-button").textContent.trim() === "Activities", "Detective setup");
  click('[data-action="back"]');
  assert(game.state.screen === "activities", "Back to Activities");
  click("#home");
  assert(q(".launch-explore"), "Home failed");
});
await test("All vocabulary assets decode, plus all scene/category/menu assets", async () => {
  for (const path of assetPaths(topic)) {
    const image = new Image();
    image.src = path;
    await image.decode();
    assert(
      image.naturalWidth > 0 && image.naturalHeight > 0,
      "Bad dimensions " + path,
    );
  }
});
await test("Category learning completes every word with focus on results", () => {
  const items = topic.items.filter((x) => x.categoryId === "mammals");
  game.start("learn");
  assert(
    qa("[data-category]").length === liveGroups + 1 && qa(".category-card--soon").length === topic.categories.length - liveGroups && q(".category-card").dataset.category === "all",
    "Missing categories or All Words first",
  );
  click('[data-category="mammals"]');
  // Families layer: All Mammals first, then each family.
  assert(game.state.stage === "families" && q("[data-family]").dataset.family === "mammals", "Family picker missing or All Mammals not first");
  click('[data-family="mammals"]');
  for (const item of items) {
    assert(q(".vocab-word").textContent === item.name, "Sequence mismatch");
    click('[data-action="next"]');
  }
  assert(game.state.screen === "results", "Not completed");
  assert(
    q(".result-score").textContent.includes(String(items.length)),
    "Wrong score",
  );
  assert(document.activeElement.tagName === "H1", "Result focus");
  click('[data-action="again"]');
  assert(
    qa("[data-category]").length === liveGroups + 1,
    "Replay lost picker",
  );
});
await test("Back restores focus to selected category; Escape exits picker", () => {
  game.chooseCategory("mammals");
  game.back();
  assert(document.activeElement.dataset.family === "mammals", "Back did not return to the family picker");
  game.back();
  assert(
    document.activeElement.dataset.category === "mammals",
    "Wrong category focus",
  );
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  assert(game.state.screen === "menu", "Escape failed");
});
await test("Sort It: picture-pair rules, whole rule pool and gentle retry flow", () => {
  game.start("sort");
  assert(q("h1").textContent === "What shall we sort?" && qa(".sort-card").length === sortingRules.length, "Sort rules picker missing");
  assert(qa(".sort-card__art").length === sortingRules.length * 2, "Each sort card needs a picture pair");
  click('[data-sort-info="mammal-or-not"]');
  assert(q(".sort-info[open]") && q(".sort-info__note").textContent.includes("milk"), "Sort note did not open");
  click("[data-sort-info-close]");
  const rule = sortingRules.find((r) => r.id === "land-or-water"), pool = sortingPool(rule, topic.items);
  click(`[data-sort-rule="${rule.id}"]`);
  assert(game.state.items.length === pool.length, "Missing words");
  assert(q(".back-button").textContent.trim() === "Sorting rules", "Back is not named Sorting rules");
  assert(qa(".sort-play .answer").length === 2 && qa(".sort-play .answer-art").length === 2, "Sort needs two picture answers");
  const answer = (i) => sortingGroup(rule, game.state.items[i]).id;
  const wrong = rule.groups.find((g) => g.id !== answer(0)).id;
  click(`[data-answer="${wrong}"]`);
  assert(game.state.score === 0, "Wrong answer scores");
  assert(!game.state.answered, "Retry locked");
  click(`[data-answer="${answer(0)}"]`);
  assert(game.state.answered && game.state.score === 0, "Retry score wrong");
  click('[data-action="continue"]');
  for (let i = 1; i < game.state.items.length; i++) {
    click(`[data-answer="${answer(i)}"]`);
    click('[data-action="continue"]');
  }
  assert(game.state.screen === "results", "Sort incomplete");
  assert(game.state.score === pool.length - 1, "Sort score wrong");
  click('[data-action="again"]');
  assert(game.state.category === rule.id && game.state.index === 0, "Next session lost the sort");
  game.back();
  assert(document.activeElement.dataset.sortRule === rule.id, "Back did not return to the rule");
});
await test("Detective: reveal styles, guess, practice reveal and one star per first-try guess", () => {
  game.start("detective");
  assert(q("[data-setup-kind]").value === "mosaic" && q("[data-setup-duration]").value === "45", "Detective defaults are Mosaic and 45 seconds");
  click('[data-action="detective-begin"]');
  assert(game.state.items.length === eligibleCount("detective"), "Detective should offer every picture");
  assert(q("#round-count").textContent === `Picture 1/${game.state.items.length}`, "Picture label missing");
  assert(qa(".detective-mosaic i").length === 120, "Mosaic needs 120 tiles");
  assert(q(".detective-answers").hidden, "Answers show before Guess");
  click("[data-start]");
  assert(q("[data-start]").textContent === "Stop reveal", "Reveal did not start");
  click("[data-guess]");
  assert(!q(".detective-answers").hidden && qa("[data-detective-answer]").length === 3, "Guess needs three word answers");
  assert(!game.view.reveal.running, "Guess did not stop the reveal");
  const item = game.state.items[0];
  click(`[data-detective-answer="${item.id}"]`);
  assert(game.state.score === 1 && game.state.answered, "First-try guess earns a star");
  click('[data-action="continue"]');
  click("[data-reveal]");
  assert(game.view.reveal.assisted && q(".detective-mosaic").hidden, "Reveal picture did not show it");
  click(`[data-detective-answer="${game.state.items[1].id}"]`);
  assert(game.state.score === 1, "A revealed picture still earned a star");
  click('[data-action="continue"]');
  q("[data-kind]").value = "pixel";
  q("[data-kind]").dispatchEvent(new Event("change"));
  assert(game.view.reveal.kind === "pixel" && q(".detective-mosaic").hidden, "Reveal style did not change in play");
  game.start("detective");
  const outline = q('[data-setup-kind] option[value="silhouette"]');
  assert(outline.disabled && outline.textContent.includes("coming soon"), "Silhouette must wait for whole-animal cut-outs");
  game.detectiveSettings = { kind: "mosaic", duration: 45 };
  game.menu();
});
await test("Three image choices, central target, independent toggles and labels", () => {
  game.start("identify");
  click('[data-count="10"]');
  assert(qa(".answer").length === 3, "Choice count");
  click('[data-action="target-toggle"]');
  assert(
    q(".identify-target").classList.contains("concealed"),
    "Target visible",
  );
  assert(
    !q(".answers").classList.contains("conceal-answers"),
    "Answers toggled together",
  );
  click('[data-action="answers-toggle"]');
  assert(
    q('[data-action="answers-toggle"]').getAttribute("aria-pressed") ===
      "true",
    "Missing toggle state",
  );
  assert(
    qa(".answer span").every((x) => x.textContent),
    "Labels disappeared",
  );
  click(`[data-answer="${game.state.items[0].id}"]`);
  click('[data-action="target-toggle"]');
  assert(game.state.answered, "Toggle unlocked answered state");
  click('[data-action="continue"]');
  assert(
    q(".answers").classList.contains("conceal-answers"),
    "Teacher preference lost",
  );
});
await test("Knowledge & Safety: group picker with All, Staying Safe and every group's questions", () => {
  game.start("knowledge");
  const cards = qa("[data-knowledge-group]").map((el) => el.dataset.knowledgeGroup);
  assert(cards[0] === "all" && cards[1] === "safety", "All and Staying Safe come first");
  const groups = topic.categories.filter((c) => topic.knowledgeQuestions.some((x) => x.groupId === c.id)).map((c) => c.id);
  assert(cards.slice(2).join() === groups.join(), "Groups in teaching order");
  assert(topic.knowledgeQuestions.length >= 50, "Question bank too small");
  const safe = topic.knowledgeQuestions.filter((x) => x.safe);
  assert(safe.length >= 6 && q('[data-knowledge-group="safety"] .count-pill').textContent === safe.length + " questions", "Staying Safe count");
  for (const id of groups) {
    const n = topic.knowledgeQuestions.filter((x) => x.groupId === id).length;
    assert(q(`[data-knowledge-group="${id}"] .count-pill`).textContent === `${n} ${n === 1 ? "question" : "questions"}`, "Count for " + id);
  }
  click('[data-knowledge-group="safety"]');
  assert(game.state.items.length === safe.length && game.state.items.every((x) => x.safe), "Staying Safe plays every safety question");
  assert(q('[data-action="back"]').textContent.trim() === "Categories", "Back names the picker");
  click('[data-action="back"]');
  assert(document.activeElement.dataset.knowledgeGroup === "safety", "Focus returns to the group");
  game.dropRound("knowledge");
  click('[data-knowledge-group="all"]');
  for (let i = 0; i < topic.knowledgeQuestions.length; i++) {
    const item = game.state.items[i];
    if (item.visualItemId)
      assert(
        q(".clue-art").getAttribute("src") ===
          topic.items.find((x) => x.id === item.visualItemId).image,
        "Wrong mapped visual",
      );
    else assert(!q(".clue-art"), "Answer giveaway visual");
    click(`[data-answer="${item.correctChoiceId}"]`);
    assert(
      q("#feedback").textContent.includes(item.explanation),
      "Explanation missing",
    );
    click('[data-action="continue"]');
  }
  assert(game.state.screen === "results", "Quiz incomplete");
});
await test("Homeward Trail: spaces kept, a right letter hops the rabbit (full checks in tests/homeward.html)", () => {
  game.start("spelling");
  game.state.items = [topic.items.find((x) => x.id === "guinea-pig")];
  game.round();
  assert(qa(".word-part").length === 2, "Space lost");
  assert(q(".homeward-trail") && qa(".chance-token").length === 9, "Trail scene or nine chances missing");
  game.guess("g");
  assert(game.state.guessed.includes("g"), "Right letter not taken");
  game.menu();
});
await test("Every Flip size keeps a mismatch open until the next click", async () => {
  for (const n of [10, 20, 30]) {
    game.start("flip");
    click(`[data-count="${n}"]`);
    assert(qa(".tile").length === n * 2, "Tile count");
    const a = game.state.tiles[0],
      b = game.state.tiles.find((t) => t.item.id !== a.item.id),
      next = game.state.tiles.find((t) => t.id !== a.id && t.id !== b.id);
    click(`[data-tile="${a.id}"]`);
    click(`[data-tile="${b.id}"]`);
    assert(qa(".tile.open").length === 2, "Both tiles must flip");
    assert(!game.state.locked, "Mismatch should accept the next click");
    await wait(540);
    assert(
      qa(".tile.open").length === 2,
      "Mismatch closed without another click",
    );
    click(`[data-tile="${next.id}"]`);
    assert(
      qa(".tile.open").length === 1 && next.open,
      "Next tile did not replace the mismatch",
    );
  }
});
await test("The groups and the full word set are selectable", () => {
  game.start("learn");
  assert(qa("[data-category]").length === liveGroups + 1, "Expected All Words plus every group");
  assert(q('[data-category="body"]').textContent.includes("23 words"), "Body words missing");
  click('[data-category="body"]');
  if (game.state.stage === "families") click('[data-family="body"]');
  assert(game.state.items.length === 23, "Body group is incomplete");
  game.start("identify");
  click('[data-count="all"]');
  assert(game.state.items.length === topic.items.length, "Full set missing from Which One Is It?");
  game.start("flip");
  click('[data-count="10"]');
  assert(game.state.items.length === 10, "Full set is not available in Flip");
});
await test("Flip completes every pair and exposes results", async () => {
  game.start("flip");
  game.startFlip(10);
  for (const item of game.state.items) {
    click(`[data-tile="${item.id}-a"]`);
    click(`[data-tile="${item.id}-b"]`);
    await wait(530);
  }
  assert(qa(".tile.matched").length === 20, "Pairs missing");
  click('[data-action="continue"]');
  assert(game.state.screen === "results", "No results");
});
await test("Leaving a Flip comparison cancels its pending callback", async () => {
  game.start("flip");
  game.startFlip(10);
  click(`[data-tile="${game.state.tiles[0].id}"]`);
  click(`[data-tile="${game.state.tiles[1].id}"]`);
  game.menu();
  await wait(550);
  assert(
    game.state.screen === "menu" && qa(".home-grid .home-tile").length === 8,
    "Stale callback changed menu",
  );
});
await test("Picture Pick: Picture Reel, reading card, every word once", async () => {
  const total = topic.items.length,
    capacity = topic.sessions.wheel.capacity;
  game.start("wheel");
  assert(q("h1").textContent === "Which words shall we pick?", "Picture Pick group picker");
  click('[data-category="all"]');
  assert(game.state.wheelPool.length === capacity, "Wrong capacity");
  assert(q("h1").classList.contains("sr-only") && q("#round-count").textContent === `Words 0/${total}`, "Picture Pick has no title and counts words");
    assert(qa(".reel-card").length === capacity * 6 && q(".reel-frame"), "Reel strip must be six sets with a frame");
  assert(!q(".pick-switch") && !q(".bug-jar"), "Only the Picture Reel until a Mammals container style is drawn");
  const seen = new Set();
  for (let i = 0; i < total; i++) {
    click('[data-action="spin"]');
    await until(() => q(".pick-word"));
    assert(q(".pick-card img") && q('[data-action="listen"]'), "Reading card needs picture and Listen");
    assert(q(".pick-card .definition").textContent === game.state.selected.definition, "Reading card needs the definition");
    seen.add(q(".pick-word").textContent);
    if (i === 0) {
      click('[data-action="wheel-next"]');
      assert(q("#round-count").textContent === `Words 1/${total}`, "Words label must count up on Next");
      continue;
    }
    click('[data-action="wheel-next"]');
  }
  assert(seen.size === total, "Lost or repeated Picture Pick word");
  assert(game.state.screen === "results", "Final word did not finish");
  assert(game.state.score === total, "Picture Pick score wrong");
});
await test("Leaving a moving Picture Pick cancels the reveal; mute works while speech unavailable", async () => {
  game.start("wheel");
  game.chooseCategory("movement");
  game.reduced = () => false;
  game.spin();
  assert(game.state.spinning && q('[data-action="spin"]').disabled, "Pick must lock while picking");
  game.back();
  game.reduced = () => true;
  await wait(220);
  assert(qa("[data-category]").length === liveGroups + 1, "Stale reveal changed picker");
  game.audio.speak("");
  game.mute();
  assert(
    q("#mute").getAttribute("aria-pressed") === String(game.audio.muted),
    "Mute state inconsistent",
  );
});
await test("Reduced motion avoids confetti and has stable spelling outcomes", () => {
  game.confetti(20);
  assert(q("#effects").children.length === 0, "Confetti on reduced motion");
});
await test("Rendered controls have accessible names and images have alt attributes", () => {
  assert(
    qa("button").every((el) =>
      (el.getAttribute("aria-label") || el.textContent).trim(),
    ),
    "Unnamed button",
  );
  assert(
    qa("img").every((el) => el.hasAttribute("alt")),
    "Missing alt",
  );
  assert(
    q("#announcer").getAttribute("role") === "status",
    "Missing live feedback",
  );
});
await test("No speech API remains playable and All Words Back restores focus", () => {
  const descriptor = Object.getOwnPropertyDescriptor(window, "speechSynthesis");
  try {
    Object.defineProperty(window, "speechSynthesis", {
      value: undefined,
      configurable: true,
    });
    game.audio.muted = false;
    game.audio.speak("Test word");
    game.start("identify");
    click('[data-count="10"]');
    assert(q(".identify-target img"), "Visual clue missing without speech");
  } finally {
    if (descriptor)
      Object.defineProperty(window, "speechSynthesis", descriptor);
    else delete window.speechSynthesis;
  }
  game.start("wheel");
  game.chooseCategory("all");
  game.back();
  assert(
    document.activeElement.dataset.category === "all",
    "All Words focus lost",
  );
  game.menu();
});

await test("Read & talk prompts moved to Knowledge & Safety concept checks", () => {
  game.start("learn");
  assert(!q('[data-action="reading"]'), "Read & talk button still on Meet the Words");
  const ids = new Set(topic.knowledgeQuestions.map((x) => x.id));
  for (const id of ["name-giraffe", "zebra-stripes", "kangaroo-move", "whiskers-use", "trunk-use", "polar-home", "pet"])
    assert(ids.has(id), "Concept check missing: " + id);
  game.menu();
});
await test("Leaving a short round keeps its place on the device; the same count resumes it", () => {
  game.queues = {};
  game.start("identify");
  click('[data-count="10"]');
  const original = [...game.state.items],
    first = original[0];
  click('[data-answer="' + first.id + '"]');
  game.menu();
  const wordCount = eligibleCount("identify");
  const stored = JSON.parse(localStorage.getItem(game.progress.key));
  assert(stored.version === 1 && stored.rounds.identify?.index === 1 && stored.rounds.identify.items.length === 10, "Round not saved on the device");
  assert(stored.cycles.identify.length === wordCount - 10, "Cycle not saved on the device");
  click('.home-grid [data-tile="activities"]');
  assert(q('[data-mode="identify"] .continue-badge')?.textContent === "Continue", "Which One Is It? tile has no Continue badge");
  assert(!q('[data-mode="flip"] .continue-badge'), "Unplayed game shows Continue");
  click('[data-mode="identify"]');
  click('[data-count="10"]');
  assert(game.state.index === 1 && game.state.score === 1, "Did not resume at the first unfinished word");
  assert(game.state.items.map((x) => x.id).join() === original.map((x) => x.id).join(), "Resumed round changed its words");
  assert(q("#round-count").textContent.includes("2/10"), "Progress not resumed");
  game.menu();
  game.start("identify");
  click('[data-count="all"]');
  assert(game.state.items.length === wordCount, "All Words omitted extensions");
  assert(game.queues.identify.length === wordCount - 1, "A different count lost the unplayed words");
  game.menu();
  assert(game.queues.identify.length === wordCount - 1, "All mode discarded short queue");
  game.start("sort");
  click('[data-sort-rule="home-or-food"]');
  click('[data-answer="' + sortingGroup(sortingRules[2], game.state.items[0]).id + '"]');
  const sortWords = game.state.items.map((x) => x.id).join();
  game.activities();
  assert(q('[data-mode="sort"] .continue-badge'), "Sort tile has no Continue badge");
  click('[data-mode="sort"]');
  click('[data-sort-rule="home-or-food"]');
  assert(game.state.index === 1 && game.state.items.map((x) => x.id).join() === sortWords, "Sort round not resumed");
  game.menu();
});
await test("Meet the Words, Flip, Picture Pick and Knowledge keep their place", async () => {
  game.start("learn");
  game.chooseCategory("mammals");
  click('[data-action="next"]');
  click('[data-action="next"]');
  game.menu();
  assert(q('.home-grid [data-tile="learn"] .continue-badge'), "Meet the Words tile has no Continue badge");
  game.start("learn");
  game.chooseCategory("mammals");
  assert(game.state.index === 2, "Group did not reopen at its last card");
  game.back();
  game.chooseCategory("all");
  assert(game.state.index === 0, "Another group borrowed the last card");

  game.start("flip");
  game.startFlip(10);
  const pair = game.state.tiles.filter((t) => t.item.id === game.state.tiles[0].item.id);
  game.flip(pair[0].id);
  game.flip(pair[1].id);
  await until(() => game.state.matches === 1);
  const board = game.state.tiles.map((t) => t.id).join();
  game.activities();
  assert(q('[data-mode="flip"] .continue-badge'), "Flip tile has no Continue badge");
  game.start("flip");
  game.startFlip(10);
  assert(game.state.tiles.map((t) => t.id).join() === board && game.state.matches === 1 && game.state.turns === 1, "Flip board not resumed");
  assert(qa(".tile.matched").length === 2 && q(".flip-turns b").textContent === "1", "Found pair not shown on the resumed board");
  game.startFlip(20);
  assert(game.state.matches === 0 && game.state.tiles.length === 40, "Another board size resumed the wrong board");

  game.start("wheel");
  game.chooseCategory("all");
  game.spin();
  await until(() => q(".pick-word"));
  const picked = game.state.selected.id;
  game.nextWheel();
  game.menu();
  game.start("wheel");
  game.chooseCategory("all");
  assert(game.state.score === 1 && !game.state.remaining.some((x) => x.id === picked), "Picture Pick not resumed");

  game.start("knowledge");
  game.chooseKnowledgeGroup("body");
  click('[data-answer="' + game.state.items[0].correctChoiceId + '"]');
  const question = game.state.items[1].id;
  game.menu();
  game.start("knowledge");
  assert(q('[data-knowledge-group="body"] .continue-badge'), "Group shows Continue");
  game.chooseKnowledgeGroup("body");
  assert(game.state.index === 1 && game.state.items[1].id === question && game.state.score === 1, "Knowledge not resumed");
  game.menu();
});
await test("Start over and finishing clear the saved round; a blocked store never breaks play", () => {
  game.start("identify");
  click('[data-count="10"]');
  click('[data-answer="' + game.state.items[0].id + '"]');
  click('[data-action="start-over"]');
  click('[data-action="start-over"]');
  assert(game.state.index === 0 && game.state.score === 0, "Start over did not restart");
  assert(game.queues.identify.length === eligibleCount("identify") - 10, "Start over kept the old cycle");
  game.state.index = game.state.items.length - 1;
  game.round();
  click('[data-answer="' + game.state.items.at(-1).id + '"]');
  click('[data-action="continue"]');
  assert(game.state.screen === "results" && !game.progress.data.rounds.identify, "Finished round still saved");
  const setItem = Storage.prototype.setItem, getItem = Storage.prototype.getItem;
  Storage.prototype.setItem = Storage.prototype.getItem = () => { throw Error("blocked"); };
  try {
    const blocked = new GameEngine(topic, { progressId: "mammals-blocked" });
    assert(blocked.progress.data.version === 1 && blocked.progress.write() === false, "Blocked store broke start-up");
    game.start("sort");
    click('[data-sort-rule="land-or-water"]');
    game.menu();
  } finally {
    Storage.prototype.setItem = setItem;
    Storage.prototype.getItem = getItem;
  }
});
await test("Alphabet shortcuts F and M guess letters rather than changing utilities", () => {
  game.start("spelling");
  game.state.items = [{ ...topic.items[0], name: "moth" }];
  game.round();
  const before = game.audio.muted;
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "m", bubbles: true }),
  );
  assert(game.state.guessed.includes("m"), "M not guessed");
  assert(game.audio.muted === before, "M muted sound during spelling");
  game.menu();
});
await test("Teacher scope: a draft applies on Apply only and filters every activity", async () => {
  const { scopeWords, questionInScope } = await import("../src/topics/curriculum.js");
  game.applyScope({});
  game.menu();
  game.teacher.open();
  assert(q("#teacherPanel").open, "Teacher dialog did not open");
  const level = q('[data-scope="level"]'), lesson = q('[data-scope="lesson"]'), collection = q('[data-scope="collection"]');
  assert(level && lesson && collection && !level.disabled, "Scope selects missing or disabled");
  assert(level.options.length === 4 && lesson.options.length === 7 && collection.options.length === 6, "Wrong number of scope choices");
  assert(q("#teacherDone").textContent === "Got it", "Unchanged draft should say Got it");
  lesson.value = "neighbours";
  lesson.dispatchEvent(new Event("change"));
  assert(q("#teacherDone").textContent === "Apply", "Changed draft should say Apply");
  assert(/Mammal or not\?/.test(q("#scopeSummary").textContent), "Summary does not name the lesson");
  click("#closeTeacherButton");
  assert(game.scope.lesson === "all", "Closing applied the draft");
  game.teacher.open();
  assert(q('[data-scope="lesson"]').value === "all", "Reopening kept a thrown-away draft");
  q('[data-scope="lesson"]').value = "neighbours";
  q('[data-scope="lesson"]').dispatchEvent(new Event("change"));
  click("#teacherDone");
  assert(game.scope.lesson === "neighbours", "Apply did not set the lesson");
  assert(game.progress.data.prefs.scope.lesson === "neighbours", "Scope not saved on the device");
  assert(game.state.screen === "menu", "Applying should return to the games");
  const words = scopeWords(topic.items, game.scope), ids = new Set(words.map((i) => i.id));
  for (const mode of ["learn", "identify", "flip", "wheel", "spelling", "detective", "sort"])
    assert(game.pool(mode).every((i) => ids.has(i.id)), `${mode} draws words outside the lesson`);
  game.start("learn");
  assert(q(".scope-chip")?.textContent.includes("Mammal or not?"), "Setup screen does not show the selection");
  game.chooseCategory("all");
  assert(game.state.items.length === words.length, "Meet the Words All is not the lesson's words");
  game.start("knowledge");
  const expected = topic.knowledgeQuestions.filter((x) => questionInScope(x, game.scope, game.lookup)).length;
  assert(q('[data-knowledge-group="all"] .count-pill').textContent.startsWith(`${expected} `), "Knowledge count ignores the lesson");
  game.applyScope({ level: "3", collection: "wild-world", lesson: "neighbours" });
  game.start("flip");
  if (game.pool("flip").length < 2) assert(q(".scope-empty"), "Too-small selection should show the empty notice");
  game.applyScope({ level: "1", lesson: "neighbours", collection: "pets" });
  game.start("identify");
  assert(q(".scope-empty") && q('[data-action="clear-scope"]'), "Empty selection needs a way back to all words");
  click('[data-action="clear-scope"]');
  assert(game.scope.level === "all" && !q(".scope-empty"), "Use all words did not clear the selection");
  game.applyScope({});
  game.menu();
});
await test("Second pack changes categories, item count, scene and spelling adapter", async () => {
  const synthetic = structuredClone(topic);
  synthetic.id = "shapes";
  synthetic.title = "Shape Studio";
  synthetic.subject = "Shapes";
  synthetic.subtitle = "A different collection";
  synthetic.launch.scene = null;
  synthetic.categories = [
    {
      id: "forms",
      label: "Forms",
      image: "assets/topics/mammals/generated/club-badge.webp",
      imageAlt: "Badge",
    },
  ];
  synthetic.items = ["circle", "square", "triangle", "oval"].map((name, i) => ({
    id: name,
    name,
    kind: "word",
    categoryId: "forms",
    definition: "A " + name + " shape.",
    sentence: "This is a " + name + ".",
    image: "assets/topics/mammals/generated/club-badge.webp",
    imageAlt: "Sample badge artwork",
  }));
  synthetic.modeSkins.spelling = {
    id: "simple-progress",
    title: "Build a word",
    instruction: "Choose letters",
    winAnnouncement: "Done",
    wrongAnnouncement: "Try again",
    assets: [],
  };
  synthetic.knowledgeQuestions = synthetic.knowledgeQuestions.map((x) => ({
    ...x,
    visualItemId: null,
  }));
  synthetic.curriculum.objectives = [];
  synthetic.curriculum.coverage = [];
  synthetic.curriculum.readingPractice = [];
  game.clean();
  game.queues = {};
  game.topic = synthetic;
  applyTheme(synthetic);
  game.launch();
  assert(!q(".scene-floaters") && !q(".campsite-peeks"), "Scene hardcoded");
  click('[data-action="launch"]');
  assert(q("#brand-name").textContent === "Shape Studio", "Title hardcoded");
  game.start("learn");
  assert(qa("[data-category]").length === 2, "Categories hardcoded");
  game.chooseCategory("forms");
  assert(q(".vocab-word").textContent === "circle", "Word hardcoded");
  game.start("spelling");
  click('[data-category="all"]');
  click('[data-count="all"]');
  assert(!q(".frog-pond") && !q(".ll-scene") && q(".simple-progress"), "Spelling skin hardcoded");
  for (const c of new Set(game.state.items[0].name)) game.guess(c);
  assert(game.state.spellingStatus === "won", "Adapter did not complete");
  game.start("flip");
  assert(
    qa("[data-count]").length === 1 && q("[data-count]").dataset.count === "4",
    "Small pack board invalid",
  );
  game.start("wheel");
  game.chooseCategory("all");
  for (let i = 0; i < 4; i++) {
    game.spin();
    await until(() => q(".pick-word"));
    assert(
      synthetic.items.some((x) => x.name === q(".pick-word").textContent),
      "Foreign word",
    );
    game.nextWheel();
  }
  assert(game.state.screen === "results", "Small wheel incomplete");
  game.clean();
  game.topic = topic;
  game.queues = {};
  applyTheme(topic);
  game.menu();
});
await test("Production styles load and desktop Flip boards fit including completion controls", () => {
  assert(
    [...document.styleSheets].some((x) => x.href?.endsWith("skins.css")),
    "Missing skin stylesheet",
  );
  if (innerWidth < 900) return;
  for (const n of [10, 20, 30]) {
    game.start("flip");
    game.startFlip(n);
    game.feedback("Every pair found!", () => game.results());
    const bottom = q(".game-panel").getBoundingClientRect().bottom;
    assert(
      bottom <= innerHeight,
      "Flip " +
        n +
        " board ends at " +
        bottom +
        " in " +
        innerHeight +
        "px screen",
    );
    assert(
      document.documentElement.scrollWidth <= innerWidth,
      "Horizontal overflow",
    );
    assert(
      document.documentElement.scrollHeight <= innerHeight,
      "Page scrolls below projector",
    );
  }
  game.menu();
});
const failures = results.filter((x) => x.startsWith("FAIL"));
report.textContent =
  `${results.length - failures.length}/${results.length} browser checks passed at ${innerWidth}×${innerHeight}\n\n` +
  results.join("\n");
document.title = failures.length
  ? "FAIL — browser tests"
  : "PASS — browser tests";
