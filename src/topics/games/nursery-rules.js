// How to play Nursery Round-up. Every level number comes from SETTINGS, so the rules follow the game.
import { SETTINGS } from "./nursery.js";

const word = (n) => ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"][n] || String(n);
const show = (cfg) => (cfg.picture ? "Each baby shows its picture and its name." : "Each baby shows only its name card, so read the name and find its mother.");

export function rulesFor(s = SETTINGS) {
  const level = (id, label) => `${label}: ${word(s[id].pairs)} babies and their mothers. ${show(s[id])}${s[id].speakName ? " You hear the baby's name when you pick it." : ""}`;
  return [
    { title: "How to play", items: [
      "The babies have wandered off into the meadow. Their mothers wait along the bottom.",
      "Tap a baby to pick it, then tap its mother. You can also drag the baby onto its mother.",
      "The right mother calls her baby home, and you hear how she feeds it milk.",
      "A wrong mother says who she is. That is a slip, and the baby goes back to try again.",
      "Bring every baby home to finish.",
    ] },
    { title: "Controls", items: [
      "Tap or click a baby, then its mother. Or drag the baby onto her.",
      "Keyboard: Tab to a baby and press Enter. Then Tab or the arrow keys move through the mothers, and Enter picks one. Esc puts the baby down.",
    ] },
    { title: "Levels", items: [level("easy", "Easy"), level("medium", "Medium"), level("hard", "Hard")] },
    { title: "Stars", items: [`Three stars with no slips. Up to ${word(s.easy.two)} slips still gives two stars.`] },
  ];
}

export const RULES = rulesFor(SETTINGS);
