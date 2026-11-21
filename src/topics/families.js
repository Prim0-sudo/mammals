// Animal families: a second layer under Meet the Mammals, so a learner can meet just the cats or
// just the sea mammals (the Insects pattern, owner 17 November 2026). The ten teaching groups stay
// as they are. Families are child-level groupings, not strict science orders. Family labels name
// the animals, not what they do. Every family except the two catch-alls has five words or more: 15 families from the
// vocabulary plan (docs/VOCABULARY-PLAN.md, approved 22 November 2026), 9 mammal and 6 Other Animals.
// A family shows only the members whose pictures are in the topic.
// Each picture word must be one of its family's members. Wording is a draft for teacher review.
const ids = (text) => text.split(" ");

export const families = [
  { id: "cats", groupId: "mammals", label: "Cats", imageId: "tiger", members: ids("cat lion tiger cheetah leopard snow-leopard jaguar lynx"), explanation: "It is a cat. Cats have soft paws, sharp claws and whiskers." },
  { id: "dogs", groupId: "mammals", label: "Dogs & foxes", imageId: "fox", members: ids("dog fox arctic-fox fennec-fox wolf dingo"), explanation: "It belongs with the dogs, foxes and wolves. They have long noses and a strong sense of smell." },
  { id: "rodents", groupId: "mammals", label: "Rodents & rabbits", imageId: "squirrel", members: ids("mouse harvest-mouse rat hamster guinea-pig squirrel red-squirrel vole beaver rabbit hare"), explanation: "It belongs with the rodents and rabbits. Their front teeth keep growing all their lives." },
  { id: "hoofed", groupId: "mammals", label: "Hoofed mammals", imageId: "zebra", members: ids("horse pony donkey zebra cow sheep goat pig llama deer reindeer moose giraffe camel rhinoceros hippopotamus"), explanation: "It is a hoofed mammal. Most hoofed mammals walk on hard hooves at the tips of their toes." },
  { id: "otters-badgers", groupId: "mammals", label: "Otters, badgers & stoats", imageId: "badger", members: ids("badger otter stoat pine-marten ferret"), explanation: "It belongs with the otters, badgers and stoats. They have long bodies, short legs and thick fur." },
  { id: "primates", groupId: "mammals", label: "Monkeys & apes", imageId: "chimpanzee", members: ids("monkey baboon chimpanzee gorilla orangutan gibbon"), explanation: "It belongs with the monkeys and apes. They have hands that can grip." },
  { id: "pouched", groupId: "mammals", label: "Pouched mammals", imageId: "kangaroo", members: ids("kangaroo wallaby koala wombat sugar-glider"), explanation: "It is a pouched mammal. Its baby grows in its mother's pouch." },
  { id: "sea-mammals", groupId: "mammals", label: "Sea mammals", imageId: "dolphin", members: ids("whale blue-whale dolphin orca porpoise narwhal seal sea-lion walrus sea-otter manatee dugong"), explanation: "It is a sea mammal. It lives in the water but comes up to breathe air." },
  { id: "other-mammals", groupId: "mammals", label: "Other mammals", imageId: "hedgehog", members: ids("hedgehog mole shrew bear polar-bear giant-panda elephant meerkat sloth bat platypus echidna human"), explanation: "It is a mammal with a small family of its own." },
  { id: "birds", groupId: "neighbours", label: "Birds", imageId: "robin", members: ids("bird robin owl eagle duck chicken penguin"), explanation: "It is a bird. Birds have feathers and a beak, and hatch from eggs." },
  { id: "reptiles", groupId: "neighbours", label: "Reptiles", imageId: "tortoise", members: ids("snake lizard tortoise turtle crocodile"), explanation: "It is a reptile. Reptiles have dry, scaly skin." },
  { id: "amphibians", groupId: "neighbours", label: "Amphibians", imageId: "frog", members: ids("frog toad tadpole newt salamander"), explanation: "It is an amphibian. It starts life in water and has damp skin." },
  { id: "fish", groupId: "neighbours", label: "Fish", imageId: "goldfish", members: ids("fish goldfish salmon shark seahorse"), explanation: "It is a fish. It breathes through gills and swims with fins." },
  { id: "minibeasts", groupId: "neighbours", label: "Minibeasts", imageId: "ladybird", members: ids("ant bee butterfly ladybird spider snail worm"), explanation: "It is a minibeast: a small animal with no backbone." },
  { id: "sea-animals", groupId: "neighbours", label: "Other sea animals", imageId: "crab", members: ids("crab octopus jellyfish"), explanation: "It is a sea animal with no backbone." },
];

const byId = new Map(families.map((f) => [f.id, f]));
export const familyById = (id) => byId.get(id);
export const familiesOf = (groupId) => families.filter((f) => f.groupId === groupId);
export const familyOf = (wordId) => families.find((f) => f.members.includes(wordId));
// A picker id is a teaching group, "all", or a family.
export const inPick = (item, id) => !id || id === "all" || item.categoryId === id || !!byId.get(id)?.members.includes(item.id);
