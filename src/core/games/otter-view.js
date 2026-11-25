// Otter Dive (arcade, the Home banner): a side-on river on a canvas driven by gsap.ticker. The otter
// dives for fish and comes up for air; the rules live in src/topics/games/otter.js (pure and seeded),
// and this view only reads input, steps the river and draws it. Word pictures stand in for the art.
import { TopicGameView, esc } from "../topic-games-kit.js";
import {
  SETTINGS, SURFACE, BED, TOP, DEEP, WHISKERS, LIVES, MAX_COMBO, FOODS, AIR, BOOST,
  createRun, step, stars, otterX,
} from "../../topics/games/otter.js";
import { loadSheet, sheetReady, cycleFrame, drawCell } from "./sprites.js";

const LEVEL_ART = { easy: "otter", medium: "dive", hard: "whiskers" };
const ASPECT = [0.78, 2.6]; // the river's shape: deeper than wide on a phone, wide on a desktop
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ready = (img) => !!(img && img.complete && img.naturalWidth);
// Each word picture has a wide clear margin (and the otter stands on a rock): draw only the animal.
// The otter stands on grass in its picture: this outline keeps the body and the curled tail, not the ground.
const OTTER_CUT = [[0, 0], [1, 0], [1, 0.61], [0.11, 0.61], [0.11, 0.72], [0, 0.72]];
const CROP = {
  otter: [0.02, 0.2, 0.94, 0.52],
  fish: [0.01, 0.24, 0.98, 0.52], // the whole fish, nose to tail
};

// The otter's swim frames (owner approved, 24 November 2026): straight, arched, straight, arched the
// other way. Anchored at the middle of the cell; a slower stroke while it floats at the surface.
const SWIM_FRAMES = { ms: 170, surface: 260, seq: [0, 1, 2, 3], at: [256, 256], size: 0.32 };

// The clear river (owner approved, Art 30a0f19; assets/topics/mammals/games/scenery/otter/). The strips
// loop with the scenery on their bottom edge (2048 x 512, so 4 wide): h is the strip's height in stage
// heights and speed the parallax against the river. The banks end at the water line; the riverbed's
// top sits just above BED. Sky, water, light rays and the surface stay in code, and the code drawings
// stand in while a picture loads.
const SCENE = "assets/topics/mammals/games/scenery/otter/";
const BANKS = [{ name: "far-bank", h: 0.31, speed: 0.15, sink: 0.005 }, { name: "near-bank", h: 0.22, speed: 0.4, sink: 0.008 }];
const BED_STRIP = { name: "riverbed", h: 0.35, top: 362 / 512, rise: 0.035, gravel: "#4c5444" };
const WEED = { size: 0.26, every: 0.48 }; // a strand of weed (roots at y = 481 of 512) every so far along the bed
// Pictures centred in a 512 square: side in stage heights.
const SIDE = { can: 0.11, bottle: 0.12, bag: 0.13, trout: 0.22, eel: 0.27, frog: 0.2, crayfish: 0.17 };
const FLOAT = { side: 0.1, water: 190 / 512 }; // the stick float, its red tip above the water line
// The snag picture runs from its base (bottom left) up to its tip (top right), in pixels of the square.
const SNAG = { base: [140, 478], tip: [436, 12] };
const CRAYFISH_FEET = 381 / 512; // where the crayfish's legs stand in its picture
// The empty holt (games/homes/holt.webp, 1024 square, no otter in it): side in stage heights, where
// its own water line and its door are in the picture, and how far in from the right edge it stands.
const HOLT = { side: 0.4, water: 0.71, door: [0.57, 0.55], inset: 0.16 };

const aWord = (name) => `${/^[aeiou]/.test(name) ? "An" : "A"} ${name}`;
// "23 fish, 2 eels and a crayfish": what the otter caught, fish first.
function caughtList(caught = {}) {
  const parts = Object.keys(FOODS).filter((k) => caught[k]).map((k) => {
    const n = caught[k], f = FOODS[k];
    return n > 1 ? `${n} ${f.plural}` : k === "fish" ? "one fish" : aWord(f.name).toLowerCase();
  });
  if (!parts.length) return "no fish";
  return parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
}

function loadImage(src) {
  const img = new Image();
  img.decoding = "async";
  if (src) img.src = src;
  return img;
}

export class View extends TopicGameView {
  constructor(game, root, meta) {
    super(game, root, meta);
    this.levels();
  }
  levelArt(level) {
    return this.art(LEVEL_ART[level]) || this.art("otter");
  }
  levelNote(level) {
    const s = SETTINGS[level];
    const river = s.river.charAt(0).toUpperCase() + s.river.slice(1);
    return `${river} river, a ${s.breath}-second breath${s.muddy ? ", muddy water and a fishing line" : ""}. ${s.time} seconds.`;
  }
  bestText(points) {
    return `Best: ${points} points`;
  }
  onReset() {
    this.stopLoop();
    this.roundEvents?.abort();
    this.observer?.disconnect();
    this.ctx = null;
  }
  onHold(paused) {
    if (paused) this.keys?.clear();
  }
  stopLoop() {
    if (this.tick) this.gsap.ticker.remove(this.tick);
    this.tick = null;
  }
  sayWord(id) {
    const name = this.item(id)?.name;
    if (name) this.game.audio.speak(name);
  }

  play() {
    this.setStage("play");
    this.cfg = SETTINGS[this.level];
    this.img = {
      otter: loadImage(this.art("otter")),
      fish: loadImage(this.art("fish")),
      holt: loadImage("assets/topics/mammals/games/homes/holt.webp"),
      swim: loadSheet("otter-swim"),
      banks: BANKS.map((b) => loadImage(`${SCENE}${b.name}.webp`)),
      bed: loadImage(`${SCENE}${BED_STRIP.name}.webp`),
      weeds: ["weed", "weed-2"].map((n) => loadImage(`${SCENE}${n}.webp`)),
      snag: loadImage(`${SCENE}snag.webp`),
      float: loadImage(`${SCENE}float.webp`),
      litter: { can: loadImage(`${SCENE}can.webp`), bottle: loadImage(`${SCENE}bottle.webp`), bag: loadImage(`${SCENE}bag.webp`) },
      foods: { trout: loadImage(`${SCENE}trout.webp`), eel: loadImage(`${SCENE}eel.webp`), frog: loadImage(`${SCENE}frog-swim.webp`), crayfish: loadImage(`${SCENE}crayfish.webp`) },
    };
    const muddy = this.cfg.muddy;
    this.root.innerHTML = `<div class="ig-play otter-play${muddy ? " is-muddy" : ""}">
      <div class="otter-bar">
        <div class="otter-hud">
          <span class="otter-chip otter-points"><b>0</b> points</span>
          <span class="otter-chip otter-combo" hidden></span>
          <span class="otter-chip otter-lives" role="img" aria-label="${LIVES} lives"></span>
          <span class="otter-chip otter-meter otter-air" role="meter" aria-label="Air" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><span class="otter-meter__label">Air</span><span class="otter-meter__bar"><i></i></span></span>
          <span class="otter-chip otter-meter otter-time" role="meter" aria-label="Time left" aria-valuemin="0" aria-valuemax="${this.cfg.time}" aria-valuenow="${this.cfg.time}"><span class="otter-meter__label">Time</span><span class="otter-meter__bar"><i></i></span></span>
        </div>
        <button class="button ig-main otter-start" type="button" data-ig-main>Start</button>
      </div>
      <div class="ig-stage otter-stage">
        <canvas class="otter-canvas" role="img" aria-label="A river. Move the otter up and down to catch fish, and come up to the surface for air."></canvas>
        <div class="otter-toasts" aria-hidden="true"></div>
        <div class="otter-intro-wrap"><section class="otter-intro" aria-labelledby="otterIntroTitle">
          <img class="otter-intro__art" src="${esc(this.art("otter"))}" alt="" draggable="false">
          <h2 id="otterIntroTitle">Dive for fish!</h2>
          <p>Otters are mammals, so they <strong>breathe air</strong>, even in the river. Dive for fish, then come up to the surface to fill your air.</p>
          ${muddy ? "<p>The water is muddy. Your <strong>whisker ring</strong> shows the fish close by.</p>" : ""}
          <p class="otter-intro__how">Swim with ↑ and ↓ (or W and S), the mouse, or drag on the river. Keep away from snags and litter${this.cfg.line ? ", and the fishing line" : ""}!</p>
        </section></div>
      </div>
      <p class="sr-only otter-status" role="status" aria-live="polite"></p>
    </div>`;
    this.stageEl = this.root.querySelector(".otter-stage");
    this.canvas = this.root.querySelector(".otter-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.toasts = this.root.querySelector(".otter-toasts");
    this.status = this.root.querySelector(".otter-status");
    this.main = this.root.querySelector("[data-ig-main]");
    this.hud = {
      points: this.root.querySelector(".otter-points b"),
      combo: this.root.querySelector(".otter-combo"),
      lives: this.root.querySelector(".otter-lives"),
      air: this.root.querySelector(".otter-air"),
      airBar: this.root.querySelector(".otter-air i"),
      time: this.root.querySelector(".otter-time"),
      timeBar: this.root.querySelector(".otter-time i"),
    };
    this.roundEvents = new AbortController();
    this.keys = new Set();
    this.aim = null;
    this.running = false;
    this.ending = false;
    this.bubbles = [];
    this.home = null;
    this.layout();
    this.run = createRun(this.level, { seed: (Date.now() ^ (Math.random() * 1e9)) >>> 0, view: this.view });
    this.observer = new ResizeObserver(() => this.layout());
    this.observer.observe(this.stageEl);
    this.bindInput();
    this.updateHud(true);
    this.main.onclick = () => this.start();
    this.tick = () => this.frame();
    this.gsap.ticker.add(this.tick);
    this.main.focus({ preventScroll: true });
  }

  /* ---------- size and input ---------- */
  // The canvas fills the stage; the river keeps its shape inside it (letterboxed), with more sky
  // above and more riverbed below on a tall phone instead of a stretched river.
  layout() {
    const box = this.stageEl.getBoundingClientRect();
    if (!box.width || !box.height || !this.ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.W = box.width;
    this.H = box.height;
    this.canvas.width = Math.round(box.width * dpr);
    this.canvas.height = Math.round(box.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const aspect = clamp(this.W / this.H, ASPECT[0], ASPECT[1]);
    this.gh = Math.min(this.H, this.W / aspect);
    this.gw = this.gh * aspect;
    this.gx = (this.W - this.gw) / 2;
    this.gy = (this.H - this.gh) / 2;
    this.view = aspect;
    if (this.run) this.run.view = aspect;
    this.draw();
  }
  px(x) {
    return this.gx + x * this.gh;
  }
  py(y) {
    return this.gy + y * this.gh;
  }
  bindInput() {
    const opts = { signal: this.roundEvents.signal };
    const aim = (e) => {
      const box = this.canvas.getBoundingClientRect();
      this.aim = clamp((e.clientY - box.top - this.gy) / this.gh, TOP, DEEP);
    };
    this.canvas.addEventListener("pointerdown", (e) => {
      if (this.isHeld()) return;
      aim(e);
      if (e.pointerType !== "mouse") this.canvas.setPointerCapture?.(e.pointerId);
      if (!this.running && !this.ending) this.start();
    }, opts);
    this.canvas.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse" || e.buttons) aim(e); }, opts);
    const keyOf = (e) => ({ ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down" })[e.key];
    window.addEventListener("keydown", (e) => {
      const k = keyOf(e);
      if (!k || this.isHeld() || !this.canvas.isConnected || this.ending) return;
      if (e.target.closest?.("input, textarea, select")) return;
      e.preventDefault();
      this.keys.add(k);
      this.aim = null;
      if (!this.running) this.start();
    }, opts);
    window.addEventListener("keyup", (e) => { const k = keyOf(e); if (k) this.keys.delete(k); }, opts);
    window.addEventListener("blur", () => this.keys.clear(), opts);
  }

  /* ---------- the round ---------- */
  start() {
    if (this.running || this.ending) return;
    this.running = true;
    this.main.hidden = true;
    this.root.querySelector(".otter-play").classList.add("is-swimming");
    const intro = this.root.querySelector(".otter-intro-wrap");
    if (this.reduced) intro.remove();
    else this.to(intro, { autoAlpha: 0, duration: 0.3, onComplete: () => intro.remove() });
    this.say("Swim! Dive for fish and come up for air.");
    this.sayWord("dive");
  }
  say(text) {
    if (this.status) this.status.textContent = text;
  }
  frame() {
    if (this.destroyed || !this.ctx) return;
    if (this.isHeld()) return;
    const dt = Math.min(0.05, this.gsap.ticker.deltaRatio() / 60);
    this.time = (this.time || 0) + dt;
    if (this.running && !this.run.over) {
      const dir = (this.keys.has("down") ? 1 : 0) - (this.keys.has("up") ? 1 : 0);
      const events = step(this.run, { dir, target: this.aim }, dt);
      this.aim = null;
      for (const e of events) this.react(e);
      this.updateHud();
      if (this.run.over) this.finish();
    } else if (!this.running) {
      // Before the start the otter bobs at the surface and follows the pointer's aim.
      if (this.aim != null) this.run.otter.target = this.aim;
    }
    this.moveBubbles(dt);
    this.draw();
  }
  react(e) {
    const o = this.run.otter;
    if (e.type === "fish") {
      const kind = e.kind || "fish", name = FOODS[kind].name;
      const label = kind === "fish" ? "" : `${name.charAt(0).toUpperCase()}${name.slice(1)}! `;
      this.toast(`${label}${e.combo > 1 ? `×${e.combo} ` : ""}+${e.points}`, "good", e.x, e.y - 0.08);
      this.game.audio.tone(560 + e.combo * 110, 0.1);
      this.say(`${aWord(name)}! ${e.points} points.${e.combo < MAX_COMBO ? "" : " Top combo!"}`);
      if (this.cfg.muddy) this.pulse = 0.35;
      if (e.kind === "mussel") this.say("A mussel! Zoom!");
    } else if (e.type === "air") {
      this.toast("Air!", "dive", e.x, e.y - 0.08);
      this.game.audio.tone(880, 0.12);
      this.say("A bubble of air! Your air is full.");
      for (let i = 0; i < 6; i++) this.bubbles.push({ x: e.x + (Math.random() - 0.5) * 0.06, y: e.y, vx: -0.05, vy: -0.2 - Math.random() * 0.15, life: 1.2, r: 2 + Math.random() * 3 });
    } else if (e.type === "boost") {
      this.toast("Zoom!", "dive", otterX(this.run), clamp(o.y - 0.14, SURFACE + 0.04, 0.8));
      this.game.audio.tone(990, 0.16);
    } else if (e.type === "boost-end") {
      this.say("The speed burst is over.");
    } else if (e.type === "shove") {
      this.game.audio.tone(420, 0.08);
      this.toast("Whoosh!", "good", e.x, clamp(e.y - 0.08, SURFACE + 0.04, 0.85));
    } else if (e.type === "surface") {
      this.splash(0.5);
      if (e.fish > 1) this.toast(`${e.fish} fish on one dive!`, "dive", otterX(this.run), SURFACE - 0.06);
    } else if (e.type === "life") {
      this.game.audio.tone(e.why === "breath" ? 320 : 180, 0.22);
      const what = { breath: "Out of breath! Up for air.", snag: "Ouch, a snag!", litter: "Ouch, litter!", line: "Careful, a fishing line!" }[e.why];
      this.toast(what, "bad", otterX(this.run), clamp(o.y - 0.12, SURFACE + 0.04, 0.8));
      const left = e.lives ? ` ${e.lives} ${e.lives === 1 ? "life" : "lives"} left.` : "";
      this.say(`${what}${left}`);
      if (e.why === "breath") this.sayWord("breathe");
      this.updateHud(true);
    }
  }
  updateHud(force = false) {
    const r = this.run, o = r.otter, h = this.hud;
    if (force || this.shown?.points !== r.points) h.points.textContent = r.points;
    const combo = r.combo > 1 ? `Combo ×${r.combo}` : "";
    if (force || this.shown?.combo !== combo) {
      h.combo.hidden = !combo;
      h.combo.textContent = combo;
      if (combo && !this.reduced) this.fromTo(h.combo, { scale: 1.25 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
    }
    if (force || this.shown?.lives !== r.lives) {
      h.lives.innerHTML = Array.from({ length: LIVES }, (_, i) => `<i class="${i < r.lives ? "" : "is-lost"}"></i>`).join("");
      h.lives.setAttribute("aria-label", `${r.lives} ${r.lives === 1 ? "life" : "lives"}`);
    }
    h.airBar.style.transform = `scaleX(${o.air})`;
    h.air.classList.toggle("is-low", o.air < 0.3 && o.under);
    h.air.classList.toggle("is-filling", !o.under && o.air < 1);
    const airNow = Math.round(o.air * 100);
    if (this.shown?.air !== airNow) h.air.setAttribute("aria-valuenow", airNow);
    const left = Math.max(0, this.cfg.time - r.time);
    h.timeBar.style.transform = `scaleX(${left / this.cfg.time})`;
    h.time.classList.toggle("is-low", left < 10);
    const secs = Math.ceil(left);
    if (this.shown?.secs !== secs) h.time.setAttribute("aria-valuenow", secs);
    this.shown = { points: r.points, combo, lives: r.lives, air: airNow, secs };
  }
  // Floating words over the river, in river units.
  toast(text, tone, x, y) {
    const el = document.createElement("span");
    el.className = `otter-toast otter-toast--${tone}`;
    el.textContent = text;
    el.style.left = `${clamp(this.px(x), 90, this.W - 90)}px`;
    el.style.top = `${clamp(this.py(y), 24, this.H - 24)}px`;
    this.toasts.append(el);
    if (this.reduced) {
      this.after(1100, () => el.remove());
      return;
    }
    this.fromTo(el, { y: 10, autoAlpha: 0, scale: 0.8 }, { y: -18, autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)" });
    this.to(el, { y: -44, autoAlpha: 0, delay: 0.9, duration: 0.4, onComplete: () => el.remove() });
  }
  splash(n) {
    if (this.reduced) return;
    const x = otterX(this.run);
    for (let i = 0; i < 10 * n; i++) this.bubbles.push({ x: x + (Math.random() - 0.3) * 0.12, y: SURFACE, vx: (Math.random() - 0.5) * 0.3, vy: -0.25 - Math.random() * 0.3, life: 0.5, r: 2 + Math.random() * 2, drop: true });
  }
  moveBubbles(dt) {
    if (this.reduced || !this.run) return;
    const o = this.run.otter;
    if (this.running && o.under && !this.ending && Math.random() < dt * 4) {
      this.bubbles.push({ x: otterX(this.run) + 0.06, y: o.y - 0.03, vx: -0.05, vy: -0.18, life: 1.6, r: 2 + Math.random() * 3 });
    }
    for (const b of this.bubbles) {
      b.x += b.vx * dt - (b.drop ? 0 : this.cfg.speed * dt * 0.6);
      b.y += b.vy * dt;
      if (b.drop) b.vy += 1.4 * dt;
      b.life -= dt;
    }
    this.bubbles = this.bubbles.filter((b) => b.life > 0 && (b.drop || b.y > SURFACE + 0.01));
  }
  // The time is up (or the lives are gone): the holt comes into view on the bank and the otter
  // swims up to it along a curve (MotionPathPlugin). Then the results.
  finish() {
    if (this.ending) return;
    this.ending = true;
    this.running = false;
    this.keys.clear();
    const why = this.run.end;
    this.say(why === "lives" ? "Time to rest. Back to the holt." : "Time is up! Home to the holt.");
    this.sayWord("holt");
    const view = this.view;
    this.home = { x: view + HOLT.side, y: SURFACE, alpha: 1 };
    const o = this.run.otter;
    this.swimmer = { x: otterX(this.run), y: o.y, rot: 0, alpha: 1 };
    const done = () => this.results(why);
    // The holt stands at the far right; the otter swims up to its door.
    const target = view - HOLT.inset;
    const door = { x: target + (HOLT.door[0] - 0.5) * HOLT.side, y: SURFACE - (HOLT.water - HOLT.door[1]) * HOLT.side };
    if (this.reduced) {
      this.home.x = target;
      this.swimmer.alpha = 0;
      this.after(700, done);
      return;
    }
    this.to(this.home, { x: target, duration: 1.1, ease: "power2.out" });
    this.to(this.swimmer, {
      motionPath: { path: [{ x: this.swimmer.x, y: this.swimmer.y }, { x: (this.swimmer.x + door.x) / 2, y: SURFACE + 0.02 }, { x: door.x, y: door.y }], curviness: 1.2 },
      rot: -0.15, duration: 1.8, delay: 0.3, ease: "power1.inOut",
    });
    this.to(this.swimmer, { alpha: 0, duration: 0.35, delay: 2, onComplete: done });
  }
  results(why) {
    const r = this.run;
    const got = stars(r.points, this.level);
    const isBest = this.game.saveGameBest(this.meta.id, this.level, r.points);
    this.showResults({
      title: why === "lives" ? "Back to the holt to rest" : "Home to the holt!",
      stars: got,
      lines: [
        `You caught ${caughtList(r.caught)} and scored ${r.points} points.`,
        r.bestCombo > 1 ? `Best dive combo: ×${r.bestCombo}.` : "Tip: catch more than one fish on the same dive to build a combo.",
      ],
      best: isBest,
      bestLine: isBest ? "New best for this level!" : `Best: ${this.game.gameBest(this.meta.id)[this.level]} points`,
    });
  }

  /* ---------- drawing ---------- */
  draw() {
    const { ctx, W, H } = this;
    if (!ctx || !W || !this.run) return;
    const r = this.run;
    const scroll = this.reduced ? 0 : r.dist; // reduced motion: the scenery stays still
    const surf = this.py(SURFACE), bed = this.py(BED), u = this.gh;
    const muddy = this.cfg.muddy;
    // Sky, far bank and near bank
    const sky = ctx.createLinearGradient(0, 0, 0, surf);
    sky.addColorStop(0, "#bfe4f1");
    sky.addColorStop(1, "#e6f5f4");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, surf);
    this.clouds(scroll);
    if (!this.banks(scroll, surf)) {
      this.bank(scroll * 0.15 * u, surf - 0.1 * u, 0.05, "#a9cf86", 1.3, true);
      this.bank(scroll * 0.4 * u, surf - 0.045 * u, 0.035, "#7cae5a", 2.6, false);
    }
    // Water
    const water = ctx.createLinearGradient(0, surf, 0, H);
    if (muddy) {
      water.addColorStop(0, "#8fa17a");
      water.addColorStop(0.45, "#6d6a48");
      water.addColorStop(1, "#3f3a26");
    } else {
      water.addColorStop(0, "#69b8ca");
      water.addColorStop(0.55, "#3d8aa1");
      water.addColorStop(1, "#1f5b70");
    }
    ctx.fillStyle = water;
    ctx.fillRect(0, surf, W, H - surf);
    if (!muddy) this.rays(scroll);
    this.riverbed(scroll, bed);
    // Things in the river
    const ox = otterX(r), oy = r.otter.y;
    for (const t of r.things) {
      const x = this.px(t.x);
      if (x < -0.4 * u || this.px(Math.min(t.x, t.x2 ?? t.x)) > W + 0.3 * u) continue;
      let alpha = 1;
      if (muddy) {
        const d = Math.hypot(t.x - ox, t.y - oy);
        alpha = t.type === "fish" ? (d < WHISKERS ? 1 : 0.1) : t.type === "line" ? 0.6 : 0.45;
      }
      ctx.globalAlpha = alpha * (t.hit ? 0.45 : 1);
      if (t.type === "air") this.drawAir(t);
      else if (t.type === "fish") this.drawFish(t);
      else if (t.type === "snag") this.drawSnag(t);
      else if (t.type === "litter") this.drawLitter(t);
      else this.drawLine(t);
      ctx.globalAlpha = 1;
    }
    if (muddy) this.mud(ox, oy);
    // Bubbles
    ctx.fillStyle = "rgba(235, 250, 255, .25)";
    ctx.strokeStyle = "rgba(235, 250, 255, .85)";
    ctx.lineWidth = 1.5;
    for (const b of this.bubbles) {
      ctx.globalAlpha = Math.min(1, b.life * 2);
      ctx.beginPath();
      ctx.arc(this.px(b.x), this.py(b.y), b.r, 0, 6.29);
      if (b.drop) ctx.fill();
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (this.home) this.drawHolt();
    if (this.run.otter.boost > 0 && !this.swimmer) this.drawZoom();
    this.drawOtter();
    this.surface(scroll, surf);
    // Letterbox bands on very wide screens
    if (this.gx > 1) {
      ctx.fillStyle = "rgba(16, 44, 40, .55)";
      ctx.fillRect(0, 0, this.gx, H);
      ctx.fillRect(this.gx + this.gw, 0, W - this.gx - this.gw, H);
    }
  }
  clouds(scroll) {
    const { ctx, W, gh } = this;
    ctx.fillStyle = "rgba(255, 255, 255, .85)";
    const span = W + 0.6 * gh;
    for (let i = 0; i < 3; i++) {
      const x = span - ((((i * 0.37 + 0.15) * span + scroll * 0.05 * gh) % span) + span) % span - 0.3 * gh;
      const y = this.py(0.05 + (i % 2) * 0.05);
      ctx.beginPath();
      ctx.ellipse(x, y, 0.09 * gh, 0.025 * gh, 0, 0, 6.29);
      ctx.ellipse(x + 0.05 * gh, y - 0.015 * gh, 0.06 * gh, 0.025 * gh, 0, 0, 6.29);
      ctx.fill();
    }
  }
  // One looping strip, its bottom at y (canvas px), moved along by shift (px).
  strip(img, h, bottom, shift) {
    const w = h * 4;
    const off = ((-shift % w) + w) % w;
    for (let x = off - w; x < this.W; x += w) this.ctx.drawImage(img, Math.floor(x), bottom - h, Math.ceil(w) + 1, h);
  }
  // The far bank (alders and willows) and the near bank (reeds), ending at the water line.
  banks(scroll, surf) {
    const imgs = this.img.banks;
    if (!imgs.every(ready)) return false;
    BANKS.forEach((b, i) => this.strip(imgs[i], b.h * this.gh, surf + b.sink * this.gh, scroll * b.speed * this.gh));
    return true;
  }
  // A rolling bank: far hills with round trees, or the near grass with reeds.
  bank(shift, top, amp, colour, freq, trees) {
    const { ctx, W, gh } = this;
    const surf = this.py(SURFACE);
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.moveTo(0, surf + 2);
    for (let x = 0; x <= W + 16; x += 16) {
      const k = (x + shift) / gh;
      ctx.lineTo(x, top - amp * gh * (Math.sin(k * freq) + 0.5 * Math.sin(k * freq * 2.3 + 1)));
    }
    ctx.lineTo(W, surf + 2);
    ctx.fill();
    if (trees) {
      ctx.fillStyle = "#7fb062";
      const gap = 0.42 * gh;
      for (let x = -((shift * 1.0) % gap) - gap; x < W + gap; x += gap) {
        const k = Math.floor((x + shift) / gap);
        if (k % 3 === 1) continue;
        const tx = x + ((k * 53) % 40);
        ctx.beginPath();
        ctx.arc(tx, top - 0.06 * gh, 0.05 * gh, 0, 6.29);
        ctx.arc(tx + 0.04 * gh, top - 0.04 * gh, 0.04 * gh, 0, 6.29);
        ctx.fill();
      }
    } else {
      ctx.strokeStyle = "#5b8f3c";
      ctx.lineWidth = Math.max(2, gh * 0.005);
      ctx.lineCap = "round";
      const gap = 0.05 * gh;
      for (let x = -(shift % gap); x < W + gap; x += gap) {
        const k = Math.floor((x + shift) / gap);
        if (k % 5 > 1) continue;
        const h = (0.04 + ((k * 7) % 5) * 0.01) * gh;
        ctx.beginPath();
        ctx.moveTo(x, surf);
        ctx.quadraticCurveTo(x + 2, surf - h * 0.6, x + 5, surf - h);
        ctx.stroke();
      }
    }
  }
  rays(scroll) {
    const { ctx, gh, H } = this;
    const surf = this.py(SURFACE);
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, .06)";
    const gap = 0.5 * gh;
    const off = (scroll * 0.3 * gh) % gap;
    for (let x = -off - gap; x < this.W + gap; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, surf);
      ctx.lineTo(x + 0.12 * gh, surf);
      ctx.lineTo(x + 0.02 * gh, H);
      ctx.lineTo(x - 0.16 * gh, H);
      ctx.fill();
    }
    ctx.restore();
  }
  riverbed(scroll, bed) {
    const { ctx, W, H, gh } = this;
    const shift = scroll * gh;
    const img = this.img.bed;
    if (ready(img)) {
      // Gravel, pebbles and mossy stones; muddy water browns it. Weed strands rise from it, swaying.
      // On a tall (phone) stage the strip grows until its gravel reaches the bottom edge.
      const h = Math.max(BED_STRIP.h * gh, (H - bed + BED_STRIP.rise * gh) / (1 - BED_STRIP.top));
      const top = bed - BED_STRIP.rise * gh - BED_STRIP.top * h;
      ctx.save();
      if (this.cfg.muddy) ctx.filter = "sepia(.45) brightness(.72)";
      this.weeds(shift, bed);
      this.strip(img, h, top + h, shift);
      ctx.fillStyle = BED_STRIP.gravel;
      if (top + h < H) ctx.fillRect(0, top + h - 1, W, H - top - h + 1);
      ctx.restore();
      return;
    }
    ctx.fillStyle = this.cfg.muddy ? "#3a301c" : "#3c4a3c";
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W + 12; x += 12) {
      const k = (x + shift) / gh;
      ctx.lineTo(x, bed - 0.012 * gh * (Math.sin(k * 7) + Math.sin(k * 3.1 + 2)));
    }
    ctx.lineTo(W, H);
    ctx.fill();
    // Pebbles and waterweed, moving with the river
    const gap = 0.16 * gh;
    for (let x = -(shift % gap) - gap; x < W + gap; x += gap) {
      const k = Math.floor((x + shift) / gap);
      const px = x + ((k * 37) % 50) * gh * 0.002;
      ctx.fillStyle = k % 2 ? "#6b7766" : "#56634f";
      ctx.beginPath();
      ctx.ellipse(px, bed + 0.01 * gh, (0.018 + (k % 3) * 0.008) * gh, 0.012 * gh, 0, 0, 6.29);
      ctx.fill();
      if (k % 3 === 0) {
        const sway = this.reduced ? 0 : Math.sin((this.time || 0) * 1.6 + k) * 0.02 * gh;
        ctx.strokeStyle = this.cfg.muddy ? "#55623a" : "#3f7d4a";
        ctx.lineWidth = Math.max(2, gh * 0.006);
        ctx.beginPath();
        ctx.moveTo(px + 0.03 * gh, bed);
        ctx.quadraticCurveTo(px + 0.02 * gh + sway, bed - 0.06 * gh, px + 0.035 * gh + sway, bed - 0.11 * gh);
        ctx.stroke();
      }
    }
  }
  weeds(shift, bed) {
    const { ctx, gh } = this;
    const imgs = this.img.weeds;
    if (!imgs.every(ready)) return;
    const gap = WEED.every * gh, side = WEED.size * gh;
    for (let x = -(shift % gap) - gap; x < this.W + gap; x += gap) {
      const k = Math.floor((x + shift) / gap);
      const px = x + ((k * 37) % 50) * gh * 0.004;
      const tall = 0.8 + ((k * 13) % 5) * 0.08;
      const sway = this.reduced ? 0 : Math.sin((this.time || 0) * 1.4 + k) * 0.06;
      ctx.save();
      ctx.translate(px, bed + 0.01 * gh);
      ctx.rotate(sway);
      ctx.drawImage(imgs[Math.abs(k) % 2], (-side * tall) / 2, -side * tall * (481 / 512), side * tall, side * tall);
      ctx.restore();
    }
  }
  // A picture centred on (x, y) in a square of side px, turned by rot.
  centred(img, x, y, side, rot = 0) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.drawImage(img, -side / 2, -side / 2, side, side);
    ctx.restore();
  }
  surface(scroll, surf) {
    const { ctx, W, gh } = this;
    const shift = scroll * 1.2 * gh;
    ctx.strokeStyle = "rgba(240, 252, 255, .95)";
    ctx.lineWidth = Math.max(2, gh * 0.006);
    ctx.beginPath();
    for (let x = 0; x <= W + 8; x += 8) {
      const y = surf + Math.sin((x + shift) / (0.05 * gh)) * 0.006 * gh;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
  // A big wobbling bubble of air, with a bright rim, a window highlight and a few small bubbles.
  drawAir(t) {
    const { ctx, gh } = this;
    const x = this.px(t.x), y = this.py(t.y), r = t.r * gh * 1.15;
    const wob = this.reduced ? 0 : Math.sin(t.phase) * 0.07;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1 + wob, 1 - wob);
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
    g.addColorStop(0, "rgba(255,255,255,.55)");
    g.addColorStop(0.55, "rgba(200,240,255,.18)");
    g.addColorStop(0.9, "rgba(170,225,250,.35)");
    g.addColorStop(1, "rgba(255,255,255,.85)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, 6.29);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = Math.max(1.5, r * 0.08);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.beginPath();
    ctx.ellipse(-r * 0.38, -r * 0.42, r * 0.2, r * 0.11, -0.6, 0, 6.29);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const a = t.phase * 0.7 + i * 2.1;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * r * 1.4, y + r * (0.9 + i * 0.35) + Math.sin(a) * r * 0.2, r * (0.13 - i * 0.03), 0, 6.29);
      ctx.stroke();
    }
  }
  // A freshwater mussel on the riverbed: a dark blue-black shell with growth lines and a soft glow,
  // so it reads as the special catch.
  drawMussel(t) {
    const { ctx, gh } = this;
    const x = this.px(t.x), w = 0.075 * gh, h = w * 0.46;
    const y = this.py(BED) - h * 0.5 + 0.004 * gh;
    ctx.save();
    const glow = this.reduced ? 0.5 : 0.5 + Math.sin(t.phase * 2) * 0.2;
    const halo = ctx.createRadialGradient(x, y, 0, x, y, w * 0.95);
    halo.addColorStop(0, `rgba(255,236,150,${0.55 * glow})`);
    halo.addColorStop(1, "rgba(255,236,150,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(x - w, y - w, w * 2, w * 2);
    ctx.translate(x, y);
    ctx.rotate(-0.08);
    const shell = ctx.createLinearGradient(0, -h, 0, h);
    shell.addColorStop(0, "#4a5f7a");
    shell.addColorStop(0.45, "#1f2a3a");
    shell.addColorStop(1, "#11161f");
    ctx.fillStyle = shell;
    ctx.beginPath();
    ctx.moveTo(-w / 2, h * 0.1);
    ctx.bezierCurveTo(-w * 0.45, -h * 0.95, w * 0.35, -h * 1.05, w / 2, -h * 0.05);
    ctx.bezierCurveTo(w * 0.42, h * 0.75, -w * 0.4, h * 0.85, -w / 2, h * 0.1);
    ctx.fill();
    ctx.strokeStyle = "rgba(160,190,215,.45)";
    ctx.lineWidth = Math.max(1, w * 0.025);
    for (let i = 1; i <= 3; i++) {
      const k = i / 4;
      ctx.beginPath();
      ctx.ellipse(-w * 0.3, h * 0.05, w * (0.18 + k * 0.6), h * (0.2 + k * 0.62), -0.08, -2.6, -0.2);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.beginPath();
    ctx.ellipse(w * 0.05, -h * 0.5, w * 0.16, h * 0.12, -0.15, 0, 6.29);
    ctx.fill();
    ctx.restore();
  }
  drawFish(t) {
    const { ctx, gh } = this;
    if (t.kind === "mussel") return this.drawMussel(t);
    const food = t.kind && t.kind !== "fish" ? this.img.foods[t.kind] : null;
    if (ready(food)) {
      const side = SIDE[t.kind] * gh, x = this.px(t.x);
      // A crayfish walks on the bed; the others swim, the eel with a slow wriggle.
      if (t.kind === "crayfish") ctx.drawImage(food, x - side / 2, this.py(BED) + 0.006 * gh - CRAYFISH_FEET * side, side, side);
      else this.centred(food, x, this.py(t.y), side, t.kind === "eel" && !this.reduced ? Math.sin(t.phase * 1.5) * 0.08 : 0);
      return;
    }
    const img = this.img.fish;
    const w = 0.17 * gh;
    const x = this.px(t.x), y = this.py(t.y);
    if (ready(img)) this.crop(img, CROP.fish, x - w / 2, y - w * 0.265, w, false);
    else {
      ctx.fillStyle = "#c9c2a5";
      ctx.beginPath();
      ctx.ellipse(x, y, w * 0.45, w * 0.2, 0, 0, 6.29);
      ctx.fill();
    }
  }
  drawSnag(t) {
    const { ctx, gh } = this;
    const bx = this.px(t.x2), by = this.py(BED + 0.02), tx = this.px(t.x), ty = this.py(t.tip);
    const img = this.img.snag;
    if (ready(img)) {
      // The picture leans the other way, so it is mirrored, then turned and scaled so its base and tip
      // land on the snag's own line (the one the otter bumps).
      const [b0, b1] = SNAG.base, [t0, t1] = SNAG.tip;
      const iv = [-(t0 - b0), t1 - b1], wv = [tx - bx, ty - by];
      const k = Math.hypot(...wv) / Math.hypot(...iv);
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(Math.atan2(wv[1], wv[0]) - Math.atan2(iv[1], iv[0]));
      ctx.scale(-k, k);
      ctx.drawImage(img, -b0, -b1);
      ctx.restore();
      return;
    }
    ctx.lineCap = "round";
    for (const [col, w] of [["#2f2112", 0.034], ["#6b4a2a", 0.022]]) {
      ctx.strokeStyle = col;
      ctx.lineWidth = w * gh;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo((bx + tx) / 2 + 0.02 * gh, (by + ty) / 2, tx, ty);
      const mx = bx + (tx - bx) * 0.55, my = by + (ty - by) * 0.55;
      ctx.moveTo(mx, my);
      ctx.lineTo(mx + (t.twig > 0.5 ? 0.06 : -0.05) * gh, my - 0.05 * gh);
      const nx = bx + (tx - bx) * 0.8, ny = by + (ty - by) * 0.8;
      ctx.moveTo(nx, ny);
      ctx.lineTo(nx + (t.twig > 0.5 ? -0.04 : 0.05) * gh, ny - 0.035 * gh);
      ctx.stroke();
    }
  }
  drawLitter(t) {
    const { ctx, gh } = this;
    const x = this.px(t.x), y = this.py(t.y), s = t.r * gh;
    const rot = this.reduced ? 0.3 : Math.sin(t.spin) * 0.5 + 0.3;
    const img = this.img.litter[t.kind];
    if (ready(img)) return this.centred(img, x, y, SIDE[t.kind] * gh, rot - 0.3);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.lineWidth = 2;
    if (t.kind === "can") {
      ctx.fillStyle = "#d8402f";
      ctx.strokeStyle = "#7c1f15";
      ctx.beginPath();
      ctx.roundRect(-s * 0.6, -s, s * 1.2, s * 2, s * 0.2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#dfe5e8";
      ctx.fillRect(-s * 0.6, -s * 0.2, s * 1.2, s * 0.4);
    } else if (t.kind === "bottle") {
      ctx.fillStyle = "rgba(122, 196, 120, .85)";
      ctx.strokeStyle = "#2e6b34";
      ctx.beginPath();
      ctx.roundRect(-s * 0.45, -s * 0.5, s * 0.9, s * 1.6, s * 0.25);
      ctx.roundRect(-s * 0.2, -s * 1.1, s * 0.4, s * 0.7, s * 0.1);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#e7f2f0";
      ctx.fillRect(-s * 0.24, -s * 1.2, s * 0.48, s * 0.2);
    } else {
      ctx.fillStyle = "rgba(245, 245, 240, .8)";
      ctx.strokeStyle = "rgba(120, 130, 130, .9)";
      ctx.beginPath();
      ctx.moveTo(-s, -s * 0.6);
      ctx.quadraticCurveTo(-s * 0.2, -s * 1.2, s * 0.9, -s * 0.7);
      ctx.quadraticCurveTo(s * 1.2, s * 0.4, s * 0.5, s * 1);
      ctx.quadraticCurveTo(-s * 0.4, s * 1.3, -s * 1.1, s * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
  // A fishing line from an angler's rod off the top of the stage, a float at the surface and a hook.
  drawLine(t) {
    const { ctx, gh } = this;
    const x = this.px(t.x), surf = this.py(SURFACE), hy = this.py(t.hook);
    ctx.strokeStyle = "rgba(245, 245, 245, .95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 0.25 * gh, 0);
    ctx.quadraticCurveTo(x + 0.05 * gh, surf * 0.4, x, surf);
    ctx.lineTo(x, hy);
    ctx.stroke();
    ctx.strokeStyle = "#cfd6da";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x - 0.012 * gh, hy, 0.012 * gh, 0, Math.PI);
    ctx.stroke();
    // The float
    const img = this.img.float;
    if (ready(img)) {
      const side = FLOAT.side * gh;
      ctx.drawImage(img, x - side / 2, surf - FLOAT.water * side, side, side);
      return;
    }
    ctx.fillStyle = "#e2412f";
    ctx.beginPath();
    ctx.ellipse(x, surf - 0.004 * gh, 0.012 * gh, 0.018 * gh, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(x, surf - 0.004 * gh, 0.012 * gh, 0.018 * gh, 0, 0, Math.PI);
    ctx.fill();
  }
  // Muddy water: a brown haze over the river, clear only inside the otter's whisker ring.
  mud(ox, oy) {
    const { ctx, W, H, gh } = this;
    const x = this.px(ox + 0.04), y = this.py(oy), surf = this.py(SURFACE);
    const ring = WHISKERS * gh;
    const haze = ctx.createRadialGradient(x, y, ring * 0.75, x, y, ring * 1.15);
    haze.addColorStop(0, "rgba(92, 78, 44, 0)");
    haze.addColorStop(1, "rgba(92, 78, 44, .5)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, surf, W, H - surf);
    ctx.save();
    ctx.strokeStyle = `rgba(255, 244, 200, ${0.55 + (this.pulse || 0)})`;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([3, 7]);
    ctx.beginPath();
    ctx.arc(x, y, ring, 0, 6.29);
    ctx.stroke();
    ctx.restore();
    if (this.pulse) this.pulse = Math.max(0, this.pulse - 0.02);
  }
  // The mussel's speed burst: a warm glow round the otter and streaks of water rushing past behind it
  // (just the glow with reduced motion). It fades in the last second.
  drawZoom() {
    const { ctx, gh } = this;
    const o = this.run.otter;
    const x = this.px(otterX(this.run)), y = this.py(o.y);
    const fade = Math.min(1, o.boost);
    ctx.save();
    const halo = ctx.createRadialGradient(x, y, 0, x, y, 0.16 * gh);
    halo.addColorStop(0, `rgba(255,236,150,${0.4 * fade})`);
    halo.addColorStop(1, "rgba(255,236,150,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(x - 0.16 * gh, y - 0.16 * gh, 0.32 * gh, 0.32 * gh);
    if (!this.reduced) {
      ctx.strokeStyle = `rgba(255,255,255,${0.7 * fade})`;
      ctx.lineCap = "round";
      const t = this.time || 0;
      for (let i = 0; i < 6; i++) {
        const dy = ((i * 0.37) % 1 - 0.5) * 0.11 * gh;
        const run = ((t * 2.4 + i * 0.29) % 1);
        const x0 = x - 0.08 * gh - run * 0.3 * gh, len = (0.05 + (i % 3) * 0.025) * gh;
        ctx.lineWidth = Math.max(1.5, 0.006 * gh);
        ctx.globalAlpha = 1 - run;
        ctx.beginPath();
        ctx.moveTo(x0, y + dy);
        ctx.lineTo(x0 - len, y + dy);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  drawHolt() {
    const { ctx, gh } = this;
    const img = this.img.holt;
    const w = HOLT.side * gh;
    const x = this.px(this.home.x), y = this.py(this.home.y);
    if (ready(img)) ctx.drawImage(img, x - w / 2, y - HOLT.water * w, w, w);
  }
  drawOtter() {
    const { ctx, gh } = this;
    const r = this.run, o = r.otter;
    const s = this.swimmer;
    const x = s ? s.x : otterX(r);
    const bob = !o.under && !this.reduced ? Math.sin((this.time || 0) * 3) * 0.006 : 0;
    const y = s ? s.y : o.y + bob;
    const alpha = s ? s.alpha : o.blink > 0 && Math.floor(o.blink * 10) % 2 === 0 ? 0.35 : 1;
    const tilt = s ? s.rot : clamp(o.vy * 0.45, -0.5, 0.5);
    // A narrow (phone) river draws the otter a little smaller so its tail stays on screen.
    const k = clamp((this.run.view || 1.8) / 1.2, 0.75, 1);
    const w = 0.3 * k * gh;
    const sheet = sheetReady(this.img.swim) ? this.img.swim : null;
    const img = this.img.otter;
    if ((!sheet && !ready(img)) || alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.px(x) - 0.06 * k * gh, this.py(y));
    ctx.rotate(tilt);
    if (sheet) {
      const still = this.reduced || !(this.running || s);
      const f = still ? 0 : cycleFrame(this.time, o.under || s ? SWIM_FRAMES.ms : SWIM_FRAMES.surface, SWIM_FRAMES.seq);
      drawCell(ctx, sheet, f, SWIM_FRAMES.at, SWIM_FRAMES.size * k * gh);
      ctx.restore();
      return;
    }
    const [, , cw, ch] = CROP.otter;
    const h = (w * ch) / cw;
    this.crop(img, CROP.otter, -w / 2, -h * 0.48, w, false, OTTER_CUT);
    ctx.restore();
  }
  // Draw the animal part of a word picture: crop = [left, top, width, height] as shares of the image.
  // An optional cut outline (in the same shares of the image) masks part of the picture out.
  crop(img, [cx, cy, cw, ch], x, y, w, flip = false, cut = null) {
    const { ctx } = this;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const h = (w * ch * ih) / (cw * iw);
    ctx.save();
    ctx.translate(flip ? x + w : x, y);
    if (flip) ctx.scale(-1, 1);
    if (cut) {
      ctx.beginPath();
      cut.forEach(([u, v], k) => ctx[k ? "lineTo" : "moveTo"](((u - cx) / cw) * w, ((v - cy) / ch) * h));
      ctx.closePath();
      ctx.clip();
    }
    ctx.drawImage(img, cx * iw, cy * ih, cw * iw, ch * ih, 0, 0, w, h);
    ctx.restore();
  }
}
