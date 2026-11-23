// How to play Home Before Dark. Every level number comes from SETTINGS, so the rules follow the game.
import { SETTINGS, FARM, nameOf } from "./homes.js";

const word = (n) => ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"][n] || String(n);
const list = (items) => (items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}` : items[0] || "");
const atOnce = (n) => (n === 1 ? "one at a time" : `${word(n)} on the paths at once`);

export function rulesFor(s = SETTINGS) {
  const level = (id, label, extra) =>
    `${label}: ${word(s[id].homes)} homes and ${word(s[id].walkers)} animals, ${atOnce(s[id].atOnce)}. ${extra} Dark comes after ${s[id].dusk} seconds.`;
  return [
    { title: "How to play", items: [
      "Dusk is falling, and the animals are walking home. Each one comes in at the start of the path.",
      "Where the path splits, there is a switch. Tap it to send animals the other way. The lit path shows where they will go.",
      "Every animal follows the switches. A switch locks for a moment while an animal is crossing it.",
      "Send each animal to its own home: a rabbit to its warren, a badger to its sett.",
      "A wrong home is a slip. The animal sniffs, says whose home it is, walks back to the start and tries again.",
      "Each animal that gets home lights a star in the sky. Animals still out when it gets dark go home on their own, but they count as missed.",
    ] },
    { title: "Controls", items: [
      "Tap or click a switch to flip it.",
      "Keyboard: Tab or the arrow keys move between the switches, and Space or Enter flips one.",
    ] },
    { title: "Levels", items: [
      level("easy", "Easy", "A thought bubble shows each animal's home."),
      level("medium", "Medium", "Only the names show, so remember who lives where."),
      level("hard", "Hard", `Farm homes join the wild ones: ${list(FARM.map(nameOf))}.`),
    ] },
    { title: "Stars", items: [
      `Three stars when every animal gets home with no slips. Up to ${word(s.easy.two)} slips or missed animals still gives two stars.`,
    ] },
  ];
}

export const RULES = rulesFor(SETTINGS);
