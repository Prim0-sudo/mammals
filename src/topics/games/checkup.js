// Mammal Check-up (education): animals visit the vet. Three checks, hair or fur, breathes air and milk
// for babies, then a stamp: a mammal says yes to all three. Pure data and rules; the screen is
// src/core/games/checkup-view.js. Design: docs/topic-games-concepts/DESIGN.md, section 1.

export const CHECKS = [
  { id: "hair", label: "Hair or fur?", short: "Hair", art: "fur", key: "1" },
  { id: "air", label: "Breathes air?", short: "Air", art: "lungs", key: "2" },
  { id: "milk", label: "Milk for babies?", short: "Milk", art: "milk", key: "3" },
];

const lungs = [true, "Yes, it breathes air with lungs."];
const gills = [false, "No, it breathes in water with gills."];
const feathers = [false, "No, it has feathers."];
const scales = [false, "No, it has scales."];
const eggsNoMilk = [false, "No. Its babies hatch from eggs and never drink milk."];
const fishNoMilk = [false, "No. Its babies look after themselves. No milk."];

// pool: plain (easy to see), sea (lives in water), tricky (looks like the other side). pair: the
// Hard slot a mammal can fill (lays eggs, flies or has spines, lives in the sea).
export const VISITORS = [
  { id: "dog", mammal: true, pool: "plain", hair: [true, "Yes, a furry coat."], air: lungs, milk: [true, "Yes, it feeds its puppies milk."] },
  { id: "cow", mammal: true, pool: "plain", hair: [true, "Yes, short hair all over."], air: lungs, milk: [true, "Yes, its calf drinks milk."] },
  { id: "rabbit", mammal: true, pool: "plain", hair: [true, "Yes, soft fur."], air: lungs, milk: [true, "Yes, its babies drink milk."] },
  { id: "horse", mammal: true, pool: "plain", hair: [true, "Yes, a hairy coat and a mane."], air: lungs, milk: [true, "Yes, its foal drinks milk."] },
  { id: "elephant", mammal: true, pool: "plain", hair: [true, "Yes, a few rough hairs."], air: lungs, milk: [true, "Yes, its calf drinks milk."] },
  { id: "kangaroo", mammal: true, pool: "plain", hair: [true, "Yes, thick fur."], air: lungs, milk: [true, "Yes, its joey drinks milk in the pouch."] },
  { id: "whale", mammal: true, pool: "sea", pair: "sea", hair: [true, "Yes, a few hairs on its head."], air: [true, "Yes, through its blowhole."], milk: [true, "Yes, it feeds its calf milk."] },
  { id: "dolphin", mammal: true, pool: "sea", pair: "sea", hair: [true, "Yes, a few hairs when it is born."], air: [true, "Yes, through its blowhole."], milk: [true, "Yes, it feeds its calf milk."] },
  { id: "seal", mammal: true, pool: "sea", hair: [true, "Yes, short fur."], air: [true, "Yes, it comes up to breathe."], milk: [true, "Yes, its pup drinks milk."] },
  { id: "bat", mammal: true, pool: "tricky", pair: "flier", hair: [true, "Yes, soft fur."], air: lungs, milk: [true, "Yes. It flies, but it feeds its baby milk."] },
  { id: "hedgehog", mammal: true, pool: "tricky", pair: "flier", hair: [true, "Yes. Its spines are stiff hairs."], air: lungs, milk: [true, "Yes, its babies drink milk."] },
  { id: "platypus", mammal: true, pool: "tricky", pair: "eggs", hair: [true, "Yes, thick fur."], air: lungs, milk: [true, "Yes. It lays eggs, but it feeds its babies milk."] },
  { id: "echidna", mammal: true, pool: "tricky", pair: "eggs", hair: [true, "Yes. Its spines are stiff hairs."], air: lungs, milk: [true, "Yes. It lays eggs, but it feeds its babies milk."] },
  { id: "frog", mammal: false, pool: "plain", hair: [false, "No, it has smooth, wet skin."], air: [true, "Yes, with lungs and through its skin."], milk: [false, "No. Its tadpoles hatch from eggs. No milk."] },
  { id: "duck", mammal: false, pool: "plain", hair: feathers, air: lungs, milk: eggsNoMilk },
  { id: "chicken", mammal: false, pool: "plain", hair: feathers, air: lungs, milk: eggsNoMilk },
  { id: "snake", mammal: false, pool: "plain", hair: scales, air: lungs, milk: eggsNoMilk },
  { id: "lizard", mammal: false, pool: "plain", hair: scales, air: lungs, milk: eggsNoMilk },
  { id: "tortoise", mammal: false, pool: "plain", hair: [false, "No, it has a shell and scales."], air: lungs, milk: eggsNoMilk },
  { id: "goldfish", mammal: false, pool: "plain", hair: scales, air: gills, milk: fishNoMilk },
  { id: "fish", mammal: false, pool: "sea", hair: scales, air: gills, milk: fishNoMilk },
  { id: "salmon", mammal: false, pool: "sea", hair: scales, air: gills, milk: fishNoMilk },
  { id: "shark", mammal: false, pool: "tricky", hair: [false, "No, it has rough skin."], air: gills, milk: fishNoMilk },
  { id: "penguin", mammal: false, pool: "tricky", hair: feathers, air: lungs, milk: eggsNoMilk },
  { id: "crocodile", mammal: false, pool: "tricky", hair: scales, air: lungs, milk: eggsNoMilk },
  { id: "turtle", mammal: false, pool: "tricky", hair: [false, "No, it has a shell and scales."], air: lungs, milk: eggsNoMilk },
  { id: "owl", mammal: false, pool: "tricky", hair: feathers, air: lungs, milk: eggsNoMilk },
];

// Per level: how many visitors of each kind, and whether the next check glows.
export const SETTINGS = {
  easy: { visitors: 4, mix: { mammals: [["plain", 2]], others: [["plain", 2]] }, glow: true },
  medium: { visitors: 6, mix: { mammals: [["plain", 2], ["sea", 1]], others: [["plain", 2], ["sea", 1]] }, glow: false },
  hard: { visitors: 6, mix: { mammals: [["eggs", 1], ["flier", 1], ["sea", 1]], others: [["tricky", 3]] }, glow: false },
};
export const STAR_SLIPS = 1;

const pick = (list, n, rand) => {
  const a = [...list];
  const out = [];
  while (out.length < n && a.length) out.push(a.splice(Math.floor(rand() * a.length), 1)[0]);
  return out;
};
export function shuffleWith(list, rand) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// One clinic session: visitor records in play order, each animal once.
export function buildRound(level, rand = Math.random) {
  const cfg = SETTINGS[level];
  const used = new Set();
  const out = [];
  const take = (mammal, group, n) => {
    const pool = VISITORS.filter((v) => v.mammal === mammal && !used.has(v.id) && (level === "hard" && mammal ? v.pair === group : v.pool === group));
    for (const v of pick(pool, n, rand)) {
      used.add(v.id);
      out.push(v);
    }
  };
  for (const [g, n] of cfg.mix.mammals) take(true, g, n);
  for (const [g, n] of cfg.mix.others) take(false, g, n);
  return shuffleWith(out, rand);
}

export const answer = (visitor, check) => visitor[check];
// "a dog", "an owl".
export const withA = (name) => `${/^[aeiou]/i.test(name) ? "an" : "a"} ${name}`;
const cap = (t) => t[0].toUpperCase() + t.slice(1);
// A mammal answers yes to every check.
export const isMammal = (visitor) => CHECKS.every((c) => visitor[c.id][0]);
// The line shown after a wrong stamp: what the checks found, and the right stamp.
const MISSING = { hair: "has no hair or fur", air: "breathes with gills", milk: "does not feed its babies milk" };
export function why(visitor, name) {
  if (isMammal(visitor)) return `${cap(withA(name))} has hair, breathes air and feeds its babies milk. It is a mammal.`;
  const no = CHECKS.filter((c) => !visitor[c.id][0]).map((c) => MISSING[c.id]);
  const list = no.length > 1 ? `${no.slice(0, -1).join(", ")} and ${no.at(-1)}` : no[0];
  return `${cap(withA(name))} ${list}. It is not a mammal.`;
}

// Spoken lines. The view and the narration bank both build them here, so a clip always matches.
export const arriveLine = (name) => `Here comes ${withA(name)}.`;
export const stampLine = (visitor, name) => (isMammal(visitor) ? `Yes! ${cap(withA(name))} is a mammal.` : `Right! ${cap(withA(name))} is not a mammal.`);
export const FIRST_LINE = "Run all three checks first.";
// Everything Check-up can say, given how the app names each animal.
export function voiceLines(name) {
  const lines = [FIRST_LINE];
  for (const v of VISITORS) {
    const n = name(v.id);
    lines.push(n, arriveLine(n), why(v, n), stampLine(v, n), ...CHECKS.map((c) => v[c.id][1]));
  }
  return lines;
}
