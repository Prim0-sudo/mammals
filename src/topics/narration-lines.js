// Every line Mammal Discovery Club says out loud, in one list, so the af_heart narration bank
// (tools/voice/build.mjs) records exactly what the app speaks, and a test can check nothing is missing.
// Lines must match the engine's text exactly: the clip is found by its text.
import { topic } from "./mammals.js";
import { sortingRules, sortingPool } from "./sorting.js";
import { knowledgeBank } from "./knowledge-bank.js";
import { drawTracePlanned } from "./draw-trace-pictures.js";

// Screen titles the Listen button reads (static ones; per-word titles are built below).
export const SCREEN_LINES = [
  "Which words shall we meet?", "Which words shall we pick?", "Which words shall we spell?",
  "Which family shall we meet?", "Which family shall we pick?", "Which family shall we spell?",
  "How many words?", "Which questions shall we try?", "What shall we sort?", "Choose your picture clues",
  "What is hiding in the woods?", "Choose your matching game", "Find the matching pairs", "Picture Pick",
  topic.modeSkins.spelling.title, topic.modeSkins.spelling.instruction,
];

const capital = (name) => name[0].toLocaleUpperCase(topic.locale) + name.slice(1);

export function narrationLines() {
  const lines = new Map();
  const add = (text, source) => {
    if (typeof text !== "string" || !text.trim()) return;
    if (!lines.has(text)) lines.set(text, []);
    lines.get(text).push(source);
  };
  const words = topic.items.filter((i) => i.kind === "word");
  for (const w of words) {
    add(w.name, `word:${w.id}`);
    add(w.definition, `meaning:${w.id}`);
    add(w.sentence, `sentence:${w.id}`);
    add(`Meet the word: ${w.name}`, `meet-title:${w.id}`);
    add(`Find the picture for ${w.name}.`, `find-title:${w.id}`);
  }
  for (const rule of sortingRules) for (const w of sortingPool(rule, words)) add(`${rule.question} ${capital(w.name)}.`, `sort:${rule.id}:${w.id}`);
  for (const q of knowledgeBank) add(q.prompt, `question:${q.id}`);
  for (const p of drawTracePlanned.flatMap((l) => l.pictures)) add(p.say, `trace:${p.id}`);
  // Reading sentences for Listen & Read (the talk prompts with gaps are not read aloud).
  for (const r of topic.curriculum.readingPractice || []) if (!r.text.includes("…")) add(r.text, `reading:${r.id}`);
  for (const text of SCREEN_LINES) add(text, "screen");
  return [...lines].map(([text, sources]) => ({ text, sources }));
}
