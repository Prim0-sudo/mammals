// Pictures a child could fairly take for another word, so Which One Is It? and Detective never
// offer them together as a right and a "wrong" answer (the Insects pattern, blueprint v7.0).
//
// SHOWS: a concept word whose picture is plainly one of the animal words (paw is a cat's paw).
// For choosing answers the picture counts as that animal, so it is kept apart from the animal,
// its kinds and other pictures of the same animal. Read off the studio-photo pictures (21
// November 2026); check again whenever a picture is redrawn.
export const SHOWS = {
  fur: ["rabbit"], whiskers: ["cat"], skin: ["elephant"], paw: ["dog"], hoof: ["horse"], claw: ["bear"], tail: ["squirrel"],
  ear: ["rabbit"], eye: ["horse"], nose: ["dog"], mouth: ["goat"], tooth: ["horse"], tongue: ["giraffe"], trunk: ["elephant"],
  tusk: ["walrus"], horn: ["goat"], antlers: ["deer"], mane: ["lion"], pouch: ["kangaroo", "joey"], flipper: ["seal"],
  blowhole: ["dolphin"], backbone: ["dog"],
  milk: ["cow", "calf"], feed: ["pig"], kitten: ["cat"], puppy: ["dog"], calf: ["cow"], lamb: ["sheep"], kid: ["goat"],
  foal: ["horse"], cub: ["lion"], joey: ["kangaroo"],
  chew: ["horse"], drink: ["cat"],
  burrow: ["rabbit"], den: ["fox"],
  walk: ["bear"], run: ["horse"], hop: ["rabbit"], jump: ["cat"], climb: ["squirrel"], stretch: ["dog"], carry: ["monkey"],
  dig: ["wombat"], swim: ["sea-otter"], dive: ["seal"], float: ["sea-otter"], fly: ["bat"],
  sniff: ["dog"], breathe: ["whale"], groom: ["cat"], hide: ["mouse"], sleep: ["fox"],
  ocean: ["whale"],
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
  "stay-back": ["deer", "human"], gentle: ["guinea-pig", "human"],
  // the people pictures (batch 6) count as the human word (batch 7, a girl waving), 22 November 2026
  "grown-up": ["human"], quiet: ["human"], "wash-hands": ["human"],
  habitat: ["rabbit", "hedgehog"],
};

// Pairs that look alike though neither is a kind of the other.
export const LOOK_ALIKES = [
  ["seal", "sea-lion"], ["dolphin", "porpoise"], ["manatee", "dugong"], ["mouse", "rat"], ["hamster", "guinea-pig"],
  ["monkey", "chimpanzee"], ["chimpanzee", "gorilla"], ["horse", "donkey"], ["cheetah", "leopard"], ["deer", "moose"],
  ["bear", "polar-bear"], ["platypus", "echidna"], ["hedgehog", "echidna"],
  ["lake", "pond"], ["river", "lake"], ["ocean", "ocean-floor"], ["grass", "grassland"], ["leaf", "branch"],
  ["horn", "antlers"], ["horn", "tusk"], ["tusk", "tooth"], ["paw", "claw"], ["fur", "skin"],
  ["hop", "jump"], ["walk", "run"], ["swim", "dive"], ["dive", "float"], ["drink", "water"], ["milk", "feed"],
  ["kid", "lamb"], ["calf", "foal"], ["cub", "kitten"], ["burrow", "den"], ["snow", "sea-ice"],
  // vocabulary plan, 22 November 2026 (whale/dolphin is now a kind link)
  ["leopard", "jaguar"], ["leopard", "snow-leopard"], ["rabbit", "hare"], ["mouse", "vole"], ["mouse", "shrew"], ["vole", "shrew"], ["harvest-mouse", "vole"], ["harvest-mouse", "shrew"],
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
  // batch 8 (22 November 2026): animals whose own pictures plainly show the feature, and the spotted cats
  ["spots", "leopard"], ["spots", "jaguar"], ["spots", "snow-leopard"], ["spots", "lynx"], ["spots", "fawn"],
  ["cheetah", "jaguar"], ["cheetah", "snow-leopard"], ["stripes", "tiger"], ["stripes", "badger"], ["wool", "llama"],
  ["hay", "barn"], ["predator", "meat-eater"],
  // batch 9 (22 November 2026): the island scenes and the moves read off the final pictures
  ["autumn", "spring"], ["summer", "grass"], ["summer", "grassland"], ["winter", "pond"], ["mountain", "snow"],
  ["habitat", "forest"], ["habitat", "hedge"], ["habitat", "garden"], ["rainforest", "habitat"],
  ["wade", "pond"], ["wade", "lake"], ["paddle", "pond"], ["paddle", "lake"], ["paddle", "swim"],
  ["pounce", "jump"], ["pounce", "snow"], ["hang", "gibbon"],
];
