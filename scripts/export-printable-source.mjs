// Writes the words and groups the printable scripts read. usage: node scripts/export-printable-source.mjs <out.json>
if (!process.env.MAMMALS_MEDIA_READY) { console.error("Insects template (21 November 2026): fit it to Mammals in the media stage before running (docs/UPGRADE-PLAN.md)."); process.exit(1); }
import fs from "node:fs";
import { topic } from "../src/topics/mammals.js";
import { letterSources } from "../src/topics/letter-pictures.js";
import { blendSources, familySources } from "../src/topics/sound-pictures.js";

// The app shows WebP twins; the printables are made from the PNG originals beside them.
const original = (image) => image?.replace(/\.webp$/, ".png");
const words = topic.items
  .filter((i) => i.kind === "word")
  .map(({ id, name, definition, image, categoryId }) => ({ id, name, definition, image: original(image), categoryId }));
const categories = topic.categories
  .map(({ id, label, image }) => ({ id, label, image: original(image) }))
  .filter((c) => words.some((w) => w.categoryId === c.id));
fs.writeFileSync(process.argv[2], JSON.stringify({ words, categories, letterSources, blendSources, familySources }, null, 1));
console.log(`${words.length} words, ${categories.length} groups`);
