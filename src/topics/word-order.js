// The ten word groups and the teaching order inside each, laid out like Insects (blueprint v7.0):
// the mammal itself, its body, how it grows, what it eats, where it lives, how it moves and stays
// safe, the wider world, its animal neighbours, and last how children watch animals safely.
// Every list in the app follows it: Meet the Words, group pickers and later printables,
// flashcards and lesson videos (a test keeps them in step).
// The lists hold the 123 words Mammals has today, placed into the ten groups on 21 November 2026.
// The 200–300 word expansion (docs/VOCABULARY-PLAN.md) adds its words here once the owner agrees
// the plan. A word shows in the app only once its picture is in the topic; a group with no words
// yet shows as a "coming soon" card (topic.showEmptyGroups) until its words arrive.
// Group ids stay stable (saved progress and the group cards use them).
export const groupRows = [
  // id, label, description, picture word used until the group's own card arrives
  ["mammals", "Meet the Mammals", "Explore mammals, from mice to whales.", "lion"],
  ["body", "Bodies Up Close", "Look closely at mammal body parts.", "whiskers"],
  ["life-cycle", "Mothers & Young", "See how baby mammals are born, fed and grow.", "joey"],
  ["food", "Food & Feeding", "Find out what mammals eat and drink.", "fruit"],
  ["homes", "Homes & Shelters", "Visit burrows, dens and other mammal homes.", "burrow"],
  ["movement", "On the Move", "Discover how mammals walk, swim, climb and fly.", "hop"],
  ["survival", "Senses & Survival", "Learn how mammals sense the world and stay safe.", "sniff"],
  ["habitats", "Habitats & Seasons", "Explore the places mammals live through the year.", "forest"],
  ["neighbours", "Other Animals", "Meet animals that are not mammals.", null],
  ["watching", "Animal Watching", "Watch animals carefully and kindly.", null],
];

export const categoryOrder = groupRows.map(([id]) => id);

export const wordOrder = {
  mammals: [
    // pets and farm animals first, then wild land mammals, then mammals of the water
    "cat", "dog", "rabbit", "hamster", "guinea-pig", "mouse", "rat",
    "horse", "donkey", "cow", "sheep", "goat", "pig",
    "squirrel", "hedgehog", "fox", "wolf", "deer", "moose", "bear", "polar-bear",
    "lion", "tiger", "cheetah", "leopard",
    "elephant", "giraffe", "zebra", "rhinoceros", "hippopotamus", "camel",
    "monkey", "chimpanzee", "gorilla", "sloth", "bat",
    "kangaroo", "koala", "wombat", "platypus", "echidna",
    "whale", "dolphin", "porpoise", "seal", "sea-lion", "walrus", "sea-otter", "manatee", "dugong",
  ],
  body: [
    "fur", "skin", "backbone", "lungs",
    "eye", "ear", "nose", "whiskers", "mouth", "tooth", "tongue",
    "paw", "claw", "hoof", "tail", "mane",
    "horn", "antlers", "tusk", "trunk",
    "pouch", "flipper", "blowhole",
  ],
  "life-cycle": ["milk", "feed", "kitten", "puppy", "calf", "lamb", "kid", "foal", "cub", "joey"],
  food: ["grass", "leaf", "fruit", "seed", "seagrass", "water", "chew", "drink"],
  homes: ["burrow", "den", "cave", "branch"],
  movement: ["walk", "run", "hop", "jump", "climb", "stretch", "carry", "dig", "swim", "dive", "float", "fly"],
  survival: ["sniff", "breathe", "groom", "hide", "sleep"],
  habitats: ["land", "forest", "grassland", "desert", "snow", "river", "lake", "pond", "ocean", "ocean-floor", "sea-ice"],
  neighbours: [],
  watching: [],
};

// Which group a word belongs to, from the lists above.
export const groupOf = Object.fromEntries(
  Object.entries(wordOrder).flatMap(([group, ids]) => ids.map((id) => [id, group])),
);
