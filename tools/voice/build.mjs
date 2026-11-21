// Builds the Little Bug Club af_heart narration bank with Kokoro (offline, CPU only).
// Default is a dry run (counts only). --make records the missing clips; --limit=N records at most N.
// Reuses the shared local Kokoro install (E:/Projects/tools/kokoro-voice: kokoro-js, its bundled
// voices and the q8 model cache) and Our Town's ffmpeg, so nothing is downloaded.
// WAV masters live OUTSIDE the repo; the game ships 64 kbps mono MP3s in assets/audio/heart/.
// Clips are keyed by a hash of the text, the spoken text and the settings, so unchanged lines are skipped.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { narrationLines } from "../../src/topics/narration-lines.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const config = JSON.parse(fs.readFileSync(new URL("./config.json", import.meta.url), "utf8"));
const fixes = JSON.parse(fs.readFileSync(new URL("./pronunciation-fixes.json", import.meta.url), "utf8")).rules;
const args = process.argv.slice(2);
const make = args.includes("--make");
const limit = Number(args.find((a) => a.startsWith("--limit="))?.slice(8)) || Infinity;
const masters = path.resolve(root, config.masterDirectory, config.voice);
const out = path.join(root, "assets/audio/heart");
const manifestFile = path.join(root, "src/audio/heart-manifest.json");

const spoken = (text) => fixes.find((r) => r.text === text)?.spokenText || text;
const key = (text) => crypto.createHash("sha256").update(JSON.stringify({ schema: 1, text, spokenText: spoken(text), voice: config.voice, model: config.model, dtype: config.dtype, speed: config.speed, bitrate: config.mp3Bitrate })).digest("hex");
const lines = narrationLines().map((l) => ({ ...l, key: key(l.text), spokenText: spoken(l.text) }));
const fileFor = (l) => `assets/audio/heart/${l.key}.mp3`;
const pending = lines.filter((l) => !fs.existsSync(path.join(root, fileFor(l))));

function writeManifest() {
  const clips = {};
  for (const l of lines) if (fs.existsSync(path.join(root, fileFor(l)))) clips[l.text] = fileFor(l);
  const done = Object.keys(clips).length;
  fs.writeFileSync(manifestFile, JSON.stringify({ status: done === lines.length ? "complete" : "incomplete", voice: config.voice, engine: "kokoro", model: config.model, dtype: config.dtype, sampleRate: 24000, lines: lines.length, clips }, null, 1) + "\n");
  return done;
}

const chars = pending.reduce((n, l) => n + l.spokenText.length, 0);
console.log(JSON.stringify({ mode: make ? "make" : "dry-run", lines: lines.length, pending: pending.length, characters: chars, masters, output: "assets/audio/heart" }));
if (!make) { writeManifest(); process.exit(0); }

// Import the same ESM builds kokoro-js uses, so the cache setting reaches its copy of transformers.
const modules = path.join(config.kokoroInstall, "node_modules");
const hf = await import(pathToFileURL(path.join(modules, "@huggingface/transformers/dist/transformers.node.mjs")).href);
const kokoroEntry = JSON.parse(fs.readFileSync(path.join(modules, "kokoro-js/package.json"), "utf8"));
const { KokoroTTS } = await import(pathToFileURL(path.join(modules, "kokoro-js", kokoroEntry.exports.node.import)).href);
hf.env.cacheDir = config.modelCache;
hf.env.allowRemoteModels = false;
const tts = await KokoroTTS.from_pretrained(config.model, { dtype: config.dtype, device: "cpu" });
fs.mkdirSync(masters, { recursive: true });
fs.mkdirSync(out, { recursive: true });
const started = Date.now();
let made = 0;
const failures = [];
for (const l of pending.slice(0, limit)) {
  try {
    const master = path.join(masters, `${l.key}.wav`);
    if (!fs.existsSync(master)) {
      const audio = await tts.generate(l.spokenText, { voice: config.voice, speed: config.speed });
      await audio.save(master);
    }
    const file = path.join(root, fileFor(l)), tmp = file + ".tmp.mp3";
    execFileSync(config.ffmpeg, ["-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-i", master, "-ac", "1", "-codec:a", "libmp3lame", "-b:a", config.mp3Bitrate, tmp], { windowsHide: true });
    fs.renameSync(tmp, file);
    made++;
    if (made % 25 === 0) { writeManifest(); console.log(`${made}/${Math.min(pending.length, limit)} in ${Math.round((Date.now() - started) / 1000)} s`); }
  } catch (error) {
    failures.push({ text: l.text, error: String(error.message) });
    console.error("FAILED", JSON.stringify(l.text), error.message);
  }
}
const done = writeManifest();
console.log(JSON.stringify({ made, failures: failures.length, recorded: done, of: lines.length, seconds: Math.round((Date.now() - started) / 1000) }));
if (failures.length) process.exitCode = 1;
