import "./check.mjs";
import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname, relative, join } from "node:path";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "dist");
if (relative(root, output) !== "dist") throw Error("Unsafe output directory");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
// A PNG with a WebP twin stays in the repo for the printable scripts but is not shipped
// (blueprint v6.1). Homeward Trail originals in homeward-trail/ are sources only (the scene draws
// the WebP frames), so they stay home too.
const frames = join("flying-bugs", "assets"); // kept from Insects; Mammals has no flight frames yet
const shipped = (src) => !src.includes(frames) && (!src.endsWith(".png") || !existsSync(src.slice(0, -4) + ".webp"));
for (const file of ["index.html", "src", "assets"])
  await cp(resolve(root, file), resolve(output, file), { recursive: true, filter: shipped });
console.log("Built current source into dist.");
