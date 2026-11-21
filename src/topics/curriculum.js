// Teacher scope for Mammal Discovery Club: three levels, six lessons and five collections
// (the Insects pattern, 21 November 2026). Provisional teaching organisation (teacher review
// pending). Lessons follow the word groups in word-order.js, so a word joins its lessons as soon
// as its picture lands. Lessons and collections may overlap; levels describe how demanding a word
// is, not a child's age.
import { groupRows, wordOrder } from "./word-order.js";

const split = (text) => text.trim().split(/\s+/);

export const levels = [
  { id: "1", label: "Level 1", description: "Familiar pets, farm animals, body parts, places and actions." },
  { id: "2", label: "Level 2", description: "Wild mammals from around the world and words for how they live." },
  { id: "3", label: "Level 3", description: "Harder words such as backbone, blowhole, echidna and seagrass." },
];

export const lessons = [
  { id: "mammals", label: "1. What is a mammal?", description: "Meet mammals and look closely at their bodies.", groups: ["mammals", "body"], extra: "milk" },
  { id: "young", label: "2. Mothers and young", description: "See how baby mammals are born, fed and grow, and what they eat.", groups: ["life-cycle", "food"], extra: "cat dog cow sheep goat pig horse deer lion seal kangaroo platypus echidna pouch" },
  { id: "homes", label: "3. Homes and habitats", description: "Visit burrows, dens and caves, and the places mammals live.", groups: ["homes", "habitats"], extra: "rabbit fox wombat bear polar-bear camel walrus badger otter beaver squirrel bat" },
  { id: "moving", label: "4. Moving and staying safe", description: "Discover how mammals move, sense the world and hide.", groups: ["movement", "survival"], extra: "paw hoof flipper tail whiskers nose ear hedgehog meerkat wolf" },
  { id: "neighbours", label: "5. Mammal or not?", description: "Compare mammals with birds, fish, reptiles and other animals.", groups: ["neighbours"], extra: "fur milk lungs backbone whale dolphin bat platypus egg fin blowhole" },
  { id: "watching", label: "6. Be an animal watcher", description: "Watch animals carefully and kindly, and stay safe near them.", groups: ["watching"], extra: "cat dog rabbit guinea-pig seal sea-lion deer fox badger hedgehog squirrel bat owl" },
];

export const collections = [
  { id: "pets", label: "Pets", description: "Mammals many people keep at home.",
    words: "cat dog rabbit hamster guinea-pig mouse rat kitten puppy fur whiskers paw tail feed drink sleep groom ferret hutch kennel goldfish gentle wash-hands" },
  { id: "farm", label: "On the farm", description: "Mammals that live on farms, and their young.",
    words: "horse donkey cow sheep goat pig calf lamb kid foal milk grass hoof horn chew pony llama piglet hay wool snout graze stable barn farm chicken duck" },
  { id: "sea", label: "Sea mammals", description: "Mammals that live in the sea but breathe air.",
    words: "whale dolphin porpoise seal sea-lion walrus sea-otter manatee dugong flipper blowhole tusk swim dive float breathe ocean ocean-floor sea-ice seagrass blue-whale orca narwhal pup fin krill beach" },
  { id: "wild-world", label: "Wild mammals of the world", description: "Big wild mammals from grasslands, forests and deserts.",
    words: "lion tiger cheetah leopard elephant giraffe zebra rhinoceros hippopotamus camel monkey chimpanzee gorilla sloth bear polar-bear wolf moose kangaroo koala wombat platypus echidna grassland desert forest snow trunk mane snow-leopard jaguar arctic-fox reindeer giant-panda meerkat orangutan wallaby rainforest mountain bamboo roar herd" },
  { id: "staying-safe", label: "Staying safe", description: "Watching mammals kindly and keeping safe near them.",
    words: "seal dog cat fox bear wolf claw tooth tusk horn hide sniff grown-up quiet stay-back gentle wash-hands binoculars droppings spines hedgehog bee jellyfish crab" },
];

const level1 = split(`cat dog rabbit mouse horse cow sheep goat pig fox bear lion tiger elephant giraffe zebra monkey
  whale dolphin seal fur eye ear nose mouth tooth tail paw milk kitten puppy lamb calf cub grass leaf fruit water
  drink walk run hop jump climb swim dig sleep hide land snow river pond
  pony giant-panda human wool stripes spots mother baby egg piglet hay berries nuts nest hutch kennel stable barn
  swing hang listen curl-up roar howl garden farm mountain beach spring summer autumn winter
  bird robin owl duck chicken penguin snake tortoise frog fish goldfish shark ant bee butterfly ladybird spider snail worm crab
  grown-up quiet stay-back gentle notebook footprint wash-hands`);
const level3 = split(`backbone lungs blowhole flipper antlers echidna platypus dugong manatee porpoise walrus
  hippopotamus rhinoceros chimpanzee seagrass ocean-floor sea-ice grassland breathe groom stretch
  vole stoat pine-marten fennec-fox dingo lynx gibbon sugar-glider narwhal webbed-feet litter krill graze gnaw predator prey
  warren sett holt roost drey lodge wade glide camouflage nocturnal hibernate habitat newt salamander wildlife-hide trail-camera`);

const groupOf = Object.fromEntries(Object.entries(wordOrder).flatMap(([group, ids]) => ids.map((id) => [id, group])));
const lessonMembers = Object.fromEntries(
  lessons.map((l) => [l.id, new Set([...l.groups.flatMap((g) => wordOrder[g] || []), ...split(l.extra || "")])]),
);
const collectionMembers = Object.fromEntries(collections.map((c) => [c.id, new Set(split(c.words))]));

export function levelFor(id) {
  return level1.includes(id) ? 1 : level3.includes(id) ? 3 : 2;
}
export function curriculumFor(item) {
  return {
    level: levelFor(item.id),
    lessons: lessons.filter((l) => lessonMembers[l.id].has(item.id)).map((l) => l.id),
    collections: collections.filter((c) => collectionMembers[c.id].has(item.id)).map((c) => c.id),
    curriculumReview: "provisional; teacher review pending",
  };
}

export const scopeChoices = { level: levels, lesson: lessons, collection: collections };
export const ALL_SCOPE = Object.freeze({ level: "all", lesson: "all", collection: "all" });
export function normaliseScope(scope) {
  scope = scope || {};
  return Object.fromEntries(
    Object.entries(scopeChoices).map(([key, list]) => [key, list.some((c) => c.id === scope[key]) ? scope[key] : "all"]),
  );
}
export const isFiltered = (scope) => Object.values(normaliseScope(scope)).some((v) => v !== "all");
export function inScope(item, scope) {
  const s = normaliseScope(scope);
  if (item.kind && item.kind !== "word") return !isFiltered(s);
  const c = item.curriculum || curriculumFor(item);
  return (
    (s.level === "all" || Number(s.level) === c.level) &&
    (s.lesson === "all" || c.lessons.includes(s.lesson)) &&
    (s.collection === "all" || c.collections.includes(s.collection))
  );
}
export const scopeWords = (items, scope) => items.filter((i) => i.kind === "word" && inScope(i, scope));

// A question follows its clue word. A concept question with no word belongs to the lessons
// that teach its group, suits every level, and joins Staying safe when it is a safety question.
export function questionInScope(q, scope, lookup) {
  const s = normaliseScope(scope);
  const item = q.visualItemId && lookup?.get(q.visualItemId);
  if (item) return inScope(item, s);
  return (
    (s.lesson === "all" || lessons.find((l) => l.id === s.lesson)?.groups.includes(q.groupId)) &&
    (s.collection === "all" || (s.collection === "staying-safe" && q.safe))
  );
}

export function scopeLabel(scope, subject = "Mammals") {
  const s = normaliseScope(scope);
  const parts = Object.entries(scopeChoices).flatMap(([key, list]) => list.filter((c) => c.id === s[key]).map((c) => c.label));
  return parts.length ? parts.join(" · ") : `All ${subject} words`;
}

// Every planned word must belong to at least one lesson (a test checks this).
export const unplacedWords = () => Object.keys(groupOf).filter((id) => !lessons.some((l) => lessonMembers[l.id].has(id)));
export const groupLabels = Object.fromEntries(groupRows.map(([id, label]) => [id, label]));
