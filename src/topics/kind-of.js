// Words that are one example of a wider word, so a card can say "A kind of bear" and learners
// see that a polar bear is a bear (the Insects pattern, blueprint v7.0). Each value is the id of
// the wider word. Both must be placed in word-order.js; the tag shows only when both words are in
// the topic, so pairs for words still waiting for a picture are ready for when they arrive.
// Draft, 21 November 2026, for the 123 words Mammals has today; the vocabulary plan adds more.
export const kindOf = {
  "polar-bear": "bear",
  moose: "deer",
};

// Labels where there is no wider word card, or the plain form would mislead. Cousins are not
// kinds: a sea lion is a cousin of the seal, not a kind of seal.
export const kindOfLabel = {
  lion: "A kind of wild cat",
  tiger: "A kind of wild cat",
  cheetah: "A kind of wild cat",
  leopard: "A kind of wild cat",
  wolf: "A wild cousin of the dog",
  fox: "A cousin of the dog",
  donkey: "A cousin of the horse",
  zebra: "A cousin of the horse",
  chimpanzee: "A kind of ape",
  gorilla: "A kind of ape",
  "sea-lion": "A cousin of the seal",
  porpoise: "A cousin of the dolphin",
  dugong: "A cousin of the manatee",
  kitten: "A young cat",
  puppy: "A young dog",
  calf: "A young cow",
  lamb: "A young sheep",
  kid: "A young goat",
  foal: "A young horse",
  cub: "A young lion or bear",
  joey: "A young kangaroo",
};
