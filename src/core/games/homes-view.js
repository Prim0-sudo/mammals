// Home Before Dark (education, DESIGN.md section 2): a path network at dusk. Walkers come in at the
// start; switches where the path splits send them up or down; each must reach its own home before dark.
// Landscape: the tree runs left to right with the homes down the right. Portrait (phones): top to bottom,
// with five or seven homes in two staggered rows along the bottom.
import { TopicGameView, esc } from "../topic-games-kit.js";
import { HOMES, SETTINGS, buildRound, switchesOf, leavesOf, nameOf, rightLine, wrongLine, enterLine, waitLine, START_LINE, DARK_LINE } from "../../topics/games/homes.js";
import { roundStars } from "../../topics/topic-games.js";

const NS = "http://www.w3.org/2000/svg";
const word = (n) => ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"][n] || String(n);
const LEVEL_ART = { easy: "warren", medium: "sett", hard: "stable" };
// The homes are drawn empty (owner, 24 November 2026): the word pictures show the animal inside, which
// gave the answer away. The word pictures keep their animals, because there they teach whose home it is.
const homeArt = (id) => `assets/topics/mammals/games/homes/${id}.webp`;
const LOCK = 30; // px either side of a switch where a walker locks it
const list = (items) => (items.length > 1 ? `${items.slice(0, -1).join(", ")} or ${items.at(-1)}` : items[0]);
const svgEl = (tag, attrs = {}) => {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
};

export class View extends TopicGameView {
  constructor(game, root, meta) {
    super(game, root, meta);
    this.levels();
  }
  levelArt(level) {
    return homeArt(LEVEL_ART[level]);
  }
  // A home is drawn empty; anything else (an animal) is its word picture.
  art(id) {
    return HOMES[id] ? homeArt(id) : super.art(id);
  }
  levelNote(level) {
    const s = SETTINGS[level];
    const pace = s.atOnce === 1 ? "one at a time" : `${word(s.atOnce)} at once`;
    return `${word(s.homes)[0].toUpperCase() + word(s.homes).slice(1)} homes, ${word(s.walkers)} animals, ${pace}.${s.farm ? " Farm homes too." : ""}`;
  }
  onReset() {
    this.observer?.disconnect();
    this.observer = null;
    this.s = null;
  }

  play() {
    this.setStage("play");
    const cfg = (this.cfg = SETTINGS[this.level]);
    this.round = buildRound(this.level);
    this.s = { slips: 0, homeCount: 0, missed: 0, finished: false, queue: [...this.round.walkers], walkers: [], gate: true, total: this.round.walkers.length };
    this.root.innerHTML = `<div class="ig-play hb-play"><div class="ig-dock hb-dock"><p class="hb-status" role="status" aria-live="polite"></p><div class="hb-hud"><span class="hb-count" aria-live="off"></span><span class="hb-dusk" role="img" aria-label="Time until dark"><span class="hb-dusk__icon" aria-hidden="true"></span><span class="hb-dusk__bar"><i></i></span></span></div></div><div class="ig-stage hb-stage"><div class="hb-night" aria-hidden="true"></div><svg class="hb-map" role="group" aria-label="Paths and homes"></svg></div></div>`;
    this.stageEl = this.root.querySelector(".hb-stage");
    this.svg = this.root.querySelector(".hb-map");
    this.statusEl = this.root.querySelector(".hb-status");
    this.night = this.root.querySelector(".hb-night");
    this.duskBar = this.root.querySelector(".hb-dusk__bar i");
    this.buildNodes();
    this.buildSvg();
    this.layout();
    this.observer = new ResizeObserver(() => this.layout());
    this.observer.observe(this.stageEl);
    this.updateCount();
    this.say(START_LINE);
    this.game.audio.speak(START_LINE);
    this.startDusk();
    if (!this.reduced) this.fromTo(this.svg.querySelectorAll(".hb-home"), { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" }, { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.06, ease: "back.out(1.7)" });
    this.after(this.reduced ? 300 : 900, () => this.pump());
    this.switches[0].el.focus({ preventScroll: true });
  }

  /* ---- The network ---- */
  buildNodes() {
    const nodes = [];
    const add = (shape, parent, depth) => {
      const n = { id: nodes.length, shape, parent, depth, kids: [], leaf: shape.kids ? null : shape.leaf };
      nodes.push(n);
      if (shape.kids) n.kids = shape.kids.map((k) => add(k, n, depth + 1));
      return n;
    };
    this.rootNode = add(this.round.tree, null, 0);
    this.nodes = nodes;
    this.start = { id: "start", pos: [0, 0] };
    const byShape = new Map(nodes.map((n) => [n.shape, n]));
    this.switches = switchesOf(this.round.tree).map((shape, i) => {
      const n = byShape.get(shape);
      n.sw = { index: i, side: 0, locks: new Set(), node: n, deg: 0 };
      return n.sw;
    });
    this.leaves = nodes.filter((n) => n.leaf !== null).sort((a, b) => a.leaf - b.leaf);
    this.maxDepth = Math.max(...nodes.filter((n) => n.kids.length).map((n) => n.depth));
  }
  buildSvg() {
    const svg = this.svg;
    svg.replaceChildren();
    this.gSky = svg.appendChild(svgEl("g", { class: "hb-sky", "aria-hidden": "true" }));
    const gCase = svg.appendChild(svgEl("g", { class: "hb-casing", "aria-hidden": "true" }));
    const gEdge = svg.appendChild(svgEl("g", { class: "hb-edges", "aria-hidden": "true" }));
    const gHome = svg.appendChild(svgEl("g", { class: "hb-homes" }));
    this.gStart = svg.appendChild(svgEl("g", { class: "hb-start", "aria-hidden": "true" }));
    // Walkers draw over the switches (a switch is locked while one is on it); taps pass through them.
    const gSw = svg.appendChild(svgEl("g", { class: "hb-switches" }));
    this.gWalk = svg.appendChild(svgEl("g", { class: "hb-walkers", "aria-hidden": "true" }));
    // Each node (but the root's start) has one path in from its parent.
    for (const n of this.nodes) {
      n.casing = gCase.appendChild(svgEl("path", { class: "hb-edge-case" }));
      n.edge = gEdge.appendChild(svgEl("path", { class: "hb-edge" }));
    }
    this.gStart.innerHTML = '<circle class="hb-start__pad" r="22"/><text class="hb-start__label" text-anchor="middle">Start</text>';
    this.leaves.forEach((n) => {
      const id = this.round.homes[n.leaf];
      const g = gHome.appendChild(svgEl("g", { class: "hb-home", "data-home": id, role: "button", tabindex: "-1", "aria-label": `${nameOf(id)}: hear the name` }));
      // Tap a home to hear its name.
      this.on(g, "click", () => this.game.audio.speak(nameOf(id)));
      g.innerHTML = `<circle class="hb-home__glow" r="10"/><image class="hb-home__art" href="${esc(this.art(id))}" preserveAspectRatio="xMidYMid meet"/><text class="hb-home__label">${esc(nameOf(id))}</text><g class="hb-home__tally"></g>`;
      n.home = id;
      n.g = g;
    });
    this.switches.forEach((sw) => {
      const g = gSw.appendChild(svgEl("g", { class: "hb-switch", tabindex: "0", role: "button", "data-switch": sw.index }));
      g.innerHTML = '<circle class="hb-switch__focus" r="31"/><circle class="hb-switch__ring" r="23"/><g class="hb-switch__arrow"><path d="M-10,0 L9,0 M2,-7 L10,0 L2,7"/></g>';
      sw.el = g;
      // Plain facts for scripted play checks: which node this is and where each side leads.
      g.dataset.node = sw.node.id;
      g.dataset.kids = sw.node.kids.map((k) => k.id).join(" ");
      sw.node.kids.forEach((k, side) => (g.dataset[`homes${side}`] = leavesOf(k.shape).map((i) => this.round.homes[i]).join(" ")));
      sw.arrow = g.querySelector(".hb-switch__arrow");
      this.on(g, "click", () => this.flip(sw));
      this.on(g, "keydown", (e) => this.switchKey(e, sw));
    });
    // Sky: one star slot per walker, plus faint stars that come out as it gets dark.
    this.slots = this.round.walkers.map(() => this.gSky.appendChild(svgEl("path", { class: "hb-slot", d: starPath(0, 0, 11) })));
    this.ambient = this.gSky.appendChild(svgEl("g", { class: "hb-ambient" }));
  }

  // Positions in px (the viewBox is the stage's own size), recomputed on every resize.
  layout() {
    const box = this.stageEl.getBoundingClientRect();
    const W = Math.round(box.width), H = Math.round(box.height);
    if (!W || !H) return;
    this.svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const n = this.leaves.length;
    const portrait = (this.portrait = W / H < 0.95);
    const stagger = portrait && n >= 5;
    const phone = W < 520;
    this.font = phone ? 15 : 16;
    // P(a, c): a runs from the start to the homes, c across them.
    let P, hs, leafC, entry;
    if (!portrait) {
      const top = 10, bottom = 10, pad = 14;
      const spacing = (H - top - bottom) / n;
      hs = Math.max(40, Math.min(n === 3 ? 150 : 120, spacing * 0.9, W * 0.13));
      const labelW = Math.max(...this.round.homes.map((h) => nameOf(h).length)) * this.font * 0.58 + 8;
      const hx = W - pad - labelW - 6 - hs / 2;
      leafC = (i) => top + (i + 0.5) * spacing;
      entry = (i) => [hx - hs * 0.42, leafC(i)];
      P = (a, c) => [a, c];
      this.homeLayout = (i) => ({ cx: hx, cy: leafC(i), label: [hx + hs / 2 + 6, leafC(i)], anchor: "start" });
      this.startPos = [pad + 26, 0];
      this.dropTo = () => null;
      this.alongEnd = hx - hs * 0.42;
    } else {
      const pad = 8, sky = 34, bottom = 6;
      const spacing = (W - 2 * pad) / n;
      hs = stagger ? Math.max(48, Math.min(92, spacing * 1.5)) : Math.max(48, Math.min(120, spacing * 0.86));
      const rowH = hs + this.font + 10;
      const lowY = H - bottom - rowH + hs / 2; // centre of the pictures in the bottom row
      const rowY = (i) => (stagger && i % 2 ? lowY - rowH : lowY);
      leafC = (i) => pad + (i + 0.5) * spacing;
      entry = (i) => [leafC(i), rowY(i) - hs * 0.42];
      P = (a, c) => [c, a];
      this.homeLayout = (i) => ({ cx: leafC(i), cy: rowY(i), label: [leafC(i), rowY(i) + hs / 2 + this.font * 0.9], anchor: "middle" });
      this.startPos = [0, sky + Math.min(60, W * 0.13)];
      // Paths to the bottom row drop straight down between the homes of the upper row.
      this.dropTo = stagger ? (i) => (i % 2 ? null : lowY - rowH - hs / 2 - 6) : () => null;
      this.alongEnd = (stagger ? lowY - rowH : lowY) - hs * 0.42;
    }
    this.hs = hs;
    this.ws = Math.max(44, Math.min(phone ? 64 : 96, Math.min(W, H) * (portrait ? 0.15 : 0.16)));
    // Across: a leaf's slot, an inner node's the mean of its two children.
    const across = (node) => (node.leaf !== null ? leafC(node.leaf) : (across(node.kids[0]) + across(node.kids[1])) / 2);
    const startA = portrait ? this.startPos[1] : this.startPos[0];
    const steps = this.maxDepth + 2;
    for (const node of this.nodes) {
      if (node.leaf !== null) node.pos = P(...(portrait ? [entry(node.leaf)[1], entry(node.leaf)[0]] : entry(node.leaf)));
      else node.pos = P(startA + ((node.depth + 1) * (this.alongEnd - startA)) / steps, across(node));
    }
    this.start.pos = P(startA, across(this.rootNode));
    this.speed = (this.alongEnd - startA) / this.cfg.cross;
    // Paths: a straight run from the start to the first switch, then smooth S-bends.
    for (const node of this.nodes) {
      const from = node.parent ? node.parent.pos : this.start.pos;
      const drop = node.leaf !== null ? this.dropTo(node.leaf) : null;
      const d = !node.parent
        ? `M${r(from[0])},${r(from[1])} L${r(node.pos[0])},${r(node.pos[1])}`
        : drop === null ? bend(from, node.pos, portrait) : `${bend(from, [node.pos[0], drop], portrait)} L${r(node.pos[0])},${r(node.pos[1])}`;
      node.d = d;
      node.edge.setAttribute("d", d);
      node.casing.setAttribute("d", d);
      node.len = node.edge.getTotalLength();
    }
    this.gStart.setAttribute("transform", `translate(${r(this.start.pos[0])},${r(this.start.pos[1])})`);
    const label = this.gStart.querySelector("text");
    label.setAttribute("x", portrait ? 30 : 0);
    label.setAttribute("y", portrait ? 5 : 44);
    label.setAttribute("text-anchor", portrait ? "start" : "middle");
    label.setAttribute("font-size", this.font);
    this.leaves.forEach((node) => {
      const L = this.homeLayout(node.leaf);
      node.center = [L.cx, L.cy];
      const img = node.g.querySelector("image");
      for (const [k, v] of Object.entries({ x: L.cx - hs / 2, y: L.cy - hs / 2, width: hs, height: hs })) img.setAttribute(k, r(v));
      const glow = node.g.querySelector(".hb-home__glow");
      glow.setAttribute("cx", r(L.cx));
      glow.setAttribute("cy", r(L.cy));
      glow.setAttribute("r", r(hs * 0.52));
      const t = node.g.querySelector("text");
      t.setAttribute("x", r(L.label[0]));
      t.setAttribute("y", r(L.label[1]));
      t.setAttribute("text-anchor", L.anchor);
      t.setAttribute("dominant-baseline", "middle");
      t.setAttribute("font-size", this.font);
      this.drawTally(node);
    });
    this.switches.forEach((sw) => {
      sw.el.setAttribute("transform", `translate(${r(sw.node.pos[0])},${r(sw.node.pos[1])})`);
      this.aimSwitch(sw, true);
    });
    // Sky stars: a row along the top left (landscape) or across the top (portrait).
    const gap = Math.min(30, (W - 44) / this.slots.length);
    this.slots.forEach((el, i) => el.setAttribute("transform", `translate(${r(24 + i * gap)},${portrait ? 18 : 24})`));
    if (!this.ambient.childElementCount) {
      let seed = 7;
      const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
      for (let i = 0; i < 26; i++) this.ambient.appendChild(svgEl("circle", { "data-x": rnd(), "data-y": rnd(), r: (0.9 + rnd() * 1.3).toFixed(1) }));
    }
    for (const c of this.ambient.children) {
      c.setAttribute("cx", r(+c.dataset.x * W));
      c.setAttribute("cy", r(+c.dataset.y * H * (portrait ? 0.35 : 0.9)));
    }
    this.lightEdges();
    for (const w of this.s.walkers) this.replace(w);
  }

  /* ---- Switches ---- */
  aimSwitch(sw, instant = false) {
    // A clear tilt towards the chosen branch: up or down (left or right on phones).
    const tilt = sw.side ? 38 : -38;
    const target = this.portrait ? 90 - tilt : tilt;
    const set = () => sw.arrow.setAttribute("transform", `rotate(${sw.deg.toFixed(1)})`);
    sw.spin?.kill();
    this.tweens.delete(sw.spin);
    if (instant || this.reduced) {
      sw.deg = target;
      set();
    } else sw.spin = this.to(sw, { deg: target, duration: 0.25, ease: "back.out(2)", onUpdate: set });
    this.labelSwitch(sw);
  }
  labelSwitch(sw) {
    sw.el.dataset.side = sw.side;
    const homes = leavesOf(sw.node.shape.kids[sw.side]).map((i) => nameOf(this.round.homes[i]));
    sw.el.setAttribute("aria-label", `Switch ${sw.index + 1} of ${this.switches.length}, points to ${list(homes)}${sw.locks.size ? ", locked while an animal crosses" : ""}`);
  }
  lightEdges() {
    for (const node of this.nodes) {
      const on = !node.parent || node.parent.kids[node.parent.sw.side] === node;
      node.edge.classList.toggle("is-on", on);
      node.casing.classList.toggle("is-on", on);
    }
  }
  flip(sw) {
    if (!this.s || this.s.finished) return;
    if (sw.locks.size) {
      const w = [...sw.locks][0];
      this.say(waitLine(w.id));
      this.game.audio.speak(waitLine(w.id));
      this.game.audio.tone(220, 0.1);
      this.nudge(sw.el.querySelector(".hb-switch__ring"));
      return;
    }
    sw.side ^= 1;
    this.game.audio.tone(sw.side ? 560 : 700, 0.08);
    this.aimSwitch(sw);
    this.lightEdges();
  }
  switchKey(e, sw) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!e.repeat) this.flip(sw);
      return;
    }
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = this.switches[(sw.index + step + this.switches.length) % this.switches.length];
    next.el.focus({ preventScroll: true });
  }
  lock(sw, w) {
    sw.locks.add(w);
    sw.el.classList.add("is-locked");
    sw.el.setAttribute("aria-disabled", "true");
    this.labelSwitch(sw);
  }
  unlock(sw, w) {
    if (!sw.locks.delete(w) || sw.locks.size) return;
    sw.el.classList.remove("is-locked");
    sw.el.removeAttribute("aria-disabled");
    this.labelSwitch(sw);
  }

  /* ---- Walkers ---- */
  pump() {
    const s = this.s;
    if (!s || s.finished || !s.queue.length || !s.gate) return;
    const out = s.walkers.filter((w) => w.state !== "home").length;
    if (out >= this.cfg.atOnce) return;
    // Someone is still standing at the start (back for another try): wait until it has set off.
    if (!this.startClear()) return this.after(400, () => this.pump());
    this.enter(s.queue.shift());
    if (this.cfg.stagger) {
      s.gate = false;
      this.after(this.cfg.stagger * 1000, () => {
        if (!this.s) return;
        this.s.gate = true;
        this.pump();
      });
    }
  }
  enter(data) {
    const ws = this.ws;
    const w = { ...data, state: "waiting", route: [], seg: null };
    const g = (w.g = this.gWalk.appendChild(svgEl("g", { class: "hb-walker", "data-walker": w.id, "data-home": w.home })));
    const bubble = this.cfg.bubble
      ? `<g class="hb-bubble" transform="translate(${r(ws * 0.62)},${r(-ws * 1.02)})"><circle class="hb-bubble__dot" cx="${r(-ws * 0.3)}" cy="${r(ws * 0.42)}" r="3"/><circle class="hb-bubble__dot" cx="${r(-ws * 0.18)}" cy="${r(ws * 0.28)}" r="4.5"/><circle class="hb-bubble__cloud" r="${r(ws * 0.36)}"/><image href="${esc(this.art(w.home))}" x="${r(-ws * 0.3)}" y="${r(-ws * 0.3)}" width="${r(ws * 0.6)}" height="${r(ws * 0.6)}"/></g>`
      : "";
    g.innerHTML = `<ellipse class="hb-walker__shadow" rx="${r(ws * 0.34)}" ry="${r(ws * 0.09)}"/><g class="hb-walker__body"><image href="${esc(this.art(w.id))}" x="${r(-ws / 2)}" y="${r(-ws * 0.86)}" width="${r(ws)}" height="${r(ws)}"/></g>${bubble}<text class="hb-walker__label" y="${r(this.font + 6)}" text-anchor="middle" font-size="${this.font}">${esc(nameOf(w.id))}</text>`;
    w.body = g.querySelector(".hb-walker__body");
    this.s.walkers.push(w);
    this.place(w, this.start.pos);
    this.say(enterLine(w.id));
    this.game.audio.speak(enterLine(w.id));
    if (this.reduced) this.fromTo(g, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
    else this.fromTo(g, { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 100%" }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2)" });
    this.after(this.cfg.atOnce === 1 ? 1500 : 1100, () => this.go(w));
  }
  // True when no other walker stands at or near the start.
  startClear(me = null) {
    const [sx, sy] = this.start.pos;
    return !this.s.walkers.some((w) => w !== me && w.state !== "home" && w.g.isConnected &&
      Math.hypot(this.gsap.getProperty(w.g, "x") - sx, this.gsap.getProperty(w.g, "y") - sy) < this.ws * 0.9);
  }
  place(w, [x, y]) {
    this.gsap.set(w.g, { x, y });
  }
  // Off from the start (again): follow the switches.
  go(w) {
    if (!this.s || this.s.finished || w.state === "home") return;
    // Two walkers never set off on top of each other.
    const ahead = this.s.walkers.find((o) => o !== w && o.state === "walking" && o.seg?.node === this.rootNode && !o.seg.done && (this.reduced ? o.seg.at : o.tween ? o.tween.progress() : 1) * o.seg.node.len < this.ws);
    if (ahead) return this.after(400, () => this.go(w));
    w.state = "walking";
    w.route = [this.rootNode];
    this.walkBob(w, true);
    this.move(w, this.rootNode, 0, 1);
  }
  walkBob(w, on) {
    if (w.bob) {
      w.bob.kill();
      this.tweens.delete(w.bob);
      w.bob = null;
      this.gsap.set(w.body, { y: 0 });
    }
    if (on && !this.reduced) w.bob = this.to(w.body, { y: -4, duration: 0.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
  }
  // Along one edge from fraction a to b (b < a walks back). Constant speed; MotionPath on the real path.
  move(w, node, a, b) {
    const dur = (Math.abs(b - a) * node.len) / this.speed;
    const token = (w.moveToken = (w.moveToken || 0) + 1);
    w.seg = { node, a, b, at: a, done: false };
    w.g.dataset.node = node.id;
    w.g.dataset.dir = b > a ? "on" : "back";
    if (this.reduced) {
      // Hops with a short fade instead of a glide: just past the switch it stood on, halfway, then the end.
      // Each hop waits as long as the walk would take, so a switch is held no longer than with motion.
      const fwd = b > a;
      const stops = fwd ? [Math.min(0.3, (2 * LOCK) / node.len), 0.5, 1].filter((f) => f > a) : [0.5, 0].filter((f) => f < a);
      if (!stops.length || stops.at(-1) !== b) stops.push(b);
      const hop = (i) => {
        const f = stops[i];
        this.after(Math.max(150, ((Math.abs(f - w.seg.at) * node.len) / this.speed) * 1000), () => {
          if (!this.s || w.moveToken !== token || this.s.finished) return;
          w.seg.at = f;
          this.placeOn(w, node, f);
          this.fromTo(w.g, { autoAlpha: 0.4 }, { autoAlpha: 1, duration: 0.2 });
          // Past the switch it came through: free it for the next animal.
          if (fwd && i === 0 && node.parent?.sw) this.unlock(node.parent.sw, w);
          if (i < stops.length - 1) return hop(i + 1);
          w.seg.done = true;
          this.reached(w, node, b);
        });
      };
      hop(0);
      return;
    }
    w.tween = this.to(w.g, {
      motionPath: { path: node.d, start: a, end: b },
      duration: Math.max(0.05, dur), ease: "none",
      onUpdate: () => this.tick(w, node),
      onComplete: () => {
        if (w.moveToken !== token) return;
        w.seg.done = true;
        this.reached(w, node, b);
      },
    });
  }
  // Locks: a forward walker locks the switch ahead as it comes within LOCK px, and frees it LOCK px past.
  tick(w, node) {
    if (w.state !== "walking" || !w.seg || !w.tween) return;
    const at = (w.seg.a + (w.seg.b - w.seg.a) * w.tween.progress()) * node.len;
    if (node.sw && !w.next && node.len - at < LOCK) {
      this.lock(node.sw, w);
      w.next = node.kids[node.sw.side];
    }
    const prev = node.parent?.sw;
    if (prev && prev.locks.has(w) && at > LOCK) this.unlock(prev, w);
  }
  reached(w, node, b) {
    if (!this.s || this.s.finished) return;
    if (w.state === "returning") {
      // Back up the route the way it came; no switches needed.
      w.route.pop();
      const up = w.route.at(-1);
      if (up) return this.move(w, up, 1, 0);
      w.state = "waiting";
      this.walkBob(w, false);
      this.after(900, () => this.go(w));
      return;
    }
    if (node.leaf !== null) return this.arrive(w, node);
    // At a switch: take the side it was locked to (reduced motion reads it now and locks while here).
    const sw = node.sw;
    if (this.reduced) {
      for (const other of this.switches) this.unlock(other, w);
      this.lock(sw, w);
      w.next = node.kids[sw.side];
    }
    const next = w.next || node.kids[sw.side];
    w.next = null;
    w.route.push(next);
    this.move(w, next, 0, 1);
  }
  arrive(w, leaf) {
    for (const sw of this.switches) this.unlock(sw, w);
    this.walkBob(w, false);
    const s = this.s;
    if (leaf.home === w.home) {
      w.state = "home";
      s.homeCount++;
      this.say(rightLine(w.home));
      this.speakLine(rightLine(w.home));
      this.game.audio.tone(880, 0.14);
      this.lightStar(s.homeCount - 1);
      leaf.tally = (leaf.tally || 0) + 1;
      this.drawTally(leaf);
      this.glow(leaf);
      const done = () => w.g.remove();
      if (this.reduced) this.to(w.g, { autoAlpha: 0, duration: 0.2, onComplete: done });
      else this.to(w.g, { x: leaf.center[0], y: leaf.center[1] + this.hs * 0.25, scale: 0.3, autoAlpha: 0, duration: 0.55, ease: "power2.in", onComplete: done });
      this.updateCount();
      if (s.homeCount + s.missed === s.total) return this.after(900, () => this.finish());
      this.after(this.cfg.atOnce === 1 ? 500 : 200, () => this.pump());
      return;
    }
    // Wrong home: a slip; the walker sniffs, says whose home this is, and walks back to try again.
    s.slips++;
    w.state = "sniffing";
    this.say(wrongLine(w.id, leaf.home));
    this.speakLine(wrongLine(w.id, leaf.home));
    this.game.audio.tone(240, 0.16);
    if (!this.reduced) {
      this.to(w.body, { rotation: 9, transformOrigin: "50% 100%", duration: 0.14, yoyo: true, repeat: 5, ease: "sine.inOut" });
      this.nudge(leaf.g.querySelector("image"));
    }
    this.after(this.reduced ? 1600 : 2000, () => {
      if (!this.s || this.s.finished) return;
      w.state = "returning";
      this.walkBob(w, true);
      this.move(w, leaf, 1, 0);
    });
  }
  // After a resize, put each walker back on its path at the same fraction.
  replace(w) {
    if (w.state === "home" || !w.g.isConnected) return;
    const seg = w.seg;
    if (!seg) return this.place(w, this.start.pos);
    const { node, a, b } = seg;
    if (this.reduced) return this.placeOn(w, node, seg.done ? b : seg.at);
    if (!w.tween || w.tween.progress() >= 1 || !["walking", "returning"].includes(w.state)) return this.placeOn(w, node, b);
    const now = a + (b - a) * w.tween.progress();
    w.tween.kill();
    this.tweens.delete(w.tween);
    this.move(w, node, now, b);
  }
  placeOn(w, node, f) {
    const p = node.edge.getPointAtLength(Math.max(0, Math.min(1, f)) * node.len);
    this.place(w, [p.x, p.y]);
  }

  /* ---- Dusk ---- */
  startDusk() {
    const sky = { t: 0 };
    let step = -1;
    const draw = () => {
      // Reduced motion: the sky changes in six steps.
      const t = this.reduced ? Math.floor(sky.t * 6) / 6 : sky.t;
      if (this.reduced && t === step) return;
      step = t;
      this.night.style.opacity = (t * 0.85).toFixed(3);
      this.ambient.style.opacity = Math.max(0, (t - 0.25) / 0.75).toFixed(3);
      this.duskBar.style.transform = `scaleX(${(1 - sky.t).toFixed(3)})`;
      this.duskBar.parentElement.parentElement.classList.toggle("is-low", sky.t > 0.8);
    };
    draw();
    this.dusk = this.to(sky, { t: 1, duration: this.cfg.dusk, ease: "none", onUpdate: draw, onComplete: () => this.nightfall() });
  }
  nightfall() {
    const s = this.s;
    if (!s || s.finished) return;
    s.finished = true;
    const out = s.walkers.filter((w) => w.state !== "home");
    s.missed = out.length + s.queue.length;
    s.queue = [];
    this.say(DARK_LINE);
    this.game.audio.speak(DARK_LINE);
    for (const sw of this.switches) for (const w of [...sw.locks]) this.unlock(sw, w);
    out.forEach((w) => {
      w.moveToken++;
      if (w.tween) { w.tween.kill(); this.tweens.delete(w.tween); }
      this.walkBob(w, false);
      const leaf = this.leaves.find((l) => l.home === w.home);
      if (this.reduced) this.to(w.g, { autoAlpha: 0, duration: 0.25 });
      else this.to(w.g, { x: leaf.center[0], y: leaf.center[1], scale: 0.3, autoAlpha: 0, duration: 1.1, ease: "power1.inOut" });
    });
    this.updateCount();
    this.after(1600, () => this.results());
  }
  finish() {
    const s = this.s;
    if (!s || s.finished) return;
    s.finished = true;
    this.dusk?.pause();
    this.results();
  }
  results() {
    const s = this.s;
    const stars = roundStars(s.slips + s.missed, this.cfg.two);
    const isBest = this.game.saveGameBest("homes", this.level, stars);
    const slipLine = s.slips ? `${s.slips === 1 ? "One wrong home" : `${capitalWord(s.slips)} wrong homes`} along the way.` : "No wrong homes at all. Expert path keeper!";
    this.showResults({
      title: s.missed ? "Night has fallen" : "Everyone is home!",
      stars,
      lines: [`${s.homeCount} of ${s.total} animals got home before dark.`, slipLine, ...(s.missed ? [`${s.missed === 1 ? "One animal was" : `${capitalWord(s.missed)} animals were`} still out at dark.`] : [])],
      best: isBest,
      bestLine: isBest ? "New best for this level!" : "",
    });
  }

  /* ---- Small pieces ---- */
  say(text) {
    this.statusEl.textContent = text;
  }
  async speakLine(text) {
    this.game.audio.speak(text);
  }
  updateCount() {
    this.root.querySelector(".hb-count").textContent = `Home ${this.s.homeCount} of ${this.s.total}`;
  }
  lightStar(i) {
    const el = this.slots[i];
    if (!el) return;
    el.classList.add("is-lit");
    if (!this.reduced) this.fromTo(el, { scale: 2.2, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
  }
  glow(leaf) {
    const glow = leaf.g.querySelector(".hb-home__glow");
    if (this.reduced) return;
    this.fromTo(glow, { opacity: 0.9 }, { opacity: 0, duration: 0.9, ease: "power1.out" });
  }
  drawTally(leaf) {
    const g = leaf.g.querySelector(".hb-home__tally");
    const n = leaf.tally || 0;
    if (!n || !leaf.center) return g.replaceChildren();
    const x = leaf.center[0] + this.hs * 0.36, y = leaf.center[1] - this.hs * 0.38;
    g.innerHTML = `<circle cx="${r(x)}" cy="${r(y)}" r="12"/><text x="${r(x)}" y="${r(y + 1)}" text-anchor="middle" dominant-baseline="middle">${n}</text>`;
  }
  nudge(el) {
    if (!el || this.reduced) return;
    this.to(el, { x: "+=6", duration: 0.06, yoyo: true, repeat: 5, ease: "sine.inOut" });
  }
}

const r = (v) => Math.round(v * 10) / 10;
const capitalWord = (n) => { const w = word(n); return w[0].toUpperCase() + w.slice(1); };
// An S-bend between two points, flat where it leaves and where it arrives.
function bend([x1, y1], [x2, y2], portrait) {
  if (portrait) {
    const my = (y1 + y2) / 2;
    return `M${r(x1)},${r(y1)} C${r(x1)},${r(my)} ${r(x2)},${r(my)} ${r(x2)},${r(y2)}`;
  }
  const mx = (x1 + x2) / 2;
  return `M${r(x1)},${r(y1)} C${r(mx)},${r(y1)} ${r(mx)},${r(y2)} ${r(x2)},${r(y2)}`;
}
function starPath(cx, cy, R) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2, rad = i % 2 ? R * 0.45 : R;
    pts.push(`${r(cx + Math.cos(a) * rad)},${r(cy + Math.sin(a) * rad)}`);
  }
  return `M${pts.join(" L")} Z`;
}
