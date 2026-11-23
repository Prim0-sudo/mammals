// Burrow Dash (arcade): data, SETTINGS and the pure meadow rules (docs/topic-games-concepts/DESIGN.md,
// section 5). No DOM: the view draws what `step` decides.
//
// The meadow is measured in stage heights. x is a distance along the meadow; `scroll` is where the
// rabbit is, so a thing is (thing.x - scroll) ahead of it. Heights (y, h) are above the ground line.
// The course is laid out ahead of the rabbit from the round's seeded random numbers, so a seed and
// the same input replay exactly (tests/games-dash.test.js).
import { seeded } from "../topic-games.js";

export const GROUND = 0.8; // the ground line, as a share of the stage height
export const RABBIT_X = 0.22; // the rabbit's place across the stage
export const RABBIT_HALF = 0.03; // half the rabbit's width for bumps
export const HOP_TIME = 0.75; // seconds in the air
export const HOP_HEIGHT = 0.26;
export const HOP_BUFFER = 0.12; // a hop pressed this close to landing still happens
export const HIDE_REACH = 0.1; // how close a burrow must be to hide in it
export const HIDE_EARLY = 0.25; // a hide pressed this many seconds early waits for the burrow
export const MIN_HIDE = 0.6; // the shortest stay in a burrow
export const ALL_CLEAR = 0.35; // seconds after the danger has gone before the rabbit pops out
export const BLINK = 1.2;
export const LIVES = 3;
export const LEAF_POINTS = 10;
export const FOX_SPEED = 0.3; // how fast the fox trots towards the rabbit
export const SWOOP = 1; // seconds of the eagle's swoop after it strikes
export const LOOKAHEAD = 2.8; // how far ahead the course is laid out
export const FIRST_STONE = 1; // a few seconds of leaves only at the start, to get going
export const SIM_VIEW = 1.8;

// Per level. speed: the run (stage heights a second). warning: seconds from the eagle's cry (or the
// fox coming into view) to the strike. gap: seconds of running between burrows. stars: points for one,
// two and three stars, from the play simulation below (the test checks they still match it).
// stones: the share of stretches with a stone (or a log) to hop.
export const SETTINGS = {
  easy: { speed: 0.42, warning: 3, gap: 4, fox: false, time: 60, stones: 0.28, logs: false, dangerEvery: 7, stars: [150, 400, 700] },
  medium: { speed: 0.42, warning: 2.2, gap: 5, fox: true, time: 75, stones: 0.3, logs: true, dangerEvery: 7, stars: [200, 550, 900] },
  hard: { speed: 0.5, warning: 1.6, gap: 6, fox: true, time: 90, stones: 0.3, logs: true, dangerEvery: 6.5, stars: [350, 800, 1300] },
};

export function createRun(level, { seed = 1 } = {}) {
  const cfg = SETTINGS[level];
  const rand = seeded(seed);
  const run = {
    level, cfg, rand, time: 0, scroll: 0, over: false, end: null,
    points: 0, leaves: 0, lives: LIVES, bumps: 0, caught: 0, safe: 0,
    rabbit: { h: 0, hop: -1, hopQueued: -1, hidden: null, hideAt: 0, clearFor: 0, hideQueued: -1, blink: 0 },
    things: [], danger: null, passing: [],
    nextBurrow: 0.9, genX: 0.5, nextDanger: 4 + rand() * 2, id: 0,
  };
  layOut(run);
  return run;
}

// Lay the course out ahead: burrows about `gap` seconds apart, and between them beats of leaves,
// stones (logs on Medium and Hard) with leaves over them, or a quiet stretch. Stones keep clear of
// burrows, so the ground round a hole is always safe to hide on.
function layOut(run) {
  const { rand, cfg } = run;
  const add = (thing) => run.things.push({ id: ++run.id, ...thing });
  while (run.genX < run.scroll + LOOKAHEAD) {
    if (run.genX >= run.nextBurrow - 0.05) {
      add({ type: "burrow", x: run.nextBurrow });
      run.genX = run.nextBurrow + 0.3;
      run.nextBurrow += cfg.gap * cfg.speed * (0.85 + rand() * 0.3);
      continue;
    }
    const x = run.genX;
    const room = run.nextBurrow - x;
    const roll = rand();
    if (room > 0.55 && x > FIRST_STONE && roll < cfg.stones) {
      const log = cfg.logs && rand() < 0.3;
      const w = log ? 0.1 : 0.065;
      add({ type: log ? "log" : "stone", x: x + 0.2, w, h: log ? 0.05 : 0.06, hit: false });
      // Leaves along the hop over it
      for (let i = -1; i <= 1; i++) add({ type: "leaf", x: x + 0.2 + i * 0.09, y: 0.14 + (i ? 0.05 : 0.12), taken: false });
      run.genX = x + 0.5;
    } else if (roll < cfg.stones + 0.4) {
      const n = 2 + Math.floor(rand() * 3);
      for (let i = 0; i < n; i++) add({ type: "leaf", x: x + 0.08 + i * 0.09, y: 0.05, taken: false });
      run.genX = x + 0.12 + n * 0.09;
    } else run.genX = x + 0.3;
  }
}

export const burrowNear = (run) => run.things.find((t) => t.type === "burrow" && Math.abs(t.x - run.scroll) < HIDE_REACH);
const nextBurrowAhead = (run) => run.things.filter((t) => t.type === "burrow" && t.x > run.scroll).sort((a, b) => a.x - b.x)[0];

// The hop: a smooth arc, or (reduced motion) a quick straight up, hold and down.
export function hopHeight(t, reduced = false) {
  if (t < 0 || t > 1) return 0;
  if (reduced) return t < 0.08 || t > 0.92 ? HOP_HEIGHT * 0.5 : HOP_HEIGHT;
  return 4 * HOP_HEIGHT * t * (1 - t);
}

// One step of the meadow. input: { hop, hide } (true on the step the key or button was pressed).
export function step(run, input = {}, dt = 1 / 60, { reduced = false } = {}) {
  const events = [];
  if (run.over) return events;
  const { cfg } = run;
  const r = run.rabbit;
  run.time += dt;
  if (r.blink > 0) r.blink = Math.max(0, r.blink - dt);

  // Input. A hop needs the ground (or comes very soon after landing); a hide needs a burrow close by.
  if (input.hop && !r.hidden) {
    if (r.hop < 0) startHop(run, events);
    else r.hopQueued = run.time;
  }
  // A hide over a burrow in mid-hop drops the rabbit straight into the hole; a hide just before a
  // burrow (or early in a hop) waits for it.
  if (input.hide && !r.hidden) {
    if (!burrowNear(run)) {
      const ahead = nextBurrowAhead(run);
      const soon = ahead && (ahead.x - run.scroll - HIDE_REACH) / cfg.speed < HIDE_EARLY;
      if (r.hop >= 0 || soon) r.hideQueued = run.time;
      else events.push({ type: "noburrow" });
    } else hide(run, events);
  }

  // The run: the meadow moves unless the rabbit is down a burrow.
  if (!r.hidden) {
    run.scroll += cfg.speed * dt;
    if (r.hop >= 0) {
      r.hop += dt / HOP_TIME;
      if (r.hop >= 1) {
        r.hop = -1;
        events.push({ type: "land" });
        if (r.hopQueued >= 0 && run.time - r.hopQueued <= HOP_BUFFER) startHop(run, events);
        r.hopQueued = -1;
      }
    }
    r.h = r.hop >= 0 ? hopHeight(r.hop, reduced) : 0;
    if (r.hideQueued >= 0) {
      if (run.time - r.hideQueued > HIDE_EARLY + HOP_TIME) r.hideQueued = -1;
      else if (burrowNear(run)) hide(run, events);
    }
  }

  // Stones and logs, and leaves.
  for (const t of run.things) {
    const dx = t.x - run.scroll;
    if (t.type === "leaf" && !t.taken && !r.hidden && Math.abs(dx) < 0.05 && Math.abs(t.y - (r.h + 0.06)) < 0.09) {
      t.taken = true;
      run.points += LEAF_POINTS;
      run.leaves++;
      events.push({ type: "leaf", x: t.x, y: t.y });
    } else if ((t.type === "stone" || t.type === "log") && !t.hit && r.blink <= 0 && !r.hidden && Math.abs(dx) < t.w / 2 + RABBIT_HALF && r.h < t.h) {
      t.hit = true;
      run.bumps++;
      loseLife(run, events, t.type, t);
    }
  }

  updateDanger(run, events, dt);

  // Out of the burrow on its own once the danger has passed.
  if (r.hidden && !run.over) {
    r.clearFor = run.danger ? 0 : r.clearFor + dt;
    if (run.time - r.hideAt >= MIN_HIDE && r.clearFor >= ALL_CLEAR) {
      r.hidden = null;
      events.push({ type: "popout" });
    }
  }

  run.things = run.things.filter((t) => t.x > run.scroll - 1.2 && !(t.type === "leaf" && t.taken));
  layOut(run);
  if (!run.over && run.time >= cfg.time) {
    run.over = true;
    run.end = "time";
    events.push({ type: "end", why: "time" });
  }
  return events;
}

function startHop(run, events) {
  run.rabbit.hop = 0;
  run.rabbit.hopQueued = -1;
  events.push({ type: "hop" });
}

function hide(run, events) {
  const r = run.rabbit;
  const b = burrowNear(run);
  r.hidden = b.id;
  r.hideAt = run.time;
  r.clearFor = 0;
  r.hideQueued = -1;
  r.hopQueued = -1;
  r.hop = -1; // a rabbit in mid-hop drops straight in
  r.h = 0;
  run.scroll = b.x; // into the hole
  events.push({ type: "hide", x: b.x });
}

// Dangers come one at a time, only when a burrow can be reached before they strike: the eagle's cry
// starts the warning, and the fox is timed to arrive after the same warning if the rabbit keeps running.
function updateDanger(run, events, dt) {
  const { cfg } = run;
  const r = run.rabbit;
  const d = run.danger;
  for (const p of run.passing) p.x -= p.v * dt;
  run.passing = run.passing.filter((p) => p.x > run.scroll - 1.5);
  if (!d) {
    if (run.over || r.hidden || run.time < run.nextDanger || run.time > cfg.time - cfg.warning - 0.5) return;
    const b = nextBurrowAhead(run);
    if (!b) return;
    const reach = (b.x - run.scroll) / cfg.speed;
    if (reach < cfg.warning * 0.3 || reach > cfg.warning * 0.8) return;
    const kind = cfg.fox && run.rand() < 0.5 ? "fox" : "eagle";
    run.danger = kind === "eagle"
      ? { id: ++run.id, kind, t: 0, warn: cfg.warning, struck: false }
      : { id: ++run.id, kind, t: 0, warn: cfg.warning, struck: false, x: run.scroll + cfg.warning * (cfg.speed + FOX_SPEED) };
    events.push({ type: "warn", kind });
    return;
  }
  d.t += dt;
  if (d.kind === "eagle") {
    if (!d.struck && d.t >= d.warn) strike(run, d, events);
    if (d.t >= d.warn + SWOOP) endDanger(run);
  } else {
    d.x -= (d.struck ? FOX_SPEED * 3 : FOX_SPEED) * dt;
    if (!d.struck && d.x <= run.scroll + 0.04) strike(run, d, events);
    if (d.struck && d.x < run.scroll - 0.35) {
      run.passing.push({ kind: "fox", x: d.x, v: FOX_SPEED * 3 });
      endDanger(run);
    }
  }
}

function strike(run, d, events) {
  d.struck = true;
  if (run.rabbit.hidden) {
    run.safe++;
    events.push({ type: "safe", kind: d.kind });
  } else {
    run.caught++;
    loseLife(run, events, d.kind);
  }
}

function endDanger(run) {
  run.danger = null;
  run.nextDanger = run.time + run.cfg.dangerEvery * (0.8 + run.rand() * 0.4);
}

function loseLife(run, events, why, thing = null) {
  run.lives = Math.max(0, run.lives - 1);
  run.rabbit.blink = BLINK;
  events.push({ type: "life", why, lives: run.lives, x: thing?.x });
  if (!run.lives) {
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

// A steady young player: it hops a little early or late, now and then misses a stone, hides when it
// hears the eagle or sees the fox (after a moment to react) and sometimes is too slow.
export function botInput(run, brain) {
  const r = run.rabbit, { cfg } = run;
  const input = {};
  if (r.hidden) return input;
  // Hop: aim for the top of the hop over the middle of the stone.
  for (const t of run.things) {
    if ((t.type !== "stone" && t.type !== "log") || t.hit || brain.done.has(t.id)) continue;
    const when = (t.x - run.scroll) / cfg.speed;
    if (!brain.plan.has(t.id)) brain.plan.set(t.id, brain.rand() < brain.slip * 0.6 ? -1 : HOP_TIME / 2 + (brain.rand() - 0.5) * 0.28);
    const lead = brain.plan.get(t.id);
    if (lead < 0) { if (when < 0) brain.done.add(t.id); continue; }
    if (when <= lead && r.hop < 0) {
      input.hop = true;
      brain.done.add(t.id);
    }
  }
  // Hide: react to the warning, then press as the burrow comes close.
  const d = run.danger;
  if (d && !d.struck) {
    if (!brain.react.has(d.id)) brain.react.set(d.id, brain.rand() < brain.slip ? Infinity : 0.35 + brain.rand() * 0.45);
    if (d.t >= brain.react.get(d.id) && burrowNear(run) && r.hop < 0) input.hide = true;
  }
  return input;
}

export function simulate(level, seed, { slip = 0.1 } = {}) {
  const run = createRun(level, { seed });
  const brain = { rand: seeded(seed * 7919 + 17), slip, plan: new Map(), done: new Set(), react: new Map() };
  while (!run.over) step(run, botInput(run, brain), 1 / 60);
  return run;
}

// Stars from the simulation, as in Otter Dive: a fifth, 45% and 75% of the steady player's median
// points, each rounded down to 50.
export const SIM_SEEDS = 24;
export function simulatedStars(level) {
  const points = Array.from({ length: SIM_SEEDS }, (_, i) => simulate(level, i + 1).points).sort((a, b) => a - b);
  const median = (points[SIM_SEEDS / 2 - 1] + points[SIM_SEEDS / 2]) / 2;
  const at = (share) => Math.max(50, Math.floor((median * share) / 50) * 50);
  return [at(0.2), at(0.45), at(0.75)];
}
