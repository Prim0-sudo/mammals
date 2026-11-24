// Bat Night Hunt (arcade): a bat flies through a dark wood and sends out echoes. The rings light up
// the moths, branches and owl they pass, which then fade again. Bats are nocturnal and find food by
// sound. Pure and seeded: the screen is src/core/games/bat-view.js. Design: DESIGN.md, section 6.
// The wood is in stage units: y runs 0 (top) to 1 (bottom), x runs 0 to `view` (width / height).
import { seeded } from "../topic-games.js";

export const BAT_R = 0.045; // the bat's reach for moths and bumps
export const MOTH_R = 0.03;
export const OWL_R = 0.065;
export const BRANCH_W = 0.02; // half a branch's thickness
export const TOP = 0.07; // the highest and lowest the bat flies
export const BOTTOM = 0.93;
export const FLY = 0.7; // the bat's top speed (stage heights a second)
export const TURN = 6; // how fast it reaches the speed it wants
export const ECHO_SPEED = 1.1; // how fast a ring grows (stage heights a second)
export const ECHO_RANGE = 0.8; // how far a ring reaches
export const ECHO_COOLDOWN = 1.2;
export const BLINK = 1.5; // seconds of blinking (and no new bumps) after a life is lost
export const LIVES = 3;
export const MOTH_POINTS = 10;
export const MAX_STREAK = 3;
export const OWL_SPEED = 0.15;
export const MOTH_BACK = 0.8; // seconds before a caught moth is replaced
export const SIM_VIEW = 1.8; // the stage shape the star simulation plays on (desktop)

// Per level. seen: seconds a lit thing stays visible. mothSpeed: stage heights a second. moths: how
// many flutter at once. branches: how many reach into the wood. owlEvery: seconds between owls (0 for
// none). autoEcho: a free echo this often (0 for none). stars: points for one, two and three stars,
// from the play simulation below (the test checks they still match it).
export const SETTINGS = {
  easy: { night: 60, seen: 2.5, mothSpeed: 0.08, moths: 4, branches: 0, owlEvery: 0, autoEcho: 3, pace: "slow", stars: [200, 450, 750] },
  medium: { night: 75, seen: 1.8, mothSpeed: 0.13, moths: 4, branches: 3, owlEvery: 0, autoEcho: 0, pace: "quicker", stars: [200, 450, 750] },
  hard: { night: 90, seen: 1.2, mothSpeed: 0.18, moths: 5, branches: 3, owlEvery: 16, autoEcho: 0, pace: "fast", stars: [200, 450, 800] },
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// How far a point is from a branch (a line from x1,y1 to x2,y2), and the nearest point on it.
export function nearOnBranch(px, py, b) {
  const dx = b.x2 - b.x1, dy = b.y2 - b.y1;
  const t = clamp(((px - b.x1) * dx + (py - b.y1) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  const nx = b.x1 + dx * t, ny = b.y1 + dy * t;
  return { d: Math.hypot(px - nx, py - ny), nx, ny };
}
// The distance from a point to the edge of a thing.
export function gap(t, x, y) {
  if (t.type === "branch") return nearOnBranch(x, y, t).d - BRANCH_W;
  return Math.hypot(t.x - x, t.y - y) - (t.type === "owl" ? OWL_R : MOTH_R);
}

// A fresh night. rand drives every spawn, so a seed replays the same wood.
export function createRun(level, { seed = 1, view = SIM_VIEW } = {}) {
  const cfg = SETTINGS[level];
  const run = {
    level, cfg, view, rand: seeded(seed), time: 0, over: false, end: null,
    points: 0, moths: 0, streak: 0, streakEcho: -1, bestStreak: 0, lives: LIVES, bumps: 0, echoes: 0,
    bat: { x: view / 2, y: 0.5, vx: 0, vy: 0, face: 1, blink: 0 },
    things: [], rings: [], cool: 0, auto: cfg.autoEcho || Infinity,
    nextOwl: cfg.owlEvery ? 6 + seeded(seed + 1)() * 4 : Infinity, id: 0,
  };
  placeBranches(run);
  for (let i = 0; i < cfg.moths; i++) spawnMoth(run);
  return run;
}

// How many branches a wood this wide gets: all of them on a wide screen, fewer on a narrow phone so
// there is still room to dodge.
export const branchCount = (cfg, view) => (cfg.branches ? Math.max(1, Math.round(cfg.branches * Math.min(1, view / 1.6))) : 0);

// Branches reach in from the sides and the top, clear of the bat's start and of each other.
function placeBranches(run) {
  const { rand, view } = run;
  const reach = Math.min(1, view / 1.2);
  const count = branchCount(run.cfg, view);
  for (let i = 0, tries = 0; i < count && tries < 200; tries++) {
    const side = ["left", "right", "top"][Math.floor(rand() * 3)];
    let x1, y1, ang;
    if (side === "left") [x1, y1, ang] = [0, 0.18 + rand() * 0.64, (rand() - 0.5) * 1.1];
    else if (side === "right") [x1, y1, ang] = [view, 0.18 + rand() * 0.64, Math.PI + (rand() - 0.5) * 1.1];
    else [x1, y1, ang] = [view * (0.12 + rand() * 0.76), 0, Math.PI / 2 + (rand() - 0.5) * 1.2];
    const len = (0.3 + rand() * 0.18) * reach;
    const b = { type: "branch", id: ++run.id, x1, y1, x2: x1 + Math.cos(ang) * len, y2: y1 + Math.sin(ang) * len, lit: 0, litBy: -1, twig: rand() };
    if (nearOnBranch(view / 2, 0.5, b).d < 0.24) continue;
    const others = run.things.filter((t) => t.type === "branch");
    if (others.some((o) => nearOnBranch(b.x2, b.y2, o).d < 0.16 || nearOnBranch(o.x2, o.y2, b).d < 0.16 || Math.hypot(o.x1 - b.x1, o.y1 - b.y1) < 0.2)) continue;
    run.things.push(b);
    i++;
  }
}

function spawnMoth(run) {
  const { rand, view, bat } = run;
  let x = view / 2, y = 0.3;
  for (let tries = 0; tries < 40; tries++) {
    x = view * (0.08 + rand() * 0.84);
    y = 0.12 + rand() * 0.72;
    const clear = run.things.every((t) => t.type !== "branch" || nearOnBranch(x, y, t).d > 0.13);
    if (clear && Math.hypot(x - bat.x, y - bat.y) > 0.35) break;
  }
  run.things.push({ type: "moth", id: ++run.id, x, y, ang: rand() * Math.PI * 2, turn: 0, lit: 0, litBy: -1, caught: false, back: 0, flap: rand() * 6 });
}

// An echo: a ring grows out from the bat. The player's own echoes wait for the cooldown.
export function echo(run, auto = false) {
  if (run.over || (!auto && run.cool > 0)) return null;
  const ring = { id: ++run.id, x: run.bat.x, y: run.bat.y, r: 0, auto };
  run.rings.push(ring);
  if (!auto) {
    run.cool = ECHO_COOLDOWN;
    run.echoes++;
  }
  run.auto = run.cfg.autoEcho || Infinity;
  return ring;
}

// The stage changed shape (a phone turned round): keep everything in the same place across it.
export function resizeRun(run, view) {
  const k = view / run.view;
  if (!isFinite(k) || k === 1) return;
  run.view = view;
  run.bat.x *= k;
  for (const r of run.rings) r.x *= k;
  for (const t of run.things) {
    if (t.type === "branch") { t.x1 *= k; t.x2 *= k; } else t.x *= k;
  }
}

// One step. input: { dx, dy } from keys (each -1 to 1), or { tx, ty } a point to fly towards, and
// echo: true to send an echo. Returns what happened, for the screen to show and say.
export function step(run, input = {}, dt = 1 / 60) {
  const events = [];
  if (run.over) return events;
  const { cfg, bat, rand } = run;
  run.time += dt;
  run.cool = Math.max(0, run.cool - dt);
  if (input.echo) {
    const ring = echo(run);
    events.push(ring ? { type: "echo", auto: false } : { type: "cooling" });
  }
  run.auto -= dt;
  if (run.auto <= 0 && echo(run, true)) events.push({ type: "echo", auto: true });

  // Fly: towards the pointer, or the way the keys say; with neither, glide to a stop.
  let wx = 0, wy = 0;
  if (input.tx != null) {
    const dx = input.tx - bat.x, dy = input.ty - bat.y, d = Math.hypot(dx, dy);
    if (d > 0.008) {
      const s = Math.min(1, d / 0.12);
      wx = (dx / d) * s;
      wy = (dy / d) * s;
    }
  } else if (input.dx || input.dy) {
    const d = Math.hypot(input.dx || 0, input.dy || 0);
    wx = (input.dx || 0) / d;
    wy = (input.dy || 0) / d;
  }
  const k = Math.min(1, TURN * dt);
  bat.vx += (wx * FLY - bat.vx) * k;
  bat.vy += (wy * FLY - bat.vy) * k;
  bat.x = clamp(bat.x + bat.vx * dt, BAT_R, run.view - BAT_R);
  bat.y = clamp(bat.y + bat.vy * dt, TOP, BOTTOM);
  if (Math.abs(bat.vx) > 0.05) bat.face = Math.sign(bat.vx);
  bat.blink = Math.max(0, bat.blink - dt);

  // Rings light what they pass; lit things fade over the level's "seen" time.
  for (const t of run.things) t.lit = Math.max(0, t.lit - dt);
  for (const ring of run.rings) {
    const r0 = ring.r;
    ring.r += ECHO_SPEED * dt;
    for (const t of run.things) {
      if (t.caught) continue;
      const d = Math.max(0, gap(t, ring.x, ring.y));
      if (d >= r0 - 0.001 && d < ring.r && d <= ECHO_RANGE) {
        t.lit = cfg.seen;
        t.litBy = ring.id;
      }
    }
  }
  run.rings = run.rings.filter((r) => r.r < ECHO_RANGE);

  // Moths flutter about, turn at the edges and keep off the branches.
  for (const t of [...run.things]) {
    if (t.type !== "moth") continue;
    if (t.caught) {
      t.back -= dt;
      if (t.back <= 0) {
        run.things.splice(run.things.indexOf(t), 1);
        spawnMoth(run);
      }
      continue;
    }
    t.flap += dt * 14;
    t.turn = clamp(t.turn + (rand() - 0.5) * 8 * dt, -2.2, 2.2);
    t.ang += t.turn * dt;
    const nx = t.x + Math.cos(t.ang) * cfg.mothSpeed * dt, ny = t.y + Math.sin(t.ang) * cfg.mothSpeed * dt;
    if (nx < run.view * 0.05 || nx > run.view * 0.95) t.ang = Math.PI - t.ang;
    else if (ny < 0.1 || ny > 0.88) t.ang = -t.ang;
    else if (run.things.some((b) => b.type === "branch" && nearOnBranch(nx, ny, b).d < 0.1)) t.ang += Math.PI;
    else { t.x = nx; t.y = ny; }
  }

  // The owl glides across now and then (Hard).
  if (run.time >= run.nextOwl) {
    const dir = rand() < 0.5 ? 1 : -1;
    const y = 0.2 + rand() * 0.55;
    run.things.push({ type: "owl", id: ++run.id, x: dir > 0 ? -0.12 : run.view + 0.12, y, base: y, dir, phase: rand() * 6, lit: 0, litBy: -1, hit: false });
    run.nextOwl = run.time + cfg.owlEvery * (0.8 + rand() * 0.4);
  }
  for (const t of [...run.things]) {
    if (t.type !== "owl") continue;
    t.x += t.dir * OWL_SPEED * dt;
    t.phase += dt * 1.4;
    t.y = t.base + Math.sin(t.phase) * 0.05;
    if ((t.dir > 0 && t.x > run.view + 0.15) || (t.dir < 0 && t.x < -0.15)) run.things.splice(run.things.indexOf(t), 1);
  }

  // Catches: a streak builds while the moths come from the same echo.
  for (const t of run.things) {
    if (t.type !== "moth" || t.caught || Math.hypot(t.x - bat.x, t.y - bat.y) > BAT_R + MOTH_R) continue;
    t.caught = true;
    t.back = MOTH_BACK;
    const from = t.lit > 0 ? t.litBy : -1;
    run.streak = from >= 0 && from === run.streakEcho ? Math.min(MAX_STREAK, run.streak + 1) : 1;
    run.streakEcho = from;
    run.bestStreak = Math.max(run.bestStreak, run.streak);
    const points = MOTH_POINTS * run.streak;
    run.points += points;
    run.moths++;
    events.push({ type: "moth", points, streak: run.streak, x: t.x, y: t.y });
  }

  // Bumps: a branch or the owl costs a life; the bat is pushed back and blinks for a moment.
  if (bat.blink <= 0) {
    for (const t of run.things) {
      if ((t.type !== "branch" && t.type !== "owl") || gap(t, bat.x, bat.y) > BAT_R * (t.type === "owl" ? 0.8 : 1)) continue;
      const near = t.type === "branch" ? nearOnBranch(bat.x, bat.y, t) : { nx: t.x, ny: t.y };
      const ax = bat.x - near.nx, ay = bat.y - near.ny, d = Math.hypot(ax, ay) || 1;
      bat.vx = (ax / d) * FLY * 0.9;
      bat.vy = (ay / d) * FLY * 0.9;
      bat.blink = BLINK;
      t.lit = cfg.seen;
      run.lives--;
      run.bumps++;
      run.streak = 0;
      run.streakEcho = -1;
      events.push({ type: "life", why: t.type, lives: run.lives, x: bat.x, y: bat.y });
      break;
    }
  }

  if (run.lives <= 0) {
    run.over = true;
    run.end = "lives";
  } else if (run.time >= cfg.night) {
    run.over = true;
    run.end = "dawn";
  }
  if (run.over) events.push({ type: "end", why: run.end });
  return events;
}

export function stars(points, level) {
  const [one, two, three] = SETTINGS[level].stars;
  return points >= three ? 3 : points >= two ? 2 : points >= one ? 1 : 0;
}

/* ---------- play simulation (star thresholds) ---------- */

// A steady young player: it echoes when it can see no moth, flies at the nearest lit one, and steers
// round the branches and owl it has seen. It reacts a little late and now and then misses a danger.
export function botInput(run, brain) {
  brain.wait -= 1 / 60;
  if (brain.wait > 0) return { tx: brain.tx, ty: brain.ty };
  brain.wait = 0.22 + brain.rand() * 0.12;
  const { bat } = run;
  let best = null, bd = Infinity;
  for (const t of run.things) {
    if (t.type !== "moth" || t.caught || t.lit <= 0) continue;
    const d = Math.hypot(t.x - bat.x, t.y - bat.y);
    if (d < bd) { bd = d; best = t; }
  }
  if (!best && (brain.roamUntil <= run.time || Math.hypot(brain.rx - bat.x, brain.ry - bat.y) < 0.05)) {
    brain.rx = run.view * (0.2 + brain.rand() * 0.6);
    brain.ry = 0.25 + brain.rand() * 0.5;
    brain.roamUntil = run.time + 2;
  }
  let tx = best ? best.x : brain.rx, ty = best ? best.y : brain.ry;
  // Dangers it knows about: look a little way ahead and turn aside if the way is blocked.
  const known = run.things.filter((t) => {
    // The owl's eye glows, so it can always be learnt. Branches are hidden in the dark: it knows one
    // only once an echo has shown it.
    if (t.type !== "branch" && t.type !== "owl") return false;
    if (t.type === "branch" && !(t.lit > 0) && !brain.seen.has(t.id)) return false;
    // Now and then it forgets one for a few seconds (a slip), as a child might.
    const s = brain.seen.get(t.id);
    if (!s || s.until <= run.time) brain.seen.set(t.id, { ok: brain.rand() >= brain.slip, until: run.time + 4 });
    return brain.seen.get(t.id).ok;
  });
  // The owl is judged where it will be in half a second.
  const gapSoon = (t, x, y) => (t.type === "owl" ? Math.hypot(t.x + t.dir * OWL_SPEED * 0.5 - x, t.y - y) - OWL_R : gap(t, x, y));
  const close = known.find((t) => gapSoon(t, bat.x, bat.y) < BAT_R + 0.04);
  if (close) {
    // Too close already: back straight away from it.
    const n = close.type === "branch" ? nearOnBranch(bat.x, bat.y, close) : { nx: close.x, ny: close.y };
    const ax = bat.x - n.nx, ay = bat.y - n.ny, ad = Math.hypot(ax, ay) || 1;
    tx = bat.x + (ax / ad) * 0.3;
    ty = bat.y + (ay / ad) * 0.3;
  } else {
    const dx = tx - bat.x, dy = ty - bat.y, d = Math.hypot(dx, dy) || 1;
    const blocked = (ux, uy) => known.some((t) => [0.07, 0.14, 0.21, 0.28, 0.35].some((s) => s < d + 0.05 && gapSoon(t, bat.x + ux * s, bat.y + uy * s) < BAT_R + 0.035));
    let ux = dx / d, uy = dy / d;
    if (blocked(ux, uy)) {
      const turns = [0.6, -0.6, 1.2, -1.2, 1.8, -1.8, Math.PI].map((a) => [ux * Math.cos(a) - uy * Math.sin(a), ux * Math.sin(a) + uy * Math.cos(a)]);
      [ux, uy] = turns.find((u) => !blocked(...u)) || [-ux, -uy];
      tx = bat.x + ux * 0.3;
      ty = bat.y + uy * 0.3;
    }
  }
  brain.tx = tx;
  brain.ty = ty;
  const echoNow = !best && run.cool <= 0 && !run.rings.some((r) => r.r < 0.45);
  return { tx, ty, echo: echoNow };
}

export function simulate(level, seed, { view = SIM_VIEW, slip = 0.12 } = {}) {
  const run = createRun(level, { seed, view });
  const brain = { rand: seeded(seed * 7919 + 13), wait: 0, tx: run.bat.x, ty: run.bat.y, rx: run.bat.x, ry: 0.5, roamUntil: 0, slip, seen: new Map() };
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
