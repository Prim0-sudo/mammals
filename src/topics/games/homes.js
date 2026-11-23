// Home Before Dark (education): data, SETTINGS and the pure round builder (docs/topic-games-concepts/DESIGN.md, section 2).
// Walkers come in at the start of a path network at dusk; switches where the path splits send each one to a home.
// No DOM here, so tests can replay rounds with seeded().

// Per level: homes on the board, walkers in the round, walkers on the paths at once, help, and dusk in seconds.
// cross: seconds a walker takes to walk from the start to the homes in a straight line (constant speed).
// stagger: least seconds between two walkers entering. two: most slips and misses that still give two stars.
export const SETTINGS = {
  easy: { homes: 3, walkers: 5, atOnce: 1, bubble: true, farm: false, dusk: 90, cross: 8, stagger: 0, two: 2 },
  medium: { homes: 5, walkers: 7, atOnce: 2, bubble: false, farm: false, dusk: 100, cross: 7.5, stagger: 4.5, two: 2 },
  hard: { homes: 7, walkers: 9, atOnce: 3, bubble: false, farm: true, dusk: 110, cross: 7, stagger: 3.5, two: 2 },
};

// Homes, each with the walkers that live there. also: other homes on this list where that walker could
// fairly be said to live too, so a round never puts both on the board (a squirrel's drey is a nest and it
// may use a tree hollow; bats roost in tree holes; a pine marten's tree-hole home is a den; foxes move into
// old setts; pet rabbits live in hutches).
export const HOMES = {
  warren: { walkers: ["rabbit"], farm: false },
  sett: { walkers: ["badger"], farm: false },
  drey: { walkers: ["squirrel", "red-squirrel"], farm: false },
  holt: { walkers: ["otter"], farm: false },
  lodge: { walkers: ["beaver"], farm: false },
  den: { walkers: ["fox"], farm: false },
  roost: { walkers: ["bat"], farm: false },
  nest: { walkers: ["harvest-mouse"], farm: false },
  "tree-hollow": { walkers: ["pine-marten"], farm: false },
  stable: { walkers: ["horse"], farm: true },
  kennel: { walkers: ["dog"], farm: true },
  hutch: { walkers: ["guinea-pig"], farm: true },
};
export const ALSO = {
  squirrel: ["nest", "tree-hollow"],
  "red-squirrel": ["nest", "tree-hollow"],
  bat: ["tree-hollow"],
  "pine-marten": ["den"],
  fox: ["sett"],
  rabbit: ["hutch"],
};
export const WILD = Object.keys(HOMES).filter((h) => !HOMES[h].farm);
export const FARM = Object.keys(HOMES).filter((h) => HOMES[h].farm);

export const nameOf = (id) => id.replaceAll("-", " ");
const an = (word) => (/^[aeiou]/i.test(word) ? "an" : "a");
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export const homeOf = (walker) => Object.keys(HOMES).find((h) => HOMES[h].walkers.includes(walker));
// Every home on the list where this walker could live: its own, and any it could fairly share.
export const homesFor = (walker) => [homeOf(walker), ...(ALSO[walker] || [])];
// How many homes on this board the walker could be sent to: a fair round has exactly one.
export const matchesOnBoard = (walker, board) => board.filter((h) => homesFor(walker).includes(h)).length;

export const rightLine = (home) => `Home in its ${nameOf(home)}!`;
export const wrongLine = (walker, home) =>
  `This is ${an(nameOf(home))} ${nameOf(home)}. ${cap(an(nameOf(walker)))} ${nameOf(walker)} lives in ${an(nameOf(homeOf(walker)))} ${nameOf(homeOf(walker))}.`;
export const enterLine = (walker) => `Here comes ${an(nameOf(walker))} ${nameOf(walker)}.`;

const pick = (list, rand) => list[Math.floor(rand() * list.length)];
function shuffled(list, rand) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// The path network: a full binary tree from the start, with n homes as its leaves (n - 1 switches).
// A node is { leaf: index } or { kids: [up, down] }; the upper branch takes the smaller half.
export function treeShape(n, first = 0) {
  if (n === 1) return { leaf: first };
  const up = Math.floor(n / 2);
  return { kids: [treeShape(up, first), treeShape(n - up, first + up)] };
}
// Switches in reading order (breadth first), each with an id; leaves keep their home index.
export function switchesOf(tree) {
  const out = [];
  const queue = [tree];
  while (queue.length) {
    const node = queue.shift();
    if (node.kids) {
      out.push(node);
      queue.push(...node.kids);
    }
  }
  return out;
}
// The switch settings (0 up, 1 down) that send a walker from the start to home index i.
export function routeTo(tree, i) {
  const out = [];
  let node = tree;
  while (node.kids) {
    const side = leavesOf(node.kids[0]).includes(i) ? 0 : 1;
    out.push([node, side]);
    node = node.kids[side];
  }
  return out;
}
export const leavesOf = (node) => (node.kids ? node.kids.flatMap(leavesOf) : [node.leaf]);
// Where a walker ends up with these switch settings (switch index -> side).
export function follow(tree, sides) {
  const list = switchesOf(tree);
  let node = tree;
  while (node.kids) node = node.kids[sides[list.indexOf(node)] || 0];
  return node.leaf;
}

// A pure, seeded round: which homes stand on the board and in what order, and who walks in, in order.
// Every home gets at least one walker, and no walker could fairly live in two homes on the board.
export function buildRound(level, rand = Math.random) {
  const cfg = SETTINGS[level];
  for (let attempt = 0; attempt < 500; attempt++) {
    const board = [];
    const fair = (h) => {
      const next = [...board, h];
      return next.every((home) => HOMES[home].walkers.every((w) => matchesOnBoard(w, next) === 1));
    };
    // Hard mixes in farm homes: at least one, at most three.
    const pool = cfg.farm ? [pick(FARM, rand), ...shuffled([...WILD, ...FARM], rand)] : shuffled(WILD, rand);
    for (const h of pool) {
      if (board.length === cfg.homes) break;
      if (!board.includes(h) && fair(h)) board.push(h);
    }
    if (board.length < cfg.homes) continue;
    const order = shuffled(board, rand);
    const walkerFor = (home) => ({ id: pick(HOMES[home].walkers, rand), home });
    const walkers = order.map(walkerFor);
    while (walkers.length < cfg.walkers) walkers.push(walkerFor(pick(order, rand)));
    // Never the same home twice in a row when it can be helped, so the switches keep moving.
    let list = shuffled(walkers, rand);
    for (let k = 0; k < 20 && list.some((w, i) => i && list[i - 1].home === w.home); k++) list = shuffled(walkers, rand);
    return { level, homes: order, walkers: list, tree: treeShape(cfg.homes) };
  }
  throw new Error("No fair Home Before Dark round");
}
