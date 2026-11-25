// Nursery Round-up: the round builder and rules (docs/topic-games-concepts/DESIGN.md, section 3).
import test from "node:test";
import assert from "node:assert/strict";
import { topic } from "../src/topics/mammals.js";
import { seeded, LEVELS } from "../src/topics/topic-games.js";
import { SETTINGS, PAIRS, buildRound, motherOf, matchesOnBoard, rightLine, wrongLine } from "../src/topics/games/nursery.js";
import { RULES, rulesFor } from "../src/topics/games/nursery-rules.js";

const levels = LEVELS.map((l) => l.id);
const words = ["no", "one", "two", "three", "four", "five", "six", "seven"];

test("Nursery Round-up: every mother and baby is a word with a picture; every line is about milk", () => {
  const ids = new Set(topic.items.filter((x) => x.image).map((x) => x.id));
  for (const p of PAIRS) {
    assert.ok(ids.has(p.mother), p.mother);
    assert.ok(ids.has(p.baby), p.baby);
    assert.match(p.line, /milk/);
  }
  assert.equal(new Set(PAIRS.map((p) => p.baby)).size, PAIRS.length, "no baby name twice");
  assert.ok(!PAIRS.some((p) => p.mother === "lion" || p.mother === "elephant"), "lion–cub and elephant–calf are left out");
});

test("Nursery Round-up: a seeded round replays exactly", () => {
  for (const level of levels)
    for (const seed of [1, 42, 9001]) assert.deepEqual(buildRound(level, seeded(seed)), buildRound(level, seeded(seed)));
  assert.notDeepEqual(buildRound("hard", seeded(1)), buildRound("hard", seeded(2)));
});

test("Nursery Round-up: counts per level match SETTINGS, over 200 seeds", () => {
  for (const level of levels)
    for (let seed = 1; seed <= 200; seed++) {
      const r = buildRound(level, seeded(seed));
      assert.equal(r.babies.length, SETTINGS[level].pairs);
      assert.equal(new Set(r.babies).size, r.babies.length);
      assert.deepEqual([...r.mothers].sort(), r.babies.map(motherOf).sort(), "each baby's mother is there, and no one else");
    }
});

test("Nursery Round-up: no baby could fairly go to two mothers, over 200 seeds per level", () => {
  for (const level of levels)
    for (let seed = 1; seed <= 200; seed++) {
      const r = buildRound(level, seeded(seed));
      for (const b of r.babies) assert.equal(matchesOnBoard(b, r.mothers), 1, `${level} seed ${seed}: ${b}`);
      // A pup and a puppy's mother, or a calf and a deer, never meet.
      assert.ok(!(r.babies.includes("pup") && r.mothers.includes("dog")));
      assert.ok(!(r.babies.includes("calf") && r.mothers.includes("deer")));
      if (r.babies.length > 1) assert.ok(r.mothers.some((m, i) => motherOf(r.babies[i]) !== m), "the mothers are not in the babies' order");
    }
});

test("Nursery Round-up: the lines a mother says", () => {
  assert.equal(wrongLine("calf", "sheep"), "I'm a sheep. A calf's mother is a cow.");
  assert.equal(wrongLine("joey", "elephant"), "I'm an elephant. A joey's mother is a kangaroo.");
  assert.equal(rightLine("joey"), "A joey drinks milk in its mother's pouch.");
});

test("Nursery Round-up: the rules take their numbers from SETTINGS", () => {
  const levelsText = RULES.find((s) => s.title === "Levels").items;
  levels.forEach((level, i) => assert.match(levelsText[i], new RegExp(`${words[SETTINGS[level].pairs]} babies`)));
  assert.match(levelsText[2], /only its name card/);
  assert.match(RULES.find((s) => s.title === "How to play").items.join(" "), /hear each baby's name/);
  const changed = structuredClone(SETTINGS);
  changed.easy.pairs = 4;
  changed.hard.picture = true;
  const text = JSON.stringify(rulesFor(changed));
  assert.match(text, /Easy: four babies/);
  assert.doesNotMatch(text, /only its name card/);
  assert.deepEqual(RULES.map((s) => s.title), ["How to play", "Controls", "Levels", "Stars"]);
});

test("Nursery Round-up: the next round brings new pairs first", () => {
  for (const level of ["easy", "medium", "hard"]) {
    for (const seed of [1, 2, 3, 42, 9001]) {
      const rand = seeded(seed);
      const a = buildRound(level, rand);
      const b = buildRound(level, rand, a.babies);
      const again = b.babies.filter((baby) => a.babies.includes(baby)).length;
      const most = Math.max(0, SETTINGS[level].pairs * 2 - PAIRS.length);
      assert.ok(again <= most + 1, `${level} seed ${seed}: ${again} back`);
    }
  }
});
