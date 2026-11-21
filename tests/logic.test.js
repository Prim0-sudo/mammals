import test from "node:test";
import assert from "node:assert/strict";
import { topic } from "../src/topics/mammals.js";
import { wordRows } from "../src/topics/mammals-words.js";
import {
  shuffle,
  letters,
  makeChoices,
  makeFlipDeck,
  takeSession,
  restoreSession,
  mistakeStage,
  removeWheelItem,
  stars,
} from "../src/core/logic.js";
import { validateTopic } from "../src/core/topic-validator.js";
import { groupRows, categoryOrder, wordOrder, groupOf } from "../src/topics/word-order.js";
import { kindOf, kindOfLabel } from "../src/topics/kind-of.js";
import { sortingRules, sortingPool } from "../src/topics/sorting.js";
import { createReveal, advanceReveal, revealedTiles, answerReveal, detectiveChoices } from "../src/core/detective.js";
test("Complete topic passes the contract; menu order is enforced", () => {
  assert.equal(validateTopic(topic), true);
  const invalid = structuredClone(topic);
  invalid.menu.activities.reverse();
  assert.throws(() => validateTopic(invalid), /Activities folder/);
  const tiles = structuredClone(topic);
  tiles.menu.tiles.reverse();
  assert.throws(() => validateTopic(tiles), /Home tiles/);
});
test("The pictured words sit in the ten groups, in teaching order; empty groups show as Coming soon", () => {
  assert.equal(topic.items.length, 183);
  assert.equal(wordRows.length, new Set(wordRows.map((x) => x.id)).size);
  assert.ok(topic.items.every((x) => !Object.hasOwn(x, "tier")));
  assert.ok(topic.showEmptyGroups, "Groups with no words yet must still show");
  assert.deepEqual(topic.categories.map((c) => [c.id, topic.items.filter((x) => x.categoryId === c.id).length]), [
    ["mammals", 50], ["body", 23], ["life-cycle", 10], ["food", 8], ["homes", 14],
    ["movement", 12], ["survival", 10], ["habitats", 12], ["neighbours", 32], ["watching", 12],
  ]);
  assert.ok(topic.categories.every((c) => c.image.startsWith("assets/topics/mammals/")), "Each group has a Mammals picture");
  const strict = structuredClone(topic);
  delete strict.showEmptyGroups;
  assert.doesNotThrow(() => validateTopic(strict), "Every group now has words, so the topic passes without showEmptyGroups");
});
test("The teaching-order file places all 268 planned words once, and the topic follows it", () => {
  assert.equal(groupRows.length, 10);
  const placed = Object.values(wordOrder).flat();
  assert.equal(placed.length, 268);
  assert.equal(new Set(placed).size, 268, "A word is placed twice");
  assert.deepEqual(Object.keys(wordOrder), categoryOrder);
  assert.deepEqual(groupRows.map(([id]) => wordOrder[id].length), [82, 32, 18, 19, 15, 20, 15, 23, 32, 12]);
  for (const item of topic.items) assert.ok(groupOf[item.id], item.id + " is not in the teaching order");
  const rank = (id) => categoryOrder.indexOf(groupOf[id]) * 1000 + wordOrder[groupOf[id]].indexOf(id);
  const ranks = topic.items.map((x) => rank(x.id));
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b), "Words are not in teaching order");
  assert.deepEqual(topic.categories.map((c) => c.id), categoryOrder.filter((id) => topic.categories.some((c) => c.id === id)));
});
test("Every kind-of pair names placed words, and each kind comes before its examples", () => {
  for (const [id, wider] of Object.entries(kindOf)) {
    assert.ok(groupOf[id] && groupOf[wider], id + " or " + wider + " is not placed");
    if (groupOf[id] === groupOf[wider]) {
      const list = wordOrder[groupOf[id]];
      assert.ok(list.indexOf(wider) < list.indexOf(id), wider + " should come before " + id);
    }
  }
  for (const id of Object.keys(kindOfLabel)) assert.ok(groupOf[id], id + " label is not placed");
});
test("Coverage cannot refer to missing words or omit objectives", () => {
  const invalid = structuredClone(topic);
  invalid.curriculum.coverage[0].itemIds.push("missing");
  assert.throws(() => validateTopic(invalid), /Invalid coverage/);
  invalid.curriculum.coverage = [];
  assert.throws(() => validateTopic(invalid), /Unmapped objective/);
});
test("Shuffling and three-choice construction preserve unique membership", () => {
  const source = topic.items.map((x) => x.id),
    mixed = shuffle(source, () => 0.3);
  assert.deepEqual([...mixed].sort(), [...source].sort());
  assert.notDeepEqual(mixed, source);
  for (const item of topic.items) {
    const choices = makeChoices(item, topic.items);
    assert.equal(new Set(choices.map((x) => x.id)).size, 3);
    assert.ok(choices.includes(item));
  }
});
test("Every word is covered once per short-session cycle", () => {
  const words = topic.items;
  let remaining,
    seen = [];
  for (let i = 0; i < Math.ceil(words.length / 12); i++) {
    const session = takeSession(words, 12, remaining);
    remaining = session.remaining;
    seen.push(...session.items);
  }
  assert.equal(remaining.length, 0);
  assert.equal(new Set(seen.map((x) => x.id)).size, words.length);
  assert.equal(takeSession(words, 12, remaining).items.length, 12);
});
test("Abandoned words return first without duplicates or loss", () => {
  const words = topic.items;
  const session = takeSession(words, 12);
  const restored = restoreSession(session.items.slice(3), session.remaining);
  assert.equal(restored.length, words.length - 3);
  assert.equal(restored[0].id, session.items[3].id);
  assert.equal(new Set(restored.map((x) => x.id)).size, words.length - 3);
  assert.equal(
    takeSession(words, 12, [{ id: "removed" }]).items.length,
    12,
  );
});
test("Every Flip board is exactly two of each word", () => {
  for (const count of [10, 20, 30]) {
    const deck = makeFlipDeck(topic.items, count);
    assert.equal(deck.length, count * 2);
    assert.equal(new Set(deck.map((x) => x.id)).size, count * 2);
    const counts = new Map();
    for (const t of deck)
      counts.set(t.item.id, (counts.get(t.item.id) || 0) + 1);
    assert.equal(counts.size, count);
    assert.ok([...counts.values()].every((x) => x === 2));
  }
  assert.throws(() => makeFlipDeck(topic.items, topic.items.length + 1));
});
test("Spelling keeps repeated letters but ignores spaces; final mistake reaches the terminal stage", () => {
  assert.equal(letters("guinea pig", topic).join(""), "guineapig");
  assert.equal(letters("hippopotamus", topic).filter((x) => x === "p").length, 3);
  assert.deepEqual(
    [1, 2, 3].map((x) => mistakeStage(x, 3)),
    [5, 9, 10],
  );
  for (const limit of [1, 2, 3, 5, 10]) {
    assert.equal(mistakeStage(0, limit), 0);
    assert.equal(mistakeStage(limit, limit), 10);
    for (let i = 1; i < limit; i++) assert.ok(mistakeStage(i, limit) < 10);
  }
});
test("Picture Pick removes a read word from its cycle", () => {
  const left = removeWheelItem(topic.items, "cat");
  assert.equal(left.length, topic.items.length - 1);
  assert.ok(!left.some((x) => x.id === "cat"));
});
test("Stars reflect first-attempt accuracy, with a gentle minimum", () => {
  assert.equal(stars(0, 12), 1);
  assert.equal(stars(7, 12), 2);
  assert.equal(stars(11, 12), 3);
});
test("Sort It: five authored sorts, placed words, no word in two groups, every sort playable", () => {
  assert.equal(sortingRules.length, 5, "Four paired sorts and Which family?");
  const placed = new Set(Object.values(wordOrder).flat()), ids = new Set(topic.items.map((x) => x.id));
  for (const rule of sortingRules) {
    if (rule.choices) {
      assert.equal(rule.cover.length, 2, rule.id + " needs a picture pair");
      for (const id of rule.cover) assert.ok(rule.groups.some((g) => g.id === id), id + " is not one of its groups");
      for (const g of rule.groups) assert.ok(rule.groups.filter((x) => x.side === g.side).length >= rule.choices, g.side + " has too few families");
    } else assert.equal(rule.groups.length, 2, rule.id + " needs a picture pair");
    assert.ok(rule.question.endsWith("?") && rule.note, rule.id + " needs a question and a note");
    const all = rule.groups.flatMap((g) => g.members);
    assert.deepEqual(all.filter((id, i) => all.indexOf(id) !== i), [], rule.id + " asks a word with two answers");
    for (const group of rule.groups) {
      for (const id of group.members) assert.ok(placed.has(id), id + " is not in the teaching order");
      // A group whose words are still waiting for their pictures stays out of play until they land.
      if (!group.members.some((id) => ids.has(id))) continue;
      assert.ok(ids.has(group.imageId), group.id + " picture is not a word in the game");
      assert.ok(group.members.includes(group.imageId), group.id + " picture is not one of its own words");
      assert.ok(sortingPool({ groups: [group] }, topic.items).length > 0, group.id + " has no words yet");
    }
  }
});
test("Detective reveal counts active time only and gives a star for a first-try guess", () => {
  assert.throws(() => createReveal("blur", 45));
  const r = createReveal("mosaic", 30);
  advanceReveal(r, 5000);
  assert.equal(r.elapsed, 0, "A stopped reveal must not move");
  r.running = true;
  advanceReveal(r, 15000);
  assert.equal(revealedTiles(r), 60);
  assert.equal(answerReveal(r, false), 0);
  assert.equal(answerReveal(r, true), 0, "A wrong guess first means no star");
  const quick = createReveal("pixel", 45);
  quick.running = true;
  advanceReveal(quick, 99000);
  assert.ok(quick.assisted && !quick.running && revealedTiles(quick) === 120, "A finished reveal is practice");
  const fresh = createReveal("mosaic", 60);
  assert.equal(answerReveal(fresh, true), 1);
  const bear = topic.items.find((x) => x.id === "bear"), polar = topic.items.find((x) => x.id === "polar-bear");
  for (let i = 0; i < 50; i++) {
    const choices = detectiveChoices(polar, topic.items);
    assert.equal(choices.length, 3);
    assert.ok(choices.includes(polar) && !choices.includes(bear), "A word and its kind-of partner were offered together");
  }
});

test("Teacher scope: every planned word has a lesson, every choice has words and questions", async () => {
  const c = await import("../src/topics/curriculum.js");
  const { wordOrder } = await import("../src/topics/word-order.js");
  const planned = new Set(Object.values(wordOrder).flat());
  assert.deepEqual(c.unplacedWords(), []);
  assert.equal(c.levels.length, 3);
  assert.equal(c.lessons.length, 6);
  for (const col of c.collections) for (const id of col.words.trim().split(/\s+/)) assert.ok(planned.has(id), `${col.id}: ${id} is not a planned word`);
  for (const l of c.lessons) for (const id of l.extra.trim().split(/\s+/).filter(Boolean)) assert.ok(planned.has(id), `${l.id}: ${id} is not a planned word`);
  const words = topic.items.filter((i) => i.kind === "word");
  const lookup = new Map(topic.items.map((i) => [i.id, i]));
  for (const [key, list] of Object.entries(c.scopeChoices))
    for (const o of list) {
      const scope = { [key]: o.id };
      // Until the vocabulary plan fills the groups a choice needs one word (Insects: ten).
      assert.ok(c.scopeWords(words, scope).length >= 1, `${key} ${o.id} has no words`);
      assert.ok(topic.knowledgeQuestions.some((q) => c.questionInScope(q, scope, lookup)), `${key} ${o.id} has no questions`);
    }
  const levelled = c.levels.reduce((n, l) => n + c.scopeWords(words, { level: l.id }).length, 0);
  assert.equal(levelled, words.length, "every word has exactly one level");
  assert.deepEqual(c.normaliseScope({ level: "9", lesson: "homes" }), { level: "all", lesson: "homes", collection: "all" });
  assert.equal(c.scopeLabel({}), "All Mammals words");
  assert.equal(c.scopeLabel({ level: "1", collection: "pets" }), "Level 1 · Pets");
});

test("Phonics: every picture card names a real word and file, every shared recording exists", async () => {
  const { existsSync, readFileSync, readdirSync } = await import("node:fs");
  const { letterPictures, letterSources } = await import("../src/topics/letter-pictures.js");
  const { blendPictures, familyPictures, blendSources, familySources } = await import("../src/topics/sound-pictures.js");
  const { PHONICS_SECTIONS } = await import("../src/core/phonics-view.js");
  const root = new URL("../", import.meta.url);
  const ids = new Set(topic.items.map((w) => w.id));
  for (const set of [letterPictures, blendPictures, familyPictures]) {
    for (const [key, card] of Object.entries(set)) {
      assert.ok(card.src && existsSync(new URL(card.src, root)), `${key}: card file missing`);
    }
  }
  for (const [key, [word, id]] of Object.entries({ ...letterSources, ...blendSources, ...familySources })) {
    assert.ok(ids.has(id), `${key}: ${id} is not a Mammals word`);
    assert.match(word, /\[.+\]/, `${key}: no taught letters marked`);
  }
  for (const s of PHONICS_SECTIONS) assert.ok(existsSync(new URL(s.image, root)), `${s.id}: tile image missing`);
  // The shared audio modules hold the recording paths the foundations play.
  const audioDir = new URL("src/audio/", root);
  const text = readdirSync(audioDir).map((n) => readFileSync(new URL(n, audioDir), "utf8")).join("\n");
  const audio = [...new Set(text.match(/assets\/audio\/[^"'`\s]+\.(?:mp3|ogg|wav|m4a)/g) || [])];
  assert.ok(audio.length > 100, "foundation recordings listed");
  for (const p of audio) assert.ok(existsSync(new URL(p, root)), `recording missing: ${p}`);
});

test("Media: every listed printable exists at its listed size, and the deck's pictures exist", async () => {
  const { existsSync, statSync } = await import("node:fs");
  const { topicFlashcards } = await import("../src/topics/flashcards.js");
  const { soundMats } = await import("../src/topics/sound-mats.js");
  const { topicPresentation: deck } = await import("../src/topics/presentation.js");
  const root = new URL("../", import.meta.url);
  const words = topic.items.filter((w) => w.kind === "word");
  // Mammals flashcards, sound mats and slides are not made yet: the shelves show "coming soon".
  for (const p of topicFlashcards) {
    assert.equal(statSync(new URL(p.path, root)).size, p.bytes, `${p.path}: size`);
    assert.ok(p.bytes < 25 * 1024 * 1024, `${p.path}: over the 25 MiB file limit`);
    assert.equal(p.wordCount, words.filter((w) => p.scopeId === "all" || w.categoryId === p.scopeId).length, `${p.path}: word count`);
  }
  for (const m of soundMats) {
    assert.equal(statSync(new URL(m.path, root)).size, m.bytes, `${m.path}: size`);
    if (m.a5Path) assert.equal(statSync(new URL(m.a5Path, root)).size, m.a5Bytes, `${m.a5Path}: size`);
    assert.ok(existsSync(new URL(m.cover, root)), `${m.id}: cover missing`);
  }
  const html = deck.slides.map((s) => s.html).join("\n");
  if (deck.slides.length) for (const w of words) assert.ok(html.includes(`assets/presentation/${w.id}.jpg`), `${w.id}: not in the deck`);
  for (const src of new Set(html.match(/assets\/presentation\/[^"]+/g))) assert.ok(existsSync(new URL(src, root)), `${src}: missing`);
  assert.equal(new Set(deck.slides.map((s) => s.id)).size, deck.slides.length, "slide ids are unique");
});

test("Mammal Games: three honest placeholders (two education, one arcade) until the games are built", async () => {
  const { TOPIC_GAMES } = await import("../src/topics/topic-games.js");
  assert.deepEqual(TOPIC_GAMES.map((g) => g.kind), ["Education", "Education", "Arcade"]);
  const ids = new Set(topic.items.map((x) => x.id));
  for (const g of TOPIC_GAMES) assert.ok(ids.has(g.image), `${g.id}: picture ${g.image} is not a word`);
});
