// Home Before Dark: the round builder and rules (docs/topic-games-concepts/DESIGN.md, section 2).
import test from "node:test";
import assert from "node:assert/strict";
import { topic } from "../src/topics/mammals.js";
import { seeded, LEVELS } from "../src/topics/topic-games.js";
import {
  SETTINGS, HOMES, FARM, buildRound, treeShape, switchesOf, leavesOf, routeTo, follow, homeOf, matchesOnBoard, rightLine, wrongLine,
} from "../src/topics/games/homes.js";
import { RULES, rulesFor } from "../src/topics/games/homes-rules.js";

const levels = LEVELS.map((l) => l.id);
const words = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

test("Home Before Dark: every walker and home is a word with a picture", () => {
  const ids = new Set(topic.items.filter((x) => x.image).map((x) => x.id));
  for (const [home, h] of Object.entries(HOMES)) {
    assert.ok(ids.has(home), home);
    for (const w of h.walkers) assert.ok(ids.has(w), w);
  }
});

test("Home Before Dark: a seeded round replays exactly", () => {
  for (const level of levels)
    for (const seed of [1, 42, 9001]) assert.deepEqual(buildRound(level, seeded(seed)), buildRound(level, seeded(seed)));
  assert.notDeepEqual(buildRound("hard", seeded(1)).walkers, buildRound("hard", seeded(2)).walkers);
});

test("Home Before Dark: counts per level match SETTINGS, over 200 seeds", () => {
  for (const level of levels) {
    const s = SETTINGS[level];
    for (let seed = 1; seed <= 200; seed++) {
      const r = buildRound(level, seeded(seed));
      assert.equal(r.homes.length, s.homes);
      assert.equal(new Set(r.homes).size, s.homes, "homes are all different");
      assert.equal(r.walkers.length, s.walkers);
      assert.equal(switchesOf(r.tree).length, s.homes - 1, "a full binary tree: one switch fewer than homes");
      assert.deepEqual(leavesOf(r.tree), [...Array(s.homes).keys()]);
      for (const home of r.homes) assert.ok(r.walkers.some((w) => w.home === home), "every home gets a walker");
      for (const w of r.walkers) assert.equal(homeOf(w.id), w.home);
      const farm = r.homes.filter((h) => FARM.includes(h)).length;
      if (s.farm) assert.ok(farm >= 1, "Hard mixes in farm homes");
      else assert.equal(farm, 0, "farm homes only on Hard");
    }
  }
});

test("Home Before Dark: no walker could fairly live in two homes on the board, over 200 seeds per level", () => {
  for (const level of levels)
    for (let seed = 1; seed <= 200; seed++) {
      const r = buildRound(level, seeded(seed));
      for (const w of r.walkers) assert.equal(matchesOnBoard(w.id, r.homes), 1, `${level} seed ${seed}: ${w.id} on ${r.homes}`);
      // Never a squirrel beside a nest or tree hollow, a fox beside a sett, a rabbit beside a hutch.
      const has = (a, b) => r.homes.includes(a) && r.homes.includes(b);
      assert.ok(!has("drey", "nest") && !has("drey", "tree-hollow") && !has("roost", "tree-hollow") && !has("den", "sett") && !has("warren", "hutch"));
    }
});

test("Home Before Dark: each home has exactly one route of switches", () => {
  for (const n of [3, 5, 7]) {
    const tree = treeShape(n);
    const sw = switchesOf(tree);
    assert.equal(sw.length, n - 1);
    for (let i = 0; i < n; i++) {
      const sides = Object.fromEntries(routeTo(tree, i).map(([node, side]) => [sw.indexOf(node), side]));
      assert.equal(follow(tree, sides), i);
    }
  }
  // Three homes: one switch, then one more (DESIGN.md).
  assert.equal(treeShape(3).kids[0].leaf, 0);
  assert.ok(treeShape(3).kids[1].kids);
});

test("Home Before Dark: the lines a walker says", () => {
  assert.equal(rightLine("warren"), "Home in its warren!");
  assert.equal(wrongLine("rabbit", "sett"), "This is a sett. A rabbit lives in a warren.");
  assert.equal(wrongLine("otter", "tree-hollow"), "This is a tree hollow. An otter lives in a holt.");
});

test("Home Before Dark: the rules take their numbers from SETTINGS", () => {
  const levelsText = RULES.find((s) => s.title === "Levels").items;
  levels.forEach((level, i) => {
    const s = SETTINGS[level];
    assert.match(levelsText[i], new RegExp(`${words[s.homes]} homes and ${words[s.walkers]} animals`));
    assert.match(levelsText[i], new RegExp(`after ${s.dusk} seconds`));
  });
  assert.match(levelsText[0], /one at a time/);
  assert.match(levelsText[1], new RegExp(`${words[SETTINGS.medium.atOnce]} on the paths at once`));
  // Change a number, and the rules change with it.
  const changed = structuredClone(SETTINGS);
  changed.medium.homes = 7;
  changed.hard.dusk = 120;
  const text = JSON.stringify(rulesFor(changed));
  assert.match(text, /Medium: seven homes/);
  assert.match(text, /after 120 seconds/);
  assert.deepEqual(RULES.map((s) => s.title), ["How to play", "Controls", "Levels", "Stars"]);
});
