// Mammal Discovery Club: the Mammals topic on the Insects layout (blueprint v7.0, 21 November 2026).
// Only the topic changes from Little Bug Club: words, pictures, scenery, colours (same roles),
// topic-game mechanics and voice. Anything Mammals has no content for yet shows an honest
// "coming soon" placeholder in the same place (see docs/UPGRADE-PLAN.md for the gap list).
import { groupRows, groupOf, wordOrder, categoryOrder } from "./word-order.js";
import { wordRows } from "./mammals-words.js";
import { knowledgeBank } from "./knowledge-bank.js";
import { trailAssets } from "../core/skins/homeward-assets.js";

// Curriculum objective each word group's questions practise.
const OBJECTIVE_BY_GROUP = {
  mammals: "traits", body: "traits", "life-cycle": "young", food: "homes", homes: "homes",
  movement: "traits", survival: "traits", habitats: "homes", neighbours: "traits", watching: "care",
};
const base = "assets/topics/mammals/";
const word = (id) => `${base}vocabulary/${id}.webp`;
const menuArt = (id) => `${base}menu/${id}.webp`;
const badge = `${base}generated/club-badge-rabbit.webp`;

// Every word with its picture, placed in its group and in teaching order (word-order.js).
const rank = (id) => categoryOrder.indexOf(groupOf[id]) * 1000 + wordOrder[groupOf[id]].indexOf(id);
const vocabulary = wordRows
  .filter((item) => groupOf[item.id])
  .map((item) => ({ ...item, categoryId: groupOf[item.id] }))
  .sort((a, b) => rank(a.id) - rank(b.id));
const has = (id) => vocabulary.some((x) => x.id === id);

const modeRows = [
  ["learn", "Meet the Words", "Look closely. Say it together.", "menu:learn"],
  ["sort", "Sort It", "Find where each word belongs.", "menu:sort"],
  ["detective", "Detective", "A picture is hiding. Can you guess it?", "menu:detective"],
  ["identify", "Which One Is It?", "Look, read and choose.", "menu:identify"],
  ["knowledge", "Knowledge & Safety", "Be a kind and careful animal watcher.", "menu:knowledge"],
  ["spelling", "Homeward Trail", "Guess a word. Help the rabbit hop home.", "menu:spelling"],
  ["flip", "Flip the Tiles", "Find every matching pair.", "menu:flip"],
  ["wheel", "Picture Pick", "Pick a picture. Read a new word.", "menu:wheel"],
];

// Read-together lines from the first Mammals app, kept for teacher review.
const readingRows = [
  ["cat", "The cat has fur.", "Read the sentence, then name what covers the cat.", "sentences"],
  ["dog", "A big dog ran.", "Find the action word; ran means run in the past.", "sentences"],
  ["whale", "Whales are mammals because they breathe air.", "This gives one clue, not a full definition: birds breathe air too. Add milk, hair at some time in life, and a backbone.", "traits"],
  ["fur", "Mammals have warm bodies.", "Warm-blooded means the body makes its own heat; it does not mean every mammal feels hot to touch.", "traits"],
  ["lion", "This is a lion.", "Use the frame \"This is a…\" with other mammal names. Say \"an elephant\".", "sentences"],
  ["dolphin", "A dolphin lives in water.", "Use \"A … lives on/in …\". Compare a horse on land.", "homes"],
  ["milk", "Mammal mothers feed their young milk.", "Compare kitten and cat, calf and cow.", "young"],
  ["platypus", "Most mammals have live young. A platypus lays eggs.", "Echidnas also lay eggs.", "traits"],
  ["whale", "The whale comes up to breathe.", "Draw the caption, then explain why it comes up.", "homes"],
  ["joey", "The joey is in the pouch.", "Find the mother and the baby in the picture.", "young"],
  ["giraffe", "The giraffe eats a leaf.", "Draw the caption, then read it to the group.", "sentences"],
  ["seal", "We give the seal space.", "Watch from a safe distance with a grown-up and follow local guidance.", "care"],
  ["ocean-floor", "The walrus finds food on the ocean floor.", "The ocean floor is a feeding place, not somewhere a mammal can breathe.", "homes"],
  ["fur", "Mammals have hair at some time in their lives.", "Fur is a coat of hair. Whales may have only a few hairs.", "traits"],
];
const readingPractice = readingRows
  .filter(([itemId]) => has(itemId))
  .map(([itemId, text, note, objectiveId], i) => ({ id: `read-${i + 1}`, itemId, text, note, objectiveId, type: i > 8 ? "Read, draw & talk" : "Read together" }));

const objectives = [
  { id: "traits", label: "Describe what makes an animal a mammal" },
  { id: "young", label: "Connect mothers, milk and young" },
  { id: "homes", label: "Describe food, homes and habitats on land and in water" },
  { id: "sentences", label: "Use sentence frames and read short captions" },
  { id: "care", label: "Watch animals safely and kindly" },
];
const objectiveGroups = { traits: ["mammals", "body", "movement", "survival"], young: ["life-cycle"], homes: ["food", "homes", "habitats"], sentences: [], care: ["watching"] };

const knowledgeQuestions = knowledgeBank.map(({ id, group, word: w, prompt, choices, explanation, safe }) => ({
  id,
  prompt,
  groupId: group,
  safe,
  visualItemId: w && has(w) ? w : null,
  sceneImage: null,
  choices: choices.map((label, i) => ({ id: `${id}-${i}`, label })),
  correctChoiceId: `${id}-0`,
  explanation,
  objectiveId: safe ? "care" : OBJECTIVE_BY_GROUP[group],
}));

const coverage = objectives.map((o) => ({
  objectiveId: o.id,
  itemIds: o.id === "sentences"
    ? [...new Set(readingPractice.filter((r) => r.objectiveId === "sentences").map((r) => r.itemId))]
    : o.id === "care" ? ["seal", "dog"].filter(has)
    : vocabulary.filter((x) => objectiveGroups[o.id].includes(x.categoryId)).map((x) => x.id),
  modeIds: o.id === "care" ? ["learn", "knowledge"] : ["learn", "identify", "knowledge", "wheel"],
  promptIds: [...knowledgeQuestions, ...readingPractice].filter((x) => x.objectiveId === o.id).map((x) => x.id),
}));

export const topic = {
  id: "mammals",
  locale: "en-GB",
  title: "Mammal Discovery Club",
  subtitle: "From tiny paws to ocean giants.",
  subject: "Mammals",
  itemNoun: "mammal word",
  description: `A teacher-led Mammals adventure with ${vocabulary.length} illustrated words, games, phonics and crafts.`,
  launch: {
    logoImage: badge,
    logoAlt: "The Mammal Discovery Club badge with a rabbit",
    buttonImage: badge,
    backgroundImage: `${base}generated/woodland-clearing-rocks.webp`,
    backgroundAlt: "A sunny woodland clearing with rocks, ferns and trees",
  },
  // Same colour roles as Insects: deep green primary, warm accent, dark ink, eight soft card tints.
  theme: {
    primary: "#295e55",
    accent: "#cf9449",
    ink: "#263e39",
    cardColors: ["#f3d7a4", "#d4e2bd", "#dce4e5", "#edd2c2", "#d7d2e6", "#e4dfa8", "#e9cdd6", "#c4dfe0"],
  },
  text: {
    alphabet: "abcdefghijklmnopqrstuvwxyz",
    normalisation: "NFC",
    spellingCase: "lower",
    ignoreCharacters: " -'",
    learnPrompt: "Look, name and describe",
    correctItem: "You found it!",
    menuEyebrow: "OUR MAMMAL FIELD GUIDE",
    menuFootnote: "Pick an adventure. Let curiosity lead.",
    launchPrompt: "Explore",
    launchHint: "Choose an activity",
    resultsTitle: "Marvellous mammal spotting!",
  },
  // All ten groups show in teaching order; a group with no words yet is a "Coming soon" card.
  showEmptyGroups: true,
  categories: groupRows.map(([id, label, description, visual]) => ({
    id,
    label,
    description,
    image: visual && has(visual) ? word(visual) : badge,
    imageAlt: label,
  })),
  categoryIntroductions: { countAsWords: false, includeInModes: [] },
  items: vocabulary,
  // Arrows for body-part pictures wait for the final art (their positions are measured on it).
  partPointers: {},
  knowledgeQuestions,
  modes: modeRows.map(([id, label, description, visual]) => ({
    id,
    label,
    description,
    image: visual.startsWith("menu:") ? menuArt(visual.slice(5)) : word(visual),
  })),
  knowledgeSafetyImage: word("sniff"),
  pickAllImage: menuArt("wheel"),
  // Home menu (blueprint v6.1): featured game banner, then eight tiles; Activities is a folder.
  menu: {
    title: "Choose a game",
    featured: { target: "games", title: "Mammal Games", subtitle: "Three new mammal games are on the way.", image: word("elephant"), imageAlt: "An elephant" },
    tiles: [
      { id: "learn", label: "Meet the Words", image: menuArt("learn") },
      { id: "activities", label: "Activities", image: menuArt("sort") },
      { id: "knowledge", label: "Knowledge & Safety", image: menuArt("knowledge") },
      { id: "media", label: "Media", image: menuArt("video") },
      { id: "games", label: "Mammal Games", image: word("cheetah") },
      { id: "phonics", label: "Phonics & Sight Words", image: menuArt("phonics") },
      { id: "arts", label: "Arts & Crafts", image: menuArt("create") },
      { id: "more", label: "More Topics", image: `${base}generated/club-badge.webp` },
    ],
    activities: ["sort", "detective", "identify", "spelling", "flip", "wheel"],
    hubs: {
      phonics: { title: "Phonics & Sight Words", label: "READING PRACTICE", note: "Alphabet, short vowels, blends, sound families and reading practice, with Mammals picture cards." },
    },
  },
  modeSkins: {
    spelling: {
      id: "homeward-trail",
      title: "Homeward Trail",
      instruction: "Find the letters to help the rabbit hop home. Nine incorrect guesses per word.",
      attempts: 9,
      winAnnouncement: "The rabbit is heading home!",
      wrongAnnouncement: "One chance is used. Try another letter.",
      frames: trailAssets,
      assets: Object.values(trailAssets).map((frame) => frame.file),
    },
  },
  sessions: {
    defaultRoundCount: 12,
    supportedFlipWordCounts: [10, 20, 30],
    wheel: { allWords: true, capacity: 12, markerStrategy: "explicit-batches" },
  },
  curriculum: {
    source: "docs/curriculum-outline.png",
    period: "30 November–4 December (year not specified)",
    reviewStatus: "Teacher review pending for all drafted wording and extensions.",
    objectives,
    coverage,
    readingPractice,
  },
  performance: {
    maxAssetBytes: 12000000,
    maxTotalAssetBytes: 96 * 1024 * 1024,
  },
  completionMessages: {
    learn: "Look, name, describe. Well done!",
    sort: "You found a place for every word!",
    identify: "What a sharp-eyed explorer!",
    knowledge: "Kind choices help every animal.",
    spelling: "The rabbit made it home!",
    flip: "Every pair, together again.",
    wheel: "So many mammal words!",
    detective: "Sharp eyes, clever guesses!",
  },
};
