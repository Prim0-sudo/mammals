// Content and asset checks for Mammal Discovery Club (the Insects check, fitted to Mammals, 21 November 2026).
import { stat, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { topic } from "../src/topics/mammals.js";
import { webpSize } from "../tools/art/webp-size.mjs";
import { validateTopic, assetPaths } from "../src/core/topic-validator.js";
import { storyVideos, lessonVideos } from "../src/topics/story-videos.js";
import { wordOrder } from "../src/topics/word-order.js";

const json = async (path) => JSON.parse(await readFile(new URL("../" + path, import.meta.url), "utf8"));
const sha = (data) => createHash("sha256").update(data).digest("hex");
validateTopic(topic);

// Every word sits in exactly one group of word-order.js, and every placed word is in the topic.
const placed = Object.values(wordOrder).flat();
if (new Set(placed).size !== placed.length) throw Error("A word is listed in two groups in word-order.js");
if (placed.length !== topic.items.length || topic.items.some((x) => !placed.includes(x.id)))
  throw Error("word-order.js and the topic's words disagree");

// Word pictures: each WebP the app shows comes from the supplied, checksummed RGBA PNG (docs/supplied-artwork.json).
const supplied = new Map((await json("docs/supplied-artwork.json")).entries.map((e) => [e.id, e]));
const twin = (path) => path.replace(/\.png$/, ".webp");
for (const item of topic.items) {
  const record = supplied.get(item.id);
  if (!record || twin(record.path) !== item.image) throw Error("Word picture not in the supplied artwork record: " + item.id);
  const data = await readFile(new URL("../" + record.path, import.meta.url));
  if (sha(data) !== record.sha256) throw Error("Artwork checksum mismatch: " + record.path);
  if (data[0] !== 137 || data[1] !== 80 || data[25] !== 6) throw Error("Artwork is not a true RGBA PNG: " + record.path);
}

// WebP twins (blueprint v6.1): made by tools/art/png-to-webp.py from the PNG, which stays for the
// printables. docs/webp-twins.json records the PNG each twin came from, so a stale twin fails here.
const twinRecord = await json("docs/webp-twins.json");
for (const png of Object.keys(twinRecord)) {
  const data = await readFile(new URL("../" + png, import.meta.url));
  const size = webpSize(await readFile(new URL("../" + twin(png), import.meta.url)));
  if (twinRecord[png] !== sha(data)) throw Error("WebP twin is stale; run python -I tools/art/png-to-webp.py: " + png);
  if (!size || size[0] !== data.readUInt32BE(16) || size[1] !== data.readUInt32BE(20)) throw Error("WebP twin size differs from its PNG: " + png);
}

// Homeward Trail: every frame the scene draws is a real WebP of the recorded size.
const trail = (await json("docs/homeward-trail-assets.json")).assets;
for (const [id, frame] of Object.entries(topic.modeSkins.spelling.frames)) {
  const size = webpSize(await readFile(new URL("../" + frame.file, import.meta.url)));
  if (!trail[id] || trail[id].file !== frame.file || !size || size[0] !== frame.width || size[1] !== frame.height)
    throw Error("Homeward Trail frame missing or the wrong size: " + id);
}

// Budget: every picture the app shows exists, is under the per-file cap, and all of them fit the total.
let bytes = 0;
for (const path of new Set(assetPaths(topic))) {
  if (path.endsWith(".png")) throw Error("The app should show the WebP twin, not " + path);
  const info = await stat(new URL("../" + path, import.meta.url)).catch(() => null);
  if (!info?.isFile() || !info.size || info.size > topic.performance.maxAssetBytes) throw Error("Asset budget: " + path);
  bytes += info.size;
  const png = path.replace(/\.webp$/, ".png");
  if (png !== path && !(png in twinRecord) && (await stat(new URL("../" + png, import.meta.url)).catch(() => null)))
    throw Error("WebP twin not recorded; run python -I tools/art/png-to-webp.py: " + png);
}
if (bytes > topic.performance.maxTotalAssetBytes) throw Error("Total asset budget exceeded");

// Storybook and lesson videos (none yet): each video, poster and caption exists and stays under Cloudflare Pages' 25 MiB.
for (const v of [...storyVideos, ...lessonVideos])
  for (const path of [v.src, v.poster, v.captions]) {
    const info = await stat(new URL("../" + path, import.meta.url)).catch(() => null);
    if (!info?.size || info.size > 25 * 1024 * 1024) throw Error("Media video file missing or over 25 MiB: " + path);
  }

const groups = topic.categories.map((c) => topic.items.filter((x) => x.categoryId === c.id).length);
console.log(
  `Validated ${topic.items.length} words across ${topic.categories.length} groups (${groups.join("/")}), ` +
    `${topic.knowledgeQuestions.length} questions, ${topic.curriculum.readingPractice.length} reading lines, ` +
    `${Object.keys(twinRecord).length} WebP twins, ${Object.keys(topic.modeSkins.spelling.frames).length} Homeward Trail frames; ` +
    `${(bytes / 1048576).toFixed(1)} MiB of pictures.`,
);
