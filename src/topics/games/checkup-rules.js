// How to play Mammal Check-up. Numbers come from SETTINGS.
import { SETTINGS, STAR_SLIPS } from "./checkup.js";

const n = (level) => SETTINGS[level].visitors;

export const RULES = [
  { title: "How to play", items: [
    "Animals come to the vet one at a time.",
    "Run all three checks: Hair or fur? Breathes air? Milk for babies?",
    "Then stamp the card: Mammal or Not a mammal.",
    "A mammal says yes to all three checks.",
    "A wrong stamp tells you why. Stamp it again.",
  ] },
  { title: "Levels", items: [
    `Easy: ${n("easy")} visitors that are easy to tell apart. The next check glows.`,
    `Medium: ${n("medium")} visitors. Some live in the sea.`,
    `Hard: ${n("hard")} tricky visitors, like an animal that lays eggs, one that flies and one that swims. No glow.`,
  ] },
  { title: "Stars", items: [
    "3 stars: every stamp right first time.",
    `2 stars: ${STAR_SLIPS} wrong stamp.`,
    `1 star: more than ${STAR_SLIPS} wrong stamp${STAR_SLIPS === 1 ? "" : "s"}.`,
  ] },
  { title: "Keys", items: ["1, 2 and 3 run the checks. M stamps Mammal, N stamps Not a mammal.", "Or use Tab and Enter."] },
];
