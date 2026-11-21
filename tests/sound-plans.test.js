import test from "node:test";
import assert from "node:assert/strict";
import { topic } from "../src/topics/mammals.js";
import { AUTHORED_SOUND_PLANS, PHONEMES, soundPlan } from "../src/topics/word-sound-plans.js";
import { recordedSound } from "../src/audio/alphabet-resolver.js";
import { CVC_IDS } from "../src/core/word-practice-view.js";

const words = topic.items.filter((i) => i.kind === "word");

test("Sound plans: every Mammals word can be sounded out on a real British recording", () => {
  for (const w of words) {
    const plan = soundPlan(w.name);
    assert.ok(plan, `${w.name} has no sound plan`);
    const letters = [...w.name].filter((c) => /[a-z]/i.test(c)).length;
    assert.equal(new Set(plan.flatMap((g) => g.indices)).size, letters, `${w.name}: every letter belongs to a sound group`);
  }
  for (const part of Object.keys(AUTHORED_SOUND_PLANS)) assert.ok(soundPlan(part), `${part}: plan does not match its spelling`);
  for (const id of Object.keys(PHONEMES)) if (id !== "i") assert.ok(recordedSound(id)?.path, `sound ${id} has no recording`);
});

test("Short vowels: every CVC word is a real word with three sounds and a short vowel", () => {
  for (const id of CVC_IDS) {
    const w = words.find((x) => x.id === id);
    assert.ok(w, `${id} is not a Mammals word`);
    const sounds = soundPlan(w.name).filter((g) => g.sound);
    assert.equal(sounds.length, 3, `${id} has ${sounds.length} sounds`);
    assert.match(sounds[1].sound, /^short-/, `${id}: the middle sound is short`);
  }
});
