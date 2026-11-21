// Sort It rules (Insects pattern, blueprint v7.0): each sort is authored on its own, not taken
// from the word groups, so a word is only asked where its answer is clear. Words without a
// membership in a rule are left out of that sort. Members may name words still waiting for a
// picture; they join the sort once they are in the topic. A rule whose groups have no words yet
// shows on the setup screen but cannot be played (Mammal or not? waits for the Other Animals
// group). Draft wording, 21 November 2026, for teacher review.
import { wordOrder } from "./word-order.js";
import { families } from "./families.js";

const ids = (text) => text.split(" ");
const water = ids("whale dolphin porpoise seal sea-lion walrus sea-otter manatee dugong");

export const sortingRules = [
  {
    id: "mammal-or-not",
    question: "Mammal or not?",
    note: "A mammal has hair or fur at some time in its life, breathes air and feeds its babies on milk. Birds, reptiles, amphibians and fish are animals too, but they are not mammals.",
    groups: [
      { id: "mammal", icon: "tick", label: "Mammal", imageId: "lion", members: wordOrder.mammals, explanation: "It is a mammal. It has hair or fur and feeds its babies on milk." },
      { id: "not-mammal", icon: "cross", label: "Not a mammal", imageId: null, members: wordOrder.neighbours, explanation: "It is an animal, but not a mammal. It does not feed its babies on milk." },
    ],
  },
  {
    id: "land-or-water",
    question: "Land or water?",
    note: "Sort by where the mammal spends most of its life: on land, or in the sea and rivers. Sea mammals still come up to breathe air. Mammals that live on both, such as the hippopotamus and the polar bear, are left out.",
    groups: [
      { id: "land", icon: "land", label: "Land", imageId: "zebra", members: wordOrder.mammals.filter((id) => !water.includes(id) && !["hippopotamus", "polar-bear", "platypus"].includes(id)), explanation: "This mammal lives on land." },
      { id: "water", icon: "water", label: "Water", imageId: "dolphin", members: water, explanation: "This mammal lives in the water and comes up to breathe air." },
    ],
  },
  {
    id: "home-or-food",
    question: "Home or food?",
    note: "Sort by what the word names: a place where mammals rest and raise their young, or something they eat or drink.",
    groups: [
      { id: "home", icon: "home", label: "Home", imageId: "burrow", members: ids("burrow den cave"), explanation: "This is a place where mammals rest or raise their young." },
      { id: "food", icon: "food", label: "Food", imageId: "fruit", members: ids("grass leaf fruit seed seagrass milk"), explanation: "This is something mammals eat or drink." },
    ],
  },
  {
    id: "body-or-movement",
    question: "Body part or movement?",
    note: "Sort by what the word names: a part of the body you can point to, or a way of moving.",
    groups: [
      { id: "body-part", icon: "body", label: "Body part", imageId: "paw", members: wordOrder.body.filter((id) => id !== "lungs"), explanation: "This word names a part of a mammal's body." },
      { id: "movement", icon: "move", label: "Movement", imageId: "hop", members: wordOrder.movement, explanation: "This word names a way mammals move." },
    ],
  },
  {
    // Which family? offers three families each turn: the right one and two others.
    id: "which-family",
    question: "Which family?",
    note: "Each mammal belongs to a family, such as the cats, the rodents or the sea mammals. Each turn offers three families.",
    choices: 3,
    cover: ["cats", "sea-mammals"],
    groups: families.map((f) => ({ id: f.id, label: f.label, imageId: f.imageId, members: f.members, explanation: f.explanation, side: f.groupId })),
  },
];

export const sortingRule = (id) => sortingRules.find((rule) => rule.id === id);
export const sortingGroup = (rule, item) => rule?.groups.find((group) => group.members.includes(item.id));
export const sortingPool = (rule, words) => words.filter((item) => sortingGroup(rule, item));
