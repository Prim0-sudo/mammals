// How to play Burrow Dash. Every number comes from SETTINGS in dash.js, never typed in here.
import { SETTINGS, LIVES, LEAF_POINTS } from "./dash.js";

const word = (n) => ["no", "one", "two", "three", "four", "five", "six"][n] || String(n);
const secs = (n) => `${n} ${n === 1 ? "second" : "seconds"}`;
const level = (id, name) => {
  const s = SETTINGS[id];
  const fast = SETTINGS[id].speed > SETTINGS.easy.speed ? ", and the rabbit runs faster" : "";
  return `${name}: ${s.fox ? "an eagle and a fox" : "an eagle only"}, a ${secs(s.warning)} warning and a burrow about every ${secs(s.gap)}${fast}${s.logs ? ". Logs to hop as well as stones" : ""}. Dusk comes after ${secs(s.time)}.`;
};

export const RULES = [
  { title: "How to play", items: [
    "A rabbit is prey: eagles and foxes are predators that hunt it. Hiding in a burrow keeps it safe.",
    "The rabbit runs across the meadow by itself.",
    `Rabbits are plant-eaters. Each leaf you collect is worth ${LEAF_POINTS} points.`,
    "Hop over stones and logs. Bumping one loses a life.",
    "When you hear the eagle's cry and see its shadow, or a fox comes trotting in, hide!",
    "You can only hide near a burrow: a ring shows when a hole is close. The rabbit stays in the burrow until the danger has passed, then pops out by itself.",
    `Not hiding in time loses a life. You have ${word(LIVES)} lives. At dusk the rabbit runs home to the warren.`,
  ] },
  { title: "Controls", items: [
    "Hop: Space or Arrow Up, the Hop button, or tap the meadow.",
    "Hide: Arrow Down, the Hide button, or swipe down on the meadow.",
  ] },
  { title: "Levels", items: [level("easy", "Easy"), level("medium", "Medium"), level("hard", "Hard")] },
  { title: "Stars", items: [
    `Easy: ${SETTINGS.easy.stars.join(", ")} points for one, two and three stars.`,
    `Medium: ${SETTINGS.medium.stars.join(", ")} points.`,
    `Hard: ${SETTINGS.hard.stars.join(", ")} points.`,
    "Your best points for each level are kept on this device.",
  ] },
];
