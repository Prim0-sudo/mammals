// How to play Bat Night Hunt. Numbers come from the game's settings.
import { SETTINGS, LIVES, MOTH_POINTS, MAX_STREAK, ECHO_COOLDOWN } from "./bat.js";

const s = SETTINGS;
const danger = (l) => (s[l].branches ? `up to ${s[l].branches} branches${s[l].owlEvery ? " and an owl" : ""}` : "nothing to bump into");

export const RULES = [
  { title: "How to play", items: [
    "Bats are nocturnal: they hunt at night. It is too dark to see, so a bat listens.",
    "Send an echo. The rings light up the moths, branches and owls they pass, then everything fades into the dark again.",
    `Fly into a moth to catch it: ${MOTH_POINTS} points.`,
    `Catch more moths from the same echo for a streak, up to ×${MAX_STREAK}.`,
    `Bumping a branch or an owl costs a life. You have ${LIVES}. The night ends at dawn.`,
  ] },
  { title: "Levels", items: [
    `Easy: ${s.easy.night} seconds of night, slow moths, ${danger("easy")}. A free echo every ${s.easy.autoEcho} seconds, and things stay lit for ${s.easy.seen} seconds.`,
    `Medium: ${s.medium.night} seconds, quicker moths and ${danger("medium")}. Things stay lit for ${s.medium.seen} seconds.`,
    `Hard: ${s.hard.night} seconds, fast moths, ${danger("hard")}. Things stay lit for only ${s.hard.seen} seconds.`,
  ] },
  { title: "Stars", items: ["easy", "medium", "hard"].map((l) => {
    const [one, two, three] = s[l].stars;
    return `${l[0].toUpperCase()}${l.slice(1)}: ${one} points for 1 star, ${two} for 2 and ${three} for 3.`;
  }) },
  { title: "Controls", items: [
    "Fly with the arrow keys or W A S D, point with the mouse, or drag on the wood.",
    `Echo with Space, the Echo button, or a double tap on the wood. An echo needs ${ECHO_COOLDOWN} seconds to come back.`,
  ] },
];
