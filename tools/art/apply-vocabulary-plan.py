# Wires the approved vocabulary plan (22 Nov 2026) into word-order, families, kind-of, look-alikes,
# curriculum and sorting. Words still show only once their row and picture are in the topic.
import re
R = r"E:\Projects\Codex\mammals-weekly-game\src\topics\\"

def edit(name, pairs):
    p = R + name
    s = open(p, encoding="utf8", newline="").read()
    crlf = "\r\n" in s
    if crlf: s = s.replace("\r\n", "\n")
    for a, b in pairs:
        assert s.count(a) == 1, (name, a[:80])
        s = s.replace(a, b)
    if crlf: s = s.replace("\n", "\r\n")
    open(p, "w", encoding="utf8", newline="").write(s)

def between(name, start, end, new):
    p = R + name
    s = open(p, encoding="utf8", newline="").read()
    crlf = "\r\n" in s
    if crlf: s = s.replace("\r\n", "\n")
    i = s.index(start); j = s.index(end, i)
    s = s[:i] + new + s[j:]
    if crlf: s = s.replace("\n", "\r\n")
    open(p, "w", encoding="utf8", newline="").write(s)

# ---- word-order.js
between("word-order.js", "export const wordOrder = {", "// Which group a word belongs to", '''export const wordOrder = {
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

''')
edit("word-order.js", [
  ("// The lists hold the 123 words Mammals has today, placed into the ten groups on 21 November 2026.\n// The 200–300 word expansion (docs/VOCABULARY-PLAN.md) adds its words here once the owner agrees\n// the plan. A word shows in the app only once its picture is in the topic;",
   "// The lists hold all 268 words of the vocabulary plan (docs/VOCABULARY-PLAN.md), approved by the\n// owner on 22 November 2026; branch moved from Homes to Habitats. A word shows in the app only once\n// its row and picture are in the topic (mammals-words.js);"),
])

# ---- families.js
F = '''export const families = [
  { id: "cats", groupId: "mammals", label: "Cats", imageId: "tiger", members: ids("cat lion tiger cheetah leopard snow-leopard jaguar lynx"), explanation: "It is a cat. Cats have soft paws, sharp claws and whiskers." },
  { id: "dogs", groupId: "mammals", label: "Dogs & foxes", imageId: "fox", members: ids("dog fox arctic-fox fennec-fox wolf dingo"), explanation: "It belongs with the dogs, foxes and wolves. They have long noses and a strong sense of smell." },
  { id: "rodents", groupId: "mammals", label: "Rodents & rabbits", imageId: "squirrel", members: ids("mouse harvest-mouse rat hamster guinea-pig squirrel red-squirrel vole beaver rabbit hare"), explanation: "@@RODENTS@@" },
  { id: "hoofed", groupId: "mammals", label: "Hoofed mammals", imageId: "zebra", members: ids("horse pony donkey zebra cow sheep goat pig llama deer reindeer moose giraffe camel rhinoceros hippopotamus"), explanation: "It is a hoofed mammal. Most hoofed mammals walk on hard hooves at the tips of their toes." },
  { id: "otters-badgers", groupId: "mammals", label: "Otters, badgers & stoats", imageId: "badger", members: ids("badger otter stoat pine-marten ferret"), explanation: "It belongs with the otters, badgers and stoats. They have long bodies, short legs and thick fur." },
  { id: "primates", groupId: "mammals", label: "Monkeys & apes", imageId: "chimpanzee", members: ids("monkey baboon chimpanzee gorilla orangutan gibbon"), explanation: "It belongs with the monkeys and apes. They have hands that can grip." },
  { id: "pouched", groupId: "mammals", label: "Pouched mammals", imageId: "kangaroo", members: ids("kangaroo wallaby koala wombat sugar-glider"), explanation: "It is a pouched mammal. Its baby grows in its mother's pouch." },
  { id: "sea-mammals", groupId: "mammals", label: "Sea mammals", imageId: "dolphin", members: ids("whale blue-whale dolphin orca porpoise narwhal seal sea-lion walrus sea-otter manatee dugong"), explanation: "@@SEA@@" },
  { id: "other-mammals", groupId: "mammals", label: "Other mammals", imageId: "hedgehog", members: ids("hedgehog mole shrew bear polar-bear giant-panda elephant meerkat sloth bat platypus echidna human"), explanation: "It is a mammal with a small family of its own." },
  { id: "birds", groupId: "neighbours", label: "Birds", imageId: "robin", members: ids("bird robin owl eagle duck chicken penguin"), explanation: "It is a bird. Birds have feathers and a beak, and hatch from eggs." },
  { id: "reptiles", groupId: "neighbours", label: "Reptiles", imageId: "tortoise", members: ids("snake lizard tortoise turtle crocodile"), explanation: "It is a reptile. Reptiles have dry, scaly skin." },
  { id: "amphibians", groupId: "neighbours", label: "Amphibians", imageId: "frog", members: ids("frog toad tadpole newt salamander"), explanation: "It is an amphibian. It starts life in water and has damp skin." },
  { id: "fish", groupId: "neighbours", label: "Fish", imageId: "goldfish", members: ids("fish goldfish salmon shark seahorse"), explanation: "It is a fish. It breathes through gills and swims with fins." },
  { id: "minibeasts", groupId: "neighbours", label: "Minibeasts", imageId: "ladybird", members: ids("ant bee butterfly ladybird spider snail worm"), explanation: "It is a minibeast: a small animal with no backbone." },
  { id: "sea-animals", groupId: "neighbours", label: "Other sea animals", imageId: "crab", members: ids("crab octopus jellyfish"), explanation: "It is a sea animal with no backbone." },
];
'''
p = R + "families.js"
s = open(p, encoding="utf8", newline="").read()
crlf = "\r\n" in s
s = s.replace("\r\n", "\n")
rod = re.search(r'id: "rodents".*?explanation: "(.*?)" \}', s).group(1)
sea = re.search(r'id: "sea-mammals".*?explanation: "(.*?)" \}', s).group(1)
i = s.index("export const families = ["); j = s.index("];\n", i) + 3
s = s[:i] + F.replace("@@RODENTS@@", rod).replace("@@SEA@@", sea) + s[j:]
s = s.replace("Every family except the catch-all should reach five words; the\n// 21 November lists hold today's 123 words and grow with the vocabulary plan (docs/VOCABULARY-PLAN.md).",
              "Every family except the two catch-alls has five words or more: 15 families from the\n// vocabulary plan (docs/VOCABULARY-PLAN.md, approved 22 November 2026), 9 mammal and 6 Other Animals.\n// A family shows only the members whose pictures are in the topic.")
if crlf: s = s.replace("\n", "\r\n")
open(p, "w", encoding="utf8", newline="").write(s)

# ---- kind-of.js
edit("kind-of.js", [
  ('// Draft, 21 November 2026, for the 123 words Mammals has today; the vocabulary plan adds more.\nexport const kindOf = {\n  "polar-bear": "bear",\n  moose: "deer",\n};',
   '''// Draft, 22 November 2026: the 41 links of the approved vocabulary plan (docs/VOCABULARY-PLAN.md).
export const kindOf = {
  "polar-bear": "bear", "giant-panda": "bear",
  moose: "deer", reindeer: "deer",
  "blue-whale": "whale", dolphin: "whale", narwhal: "whale",
  orca: "dolphin",
  pony: "horse",
  "harvest-mouse": "mouse",
  "red-squirrel": "squirrel",
  "arctic-fox": "fox", "fennec-fox": "fox",
  dingo: "dog",
  baboon: "monkey",
  "sea-otter": "otter",
  robin: "bird", owl: "bird", eagle: "bird", duck: "bird", chicken: "bird", penguin: "bird",
  goldfish: "fish", salmon: "fish", shark: "fish", seahorse: "fish",
  wool: "fur",
  snout: "nose",
  tusk: "tooth",
  bamboo: "grass",
  berries: "fruit",
  nuts: "seed",
  sett: "burrow",
  holt: "den",
  drey: "nest",
  wade: "walk",
  gallop: "run", scamper: "run",
  pounce: "jump",
  paddle: "swim",
  rainforest: "forest",
};'''),
  ('  joey: "A young kangaroo",\n};',
   '''  joey: "A young kangaroo",
  // vocabulary plan, 22 November 2026
  "snow-leopard": "A kind of wild cat",
  jaguar: "A kind of wild cat",
  lynx: "A kind of wild cat",
  orangutan: "A kind of ape",
  gibbon: "A kind of ape",
  wallaby: "A small cousin of the kangaroo",
  hare: "A cousin of the rabbit",
  llama: "A cousin of the camel",
  toad: "A cousin of the frog",
  salamander: "A cousin of the newt",
  piglet: "A young pig",
  fawn: "A young deer",
  pup: "A young seal",
  tadpole: "A young frog or toad",
  hay: "Dried grass",
  warren: "Lots of rabbit burrows",
  snake: "A kind of reptile",
  lizard: "A kind of reptile",
  tortoise: "A kind of reptile",
  turtle: "A kind of reptile",
  crocodile: "A kind of reptile",
  ant: "A kind of insect",
  bee: "A kind of insect",
  butterfly: "A kind of insect",
  ladybird: "A kind of insect",
  spring: "A season",
  summer: "A season",
  autumn: "A season",
  winter: "A season",
  dingo: "A wild dog",
};'''),
])

# ---- look-alikes.js
edit("look-alikes.js", [
  ('  ocean: ["whale"],\n};',
   '''  ocean: ["whale"],
  // vocabulary plan, 22 November 2026 (read off the briefs; check again on the final art)
  wool: ["sheep"], spines: ["hedgehog"], stripes: ["zebra"], spots: ["cheetah"], snout: ["pig"], bill: ["platypus"],
  "webbed-feet": ["otter"], hump: ["camel"], fin: ["dolphin"],
  mother: ["orangutan"], baby: ["elephant"], born: ["horse", "foal"], litter: ["pig", "piglet"], piglet: ["pig"],
  fawn: ["deer"], pup: ["seal"],
  graze: ["sheep"], gnaw: ["beaver"], "plant-eater": ["rabbit"], "meat-eater": ["seal"], predator: ["fox"], prey: ["rabbit"],
  warren: ["rabbit"], sett: ["badger"], holt: ["otter"], drey: ["red-squirrel"], lodge: ["beaver"], roost: ["bat"],
  hutch: ["rabbit"], kennel: ["dog"], stable: ["horse"],
  wade: ["moose"], gallop: ["horse"], scamper: ["mouse"], pounce: ["fox"], swing: ["gibbon"], hang: ["bat"], paddle: ["dog"],
  glide: ["sugar-glider"],
  listen: ["deer"], camouflage: ["arctic-fox"], "curl-up": ["hedgehog"], lookout: ["meerkat"], herd: ["zebra"], pack: ["wolf"],
  roar: ["lion"], howl: ["wolf"], nocturnal: ["badger"], hibernate: ["hedgehog"],
  "stay-back": ["deer"], gentle: ["guinea-pig"],
};'''),
  ('["horse", "donkey"], ["cheetah", "leopard"], ["deer", "moose"],\n  ["bear", "polar-bear"], ["whale", "dolphin"], ["platypus", "echidna"],',
   '["horse", "donkey"], ["cheetah", "leopard"], ["deer", "moose"],\n  ["bear", "polar-bear"], ["platypus", "echidna"],'),
  ('["kid", "lamb"], ["calf", "foal"], ["cub", "kitten"], ["burrow", "den"], ["snow", "sea-ice"],\n];',
   '''["kid", "lamb"], ["calf", "foal"], ["cub", "kitten"], ["burrow", "den"], ["snow", "sea-ice"],
  // vocabulary plan, 22 November 2026 (whale/dolphin is now a kind link)
  ["leopard", "jaguar"], ["leopard", "snow-leopard"], ["rabbit", "hare"], ["mouse", "vole"], ["mouse", "shrew"], ["vole", "shrew"],
  ["mole", "shrew"], ["stoat", "ferret"], ["stoat", "pine-marten"], ["otter", "beaver"], ["monkey", "gibbon"], ["kangaroo", "wallaby"],
  ["reindeer", "moose"], ["donkey", "pony"], ["camel", "llama"], ["dolphin", "shark"], ["whale", "shark"], ["wolf", "dingo"],
  ["owl", "eagle"], ["newt", "lizard"], ["newt", "salamander"], ["salamander", "lizard"], ["tortoise", "turtle"], ["snake", "worm"], ["frog", "toad"],
  ["webbed-feet", "flipper"], ["fin", "flipper"],
  ["mother", "baby"], ["litter", "piglet"], ["born", "foal"], ["pup", "puppy"],
  ["hay", "grass"], ["graze", "grass"], ["graze", "chew"], ["predator", "prey"],
  ["warren", "burrow"], ["stable", "barn"], ["kennel", "hutch"], ["roost", "cave"], ["roost", "hang"],
  ["swing", "hang"], ["hang", "climb"], ["glide", "fly"], ["wade", "paddle"],
  ["curl-up", "sleep"], ["hibernate", "sleep"], ["hibernate", "curl-up"], ["herd", "pack"], ["camouflage", "hide"], ["listen", "ear"],
  ["hedge", "garden"], ["beach", "ocean"], ["winter", "snow"], ["autumn", "leaf"], ["spring", "summer"], ["farm", "barn"],
  ["notebook", "field-guide"], ["quiet", "stay-back"], ["grown-up", "stay-back"], ["footprint", "snow"],
];'''),
])

# ---- curriculum.js
edit("curriculum.js", [
  ('extra: "cat dog cow sheep goat horse lion kangaroo pouch" }', 'extra: "cat dog cow sheep goat pig horse deer lion seal kangaroo platypus echidna pouch" }'),
  ('extra: "rabbit fox wombat bear polar-bear camel walrus" }', 'extra: "rabbit fox wombat bear polar-bear camel walrus badger otter beaver squirrel bat" }'),
  ('extra: "paw hoof flipper tail whiskers nose ear" }', 'extra: "paw hoof flipper tail whiskers nose ear hedgehog meerkat wolf" }'),
  ('extra: "fur milk lungs backbone whale dolphin bat platypus" }', 'extra: "fur milk lungs backbone whale dolphin bat platypus egg fin blowhole" }'),
  ('extra: "cat dog rabbit seal sea-lion deer fox hedgehog squirrel" }', 'extra: "cat dog rabbit guinea-pig seal sea-lion deer fox badger hedgehog squirrel bat owl" }'),
  ('kitten puppy fur whiskers paw tail feed drink sleep groom" },', 'kitten puppy fur whiskers paw tail feed drink sleep groom ferret hutch kennel goldfish gentle wash-hands" },'),
  ('calf lamb kid foal milk grass hoof horn chew" },', 'calf lamb kid foal milk grass hoof horn chew pony llama piglet hay wool snout graze stable barn farm chicken duck" },'),
  ('ocean ocean-floor sea-ice seagrass" },', 'ocean ocean-floor sea-ice seagrass blue-whale orca narwhal pup fin krill beach" },'),
  ('grassland desert forest snow trunk mane" },', 'grassland desert forest snow trunk mane snow-leopard jaguar arctic-fox reindeer giant-panda meerkat orangutan wallaby rainforest mountain bamboo roar herd" },'),
  ('words: "seal dog cat fox bear wolf claw tooth tusk horn hide sniff" },', 'words: "seal dog cat fox bear wolf claw tooth tusk horn hide sniff grown-up quiet stay-back gentle wash-hands binoculars droppings spines hedgehog bee jellyfish crab" },'),
  ('''  drink walk run hop jump climb swim dig sleep hide land snow river pond`);''',
   '''  drink walk run hop jump climb swim dig sleep hide land snow river pond
  pony giant-panda human wool stripes spots mother baby egg piglet hay berries nuts nest hutch kennel stable barn
  swing hang listen curl-up roar howl garden farm mountain beach spring summer autumn winter
  bird robin owl duck chicken penguin snake tortoise frog fish goldfish shark ant bee butterfly ladybird spider snail worm crab
  grown-up quiet stay-back gentle notebook footprint wash-hands`);'''),
  ('''  hippopotamus rhinoceros chimpanzee seagrass ocean-floor sea-ice grassland breathe groom stretch`);''',
   '''  hippopotamus rhinoceros chimpanzee seagrass ocean-floor sea-ice grassland breathe groom stretch
  vole stoat pine-marten fennec-fox dingo lynx gibbon sugar-glider narwhal webbed-feet litter krill graze gnaw predator prey
  warren sett holt roost drey lodge wade glide camouflage nocturnal hibernate habitat newt salamander wildlife-hide trail-camera`);'''),
])

# ---- sorting.js
edit("sorting.js", [
  ('const water = ids("whale dolphin porpoise seal sea-lion walrus sea-otter manatee dugong");',
   'const water = ids("whale blue-whale dolphin orca porpoise narwhal seal sea-lion walrus sea-otter manatee dugong");\n// Mammals that live on land and in water, so they are left out of Land or water?\nconst both = ids("hippopotamus polar-bear platypus otter beaver");'),
  ("Mammals that live on both, such as the hippopotamus and the polar bear, are left out.",
   "Mammals that live on both, such as the hippopotamus, the otter and the polar bear, are left out."),
  ('members: wordOrder.mammals.filter((id) => !water.includes(id) && !["hippopotamus", "polar-bear", "platypus"].includes(id)),',
   'members: wordOrder.mammals.filter((id) => !water.includes(id) && !both.includes(id)),'),
  ('members: ids("burrow den cave"),', 'members: wordOrder.homes,'),
  ('members: ids("grass leaf fruit seed seagrass milk"),', 'members: ids("grass hay bamboo leaf fruit berries seed nuts seagrass krill milk water"),'),
  ('members: wordOrder.body.filter((id) => id !== "lungs"),', 'members: wordOrder.body.filter((id) => !["lungs", "stripes", "spots"].includes(id)),'),
  ('members: wordOrder.movement,', 'members: wordOrder.movement.filter((id) => id !== "carry"),'),
  ('cover: ["cats", "sea-mammals"],', 'cover: ["cats", "sea-mammals", "birds"],'),
  ("shows on the setup screen but cannot be played (Mammal or not? waits for the Other Animals\n// group). Draft wording, 21 November 2026, for teacher review.",
   "shows on the setup screen but cannot be played until its words arrive. Draft wording,\n// 22 November 2026 (vocabulary plan), for teacher review."),
])
print("applied")
