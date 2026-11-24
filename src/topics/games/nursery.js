// Nursery Round-up (education): data, SETTINGS and the pure round builder (docs/topic-games-concepts/DESIGN.md, section 3).
// Babies wander in the meadow; the child brings each one to its mother. No DOM here.

// Per level: how many mother-and-baby pairs, whether babies show their picture (Hard: the name card only),
// and whether a baby's name is spoken when it is picked. two: most slips that still give two stars.
export const SETTINGS = {
  easy: { pairs: 3, picture: true, two: 2 },
  medium: { pairs: 5, picture: true, two: 2 },
  hard: { pairs: 6, picture: false, two: 2 },
};

// mother -> baby, with the line that plays when the baby gets home. Every line is about milk.
// lion–cub and elephant–calf are left out: they would give "cub" and "calf" two mothers.
export const PAIRS = [
  { mother: "kangaroo", baby: "joey", line: "A joey drinks milk in its mother's pouch." },
  { mother: "cow", baby: "calf", line: "A calf drinks its mother's milk." },
  { mother: "sheep", baby: "lamb", line: "A lamb wags its tail as it drinks its mother's milk." },
  { mother: "horse", baby: "foal", line: "A foal stands up soon after it is born, then drinks its mother's milk." },
  { mother: "goat", baby: "kid", line: "A kid drinks its mother's milk, then starts to climb." },
  { mother: "pig", baby: "piglet", line: "Piglets line up to drink their mother's milk." },
  { mother: "cat", baby: "kitten", line: "A kitten drinks its mother's milk and purrs." },
  { mother: "dog", baby: "puppy", line: "A puppy drinks its mother's milk until its teeth grow." },
  { mother: "seal", baby: "pup", line: "A seal pup drinks rich milk and grows fast." },
  { mother: "bear", baby: "cub", line: "A bear cub drinks its mother's milk in the winter den." },
  // Deer and fawn come back once the painted art has a hind: the deer word picture is a stag, and a
  // mother with antlers would teach the wrong thing.
  // { mother: "deer", baby: "fawn", line: "A fawn hides in the long grass between drinks of milk." },
];

// Other mothers on the list whose young can share a baby's name, so they never meet in a round:
// a dog's puppy is also called a pup, and a red deer's young is called a calf.
export const ALSO = { pup: ["dog"], calf: ["deer"] };

export const nameOf = (id) => id.replaceAll("-", " ");
const an = (word) => (/^[aeiou]/i.test(word) ? "an" : "a");
export const pairOf = (baby) => PAIRS.find((p) => p.baby === baby);
export const motherOf = (baby) => pairOf(baby)?.mother;
// Every mother on the list a baby's name could fairly belong to.
export const mothersFor = (baby) => [motherOf(baby), ...(ALSO[baby] || [])];
export const matchesOnBoard = (baby, mothers) => mothers.filter((m) => mothersFor(baby).includes(m)).length;
export const rightLine = (baby) => pairOf(baby).line;
// A wrong mother says who she is: "I'm a sheep. A calf's mother is a cow."
export const wrongLine = (baby, mother) => `I'm ${an(nameOf(mother))} ${nameOf(mother)}. ${an(nameOf(baby)) === "an" ? "An" : "A"} ${nameOf(baby)}'s mother is ${an(nameOf(motherOf(baby)))} ${nameOf(motherOf(baby))}.`;

function shuffled(list, rand) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// A pure, seeded round: the babies in the meadow (in order) and the mothers along the bottom (in order).
// No baby could fairly go to two mothers on the board.
export function buildRound(level, rand = Math.random) {
  const cfg = SETTINGS[level];
  for (let attempt = 0; attempt < 500; attempt++) {
    const chosen = [];
    for (const p of shuffled(PAIRS, rand)) {
      if (chosen.length === cfg.pairs) break;
      const next = [...chosen, p];
      const mothers = next.map((x) => x.mother);
      if (next.every((x) => matchesOnBoard(x.baby, mothers) === 1)) chosen.push(p);
    }
    if (chosen.length < cfg.pairs) continue;
    const babies = shuffled(chosen.map((p) => p.baby), rand);
    let mothers = shuffled(chosen.map((p) => p.mother), rand);
    // The mothers never stand in the same order as the babies, so position gives nothing away.
    for (let k = 0; k < 20 && mothers.every((m, i) => motherOf(babies[i]) === m); k++) mothers = shuffled(mothers, rand);
    return { level, babies, mothers };
  }
  throw new Error("No fair Nursery Round-up round");
}

// Spoken lines, shared by the view and the narration bank.
export const PICK_FIRST = "Pick a baby first, then its mother.";
export const START_PICTURES = "Tap a baby, then tap its mother.";
export const START_CARDS = "Read the name card, then tap the baby's mother.";
// Everything Nursery Round-up can say: every name (tapped), each right line and each wrong mother.
export function voiceLines() {
  const lines = [PICK_FIRST, START_PICTURES, START_CARDS];
  const mothers = [...new Set(PAIRS.map((p) => p.mother))];
  for (const m of mothers) lines.push(nameOf(m));
  for (const p of PAIRS) {
    lines.push(nameOf(p.baby), rightLine(p.baby));
    for (const m of mothers) if (!mothersFor(p.baby).includes(m)) lines.push(wrongLine(p.baby, m));
  }
  return lines;
}
