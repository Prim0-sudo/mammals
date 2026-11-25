// Draw & Trace and Colouring pictures (Arts & Crafts): coloured outline art in assets/line-art, sorted
// simple to hard within each level (the Insects pattern). A picture shows in the game only once its file is in
// and its id is in READY, and a level with no ready pictures stays hidden, so children never meet a broken
// picture. `say` is the word spoken when a picture is picked; it stays silent until a recording exists.
// The 30 Mammals outlines are briefed to Codex (docs/line-art/codex-outlines.md, 25 November 2026); each stays
// hidden until its file is in assets/line-art and its id is in READY. One subject on its own is Easy, a subject
// with a little scene is Medium, several animals or a busy scene is Hard.
// `word` is the one word a child traces on the printed sheet when the name is more than one word.
const planned = [
  { id: "easy", label: "Easy", pictures: [
    { id: "easy-01-mouse", name: "Mouse", say: "mouse" },
    { id: "easy-02-whale", name: "Whale", say: "whale" },
    { id: "easy-03-cat", name: "Cat", say: "cat" },
    { id: "easy-04-pig", name: "Pig", say: "pig" },
    { id: "easy-05-rabbit", name: "Rabbit", say: "rabbit" },
    { id: "easy-06-hedgehog", name: "Hedgehog", say: "hedgehog" },
    { id: "easy-07-fox", name: "Fox", say: "fox" },
    { id: "easy-08-sheep", name: "Sheep", say: "sheep" },
    { id: "easy-09-bat", name: "Bat", say: "bat" },
    { id: "easy-10-seal", name: "Seal", say: "seal" },
  ] },
  { id: "medium", label: "Medium", pictures: [
    { id: "medium-01-squirrel-with-a-nut", name: "Squirrel with a nut", word: "squirrel", say: "squirrel" },
    { id: "medium-02-rabbit-by-its-burrow", name: "Rabbit by its burrow", word: "rabbit", say: "burrow" },
    { id: "medium-03-elephant", name: "Elephant", say: "elephant" },
    { id: "medium-04-lion", name: "Lion", say: "lion" },
    { id: "medium-05-giraffe", name: "Giraffe", say: "giraffe" },
    { id: "medium-06-kangaroo-and-joey", name: "Kangaroo and joey", word: "kangaroo", say: "joey" },
    { id: "medium-07-otter-floating", name: "Otter floating", word: "otter", say: "float" },
    { id: "medium-08-zebra", name: "Zebra", say: "zebra" },
    { id: "medium-09-cow-and-calf", name: "Cow and calf", word: "cow", say: "calf" },
    { id: "medium-10-dolphin-jumping", name: "Dolphin jumping", word: "dolphin", say: "dolphin" },
  ] },
  { id: "hard", label: "Hard", pictures: [
    { id: "hard-01-rabbit-warren", name: "Rabbit warren", word: "warren", say: "warren" },
    { id: "hard-02-farm-friends", name: "Farm friends", word: "farm", say: "farm" },
    { id: "hard-03-badger-at-its-sett", name: "Badger at its sett", word: "badger", say: "sett" },
    { id: "hard-04-beaver-lodge", name: "Beaver lodge", word: "beaver", say: "lodge" },
    { id: "hard-05-stag-in-the-forest", name: "Stag in the forest", word: "deer", say: "antlers" },
    { id: "hard-06-hedgehog-in-leaves", name: "Hedgehog in the leaves", word: "hedgehog", say: "hibernate" },
    { id: "hard-07-bats-in-the-barn", name: "Bats in the barn", word: "bats", say: "roost" },
    { id: "hard-08-elephant-family", name: "Elephant family", word: "elephant", say: "herd" },
    { id: "hard-09-seal-and-pup", name: "Seal and pup", word: "seal", say: "pup" },
    { id: "hard-10-monkeys-in-the-trees", name: "Monkeys in the trees", word: "monkey", say: "swing" },
  ] },
];

// Codex outlines approved by the owner, 25 November 2026 (docs/line-art/originals). The beaver lodge is being redrawn.
const READY = new Set([
  "easy-01-mouse", "easy-02-whale", "easy-03-cat", "easy-04-pig", "easy-05-rabbit",
  "easy-06-hedgehog", "easy-07-fox", "easy-08-sheep", "easy-09-bat", "easy-10-seal",
  "medium-01-squirrel-with-a-nut", "medium-02-rabbit-by-its-burrow", "medium-03-elephant", "medium-04-lion", "medium-05-giraffe",
  "medium-06-kangaroo-and-joey", "medium-07-otter-floating", "medium-08-zebra", "medium-09-cow-and-calf", "medium-10-dolphin-jumping",
  "hard-01-rabbit-warren", "hard-02-farm-friends", "hard-03-badger-at-its-sett", "hard-05-stag-in-the-forest", "hard-06-hedgehog-in-leaves",
  "hard-07-bats-in-the-barn", "hard-08-elephant-family", "hard-09-seal-and-pup", "hard-10-monkeys-in-the-trees",
]);

export const drawTracePlanned = planned;
export const drawTraceLevels = planned
  .map(level => ({ ...level, pictures: level.pictures.filter(picture => READY.has(picture.id)).map(picture => ({ ...picture, level: level.id })) }))
  .filter(level => level.pictures.length);

export const drawTraceStyles = [
  { id: 'step', label: 'Step by step' },
  { id: 'watch', label: 'Watch it all first' }
];

export const drawTraceFile = picture => `assets/line-art/${picture.id}-${picture.version || 'v1'}.webp`;
// Pictures drawn by scripts/draw-outlines.py (`steps: true`) carry their own tracing steps in a .json twin.
export const drawTraceSteps = picture => (picture.steps ? `assets/line-art/${picture.id}-${picture.version || 'v1'}.json` : null);
export const drawTracePicture = id => drawTraceLevels.flatMap(level => level.pictures).find(picture => picture.id === id) || null;
