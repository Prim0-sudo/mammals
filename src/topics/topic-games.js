// Mammal Games: the six topic games, three education and three arcade (owner, 23 November 2026:
// "build them all"). Each game keeps its data and pure rules in src/topics/games/<id>.js and its
// screen in src/core/games/<id>-view.js; the design is docs/topic-games-concepts/DESIGN.md.
// A game whose view file still re-exports PlaceholderGameView shows its honest "being made" page.

export const TOPIC_GAMES = [
  { id: "checkup", title: "Mammal Check-up", kind: "Education", line: "Run the vet checks. Is this visitor a mammal?", image: "whale" },
  { id: "homes", title: "Home Before Dark", kind: "Education", line: "Flip the path switches so every animal gets home.", image: "warren" },
  { id: "nursery", title: "Nursery Round-up", kind: "Education", line: "Help each baby find its mother.", image: "joey" },
  { id: "otter", title: "Otter Dive", kind: "Arcade", line: "Dive for fish, and come up for air in time.", image: "otter" },
  { id: "dash", title: "Burrow Dash", kind: "Arcade", line: "Hop, eat, and hide from the eagle.", image: "rabbit" },
  { id: "bat", title: "Bat Night Hunt", kind: "Arcade", line: "Echo in the dark to find the moths.", image: "bat" },
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
