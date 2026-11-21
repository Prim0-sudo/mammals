// Animal families: a second layer under Meet the Mammals, so a learner can meet just the cats or
// just the sea mammals (the Insects pattern, owner 17 November 2026). The ten teaching groups stay
// as they are. Families are child-level groupings, not strict science orders. Family labels name
// the animals, not what they do. Every family except the catch-all should reach five words; the
// 21 November lists hold today's 123 words and grow with the vocabulary plan (docs/VOCABULARY-PLAN.md).
// Each picture word must be one of its family's members. Wording is a draft for teacher review.
const ids = (text) => text.split(" ");

export const families = [
  { id: "cats", groupId: "mammals", label: "Cats", imageId: "tiger", members: ids("cat lion tiger cheetah leopard"), explanation: "It is a cat. Cats have soft paws, sharp claws and whiskers." },
  { id: "dogs", groupId: "mammals", label: "Dogs & foxes", imageId: "fox", members: ids("dog fox wolf"), explanation: "It belongs with the dogs, foxes and wolves. They have long noses and a strong sense of smell." },
  { id: "rodents", groupId: "mammals", label: "Rodents & rabbits", imageId: "squirrel", members: ids("mouse rat hamster guinea-pig squirrel rabbit"), explanation: "It belongs with the rodents and rabbits. Their front teeth keep growing all their lives." },
  { id: "hoofed", groupId: "mammals", label: "Hoofed mammals", imageId: "zebra", members: ids("horse donkey zebra cow sheep goat pig deer moose giraffe camel rhinoceros hippopotamus"), explanation: "It is a hoofed mammal. It walks on the tips of its toes, inside hard hooves." },
  { id: "primates", groupId: "mammals", label: "Monkeys & apes", imageId: "chimpanzee", members: ids("monkey chimpanzee gorilla"), explanation: "It belongs with the monkeys and apes. They have hands that can grip." },
  { id: "pouched", groupId: "mammals", label: "Pouched mammals", imageId: "kangaroo", members: ids("kangaroo koala wombat"), explanation: "It is a pouched mammal. Its baby grows in its mother's pouch." },
  { id: "sea-mammals", groupId: "mammals", label: "Sea mammals", imageId: "dolphin", members: ids("whale dolphin porpoise seal sea-lion walrus sea-otter manatee dugong"), explanation: "It is a sea mammal. It lives in the water but comes up to breathe air." },
  { id: "other-mammals", groupId: "mammals", label: "Other mammals", imageId: "hedgehog", members: ids("hedgehog bear polar-bear elephant sloth bat platypus echidna"), explanation: "It is a mammal with a small family of its own." },
];

const byId = new Map(families.map((f) => [f.id, f]));
export const familyById = (id) => byId.get(id);
export const familiesOf = (groupId) => families.filter((f) => f.groupId === groupId);
export const familyOf = (wordId) => families.find((f) => f.members.includes(wordId));
// A picker id is a teaching group, "all", or a family.
export const inPick = (item, id) => !id || id === "all" || item.categoryId === id || !!byId.get(id)?.members.includes(item.id);
