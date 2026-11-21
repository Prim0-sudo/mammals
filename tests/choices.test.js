import test from "node:test";
import assert from "node:assert/strict";
import { topic } from "../src/topics/mammals.js";
import { detectiveChoices, related } from "../src/core/detective.js";

test("Picture choices never offer a word's own kind (bear with polar bear, cat with kitten)", () => {
  const words = topic.items;
  for (const item of words)
    for (let n = 0; n < 5; n++) {
      const choices = detectiveChoices(item, words);
      assert.equal(new Set(choices.map((x) => x.id)).size, 3);
      assert.ok(choices.includes(item));
      for (const x of choices) if (x !== item) assert.ok(!related(x, item), `${item.id} offered with ${x.id}`);
    }
  assert.ok(related({ id: "polar-bear" }, { id: "bear" }), "A kind and its wider word are kept apart");
  assert.ok(related({ id: "kitten" }, { id: "cat" }) && related({ id: "tongue" }, { id: "giraffe" }), "A concept picture counts as the animal it shows");
  assert.ok(related({ id: "paw" }, { id: "nose" }), "Two pictures of the same animal are kept apart");
  assert.ok(related({ id: "seal" }, { id: "sea-lion" }) && !related({ id: "lion" }, { id: "zebra" }), "Look-alikes are kept apart, other animals are not");
  const sea = words.filter((x) => ["whale", "dolphin", "porpoise"].includes(x.id));
  const whale = words.find((x) => x.id === "whale");
  assert.equal(detectiveChoices(whale, sea, words).length, 3, "A small session still gets two fair wrong pictures");
});
