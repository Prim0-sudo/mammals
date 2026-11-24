import test from "node:test";
import assert from "node:assert/strict";
import { narrationLines } from "../src/topics/narration-lines.js";
import { VISITORS, arriveLine, stampLine, why } from "../src/topics/games/checkup.js";
import { HOMES, ALSO as HOME_ALSO, enterLine, rightLine as homeLine, wrongLine as homeWrong, nameOf as homeName } from "../src/topics/games/homes.js";
import { PAIRS, rightLine, wrongLine, nameOf, mothersFor } from "../src/topics/games/nursery.js";
import { topic } from "../src/topics/mammals.js";

const bank = new Set(narrationLines().map((l) => l.text));
const name = (id) => (topic.items.find((i) => i.id === id)?.name || id).toLowerCase();

test("Topic Games voice: Check-up's lines are all in the narration bank", () => {
  for (const v of VISITORS) {
    const n = name(v.id);
    for (const line of [n, arriveLine(n), stampLine(v, n), why(v, n), v.hair[1], v.air[1], v.milk[1]]) assert.ok(bank.has(line), line);
  }
});

test("Topic Games voice: Home Before Dark's names and lines are all in the narration bank", () => {
  const homes = Object.keys(HOMES);
  for (const h of homes) {
    assert.ok(bank.has(homeName(h)), h);
    assert.ok(bank.has(homeLine(h)), h);
    for (const w of HOMES[h].walkers) {
      assert.ok(bank.has(enterLine(w)), w);
      for (const other of homes) if (other !== h && !(HOME_ALSO[w] || []).includes(other)) assert.ok(bank.has(homeWrong(w, other)), `${w} at ${other}`);
    }
  }
});

test("Topic Games voice: Nursery's names and lines are all in the narration bank", () => {
  const mothers = [...new Set(PAIRS.map((p) => p.mother))];
  for (const p of PAIRS) {
    assert.ok(bank.has(nameOf(p.baby)) && bank.has(nameOf(p.mother)) && bank.has(rightLine(p.baby)), p.baby);
    for (const m of mothers) if (!mothersFor(p.baby).includes(m)) assert.ok(bank.has(wrongLine(p.baby, m)), `${p.baby} to ${m}`);
  }
});
