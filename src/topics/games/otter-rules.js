// How to play Otter Dive. Every number comes from SETTINGS in otter.js, never typed in here.
import { SETTINGS, LIVES, FISH_POINTS, MAX_COMBO, REFILL } from "./otter.js";

const word = (n) => ["no", "one", "two", "three", "four", "five", "six"][n] || String(n);
const secs = (n) => `${n} ${n === 1 ? "second" : "seconds"}`;
const level = (id, name) => {
  const s = SETTINGS[id];
  const extra = [s.line ? "a fishing line drifts across now and then" : "", s.muddy ? "the water is muddy, so only your whisker ring shows the fish" : ""].filter(Boolean);
  return `${name}: a ${s.river} river, a ${secs(s.breath)} breath and ${s.obstacles} snags and litter${extra.length ? `; ${extra.join(", and ")}` : ""}. The swim lasts ${secs(s.time)}.`;
};

export const RULES = [
  { title: "How to play", items: [
    "Otters are mammals. They swim and dive for fish, but they breathe air, so they must come up to the surface.",
    `Swim into a fish to catch it: ${FISH_POINTS} points. Each extra fish on the same dive raises your dive combo, up to ×${MAX_COMBO}.`,
    `Your air bar goes down under water. At the surface it fills again in ${secs(REFILL)}.`,
    "If your air runs out, the otter is lifted up for air and loses a life. Otters never drown in this game.",
    "Bumping a snag or a piece of litter loses a life and breaks your combo.",
    `You have ${word(LIVES)} lives. When the time is up, the otter swims home to its holt.`,
  ] },
  { title: "Controls", items: [
    "Arrow Up and Arrow Down, or W and S: swim up and down.",
    "Mouse: move the pointer up and down over the river.",
    "Touch: drag anywhere on the river. The otter follows your finger.",
  ] },
  { title: "Levels", items: [level("easy", "Easy"), level("medium", "Medium"), level("hard", "Hard")] },
  { title: "Stars", items: [
    `Easy: ${SETTINGS.easy.stars.join(", ")} points for one, two and three stars.`,
    `Medium: ${SETTINGS.medium.stars.join(", ")} points.`,
    `Hard: ${SETTINGS.hard.stars.join(", ")} points.`,
    "Your best points for each level are kept on this device.",
  ] },
];
