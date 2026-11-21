// Mammal Games: the three topic games' data and pure rules, kept apart from the screens so tests can
// check them (the Insects pattern: two education games and one arcade game). Not designed yet
// (21 November 2026): the folder shows three placeholder cards whose level pages say the game is
// being made. Their names, mechanics and art come after the art style and vocabulary are agreed.

export const TOPIC_GAMES = [
  { id: "edu-1", title: "Education game 1", kind: "Education", line: "A Mammals education game is being made for this space.", image: "elephant", pending: true },
  { id: "edu-2", title: "Education game 2", kind: "Education", line: "A second Mammals education game is being made for this space.", image: "kangaroo", pending: true },
  { id: "arcade", title: "Arcade game", kind: "Arcade", line: "A Mammals arcade game is being made for this space.", image: "cheetah", pending: true },
];

export const LEVELS = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

// Small seeded random numbers, so tests can replay a round.
export function seeded(seed = Date.now()) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Stars for a finished round: three with no slips, two with up to `two` slips, otherwise one.
export function roundStars(slips, two = 2) {
  return slips <= 0 ? 3 : slips <= two ? 2 : 1;
}
