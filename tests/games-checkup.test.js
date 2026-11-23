import test from "node:test";
import assert from "node:assert/strict";
import { CHECKS, VISITORS, SETTINGS, STAR_SLIPS, buildRound, isMammal, why } from "../src/topics/games/checkup.js";
import { RULES } from "../src/topics/games/checkup-rules.js";
import { seeded, roundStars } from "../src/topics/topic-games.js";

const count = (list, f) => list.filter(f).length;

test("Check-up: every visitor answers all three checks, and the mammal flag matches the answers", () => {
  const ids = new Set();
  for (const v of VISITORS) {
    assert.ok(!ids.has(v.id), `duplicate visitor ${v.id}`);
    ids.add(v.id);
    for (const c of CHECKS) {
      assert.ok(Array.isArray(v[c.id]) && typeof v[c.id][0] === "boolean" && v[c.id][1].length > 4, `${v.id} ${c.id}`);
    }
    assert.equal(isMammal(v), v.mammal, `${v.id}: a mammal says yes to all three checks`);
    assert.match(why(v, v.id), v.mammal ? /is a mammal\.$/ : /is not a mammal\.$/);
  }
});

test("Check-up: each level gets the right mix, with no animal twice", () => {
  for (let seed = 1; seed <= 40; seed++) {
    for (const level of ["easy", "medium", "hard"]) {
      const cfg = SETTINGS[level];
      const round = buildRound(level, seeded(seed));
      assert.equal(round.length, cfg.visitors, `${level} seed ${seed}`);
      assert.equal(new Set(round.map((v) => v.id)).size, round.length, "no repeats");
      const mammals = cfg.mix.mammals.reduce((s, [, n]) => s + n, 0);
      assert.equal(count(round, (v) => v.mammal), mammals, `${level} mammals`);
      if (level === "easy") assert.ok(round.every((v) => v.pool === "plain"));
      if (level === "medium") assert.equal(count(round, (v) => v.pool === "sea"), 2);
      if (level === "hard") {
        for (const g of ["eggs", "flier", "sea"]) assert.equal(count(round, (v) => v.mammal && v.pair === g), 1, `hard ${g}`);
        assert.equal(count(round, (v) => !v.mammal && v.pool === "tricky"), 3);
      }
    }
  }
});

test("Check-up: a seed replays the same clinic", () => {
  const a = buildRound("hard", seeded(7)).map((v) => v.id);
  const b = buildRound("hard", seeded(7)).map((v) => v.id);
  assert.deepEqual(a, b);
});

test("Check-up: rules use the numbers from SETTINGS, and stars follow wrong stamps", () => {
  const text = RULES.flatMap((s) => s.items).join(" ");
  for (const level of ["easy", "medium", "hard"]) assert.ok(text.includes(`${SETTINGS[level].visitors} `), level);
  assert.ok(text.includes(`${STAR_SLIPS} wrong stamp`));
  assert.equal(roundStars(0, STAR_SLIPS), 3);
  assert.equal(roundStars(STAR_SLIPS, STAR_SLIPS), 2);
  assert.equal(roundStars(STAR_SLIPS + 1, STAR_SLIPS), 1);
});
