// Pictures a child could fairly take for another word, so Which One Is It? and Detective never
// offer them together as a right and a "wrong" answer (the Insects pattern, blueprint v7.0).
//
// SHOWS: a concept word whose picture is plainly one of the animal words (paw is a cat's paw).
// For choosing answers the picture counts as that animal, so it is kept apart from the animal,
// its kinds and other pictures of the same animal. Read off each word's imageAlt (21 November
// 2026); check again whenever a picture is redrawn.
export const SHOWS = {
  fur: ["rabbit"], whiskers: ["cat"], skin: ["elephant"], paw: ["cat"], hoof: ["horse"], claw: ["bear"], tail: ["squirrel"],
  ear: ["rabbit"], eye: ["horse"], nose: ["dog"], mouth: ["goat"], tooth: ["horse"], tongue: ["cat"], trunk: ["elephant"],
  tusk: ["walrus"], horn: ["goat"], antlers: ["deer"], mane: ["lion"], pouch: ["kangaroo", "joey"], flipper: ["seal"],
  blowhole: ["dolphin"], backbone: ["dog"],
  milk: ["cow", "calf"], feed: ["cow", "calf"], kitten: ["cat"], puppy: ["dog"], calf: ["cow"], lamb: ["sheep"], kid: ["goat"],
  foal: ["horse"], cub: ["lion"], joey: ["kangaroo"],
  seagrass: ["dugong"], water: ["deer"], chew: ["horse"], drink: ["cat"],
  burrow: ["wombat"], den: ["fox"],
  walk: ["bear"], run: ["horse"], hop: ["rabbit"], jump: ["cat"], climb: ["squirrel"], stretch: ["cat"], carry: ["monkey"],
  dig: ["wombat"], swim: ["dolphin"], dive: ["seal"], float: ["sea-otter"], fly: ["bat"],
  sniff: ["dog"], breathe: ["whale"], groom: ["cat"], hide: ["mouse"], sleep: ["cat"],
  ocean: ["whale"], grassland: ["zebra"], snow: ["wolf"],
};

// Pairs that look alike though neither is a kind of the other.
export const LOOK_ALIKES = [
  ["seal", "sea-lion"], ["dolphin", "porpoise"], ["manatee", "dugong"], ["mouse", "rat"], ["hamster", "guinea-pig"],
  ["monkey", "chimpanzee"], ["chimpanzee", "gorilla"], ["horse", "donkey"], ["cheetah", "leopard"], ["deer", "moose"],
  ["bear", "polar-bear"], ["whale", "dolphin"], ["platypus", "echidna"], ["hedgehog", "echidna"],
  ["lake", "pond"], ["river", "lake"], ["ocean", "ocean-floor"], ["grass", "grassland"], ["leaf", "branch"],
  ["horn", "antlers"], ["horn", "tusk"], ["tusk", "tooth"], ["paw", "claw"], ["fur", "skin"],
  ["hop", "jump"], ["walk", "run"], ["swim", "dive"], ["dive", "float"], ["drink", "water"], ["milk", "feed"],
  ["kid", "lamb"], ["calf", "foal"], ["cub", "kitten"], ["burrow", "den"], ["snow", "sea-ice"],
];
