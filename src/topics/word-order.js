// The ten word groups and the teaching order inside each, laid out like Insects (blueprint v7.0):
// the mammal itself, its body, how it grows, what it eats, where it lives, how it moves and stays
// safe, the wider world, its animal neighbours, and last how children watch animals safely.
// Every list in the app follows it: Meet the Words, group pickers and later printables,
// flashcards and lesson videos (a test keeps them in step).
// The lists hold all 268 words of the vocabulary plan (docs/VOCABULARY-PLAN.md), approved by the
// owner on 22 November 2026; branch moved from Homes to Habitats. A word shows in the app only once
// its row and picture are in the topic (mammals-words.js); a group with no words
// yet shows as a "coming soon" card (topic.showEmptyGroups) until its words arrive.
// Group ids stay stable (saved progress and the group cards use them).
export const groupRows = [
  // id, label, description, a picture word for the group (the card itself is the painted groups/<id>.webp)
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
    // pets and farm animals first, then British wildlife, then wild land mammals of the world,
    // then mammals of the water (vocabulary plan, approved 22 November 2026)
    "cat", "dog", "rabbit", "hamster", "guinea-pig", "mouse", "harvest-mouse", "rat", "ferret",
    "horse", "pony", "donkey", "cow", "sheep", "goat", "pig", "llama",
    "squirrel", "red-squirrel", "hedgehog", "mole", "shrew", "vole", "hare", "badger", "otter", "stoat", "pine-marten", "beaver",
    "fox", "arctic-fox", "fennec-fox", "wolf", "dingo", "deer", "reindeer", "moose", "bear", "polar-bear", "giant-panda",
    "lion", "tiger", "cheetah", "leopard", "snow-leopard", "jaguar", "lynx",
    "elephant", "giraffe", "zebra", "rhinoceros", "hippopotamus", "camel", "meerkat",
    "monkey", "baboon", "chimpanzee", "gorilla", "orangutan", "gibbon", "human", "sloth", "bat",
    "kangaroo", "wallaby", "koala", "wombat", "sugar-glider", "platypus", "echidna",
    "whale", "blue-whale", "dolphin", "orca", "porpoise", "narwhal", "seal", "sea-lion", "walrus", "sea-otter", "manatee", "dugong",
  ],
  body: [
    "fur", "wool", "spines", "stripes", "spots", "skin", "backbone", "lungs",
    "eye", "ear", "nose", "snout", "bill", "whiskers", "mouth", "tooth", "tongue",
    "paw", "claw", "hoof", "webbed-feet", "tail", "mane", "hump",
    "horn", "antlers", "tusk", "trunk",
    "pouch", "flipper", "fin", "blowhole",
  ],
  "life-cycle": ["mother", "baby", "born", "egg", "milk", "feed", "litter", "kitten", "puppy", "calf", "lamb", "kid", "piglet", "foal", "fawn", "cub", "pup", "joey"],
  food: ["grass", "hay", "bamboo", "leaf", "fruit", "berries", "seed", "nuts", "seagrass", "krill", "water", "chew", "graze", "gnaw", "drink", "plant-eater", "meat-eater", "predator", "prey"],
  homes: ["burrow", "warren", "sett", "den", "holt", "cave", "roost", "nest", "drey", "tree-hollow", "lodge", "hutch", "kennel", "stable", "barn"],
  movement: ["walk", "wade", "run", "gallop", "scamper", "hop", "jump", "pounce", "climb", "swing", "hang", "stretch", "carry", "dig", "swim", "paddle", "dive", "float", "glide", "fly"],
  survival: ["sniff", "listen", "breathe", "groom", "hide", "camouflage", "curl-up", "lookout", "herd", "pack", "roar", "howl", "sleep", "nocturnal", "hibernate"],
  habitats: ["habitat", "land", "forest", "rainforest", "branch", "hedge", "garden", "farm", "grassland", "mountain", "desert", "snow", "river", "lake", "pond", "beach", "ocean", "ocean-floor", "sea-ice", "spring", "summer", "autumn", "winter"],
  neighbours: [
    "bird", "robin", "owl", "eagle", "duck", "chicken", "penguin",
    "snake", "lizard", "tortoise", "turtle", "crocodile",
    "frog", "toad", "tadpole", "newt", "salamander",
    "fish", "goldfish", "salmon", "shark", "seahorse",
    "ant", "bee", "butterfly", "ladybird", "spider", "snail", "worm",
    "crab", "octopus", "jellyfish",
  ],
  watching: ["grown-up", "quiet", "stay-back", "gentle", "binoculars", "wildlife-hide", "notebook", "field-guide", "footprint", "droppings", "trail-camera", "wash-hands"],
};

// Which group a word belongs to, from the lists above.
export const groupOf = Object.fromEntries(
  Object.entries(wordOrder).flatMap(([group, ids]) => ids.map((id) => [id, group])),
);
