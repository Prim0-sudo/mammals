// Otter Dive (arcade, the Home banner): data, SETTINGS and the pure river rules
// (docs/topic-games-concepts/DESIGN.md, section 4). No DOM: the view draws what `step` decides.
//
// The river is measured in stage heights: the water line sits at SURFACE, the riverbed at BED, and
// x runs from 0 (left edge) to `view` (the stage's width over its height). The otter stays at
// OTTER_X of the width and only moves up and down; everything in the river comes in from the right.
// A round is seeded, so the same seed and the same input replay exactly (tests/games-otter.test.js).
import { seeded } from "../topic-games.js";

export const SURFACE = 0.22; // the water line, as a share of the stage height
export const BED = 0.94; // the riverbed
export const OTTER_X = 0.25; // the otter's place across the stage
export const OTTER_R = 0.05; // the otter's reach for fish and bumps
export const TOP = SURFACE - 0.015; // the highest the otter floats
export const DEEP = BED - 0.07; // the deepest it can swim
export const AT_SURFACE = SURFACE + 0.035; // at or above this the otter is breathing
export const SWIM = 0.85; // how fast the otter swims up or down (stage heights a second)
export const STEER = 1.1; // how fast the arrow keys move the otter's aim
export const LIFT = 1.5; // how fast an out-of-breath otter is lifted to the surface
export const REFILL = 1; // seconds to fill the air at the surface
export const BLINK = 1.5; // seconds of blinking (and no new bumps) after a life is lost
export const WHISKERS = 0.3; // the whisker ring in muddy water
export const LIVES = 3;
export const FISH_POINTS = 10;
export const MAX_COMBO = 4;
export const SIM_VIEW = 1.8; // the stage shape the star simulation plays on (desktop)

// Per level. speed: the river (stage heights a second). breath: seconds of air under water.
// fishEvery / obstacleEvery: seconds between shoals and between snags or litter. line: seconds
// between fishing lines (0 for none). stars: points for one, two and three stars, from the play
// simulation below (the test checks they still match it).
export const SETTINGS = {
  easy: { speed: 0.3, breath: 12, time: 60, fishEvery: 1.9, obstacleEvery: 4.6, line: 0, muddy: false, river: "slow", obstacles: "a few", stars: [250, 600, 1000] },
  medium: { speed: 0.4, breath: 9, time: 75, fishEvery: 1.8, obstacleEvery: 2.9, line: 0, muddy: false, river: "faster", obstacles: "more", stars: [250, 650, 1100] },
  hard: { speed: 0.5, breath: 7, time: 90, fishEvery: 1.7, obstacleEvery: 2.7, line: 15, muddy: true, river: "fast", obstacles: "many", stars: [250, 550, 950] },
};

export const LITTER_KINDS = ["can", "bottle", "bag"];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// A fresh round. rand drives every spawn, so a seed replays the same river.
export function createRun(level, { seed = 1, view = SIM_VIEW } = {}) {
  const cfg = SETTINGS[level];
  const rand = seeded(seed);
  return {
    level, cfg, view, rand, time: 0, dist: 0, over: false, end: null,
    points: 0, fish: 0, bestCombo: 1, combo: 1, diveFish: 0, lives: LIVES, bumps: 0, breaths: 0,
    otter: { y: TOP, target: TOP, vy: 0, air: 1, under: false, lift: false, blink: 0 },
    things: [],
    nextFish: 0.8, nextObstacle: 2.2 + rand() * 1.5, nextLine: cfg.line ? 6 + rand() * 4 : Infinity,
    lastFishAt: -9, id: 0,
  };
}

export const otterX = (run) => OTTER_X * run.view;
const spawnX = (run) => run.view + 0.22;

function spawnShoal(run) {
  const { rand } = run;
  const n = 1 + Math.floor(rand() * 3);
  const y0 = SURFACE + 0.12 + rand() * (DEEP - SURFACE - 0.18);
  const slope = rand() < 0.5 ? -1 : 1;
  for (let i = 0; i < n; i++) {
    const y = clamp(y0 + slope * i * 0.07, SURFACE + 0.1, DEEP - 0.02);
    run.things.push({ id: ++run.id, type: "fish", x: spawnX(run) + i * 0.16, y, base: y, r: 0.045, drift: 0.85 + rand() * 0.3, phase: rand() * 6.28, caught: false });
  }
  run.lastFishAt = run.time;
}

// A snag is a branch standing up from the riverbed (a slanted line from the bed to its tip); litter
// floats in the water. Neither is put on top of a shoal that has just come in.
function spawnObstacle(run) {
  const { rand } = run;
  if (rand() < 0.55 && !run.things.some((t) => t.type === "line")) {
    const tip = SURFACE + 0.3 + rand() * 0.28;
    run.things.push({ id: ++run.id, type: "snag", x: spawnX(run), y: tip, x2: spawnX(run) + 0.06 + rand() * 0.1, tip, r: 0.03, drift: 1, hit: false, twig: rand() });
  } else {
    const y = SURFACE + 0.12 + rand() * (DEEP - SURFACE - 0.2);
    run.things.push({ id: ++run.id, type: "litter", kind: LITTER_KINDS[Math.floor(rand() * LITTER_KINDS.length)], x: spawnX(run), y, base: y, r: 0.04, drift: 1, phase: rand() * 6.28, spin: rand() * 6.28, hit: false });
  }
}

// The fishing line (Hard) hangs from an angler on the bank to a hook, and drifts across slowly.
function spawnLine(run) {
  const hook = SURFACE + 0.2 + run.rand() * 0.22;
  run.things.push({ id: ++run.id, type: "line", x: spawnX(run), y: hook, hook, base: hook, r: 0.02, drift: 0.38, phase: run.rand() * 6.28, hit: false });
}

// Distance from a point to a line segment.
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// Does the otter at (x, y) touch this thing?
export function touches(t, x, y) {
  if (t.type === "snag") return segDist(x, y, t.x2, BED, t.x, t.tip) < OTTER_R + t.r;
  if (t.type === "line") return Math.abs(x - t.x) < OTTER_R * 0.7 + t.r && y > SURFACE - 0.02 && y < t.hook + 0.035;
  return Math.hypot(x - t.x, y - t.y) < OTTER_R + t.r;
}

// One step of the river. input: { dir } (-1 up, 1 down, from keys) and/or { target } (a height to
// swim to, from the pointer). Returns the events of this step for the view's toasts and sounds.
export function step(run, input = {}, dt = 1 / 60) {
  const events = [];
  if (run.over) return events;
  const { cfg } = run;
  const o = run.otter;
  run.time += dt;
  run.dist += cfg.speed * dt;
  if (o.blink > 0) o.blink = Math.max(0, o.blink - dt);

  // Steering: keys move the aim, a pointer sets it. A lifted otter goes up whatever you press.
  if (input.target != null) o.target = input.target;
  if (input.dir) o.target += input.dir * STEER * dt;
  o.target = clamp(o.target, TOP, DEEP);
  const aim = o.lift ? TOP : o.target;
  const rate = o.lift ? LIFT : SWIM;
  const before = o.y;
  o.y = clamp(o.y + clamp(aim - o.y, -rate * dt, rate * dt), TOP, DEEP);
  o.vy = (o.y - before) / dt;

  // Air: it drains under water and fills again in REFILL seconds at the surface.
  const wasUnder = o.under;
  o.under = o.y > AT_SURFACE;
  if (o.under) {
    o.air = Math.max(0, o.air - dt / cfg.breath);
    if (o.air <= 0 && !o.lift) {
      o.lift = true;
      run.breaths++;
      loseLife(run, events, "breath");
    }
  } else {
    o.air = Math.min(1, o.air + dt / REFILL);
    if (o.lift) {
      o.lift = false;
      o.target = TOP;
    }
    if (wasUnder) {
      events.push({ type: "surface", fish: run.diveFish });
      run.combo = 1;
      run.diveFish = 0;
    }
  }

  // Spawns, on the round's own seeded random numbers.
  if (run.time >= run.nextFish) {
    spawnShoal(run);
    run.nextFish = run.time + cfg.fishEvery * (0.75 + run.rand() * 0.5);
  }
  if (run.time >= run.nextObstacle) {
    if (run.time - run.lastFishAt < 0.45) run.nextObstacle = run.lastFishAt + 0.5;
    else {
      spawnObstacle(run);
      run.nextObstacle = run.time + cfg.obstacleEvery * (0.7 + run.rand() * 0.6);
    }
  }
  if (run.time >= run.nextLine) {
    if (!run.things.some((t) => t.type === "line")) spawnLine(run);
    run.nextLine = run.time + cfg.line * (0.85 + run.rand() * 0.3);
  }

  // The river carries everything left; fish and litter bob, the hook dips.
  const ox = otterX(run);
  for (const t of run.things) {
    const dx = cfg.speed * t.drift * dt;
    t.x -= dx;
    if (t.x2 != null) t.x2 -= dx;
    if (t.type === "fish" || t.type === "litter" || t.type === "line") {
      t.phase += dt * (t.type === "line" ? 1.3 : 2.2);
      t.y = t.base + Math.sin(t.phase) * (t.type === "fish" ? 0.018 : 0.012);
      if (t.type === "line") t.hook = t.y;
      if (t.type === "litter") t.spin += dt * 0.8;
    }
    if (t.type === "fish") {
      if (!t.caught && touches(t, ox, o.y)) catchFish(run, t, events);
    } else if (!t.hit && o.blink <= 0 && !run.over && touches(t, ox, o.y)) {
      t.hit = true;
      run.bumps++;
      loseLife(run, events, t.type, t);
    }
  }
  run.things = run.things.filter((t) => Math.max(t.x, t.x2 ?? t.x) > -0.3 && !(t.type === "fish" && t.caught));

  if (!run.over && run.time >= cfg.time) {
    run.over = true;
    run.end = "time";
    events.push({ type: "end", why: "time" });
  }
  return events;
}

function catchFish(run, fish, events) {
  fish.caught = true;
  const points = FISH_POINTS * run.combo;
  run.points += points;
  run.fish++;
  run.diveFish++;
  events.push({ type: "fish", points, combo: run.combo, x: fish.x, y: fish.y });
  run.bestCombo = Math.max(run.bestCombo, run.combo);
  run.combo = Math.min(MAX_COMBO, run.combo + 1);
}

function loseLife(run, events, why, thing = null) {
  run.lives = Math.max(0, run.lives - 1);
  run.otter.blink = BLINK;
  run.combo = 1;
  events.push({ type: "life", why, lives: run.lives, x: thing?.x, y: thing?.y });
  if (!run.lives) {
    run.otter.lift = true; // never drowns: up it comes, then home to the holt
    run.over = true;
    run.end = "lives";
    events.push({ type: "end", why: "lives" });
  }
}

export function stars(points, level) {
  const [one, two, three] = SETTINGS[level].stars;
  return points >= three ? 3 : points >= two ? 2 : points >= one ? 1 : 0;
}

/* ---------- play simulation (star thresholds) ---------- */

// A steady young player: it looks a short way ahead, chases the nearest shoal it can reach, goes up
// when its air runs low, and steers round snags, litter and lines. It reacts a little late and now
// and then misses a hazard, so it plays like a careful child, not a machine.
export function botInput(run, brain) {
  const o = run.otter, ox = otterX(run), { cfg } = run;
  brain.wait -= 1 / 60;
  if (brain.wait > 0) return { target: brain.target };
  brain.wait = 0.22 + brain.rand() * 0.12;
  const toTop = (o.y - TOP) / SWIM;
  // A fishing line right overhead: wait under the hook for it to pass, if there is air for it.
  const line = run.things.find((t) => t.type === "line" && t.x - ox > -0.12 && t.x - ox < 0.3 && brain.seen.get(t.id));
  let target = o.target;
  if (line && o.air * cfg.breath > 0.6) target = line.hook + 0.11;
  else if (brain.up || o.air * cfg.breath < toTop + 1.6 + brain.rand() * 1.2) {
    brain.up = o.air < 0.97;
    target = TOP;
  } else {
    let best = Infinity;
    for (const t of run.things) {
      if (t.type !== "fish" || t.caught || t.x < ox - 0.02) continue;
      const when = (t.x - ox) / (cfg.speed * t.drift);
      if (when > 3.2) continue;
      const reach = Math.abs(t.y - o.y) / SWIM;
      if (reach > when + 0.15) continue;
      if (o.air * cfg.breath < when + (t.y - TOP) / SWIM + 1.2) continue;
      if (when < best) { best = when; target = t.y; }
    }
    if (best === Infinity) target = clamp(o.y, SURFACE + 0.15, SURFACE + 0.35);
  }
  // Hazards in the next second or so push the aim away (unless this is one of its slips).
  for (const t of run.things) {
    if (t.type === "fish" || t.hit) continue;
    const near = Math.min(t.x, t.x2 ?? t.x) - ox, far = Math.max(t.x, t.x2 ?? t.x) - ox;
    const when = (near - 0.1) / (cfg.speed * t.drift);
    if (far < -0.1 || when > 1.5) continue;
    if (!brain.seen.has(t.id)) brain.seen.set(t.id, brain.rand() >= brain.slip);
    if (!brain.seen.get(t.id)) continue;
    // Close by, it keeps to the side it is already on; further off, it just moves the aim.
    const soon = when < 0.8;
    if (t.type === "snag") target = Math.min(target, t.tip - 0.13);
    else if (t.type === "line") target = Math.max(target, t.hook + 0.11);
    else if (soon) target = o.y < t.y ? Math.min(target, t.y - 0.14) : Math.max(target, t.y + 0.14);
    else if (Math.abs(target - t.y) < 0.13) target = t.y + (target < t.y ? -0.14 : 0.14);
  }
  target = clamp(target + (brain.rand() - 0.5) * 0.04, TOP, DEEP);
  return { target: (brain.target = target) };
}

export function simulate(level, seed, { view = SIM_VIEW, slip = 0.12 } = {}) {
  const run = createRun(level, { seed, view });
  const brain = { rand: seeded(seed * 7919 + 13), wait: 0, target: TOP, up: false, slip, seen: new Map() };
  while (!run.over) step(run, botInput(run, brain), 1 / 60);
  return run;
}

// Stars from the simulation: one star at a fifth of the steady player's median points, two at 45%
// and three at 75% (each rounded down to 50 points). The bot never tires, so a child needs less.
export const SIM_SEEDS = 24;
export function simulatedStars(level) {
  const points = Array.from({ length: SIM_SEEDS }, (_, i) => simulate(level, i + 1).points).sort((a, b) => a - b);
  const median = (points[SIM_SEEDS / 2 - 1] + points[SIM_SEEDS / 2]) / 2;
  const at = (share) => Math.max(50, Math.floor((median * share) / 50) * 50);
  return [at(0.2), at(0.45), at(0.75)];
}
