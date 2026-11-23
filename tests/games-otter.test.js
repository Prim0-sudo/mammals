import test from "node:test";
import assert from "node:assert/strict";
import {
  SETTINGS, LIVES, FISH_POINTS, MAX_COMBO, REFILL, TOP, DEEP, AT_SURFACE,
  createRun, step, stars, otterX, simulate, simulatedStars,
} from "../src/topics/games/otter.js";
import { RULES } from "../src/topics/games/otter-rules.js";

const LEVELS = ["easy", "medium", "hard"];
const DT = 1 / 60;
// The run state without its random-number function, for comparing two runs.
const snapshot = (run) => JSON.parse(JSON.stringify(run));
// A quiet river: nothing comes in unless the test puts it there.
const quiet = (level = "easy") => {
  const run = createRun(level, { seed: 1 });
  run.nextFish = run.nextObstacle = run.nextLine = Infinity;
  return run;
};
const until = (run, input, f, max = 120) => {
  const events = [];
  for (let i = 0; i < max / DT && !f(run); i++) events.push(...step(run, input, DT));
  return events;
};

test("Otter Dive: a seeded run with the same input replays exactly", () => {
  for (const level of LEVELS) {
    const play = () => {
      const run = createRun(level, { seed: 42 });
      const log = [];
      for (let i = 0; i < 60 * 30; i++) {
        const dir = Math.floor(i / 50) % 3 === 0 ? -1 : Math.floor(i / 50) % 3 === 1 ? 1 : 0;
        log.push(...step(run, { dir }, DT));
      }
      return { run: snapshot(run), log };
    };
    assert.deepEqual(play(), play(), level);
    assert.deepEqual(snapshot(simulate(level, 7)), snapshot(simulate(level, 7)), `${level} simulation`);
  }
});

test("Otter Dive: the star thresholds come from the simulation", () => {
  for (const level of LEVELS) {
    const s = SETTINGS[level].stars;
    assert.deepEqual(s, simulatedStars(level), level);
    assert.ok(s[0] < s[1] && s[1] < s[2], `${level} thresholds rise`);
    assert.equal(stars(s[0] - 1, level), 0);
    assert.equal(stars(s[0], level), 1);
    assert.equal(stars(s[1], level), 2);
    assert.equal(stars(s[2], level), 3);
  }
});

test("Otter Dive: air runs out after the level's breath, then the otter is lifted and loses a life", () => {
  for (const level of LEVELS) {
    const run = quiet(level);
    const events = until(run, { target: DEEP }, (r) => r.lives < LIVES);
    // The air lasts the breath setting (counted from going under), to within a frame or two.
    const wentUnder = run.time - SETTINGS[level].breath;
    assert.ok(wentUnder > 0 && wentUnder < 0.3, `${level}: air lasted ${SETTINGS[level].breath} s`);
    assert.equal(run.lives, LIVES - 1);
    assert.equal(run.breaths, 1);
    assert.ok(run.otter.lift, "lifted to the surface");
    assert.ok(events.some((e) => e.type === "life" && e.why === "breath"));
    // Lifted up whatever you press, then the air fills again within REFILL seconds.
    until(run, { target: DEEP }, (r) => !r.otter.under);
    assert.ok(run.otter.y <= AT_SURFACE && !run.otter.lift);
    const t0 = run.time;
    until(run, { target: TOP }, (r) => r.otter.air >= 1);
    assert.ok(run.time - t0 <= REFILL + 0.05, "air refills in REFILL seconds");
  }
});

test("Otter Dive: fish build a combo; a bump costs one life, blinks and resets the combo", () => {
  const run = quiet("easy");
  run.otter.y = run.otter.target = 0.5;
  const ox = otterX(run);
  for (let i = 0; i < MAX_COMBO + 1; i++) run.things.push({ id: 100 + i, type: "fish", x: ox, y: 0.5, base: 0.5, r: 0.045, drift: 0, phase: 0, caught: false });
  const got = step(run, { target: 0.5 }, DT).filter((e) => e.type === "fish").map((e) => e.points);
  assert.deepEqual(got, [1, 2, 3, 4, 4].map((c) => c * FISH_POINTS), "combo grows to MAX_COMBO");
  run.things.push({ id: 200, type: "litter", kind: "can", x: ox, y: 0.5, base: 0.5, r: 0.04, drift: 0, phase: 0, spin: 0, hit: false });
  run.things.push({ id: 201, type: "snag", x: ox, y: 0.5, x2: ox + 0.05, tip: 0.5, r: 0.03, drift: 0, hit: false, twig: 0 });
  const events = step(run, { target: 0.5 }, DT);
  assert.equal(events.filter((e) => e.type === "life").length, 1, "one life for touching two hazards at once");
  assert.equal(run.lives, LIVES - 1);
  assert.equal(run.combo, 1);
  assert.ok(run.otter.blink > 0);
});

test("Otter Dive: losing the last life ends the round with the otter lifted home", () => {
  const run = quiet("medium");
  run.lives = 1;
  run.otter.y = run.otter.target = 0.6;
  const ox = otterX(run);
  run.things.push({ id: 300, type: "snag", x: ox, y: 0.55, x2: ox + 0.08, tip: 0.55, r: 0.03, drift: 0, hit: false, twig: 0 });
  const events = step(run, { target: 0.6 }, DT);
  assert.ok(run.over && run.end === "lives" && run.lives === 0 && run.otter.lift);
  assert.deepEqual(events.at(-1), { type: "end", why: "lives" });
  assert.deepEqual(step(run, {}, DT), [], "nothing happens after the end");
});

test("Otter Dive: the round ends at the level's time", () => {
  const run = quiet("easy");
  const events = until(run, { target: TOP }, (r) => r.over);
  assert.equal(run.end, "time");
  assert.ok(Math.abs(run.time - SETTINGS.easy.time) < 0.05);
  assert.deepEqual(events.at(-1), { type: "end", why: "time" });
});

test("Otter Dive: the rules text takes its numbers from SETTINGS", () => {
  const text = RULES.flatMap((s) => s.items).join("\n");
  for (const level of LEVELS) {
    const s = SETTINGS[level];
    assert.match(text, new RegExp(`${s.breath}-second|${s.breath} seconds`), `${level} breath`);
    assert.match(text, new RegExp(`${s.time} seconds`), `${level} time`);
    assert.ok(text.includes(s.stars.join(", ")), `${level} stars`);
  }
  assert.ok(text.includes(String(FISH_POINTS)));
  assert.ok(/three lives/.test(text) || text.includes(String(LIVES)));
});
