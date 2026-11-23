import test from "node:test";
import assert from "node:assert/strict";
import {
  SETTINGS, LIVES, LEAF_POINTS, HIDE_REACH, HOP_TIME, MIN_HIDE, ALL_CLEAR,
  createRun, step, stars, burrowNear, hopHeight, simulate, simulatedStars,
} from "../src/topics/games/dash.js";
import { RULES } from "../src/topics/games/dash-rules.js";

const LEVELS = ["easy", "medium", "hard"];
const DT = 1 / 60;
const snapshot = (run) => JSON.parse(JSON.stringify(run));
// A bare meadow with one burrow at x, and no danger unless the test brings one.
const meadow = (level = "medium", burrowAt = 1) => {
  const run = createRun(level, { seed: 3 });
  run.things = [{ id: 900, type: "burrow", x: burrowAt }];
  run.genX = Infinity;
  run.nextDanger = Infinity;
  return run;
};
const runTo = (run, x) => { while (run.scroll < x && !run.over) step(run, {}, DT); };

test("Burrow Dash: a seeded run with the same input replays exactly", () => {
  for (const level of LEVELS) {
    const play = () => {
      const run = createRun(level, { seed: 99 });
      const log = [];
      for (let i = 0; i < 60 * 30; i++) log.push(...step(run, { hop: i % 47 === 0, hide: i % 113 === 0 }, DT));
      return { run: snapshot(run), log };
    };
    assert.deepEqual(play(), play(), level);
    assert.deepEqual(snapshot(simulate(level, 5)), snapshot(simulate(level, 5)), `${level} simulation`);
  }
});

test("Burrow Dash: the star thresholds come from the simulation", () => {
  for (const level of LEVELS) {
    const s = SETTINGS[level].stars;
    assert.deepEqual(s, simulatedStars(level), level);
    assert.ok(s[0] < s[1] && s[1] < s[2]);
    assert.equal(stars(s[0] - 1, level), 0);
    assert.equal(stars(s[2], level), 3);
  }
});

test("Burrow Dash: hiding only works near a burrow", () => {
  const run = meadow("medium", 1);
  const far = step(run, { hide: true }, DT);
  assert.ok(far.some((e) => e.type === "noburrow"), "no burrow here");
  assert.equal(run.rabbit.hidden, null);
  runTo(run, 1 - HIDE_REACH * 0.5);
  assert.ok(burrowNear(run));
  const near = step(run, { hide: true }, DT);
  assert.ok(near.some((e) => e.type === "hide"));
  assert.equal(run.rabbit.hidden, 900);
  // The meadow stands still while the rabbit is down the hole, then it pops out by itself.
  const x = run.scroll;
  let popped = false;
  for (let i = 0; i < (MIN_HIDE + ALL_CLEAR + 0.2) / DT && !popped; i++) popped = step(run, {}, DT).some((e) => e.type === "popout");
  assert.ok(popped, "pops out by itself");
  assert.ok(Math.abs(run.scroll - x) < 0.01, "the meadow stood still");
});

test("Burrow Dash: a hide pressed just before a burrow waits for it", () => {
  const run = meadow("easy", 1);
  runTo(run, 1 - HIDE_REACH - SETTINGS.easy.speed * 0.1);
  assert.equal(burrowNear(run), undefined);
  const early = step(run, { hide: true }, DT);
  assert.ok(!early.some((e) => e.type === "noburrow"));
  for (let i = 0; i < 30 && !run.rabbit.hidden; i++) step(run, {}, DT);
  assert.equal(run.rabbit.hidden, 900);
});

test("Burrow Dash: a predator strike costs a life in the open and nothing in a burrow", () => {
  for (const kind of ["eagle", "fox"]) {
    const open = meadow("medium", 5);
    open.danger = kind === "eagle"
      ? { id: 1, kind, t: 0, warn: 0.5, struck: false }
      : { id: 1, kind, t: 0, warn: 0.5, struck: false, x: open.scroll + 0.2 };
    const ev = [];
    for (let i = 0; i < 3 / DT && open.lives === LIVES; i++) ev.push(...step(open, {}, DT));
    assert.equal(open.lives, LIVES - 1, `${kind} in the open`);
    assert.ok(ev.some((e) => e.type === "life" && e.why === kind));

    const safe = meadow("medium", 0.02);
    step(safe, { hide: true }, DT);
    assert.ok(safe.rabbit.hidden, "hid");
    safe.danger = kind === "eagle"
      ? { id: 1, kind, t: 0, warn: 0.5, struck: false }
      : { id: 1, kind, t: 0, warn: 0.5, struck: false, x: safe.scroll + 0.2 };
    const ev2 = [];
    for (let i = 0; i < 3 / DT; i++) ev2.push(...step(safe, {}, DT));
    assert.equal(safe.lives, LIVES, `${kind} while hidden`);
    assert.equal(safe.safe, 1);
    assert.ok(ev2.some((e) => e.type === "safe" && e.kind === kind));
  }
});

test("Burrow Dash: a hop clears a stone; running into one costs a life", () => {
  const hit = meadow("easy", 5);
  hit.things.push({ id: 901, type: "stone", x: 0.6, w: 0.065, h: 0.06, hit: false });
  runTo(hit, 0.7);
  assert.equal(hit.lives, LIVES - 1);
  const clear = meadow("easy", 5);
  clear.things.push({ id: 901, type: "stone", x: 0.6, w: 0.065, h: 0.06, hit: false });
  runTo(clear, 0.6 - (HOP_TIME / 2) * SETTINGS.easy.speed);
  step(clear, { hop: true }, DT);
  runTo(clear, 0.7);
  assert.equal(clear.lives, LIVES);
  assert.ok(hopHeight(0.5) > 0.06 && hopHeight(0) === 0);
});

test("Burrow Dash: leaves score and the round ends at dusk or with no lives", () => {
  const run = meadow("easy", 5);
  run.things.push({ id: 902, type: "leaf", x: 0.3, y: 0.06, taken: false });
  runTo(run, 0.4);
  assert.equal(run.points, LEAF_POINTS);
  while (!run.over) step(run, {}, DT);
  assert.equal(run.end, "time");
  assert.ok(Math.abs(run.time - SETTINGS.easy.time) < 0.05);

  const last = meadow("easy", 5);
  last.lives = 1;
  last.things.push({ id: 903, type: "stone", x: 0.3, w: 0.065, h: 0.06, hit: false });
  runTo(last, 0.4);
  assert.ok(last.over && last.end === "lives" && last.lives === 0);
});

test("Burrow Dash: the rules text takes its numbers from SETTINGS", () => {
  const text = RULES.flatMap((s) => s.items).join("\n");
  for (const level of LEVELS) {
    const s = SETTINGS[level];
    assert.match(text, new RegExp(`${s.warning} seconds? warning`), `${level} warning`);
    assert.match(text, new RegExp(`every ${s.gap} seconds`), `${level} gap`);
    assert.match(text, new RegExp(`after ${s.time} seconds`), `${level} time`);
    assert.ok(text.includes(s.stars.join(", ")), `${level} stars`);
  }
  assert.ok(text.includes(`${LEAF_POINTS} points`));
});
