import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { narrationLines } from "../src/topics/narration-lines.js";

const manifest = JSON.parse(fs.readFileSync(new URL("../src/audio/heart-manifest.json", import.meta.url), "utf8"));
// The Mammals voice is not recorded yet (21 November 2026): the owner picks one Kokoro voice first.
const pending = manifest.status === "pending";

test("Narration: the line list names every spoken line once, with its source", () => {
  const lines = narrationLines();
  assert.ok(lines.length > 300, `only ${lines.length} lines`);
  assert.equal(new Set(lines.map((l) => l.text)).size, lines.length, "a line is listed twice");
  assert.ok(lines.every((l) => l.text.trim() && l.sources.length), "a line has no text or source");
  if (pending) assert.deepEqual(manifest.clips, {}, "a pending bank holds no clips");
});

test("Narration: every spoken line has a recording on disk", { skip: pending && "Mammals voice not recorded yet" }, () => {
  const missing = narrationLines().filter((l) => !manifest.clips[l.text]).map((l) => l.text);
  assert.deepEqual(missing.slice(0, 10), [], `${missing.length} lines have no recording; run node tools/voice/build.mjs --make`);
  for (const file of new Set(Object.values(manifest.clips))) {
    assert.match(file, /^assets\/audio\/heart\/[a-f0-9]{64}\.mp3$/);
    assert.ok(fs.existsSync(new URL("../" + file, import.meta.url)), `${file} is missing`);
  }
});
