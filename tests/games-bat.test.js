import test from "node:test";
import assert from "node:assert/strict";
import {
  SETTINGS, LIVES, ECHO_COOLDOWN, ECHO_RANGE, MOTH_POINTS, MAX_STREAK, BAT_R, SIM_VIEW,
  createRun, step, echo, resizeRun, nearOnBranch, branchCount, stars, simulate, simulatedStars,
} from "../src/topics/games/bat.js";
import { RULES } from "../src/topics/games/bat-rules.js";

const levels = ["easy", "medium", "hard"];

test("Bat: a seed replays the same night", () => {
  const a = simulate("hard", 5), b = simulate("hard", 5);
  assert.equal(a.points, b.points);
  assert.equal(a.time, b.time);
  assert.deepEqual(a.things.map((t) => t.type), b.things.map((t) => t.type));
});

test("Bat: each level sets out its moths and branches, clear of the bat's start", () => {
  for (const level of levels) {
    for (let seed = 1; seed <= 30; seed++) {
      const run = createRun(level, { seed });
      const branches = run.things.filter((t) => t.type === "branch");
      assert.equal(branches.length, SETTINGS[level].branches, `${level} seed ${seed}`);
      assert.equal(run.things.filter((t) => t.type === "moth").length, SETTINGS[level].moths);
      for (const b of branches) assert.ok(nearOnBranch(run.bat.x, run.bat.y, b).d > 0.2, "a branch is clear of the start");
    }
  }
});

test("Bat: a narrow phone wood gets fewer branches, so there is room to dodge", () => {
  for (const level of ["medium", "hard"]) {
    const narrow = createRun(level, { seed: 3, view: 0.78 }).things.filter((t) => t.type === "branch").length;
    assert.equal(narrow, branchCount(SETTINGS[level], 0.78));
    assert.ok(narrow >= 1 && narrow < SETTINGS[level].branches, level);
  }
  assert.equal(branchCount(SETTINGS.easy, 0.78), 0);
});

test("Bat: echoes wait for the cooldown, light what they pass, and things fade over the seen time", () => {
  const run = createRun("medium", { seed: 3 });
  assert.ok(echo(run));
  assert.equal(echo(run), null, "a second echo straight away is refused");
  const events = step(run, { echo: true }, 1 / 60);
  assert.equal(events[0].type, "cooling");
  for (let i = 0; i < Math.ceil((ECHO_RANGE / 1.1) * 60) + 2; i++) step(run, {}, 1 / 60);
  const lit = run.things.filter((t) => t.lit > 0);
  assert.ok(lit.length > 0, "the ring lit something");
  for (let i = 0; i < SETTINGS.medium.seen * 60 + 5; i++) step(run, {}, 1 / 60);
  assert.ok(run.time > ECHO_COOLDOWN);
  assert.ok(run.things.every((t) => t.lit === 0 || t.litBy !== lit[0].litBy), "they faded");
});

test("Bat: Easy sends a free echo by itself; the others do not", () => {
  for (const level of levels) {
    const run = createRun(level, { seed: 2 });
    let auto = 0;
    for (let i = 0; i < 60 * 7; i++) auto += step(run, {}, 1 / 60).filter((e) => e.type === "echo" && e.auto).length;
    assert.equal(auto > 0, level === "easy", level);
  }
});

test("Bat: moths score, and a streak builds within one echo up to the top", () => {
  const run = createRun("easy", { seed: 4 });
  const ring = echo(run);
  const moths = run.things.filter((t) => t.type === "moth");
  const got = [];
  for (const m of moths) {
    m.lit = 1;
    m.litBy = ring.id;
    m.x = run.bat.x;
    m.y = run.bat.y;
    for (const e of step(run, {}, 1 / 60)) if (e.type === "moth") got.push(e.points);
  }
  assert.deepEqual(got.slice(0, 4), [MOTH_POINTS, MOTH_POINTS * 2, MOTH_POINTS * 3, MOTH_POINTS * MAX_STREAK]);
});

test("Bat: a branch costs a life, the bat blinks, and the night ends when the lives run out", () => {
  const run = createRun("medium", { seed: 6 });
  const b = run.things.find((t) => t.type === "branch");
  let lost = 0;
  for (let i = 0; i < LIVES; i++) {
    run.bat.blink = 0;
    run.bat.x = (b.x1 + b.x2) / 2;
    run.bat.y = (b.y1 + b.y2) / 2;
    const events = step(run, {}, 1 / 60);
    lost += events.filter((e) => e.type === "life").length;
    assert.ok(run.bat.blink > 0);
  }
  assert.equal(lost, LIVES);
  assert.equal(run.over, true);
  assert.equal(run.end, "lives");
});

test("Bat: the night ends at dawn, and resizing keeps the bat inside the wood", () => {
  const run = createRun("easy", { seed: 1 });
  run.bat.x = SIM_VIEW - BAT_R;
  resizeRun(run, 0.8);
  assert.ok(run.bat.x <= 0.8);
  while (!run.over) step(run, {}, 1 / 30);
  assert.equal(run.end, "dawn");
  assert.ok(Math.abs(run.time - SETTINGS.easy.night) < 0.05);
});

test("Bat: star thresholds match the play simulation, and the rules quote the settings", () => {
  for (const level of levels) {
    assert.deepEqual(SETTINGS[level].stars, simulatedStars(level), level);
    const [one, two, three] = SETTINGS[level].stars;
    assert.equal(stars(three, level), 3);
    assert.equal(stars(two, level), 2);
    assert.equal(stars(one, level), 1);
    assert.equal(stars(one - 10, level), 0);
  }
  const text = RULES.flatMap((s) => s.items).join(" ");
  for (const level of levels) {
    assert.ok(text.includes(`${SETTINGS[level].night} seconds`), level);
    assert.ok(text.includes(`${SETTINGS[level].seen} seconds`), level);
  }
});
