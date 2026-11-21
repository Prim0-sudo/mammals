// Builds the Little Bug Club whole-topic presentation (1920x1080 slides of inline-styled HTML)
// from the words, groups and Knowledge & Safety bank. Pictures come from
// scripts/create-presentation-images.py. usage: node scripts/create-presentation.mjs
if (!process.env.MAMMALS_MEDIA_READY) { console.error("Insects template (21 November 2026): fit it to Mammals in the media stage before running (docs/UPGRADE-PLAN.md)."); process.exit(1); }
import fs from "node:fs";
import { topic } from "../src/topics/mammals.js";
import { groupRows } from "../src/topics/word-order.js";
import { kindOf } from "../src/topics/kind-of.js";

const C = { dark: "#1F4F39", cream: "#FFFBED", paper: "#FBF7EC", mint: "#EEF4E4", sun: "#FFD85C", ink: "#3F4D40", head: "#1F4F39", soft: "#C9DDB8", line: "#E2E8D2", label: "#6B7A5E", answer: "#2B7A4B", letter: "#9C3B2E" };
const FONT = "'Trebuchet MS', 'Arial Rounded MT Bold', Arial, sans-serif";
const esc = (s) => String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const pic = (id) => `assets/presentation/${id}.jpg`;
const img = (src, alt, size, fit = "contain") => `<img src="${src}" alt="${esc(alt)}" style="width:${size}px;height:${size}px;object-fit:${fit};border-radius:20px">`;
const page = (bg, body, pad = "96px 128px 112px") => `<section style="background:${bg};color:${C.ink};font-family:${FONT};padding:${pad};display:flex;flex-direction:column;gap:32px">${body}</section>`;
const heading = (kicker, title) => `<div style="display:flex;flex-direction:column;gap:4px"><p style="font-size:24px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.label}">${esc(kicker)}</p><h2 style="font-size:64px;font-weight:600;line-height:1.15;color:${C.head}">${esc(title)}</h2></div>`;
const darkSlide = (kicker, title, text, footer, picture, alt) =>
  `<section style="background:${C.dark};color:${C.cream};font-family:${FONT};padding:128px;display:flex;flex-direction:row;align-items:center;gap:96px"><div style="flex:1;display:flex;flex-direction:column;gap:28px">${kicker}<h2 style="font-size:112px;font-weight:600;line-height:1.05;color:${C.cream}">${esc(title)}</h2><p style="font-size:40px;line-height:1.3;color:${C.soft}">${esc(text)}</p>${footer ? `<p style="font-size:28px;font-weight:700;color:${C.cream}">${esc(footer)}</p>` : ""}</div><div style="display:flex;align-items:center;justify-content:center;background:${C.cream};border-radius:48px;padding:32px">${img(picture, alt, 680)}</div></section>`;

const words = topic.items.filter((i) => i.kind === "word");
const byId = new Map(words.map((w) => [w.id, w]));
const groups = groupRows.map(([id, label, description]) => ({ id, label, description, words: words.filter((w) => w.categoryId === id) })).filter((g) => g.words.length);
const questions = topic.knowledgeQuestions;
const slides = [];
const add = (id, title, notes, html) => slides.push({ id, title, notes, html });
let letterTurn = 0;

function quickCheck(id, q) {
  // Rotate the choices so the right answer is not always A.
  const turn = letterTurn++ % 3;
  const choices = q.choices.map((c, i) => ({ ...c, right: c.id === q.correctChoiceId, i }));
  const order = [...choices.slice(turn), ...choices.slice(0, turn)];
  const at = order.findIndex((c) => c.right);
  const letter = "ABC"[at];
  const visual = q.visualItemId && byId.get(q.visualItemId);
  const left = visual ? 872 : 128, width = visual ? 920 : 1664;
  const rows = order.map((c, i) => `<div style="position:absolute;left:${left}px;top:${392 + i * 112}px;width:${width}px;height:92px;display:flex;flex-direction:row;align-items:center;gap:20px;background:${C.cream};border:2px solid #D5DEC5;border-radius:24px;padding:0 24px"><p style="font-size:32px;font-weight:600;color:${C.cream};background:${C.letter};width:56px;height:56px;line-height:56px;text-align:center;border-radius:999px">${"ABC"[i]}</p><p style="font-size:32px;line-height:1.2;color:${C.ink}">${esc(c.label)}</p></div>`).join("");
  const picture = visual ? `<div style="position:absolute;left:128px;top:128px;width:680px;height:680px;display:flex;align-items:center;justify-content:center;background:${C.cream};border:2px solid ${C.line};border-radius:32px;padding:30px">${img(pic(visual.id), visual.imageAlt, 620)}</div>` : "";
  const answer = `${letter}: ${order[at].label}`;
  add(id, q.prompt,
    `Read the question aloud and let the class vote before you click. Click once to reveal the answer.\nAnswer ${answer}. ${q.explanation}`,
    `<section style="background:${C.mint};color:${C.ink};font-family:${FONT};padding:128px">${picture}<p style="position:absolute;left:${left}px;top:128px;width:280px;font-size:26px;font-weight:700;color:${C.dark};background:${C.sun};padding:8px 20px;border-radius:999px;text-align:center">${q.safe ? "Staying safe" : "Quick check"}</p><h2 style="position:absolute;left:${left}px;top:200px;width:${width}px;font-size:50px;font-weight:600;line-height:1.15;color:${C.head}">${esc(q.prompt)}</h2>${rows}<div data-build-in="pop" style="position:absolute;left:${left}px;top:744px;width:${width}px;display:flex;flex-direction:column;gap:6px;background:${C.answer};border-radius:24px;padding:22px 28px"><p style="font-size:30px;font-weight:700;line-height:1.3;color:${C.cream}">Answer ${esc(answer)}</p><p style="font-size:26px;line-height:1.35;color:#E4F2DF">${esc(q.explanation)}</p></div></section>`);
}

const tiles = (items, width, size) => `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:24px">${items.map(([src, label]) => `<div style="width:${width}px;display:flex;flex-direction:column;align-items:center;gap:10px;background:${C.cream};border:2px solid ${C.line};border-radius:28px;padding:18px">${img(src, label, size)}<p style="font-size:28px;font-weight:600;line-height:1.2;color:${C.head};text-align:center">${esc(label)}</p></div>`).join("")}</div>`;

add("cover", "Little Bug Club", "Welcome! Today we explore the whole world of insects and minibeasts: what an insect is, how bugs grow, eat, live and move, the minibeasts that are not insects, and how to watch them safely and kindly.",
  `<section style="background:${C.dark};color:${C.cream};font-family:${FONT};padding:128px;display:flex;flex-direction:row;align-items:center;gap:96px"><div style="flex:1;display:flex;flex-direction:column;gap:32px"><p style="font-size:28px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${C.sun}">The whole topic</p><h1 style="font-size:150px;font-weight:600;line-height:1;color:${C.cream}">Insects &amp; Bugs</h1><p style="font-size:44px;line-height:1.3;color:${C.soft}">From tiny ants to buzzing bees: every word, how minibeasts live, and how to watch them safely.</p><p style="font-size:28px;font-weight:700;color:${C.cream}">${words.length} words · ${groups.length} topics · quick checks and safety</p></div><div style="display:flex;align-items:center;justify-content:center;background:${C.cream};border-radius:48px;padding:32px">${img(pic("ladybug"), byId.get("ladybug").imageAlt, 680)}</div></section>`);

add("agenda", `${groups.length} stops on the way`, `Here is our route: ${groups.map((g) => g.label).join(", ")}. We finish with how to stay safe.`,
  page(C.paper, heading("Our journey", `${["Ten", "Eleven"][groups.length - 10] || groups.length} stops on the way`) + tiles(groups.map((g, i) => [pic(`group-${g.id}`), `${i + 1}. ${g.label}`]), 300, 200)));

const ant = byId.get("ant");
add("what-is-an-insect", "What is an insect?", "Ask: how many legs does an insect have? Count them on the ant together. Every adult insect has three body parts, six legs and two antennae, and many have wings. Spiders, worms and snails are minibeasts, but they are not insects.",
  page(C.mint, `<div style="display:flex;flex-direction:row;align-items:center;gap:72px;flex:1"><div style="flex:1;display:flex;flex-direction:column;gap:28px"><p style="font-size:24px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.label}">Big question</p><h2 style="font-size:88px;font-weight:600;line-height:1.1;color:${C.head}">What is an insect?</h2><p style="font-size:40px;line-height:1.35">An insect is a small animal with a hard outside and a body in three parts.</p><div style="display:flex;flex-direction:column;gap:16px">${["Three body parts: head, thorax and abdomen.", "Six legs, all joined to the thorax.", "Two antennae for feeling and smelling. Many insects have wings too."].map((t) => `<p style="font-size:32px;line-height:1.3;background:${C.cream};border:2px solid ${C.line};border-radius:20px;padding:16px 24px">${esc(t)}</p>`).join("")}</div></div>${img(pic(ant.id), ant.imageAlt, 620)}</div>`));

// Up to four words a slide, but a kind and its examples stay together (content check, 19 November):
// a run is a word and the words after it that are kinds of it (at any depth). A run that does not fit
// the slide in hand starts a new one; a run longer than four is shared evenly over slides, starting with its kind.
const isKindOf = (id, wide) => { for (let at = kindOf[id]; at; at = kindOf[at]) if (at === wide) return true; return false; };
// Words that teach as one set stay on one slide (the four seasons).
const TOGETHER = [["spring", "summer", "autumn", "winter"]];
const together = (a, b) => TOGETHER.some((t) => t.includes(a) && t.includes(b));
function slideSets(list) {
  const runs = [];
  for (const w of list) {
    const run = runs.at(-1);
    if (run && run.some((x) => isKindOf(w.id, x.id) || together(w.id, x.id))) run.push(w);
    else runs.push([w]);
  }
  const sets = [];
  for (const run of runs) {
    const last = sets.at(-1);
    if (last && last.length + run.length <= 4) { last.push(...run); continue; }
    const size = Math.ceil(run.length / Math.ceil(run.length / 4)); // 5 -> 3 + 2, 9 -> 3 + 3 + 3
    for (let i = 0; i < run.length; i += size) sets.push(run.slice(i, i + size));
  }
  return sets;
}

groups.forEach((g, gi) => {
  const short = g.id;
  add(`${short}-intro`, g.label, `${g.description} As we meet each word, ask the class what they already know about it.`,
    darkSlide(`<p style="font-size:28px;font-weight:700;color:${C.dark};background:${C.sun};padding:10px 24px;border-radius:999px;align-self:start">Part ${gi + 1} of ${groups.length}</p>`, g.label, g.description, `${g.words.length} words`, pic(`group-${g.id}`), g.label));
  slideSets(g.words).forEach((set, si) => {
    const i = si * 4;
    const title = set.map((w) => w.name).join(", ").replace(/, ([^,]*)$/, " and $1");
    const cards = set.map((w) => `<div style="display:flex;flex-direction:row;align-items:center;gap:28px;background:${C.cream};border:2px solid ${C.line};border-radius:28px;padding:24px">${img(pic(w.id), w.imageAlt, 290)}<div style="flex:1;display:flex;flex-direction:column;gap:10px"><h3 style="font-size:48px;font-weight:600;line-height:1.1;color:${C.head}">${esc(w.name[0].toUpperCase() + w.name.slice(1))}</h3><p style="font-size:28px;line-height:1.35">${esc(w.definition)}</p></div></div>`).join("");
    add(`${short}-${i / 4 + 1}`, title[0].toUpperCase() + title.slice(1), set.map((w) => `${w.name[0].toUpperCase() + w.name.slice(1)}: ${w.definition}`).join("\n"),
      page(C.paper, heading(g.label, title[0].toUpperCase() + title.slice(1)) + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">${cards}</div>`));
  });
  questions.filter((q) => q.groupId === g.id && !q.safe).slice(0, 2).forEach((q, qi) => quickCheck(`${short}-q${qi + 1}`, q));
});

const safe = questions.filter((q) => q.safe);
add("safety-intro", "Staying safe", "Most minibeasts are harmless, but a few can sting or bite. Being a good bug watcher means keeping yourself and the minibeasts safe.",
  darkSlide(`<p style="font-size:28px;font-weight:700;color:${C.dark};background:${C.sun};padding:10px 24px;border-radius:999px;align-self:start">Last stop</p>`, "Staying safe", "How to watch minibeasts kindly, and what to do about stings and bites.", `${safe.length} safety checks`, pic("magnifying-glass"), "A magnifying glass"));
add("safety-rules", "Bug watcher rules", "Go through each rule. Ask: why is it kind to put a minibeast back where you found it?",
  page(C.mint, heading("Staying safe", "Bug watcher rules") + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">${["Look first. Ask a grown-up before you touch anything.", "Never touch bees, wasps, hornets or hairy caterpillars.", "Stay calm and move slowly away from anything that stings.", "Use a bug jar gently and keep it out of the sun.", "Put every minibeast back where you found it.", "Wash your hands after a bug hunt."].map((t) => `<p style="font-size:34px;line-height:1.3;background:${C.cream};border:2px solid ${C.line};border-radius:24px;padding:24px 28px">${esc(t)}</p>`).join("")}</div>`));
safe.forEach((q, i) => quickCheck(`safety-q${i + 1}`, q));

add("recap", "What we learned", "Look back at each topic. Ask the class to name one new word from each.",
  page(C.paper, heading("Looking back", "What we learned") + `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:20px">${groups.map((g) => `<div style="width:520px;display:flex;flex-direction:row;align-items:center;gap:16px;background:${C.cream};border:2px solid ${C.line};border-radius:24px;padding:14px">${img(pic(`group-${g.id}`), g.label, 120)}<div style="flex:1;display:flex;flex-direction:column;gap:4px"><h3 style="font-size:28px;font-weight:600;line-height:1.15;color:${C.head}">${esc(g.label)}</h3><p style="font-size:21px;line-height:1.3">${esc(g.description)}</p></div></div>`).join("")}</div>`, "72px 96px 80px"));
add("keep-exploring", "Keep exploring", "Finish by planning a bug hunt: where will you look, what will you take, and how will you keep the minibeasts safe?",
  darkSlide(`<p style="font-size:28px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${C.sun}">Well done, bug watchers</p>`, "Keep exploring", "Look under logs, in the grass and by the pond. Look closely, be gentle, and put every minibeast back.", "", pic("bug-jar"), byId.get("bug-jar")?.imageAlt || "A bug jar"));

const deck = { id: "insects-full-topic", title: "Insects & Bugs: the whole topic", width: 1920, height: 1080, slides };
fs.writeFileSync(new URL("../src/topics/presentation.js", import.meta.url),
  `// Generated by scripts/create-presentation.mjs from the words, groups and question bank (${slides.length} slides, 1920x1080).\n// Each slide is one <section> with inline styles; pictures live in assets/presentation/.\nexport const insectsPresentation = ${JSON.stringify(deck, null, 1)};\n`);
const missing = [...new Set(slides.flatMap((s) => [...s.html.matchAll(/src="([^"]+)"/g)].map((m) => m[1])))].filter((p) => !fs.existsSync(new URL(`../${p}`, import.meta.url)));
console.log(`${slides.length} slides; missing pictures: ${missing.length ? missing.join(", ") : "none"}`);
