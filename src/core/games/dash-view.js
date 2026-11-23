// Burrow Dash (arcade): a side-on meadow on a canvas driven by gsap.ticker. The rabbit runs by
// itself; the child hops stones and hides in a burrow when the eagle or the fox comes. The rules live
// in src/topics/games/dash.js (pure and seeded); this view reads input, steps the meadow and draws it.
// Word pictures stand in for the painted art.
import { TopicGameView, esc } from "../topic-games-kit.js";
import {
  SETTINGS, GROUND, RABBIT_X, LIVES, LEAF_POINTS, SWOOP,
  createRun, step, stars, burrowNear,
} from "../../topics/games/dash.js";

const LEVEL_ART = { easy: "rabbit", medium: "fox", hard: "eagle" };
const EARS = 0.84; // how far the rabbit sinks into a burrow: its ear tips stay above the ground
const ASPECT = [1.1, 2.6]; // a landscape meadow, letterboxed on a phone
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ready = (img) => !!(img && img.complete && img.naturalWidth);
// The animal part of each word picture.
// The eagle stands on a rock in its picture: this outline keeps the bird and its tail, not the rock.
const EAGLE_CUT = [[0, 0], [1, 0], [1, 0.79], [0.31, 0.79], [0.31, 1], [0, 1]];
const CROP = {
  rabbit: [0.05, 0.02, 0.88, 0.96],
  eagle: [0.08, 0.01, 0.84, 0.97],
  fox: [0.02, 0.1, 0.97, 0.8],
  leaf: [0.04, 0.02, 0.92, 0.96],
  warren: [0, 0.1, 1, 0.82],
};
const mix = (c1, c2, t) => {
  const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const a = p(c1), b = p(c2);
  return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], t))).join(",")})`;
};

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
    return this.art(LEVEL_ART[level]) || this.art("rabbit");
  }
  levelNote(level) {
    const s = SETTINGS[level];
    return `${s.fox ? "An eagle and a fox" : "An eagle only"}, a ${s.warning}-second warning${s.speed > SETTINGS.easy.speed ? ", a faster run" : ""}. ${s.time} seconds.`;
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
    if (paused) this.pending = {};
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
    this.img = Object.fromEntries(["rabbit", "eagle", "fox", "leaf", "warren"].map((id) => [id, loadImage(this.art(id))]));
    this.root.innerHTML = `<div class="ig-play dash-play">
      <div class="dash-bar">
        <div class="dash-hud">
          <span class="dash-chip dash-points"><b>0</b> points</span>
          <span class="dash-chip dash-lives" role="img" aria-label="${LIVES} lives"></span>
          <span class="dash-chip dash-time" role="meter" aria-label="Time to dusk" aria-valuemin="0" aria-valuemax="${this.cfg.time}" aria-valuenow="${this.cfg.time}"><span class="dash-time__sun" aria-hidden="true"></span><span class="dash-time__bar"><i></i></span></span>
        </div>
        <div class="dash-controls">
          <button class="button ig-main dash-start" type="button" data-ig-main>Start</button>
          <button class="button dash-btn dash-hop" type="button" data-dash="hop" aria-label="Hop" hidden><span aria-hidden="true">⤴</span> Hop</button>
          <button class="button button--outline dash-btn dash-hide" type="button" data-dash="hide" aria-label="Hide in the burrow" hidden><span aria-hidden="true">⤵</span> Hide</button>
        </div>
      </div>
      <div class="ig-stage dash-stage">
        <canvas class="dash-canvas" role="img" aria-label="A meadow. The rabbit runs by itself. Hop over stones, collect leaves, and hide in a burrow when a predator comes."></canvas>
        <div class="dash-toasts" aria-hidden="true"></div>
        <div class="dash-intro-wrap"><section class="dash-intro" aria-labelledby="dashIntroTitle">
          <img class="dash-intro__art" src="${esc(this.art("rabbit"))}" alt="" draggable="false">
          <h2 id="dashIntroTitle">Run, rabbit, run!</h2>
          <p>A rabbit is <strong>prey</strong>. Collect leaves and hop over stones${this.cfg.logs ? " and logs" : ""}.</p>
          <p>When the eagle cries${this.cfg.fox ? " or a fox comes" : ""}, <strong>hide</strong> in a burrow. A ring shows when a hole is close.</p>
          <p class="dash-intro__how">Hop: Space, ↑ or tap. Hide: ↓ or swipe down. Or use the Hop and Hide buttons.</p>
        </section></div>
      </div>
      <p class="sr-only dash-status" role="status" aria-live="polite"></p>
    </div>`;
    this.stageEl = this.root.querySelector(".dash-stage");
    this.canvas = this.root.querySelector(".dash-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.toasts = this.root.querySelector(".dash-toasts");
    this.status = this.root.querySelector(".dash-status");
    this.main = this.root.querySelector("[data-ig-main]");
    this.hopBtn = this.root.querySelector('[data-dash="hop"]');
    this.hideBtn = this.root.querySelector('[data-dash="hide"]');
    this.hud = {
      points: this.root.querySelector(".dash-points b"),
      lives: this.root.querySelector(".dash-lives"),
      time: this.root.querySelector(".dash-time"),
      timeBar: this.root.querySelector(".dash-time i"),
    };
    this.roundEvents = new AbortController();
    this.pending = {};
    this.running = false;
    this.ending = false;
    this.pose = { sy: 1 };
    this.sink = 0;
    this.crumbs = [];
    this.layout();
    this.run = createRun(this.level, { seed: (Date.now() ^ (Math.random() * 1e9)) >>> 0 });
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
  // The canvas fills the stage; the meadow keeps a landscape shape inside it, with more sky above
  // and more soil below on a tall phone instead of a stretched meadow.
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
    // On a tall stage the meadow sits a little low, so the extra room is mostly sky for the eagle.
    this.gy = (this.H - this.gh) * 0.62;
    this.view = aspect;
    // The rabbit's place across the meadow: a little further left on a narrow (phone) meadow, so
    // there is more room to see what is coming.
    this.rx = RABBIT_X * aspect - Math.max(0, 1.6 - aspect) * 0.15;
    this.draw();
  }
  // Screen x for a distance along the meadow, and screen y for a height above the ground.
  sx(x) {
    return this.gx + (this.rx + (x - this.run.scroll)) * this.gh;
  }
  sy(h) {
    return this.gy + (GROUND - h) * this.gh;
  }
  bindInput() {
    const opts = { signal: this.roundEvents.signal };
    const act = (what) => {
      if (this.isHeld() || this.ending) return;
      if (!this.running) { this.start(); if (what === "hide") return; }
      this.pending[what] = true;
    };
    // Tap the meadow to hop (a mouse hops at once); a swipe down hides.
    let down = null;
    this.canvas.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") { act("hop"); return; }
      down = { y: e.clientY, t: performance.now(), swiped: false };
      this.canvas.setPointerCapture?.(e.pointerId);
    }, opts);
    this.canvas.addEventListener("pointermove", (e) => {
      if (!down || down.swiped) return;
      if (e.clientY - down.y > 28) { down.swiped = true; act("hide"); }
    }, opts);
    this.canvas.addEventListener("pointerup", () => {
      if (down && !down.swiped && performance.now() - down.t < 450) act("hop");
      down = null;
    }, opts);
    this.canvas.addEventListener("pointercancel", () => { down = null; }, opts);
    let lastKey = 0;
    for (const btn of [this.hopBtn, this.hideBtn]) {
      btn.addEventListener("pointerdown", (e) => { e.preventDefault(); act(btn.dataset.dash); }, opts);
      // A keyboard press on a focused button (Enter, or Space already handled below) still works.
      btn.addEventListener("click", (e) => { if (e.detail === 0 && performance.now() - lastKey > 400) act(btn.dataset.dash); }, opts);
    }
    const keyOf = (e) => ({ " ": "hop", ArrowUp: "hop", w: "hop", W: "hop", ArrowDown: "hide", s: "hide", S: "hide" })[e.key];
    window.addEventListener("keydown", (e) => {
      const k = keyOf(e);
      if (!k || this.isHeld() || !this.canvas.isConnected || this.ending) return;
      if (e.target.closest?.("input, textarea, select")) return;
      if (e.target.closest?.("button") && e.key === " " && !e.target.closest(".dash-btn")) return;
      e.preventDefault();
      lastKey = performance.now();
      if (e.repeat) return;
      act(k);
    }, opts);
  }

  /* ---------- the round ---------- */
  start() {
    if (this.running || this.ending) return;
    this.running = true;
    this.main.hidden = true;
    this.hopBtn.hidden = false;
    this.hideBtn.hidden = false;
    this.root.querySelector(".dash-play").classList.add("is-running");
    const intro = this.root.querySelector(".dash-intro-wrap");
    if (this.reduced) intro.remove();
    else this.to(intro, { autoAlpha: 0, duration: 0.3, onComplete: () => intro.remove() });
    this.say("Run! Collect leaves and hop over stones.");
    this.canvas.focus?.({ preventScroll: true });
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
      const events = step(this.run, this.pending, dt, { reduced: this.reduced });
      this.pending = {};
      for (const e of events) this.react(e);
      this.updateHud();
      if (this.run.over) this.finish();
    }
    this.moveCrumbs(dt);
    this.draw();
  }
  react(e) {
    const rx = this.run.scroll;
    if (e.type === "leaf") {
      this.toast(`+${LEAF_POINTS}`, "good", e.x, e.y + 0.12);
      this.game.audio.tone(760, 0.07);
      if (!this.reduced) for (let i = 0; i < 6; i++) this.crumbs.push({ x: e.x, h: e.y, vx: (Math.random() - 0.5) * 0.4, vh: Math.random() * 0.4, life: 0.5 });
    } else if (e.type === "hop") {
      this.game.audio.tone(520, 0.06);
      if (!this.reduced) this.fromTo(this.pose, { sy: 0.8 }, { sy: 1, duration: 0.22, ease: "back.out(3)" });
    } else if (e.type === "land") {
      if (!this.reduced) this.fromTo(this.pose, { sy: 0.86 }, { sy: 1, duration: 0.18, ease: "power2.out" });
    } else if (e.type === "hide") {
      this.game.audio.tone(330, 0.12);
      this.say("Hiding in the burrow.");
      this.sayWord("hide");
      // Down the hole, with only the ear tips showing so the child can see where the rabbit is.
      if (this.reduced) this.sink = EARS;
      else this.to(this, { sink: EARS, duration: 0.22, ease: "power2.in" });
    } else if (e.type === "popout") {
      this.say("All clear! Out you pop.");
      if (this.reduced) this.sink = 0;
      else this.to(this, { sink: 0, duration: 0.28, ease: "back.out(1.8)" });
    } else if (e.type === "noburrow") {
      this.toast("No burrow here!", "warn", rx + 0.05, 0.42);
      this.say("You can only hide near a burrow. Look for the ring.");
      this.game.audio.tone(240, 0.1);
    } else if (e.type === "warn") {
      const eagle = e.kind === "eagle";
      this.toast(eagle ? "An eagle! Hide!" : "A fox! Hide!", "bad", rx + 0.5, 0.62);
      this.say(eagle ? "An eagle! Hide in a burrow!" : "A fox is coming! Hide in a burrow!");
      this.sayWord(e.kind);
      if (eagle) this.cry();
      else this.game.audio.tone(150, 0.25);
    } else if (e.type === "safe") {
      this.toast("Safe in the burrow!", "safe", rx, 0.4);
      this.say(`Safe! The ${e.kind} has gone.`);
      this.game.audio.tone(880, 0.12);
    } else if (e.type === "life") {
      const what = { stone: "Bump! A stone.", log: "Bump! A log.", eagle: "Too slow! The eagle swooped.", fox: "Too slow! The fox pounced." }[e.why];
      this.toast(what, "bad", rx + 0.05, 0.45);
      this.game.audio.tone(180, 0.22);
      const left = e.lives ? ` ${e.lives} ${e.lives === 1 ? "life" : "lives"} left.` : "";
      this.say(`${what}${left}`);
      this.updateHud(true);
      if (!this.reduced && (e.why === "stone" || e.why === "log")) this.fromTo(this.pose, { sy: 0.7 }, { sy: 1, duration: 0.35, ease: "elastic.out(1, 0.5)" });
    }
  }
  // The eagle's cry: a high falling call, twice.
  cry() {
    const a = this.game.audio;
    a.tone(1400, 0.16);
    this.after(170, () => a.tone(1150, 0.2));
    this.after(420, () => a.tone(1350, 0.14));
  }
  updateHud(force = false) {
    const r = this.run, h = this.hud;
    if (force || this.shown?.points !== r.points) h.points.textContent = r.points;
    if (force || this.shown?.lives !== r.lives) {
      h.lives.innerHTML = Array.from({ length: LIVES }, (_, i) => `<i class="${i < r.lives ? "" : "is-lost"}"></i>`).join("");
      h.lives.setAttribute("aria-label", `${r.lives} ${r.lives === 1 ? "life" : "lives"}`);
    }
    const left = Math.max(0, this.cfg.time - r.time);
    h.timeBar.style.transform = `scaleX(${left / this.cfg.time})`;
    h.time.classList.toggle("is-low", left < 10);
    const secs = Math.ceil(left);
    if (this.shown?.secs !== secs) h.time.setAttribute("aria-valuenow", secs);
    const near = !r.rabbit.hidden && !!burrowNear(r);
    if (force || this.shown?.near !== near) {
      // The shared yellow button marks a burrow in reach; the outline button the rest of the time.
      this.hideBtn.classList.toggle("is-ready", near);
      this.hideBtn.classList.toggle("button--secondary", near);
      this.hideBtn.classList.toggle("button--outline", !near);
    }
    if (force || this.shown?.hidden !== !!r.rabbit.hidden) {
      this.hideBtn.setAttribute("aria-pressed", String(!!r.rabbit.hidden));
      this.hopBtn.disabled = !!r.rabbit.hidden;
    }
    this.shown = { points: r.points, lives: r.lives, secs, near, hidden: !!r.rabbit.hidden };
  }
  // Floating words over the meadow: x along the meadow, h above the ground.
  toast(text, tone, x, h) {
    const el = document.createElement("span");
    el.className = `dash-toast dash-toast--${tone}`;
    el.textContent = text;
    el.style.left = `${clamp(this.sx(x), 100, this.W - 100)}px`;
    el.style.top = `${clamp(this.sy(h), 24, this.H - 24)}px`;
    this.toasts.append(el);
    if (this.reduced) {
      this.after(1200, () => el.remove());
      return;
    }
    this.fromTo(el, { y: 10, autoAlpha: 0, scale: 0.8 }, { y: -16, autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)" });
    this.to(el, { y: -40, autoAlpha: 0, delay: 1, duration: 0.4, onComplete: () => el.remove() });
  }
  moveCrumbs(dt) {
    for (const c of this.crumbs) {
      c.x += c.vx * dt;
      c.h += c.vh * dt;
      c.vh -= 1.6 * dt;
      c.life -= dt;
    }
    this.crumbs = this.crumbs.filter((c) => c.life > 0);
  }
  // Dusk (or no lives left): the warren comes into view and the rabbit hops home along a curve.
  finish() {
    if (this.ending) return;
    this.ending = true;
    this.running = false;
    this.hopBtn.disabled = true;
    this.hideBtn.disabled = true;
    const why = this.run.end;
    this.say(why === "lives" ? "Time to rest. Home to the warren." : "Dusk! Home to the warren.");
    this.sayWord("warren");
    const r = this.run;
    this.home = { x: r.scroll + this.view - this.rx + 0.3 };
    this.runner = { x: r.scroll, h: r.rabbit.h, alpha: 1 };
    const goal = r.scroll + this.view * 0.78 - this.rx;
    const done = () => this.results(why);
    if (this.reduced || r.rabbit.hidden) {
      this.home.x = goal;
      this.runner.alpha = 0;
      this.after(700, done);
      return;
    }
    this.to(this.home, { x: goal, duration: 1, ease: "power2.out" });
    this.to(this.runner, {
      motionPath: { path: [{ x: this.runner.x, h: this.runner.h }, { x: (this.runner.x + goal) / 2, h: 0.3 }, { x: goal - 0.03, h: 0.02 }], curviness: 1.1 },
      duration: 1.4, delay: 0.5, ease: "power1.inOut",
    });
    this.to(this.runner, { alpha: 0, duration: 0.3, delay: 1.75, onComplete: done });
  }
  results(why) {
    const r = this.run;
    const got = stars(r.points, this.level);
    const isBest = this.game.saveGameBest(this.meta.id, this.level, r.points);
    const hid = r.safe ? `You hid from ${r.safe} ${r.safe === 1 ? "predator" : "predators"}.` : "Tip: when the eagle cries, look for the ring round a burrow and hide.";
    this.showResults({
      title: why === "lives" ? "Home to the warren to rest" : "Safe in the warren!",
      stars: got,
      lines: [`You collected ${r.leaves} ${r.leaves === 1 ? "leaf" : "leaves"} and scored ${r.points} points.`, hid],
      best: isBest,
      bestLine: isBest ? "New best for this level!" : `Best: ${this.game.gameBest(this.meta.id)[this.level]} points`,
    });
  }

  /* ---------- drawing ---------- */
  draw() {
    const { ctx, W, H } = this;
    if (!ctx || !W || !this.run) return;
    const r = this.run;
    const scroll = this.reduced ? 0 : r.scroll; // reduced motion: no parallax behind the meadow
    const ground = this.sy(0), u = this.gh;
    const dusk = clamp((r.time - this.cfg.time * 0.7) / (this.cfg.time * 0.3), 0, 1);
    // Sky, sun and clouds
    const sky = ctx.createLinearGradient(0, 0, 0, ground);
    sky.addColorStop(0, mix("#9fd3ef", "#43457e", dusk));
    sky.addColorStop(1, mix("#e3f4f2", "#f0a46e", dusk));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, ground);
    const sunY = lerp(0.14, 0.62, clamp(r.time / this.cfg.time, 0, 1));
    ctx.fillStyle = mix("#fff1a8", "#ff9a4a", dusk);
    ctx.beginPath();
    ctx.arc(this.gx + this.gw * 0.86, this.gy + sunY * u, 0.05 * u, 0, 6.29);
    ctx.fill();
    this.clouds(scroll);
    this.hills(scroll * 0.18 * u, ground - 0.2 * u, 0.06, mix("#b9dc95", "#6f7f86", dusk * 0.7), 1.1);
    this.hills(scroll * 0.45 * u, ground - 0.09 * u, 0.04, mix("#94c56d", "#5d7660", dusk * 0.7), 2.2, true);
    // Ground
    ctx.fillStyle = mix("#7fae55", "#5a7a46", dusk * 0.7);
    ctx.fillRect(0, ground, W, 0.05 * u);
    const soil = ctx.createLinearGradient(0, ground + 0.04 * u, 0, H);
    soil.addColorStop(0, mix("#8a6a3e", "#5d4a33", dusk * 0.6));
    soil.addColorStop(1, mix("#5a4126", "#3b2e20", dusk * 0.6));
    ctx.fillStyle = soil;
    ctx.fillRect(0, ground + 0.045 * u, W, H - ground);
    this.pebbles(r.scroll, ground);
    this.tufts(r.scroll, ground);
    // Burrows, stones, logs and leaves
    const near = !r.rabbit.hidden && burrowNear(r);
    for (const t of r.things) {
      const x = this.sx(t.x);
      if (x < -0.3 * u || x > W + 0.3 * u) continue;
      if (t.type === "burrow") this.drawBurrow(t, x, near === t);
      else if (t.type === "stone") this.drawStone(t, x);
      else if (t.type === "log") this.drawLog(t, x);
    }
    if (this.home) this.drawWarren();
    for (const t of r.things) if (t.type === "leaf") this.drawLeaf(t);
    for (const c of this.crumbs) {
      ctx.globalAlpha = clamp(c.life * 2, 0, 1);
      ctx.fillStyle = "#5f9c3c";
      ctx.beginPath();
      ctx.arc(this.sx(c.x), this.sy(c.h), 3, 0, 6.29);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    const d = this.ending ? null : r.danger; // the predator has gone by the time the rabbit runs home
    if (d?.kind === "eagle") this.drawShadow(d);
    this.drawRabbit();
    if (d?.kind === "fox") this.drawFox(d.x, d.struck);
    if (!this.ending) for (const p of r.passing) this.drawFox(p.x, true);
    if (d?.kind === "eagle") this.drawEagle(d);
    if (d?.kind === "fox" && this.sx(d.x) > W - 0.05 * u && !d.struck) this.edgeSign("Fox!");
    if (dusk > 0) {
      ctx.fillStyle = `rgba(30, 30, 70, ${dusk * 0.22})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (this.gx > 1) {
      ctx.fillStyle = "rgba(30, 50, 30, .5)";
      ctx.fillRect(0, 0, this.gx, H);
      ctx.fillRect(this.gx + this.gw, 0, W - this.gx - this.gw, H);
    }
  }
  clouds(scroll) {
    const { ctx, W, gh } = this;
    ctx.fillStyle = "rgba(255, 255, 255, .8)";
    const span = W + 0.6 * gh;
    for (let i = 0; i < 3; i++) {
      const drift = this.reduced ? 0 : (this.time || 0) * 0.01;
      const x = span - ((((i * 0.41 + 0.1) * span + (scroll * 0.06 + drift) * gh) % span) + span) % span - 0.3 * gh;
      const y = this.gy + (0.08 + (i % 2) * 0.08) * gh;
      ctx.beginPath();
      ctx.ellipse(x, y, 0.1 * gh, 0.028 * gh, 0, 0, 6.29);
      ctx.ellipse(x + 0.06 * gh, y - 0.018 * gh, 0.065 * gh, 0.028 * gh, 0, 0, 6.29);
      ctx.fill();
    }
  }
  hills(shift, top, amp, colour, freq, hedge = false) {
    const { ctx, W, gh } = this;
    const ground = this.sy(0);
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.moveTo(0, ground + 1);
    for (let x = 0; x <= W + 16; x += 16) {
      const k = (x + shift) / gh;
      ctx.lineTo(x, top - amp * gh * (Math.sin(k * freq) + 0.6 * Math.sin(k * freq * 2.7 + 1.3)));
    }
    ctx.lineTo(W, ground + 1);
    ctx.fill();
    if (!hedge) return;
    ctx.fillStyle = "rgba(60, 110, 50, .55)";
    const gap = 0.55 * gh;
    for (let x = -(shift % gap) - gap; x < W + gap; x += gap) {
      const k = Math.floor((x + shift) / gap);
      if (k % 2) continue;
      ctx.beginPath();
      ctx.ellipse(x, top - 0.01 * gh, 0.09 * gh, 0.035 * gh, 0, Math.PI, 0);
      ctx.fill();
    }
  }
  // Stones and roots in the soil, moving with the ground.
  pebbles(scroll, ground) {
    const { ctx, W, H, gh } = this;
    const shift = scroll * gh, gap = 0.13 * gh;
    for (let x = -(shift % gap) - gap; x < W + gap; x += gap) {
      const k = Math.floor((x + shift) / gap);
      const j = ((k * 7919) % 13 + 13) % 13;
      const y = ground + (0.08 + (j % 5) * 0.028) * gh;
      if (y > H - 4) continue;
      ctx.fillStyle = j % 3 ? "rgba(60, 40, 20, .35)" : "rgba(190, 170, 140, .45)";
      ctx.beginPath();
      ctx.ellipse(x + (j / 13) * gap, y, (0.008 + (j % 4) * 0.003) * gh, (0.005 + (j % 3) * 0.002) * gh, 0, 0, 6.29);
      ctx.fill();
      if (j % 4 === 1) {
        ctx.strokeStyle = "rgba(70, 48, 25, .4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, ground + 0.05 * gh);
        ctx.quadraticCurveTo(x + 0.02 * gh, ground + 0.08 * gh, x + 0.01 * gh, ground + 0.12 * gh);
        ctx.stroke();
      }
    }
  }
  tufts(scroll, ground) {
    const { ctx, W, gh } = this;
    const shift = scroll * gh;
    const gap = 0.045 * gh;
    ctx.strokeStyle = "#5f9c3c";
    ctx.lineWidth = Math.max(2, gh * 0.006);
    ctx.lineCap = "round";
    for (let x = -(shift % gap) - gap; x < W + gap; x += gap) {
      const k = Math.floor((x + shift) / gap);
      if (k % 3 === 2) continue;
      const h = (0.018 + (k % 4) * 0.006) * gh;
      ctx.beginPath();
      ctx.moveTo(x, ground + 2);
      ctx.lineTo(x - 3, ground - h);
      ctx.moveTo(x + 4, ground + 2);
      ctx.lineTo(x + 6, ground - h * 0.8);
      ctx.stroke();
    }
  }
  drawBurrow(t, x, near) {
    const { ctx, gh } = this;
    const g = this.sy(0);
    // A mound of earth behind the hole, then the dark hole itself
    ctx.fillStyle = "#9b7444";
    ctx.beginPath();
    ctx.ellipse(x, g + 0.006 * gh, 0.085 * gh, 0.045 * gh, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#2e2113";
    ctx.beginPath();
    ctx.ellipse(x, g + 0.008 * gh, 0.05 * gh, 0.03 * gh, 0, Math.PI, 0);
    ctx.ellipse(x, g + 0.008 * gh, 0.05 * gh, 0.012 * gh, 0, 0, Math.PI);
    ctx.fill();
    if (near) {
      const pulse = this.reduced ? 0 : Math.sin((this.time || 0) * 8) * 0.008;
      ctx.strokeStyle = "#ffe066";
      ctx.lineWidth = Math.max(3, gh * 0.008);
      ctx.beginPath();
      ctx.ellipse(x, g, (0.095 + pulse) * gh, (0.05 + pulse) * gh, 0, 0, 6.29);
      ctx.stroke();
    }
  }
  drawStone(t, x) {
    const { ctx, gh } = this;
    const g = this.sy(0), w = t.w * gh, h = t.h * gh;
    ctx.globalAlpha = t.hit ? 0.55 : 1;
    ctx.fillStyle = "#8d8f88";
    ctx.strokeStyle = "#5c5e58";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.6, g + 2);
    ctx.quadraticCurveTo(x - w * 0.65, g - h * 0.9, x - w * 0.05, g - h * 1.05);
    ctx.quadraticCurveTo(x + w * 0.6, g - h, x + w * 0.62, g + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 255, 255, .25)";
    ctx.beginPath();
    ctx.ellipse(x - w * 0.18, g - h * 0.7, w * 0.16, h * 0.14, -0.3, 0, 6.29);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  drawLog(t, x) {
    const { ctx, gh } = this;
    const g = this.sy(0), w = t.w * gh, h = t.h * gh;
    ctx.globalAlpha = t.hit ? 0.55 : 1;
    ctx.fillStyle = "#7a5230";
    ctx.strokeStyle = "#4a3019";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, g - h, w, h, h / 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#c9a26b";
    ctx.beginPath();
    ctx.ellipse(x + w / 2 - h * 0.3, g - h / 2, h * 0.3, h * 0.45, 0, 0, 6.29);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  drawLeaf(t) {
    const img = this.img.leaf;
    if (!ready(img)) return;
    const { ctx, gh } = this;
    const s = 0.075 * gh;
    const x = this.sx(t.x), y = this.sy(t.y);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.reduced ? -0.4 : -0.4 + Math.sin((this.time || 0) * 2.5 + t.id) * 0.15);
    this.crop(img, CROP.leaf, -s / 2, -s / 2, s);
    ctx.restore();
  }
  drawWarren() {
    const img = this.img.warren;
    if (!ready(img)) return;
    // The warren picture is a cut-away of the tunnels: its grass sits on the meadow, the rooms below.
    const w = 0.27 * this.gh;
    const x = this.sx(this.home.x);
    this.crop(img, CROP.warren, x - w / 2, this.sy(0) - 0.03 * this.gh, w);
  }
  drawRabbit() {
    const { ctx, gh } = this;
    const r = this.run, rb = r.rabbit;
    const img = this.img.rabbit;
    if (!ready(img)) return;
    const s = this.runner;
    const x = this.sx(s ? s.x : r.scroll);
    const h = s ? s.h : rb.h;
    const alpha = s ? s.alpha : rb.blink > 0 && Math.floor(rb.blink * 10) % 2 === 0 ? 0.35 : 1;
    if (alpha <= 0 || this.sink >= 1) return;
    const [, , cw, ch] = CROP.rabbit;
    const w = 0.2 * gh, ht = (w * ch * img.naturalHeight) / (cw * img.naturalWidth);
    const g = this.sy(0);
    // A running bounce while on the ground (none under reduced motion)
    const bounce = !s && h === 0 && this.running && !this.reduced ? Math.abs(Math.sin((this.time || 0) * 11)) * 0.012 * gh : 0;
    const feet = this.sy(h) - bounce + this.sink * ht;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (this.sink > 0) {
      ctx.beginPath();
      ctx.rect(0, 0, this.W, g + 0.004 * gh);
      ctx.clip();
    }
    // Shadow on the ground
    if (h > 0 && !s) {
      ctx.fillStyle = "rgba(30, 40, 20, .2)";
      ctx.beginPath();
      ctx.ellipse(x, g + 2, w * 0.35 * (1 - h), 0.01 * gh, 0, 0, 6.29);
      ctx.fill();
    }
    ctx.translate(x, feet);
    const sy = this.pose.sy;
    ctx.scale(1 + (1 - sy) * 0.5, sy);
    if (h > 0 && !this.reduced) ctx.rotate(-0.12 + rb.hop * 0.24);
    this.crop(img, CROP.rabbit, -w * 0.5, -ht, w);
    ctx.restore();
  }
  // The eagle's warning shadow grows on the ground near the rabbit; then the eagle swoops through.
  drawShadow(d) {
    const { ctx, gh } = this;
    const k = clamp(d.t / d.warn, 0, 1);
    if (d.t > d.warn + 0.3) return;
    const x = this.sx(this.run.scroll) + (1 - k) * 0.25 * gh;
    ctx.fillStyle = `rgba(20, 30, 20, ${0.12 + k * 0.28})`;
    ctx.beginPath();
    ctx.ellipse(x, this.sy(0) + 0.01 * gh, (0.04 + k * 0.16) * gh, (0.01 + k * 0.022) * gh, 0, 0, 6.29);
    ctx.fill();
  }
  eaglePos(d) {
    const rx = this.rx;
    const high = { x: rx + 0.3, y: 0.14 };
    if (d.t < d.warn - 0.35) {
      const k = clamp(d.t / (d.warn - 0.35), 0, 1);
      const enter = { x: this.view + 0.25, y: 0.02 };
      const wob = this.reduced ? 0 : Math.sin(d.t * 3) * 0.02;
      return { x: lerp(enter.x, high.x, k), y: lerp(enter.y, high.y, k) + wob, size: 0.14 + k * 0.06, rot: 0 };
    }
    if (d.t < d.warn) {
      const k = (d.t - (d.warn - 0.35)) / 0.35;
      return { x: lerp(high.x, rx + 0.02, k), y: lerp(high.y, GROUND - 0.1, k * k), size: 0.2 + k * 0.04, rot: -0.5 * k };
    }
    const k = clamp((d.t - d.warn) / SWOOP, 0, 1);
    return { x: lerp(rx + 0.02, rx - 0.7, k), y: lerp(GROUND - 0.1, -0.1, Math.sqrt(k)), size: 0.24, rot: -0.5 + k * 0.9 };
  }
  drawEagle(d) {
    const img = this.img.eagle;
    if (!ready(img)) return;
    const { ctx, gh } = this;
    const p = this.eaglePos(d);
    const w = p.size * gh;
    ctx.save();
    ctx.translate(this.gx + p.x * gh, this.gy + p.y * gh);
    ctx.rotate(p.rot);
    this.crop(img, CROP.eagle, -w / 2, -w / 2, w, true, EAGLE_CUT);
    ctx.restore();
  }
  // The fox trots in crouched, from the right; after its pounce it runs off to the left.
  drawFox(x, gone) {
    const img = this.img.fox;
    if (!ready(img)) return;
    const { ctx, gh } = this;
    const w = 0.26 * gh;
    const [, , cw, ch] = CROP.fox;
    const ht = (w * ch * img.naturalHeight) / (cw * img.naturalWidth);
    const trot = this.reduced ? 0 : Math.abs(Math.sin((this.time || 0) * (gone ? 16 : 9))) * 0.012 * gh;
    ctx.save();
    ctx.translate(this.sx(x), this.sy(0) - trot);
    ctx.scale(1, gone ? 1 : 0.86); // crouched while it stalks
    this.crop(img, CROP.fox, -w / 2, -ht, w, true);
    ctx.restore();
  }
  // A sign at the right edge while the fox is still out of sight.
  edgeSign(text) {
    const { ctx, gh } = this;
    const fs = Math.max(15, 0.05 * gh);
    ctx.font = `900 ${fs}px system-ui, sans-serif`;
    const tw = ctx.measureText(text).width;
    const x = this.gx + this.gw - tw - fs * 2.2, y = this.sy(0.22);
    ctx.fillStyle = "#b8321f";
    ctx.beginPath();
    ctx.roundRect(x, y - fs, tw + fs * 1.8, fs * 1.8, fs * 0.9);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "middle";
    ctx.fillText(`${text} ›`, x + fs * 0.6, y - fs + fs * 0.9);
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
      cut.forEach(([u, v], i) => ctx[i ? "lineTo" : "moveTo"](((u - cx) / cw) * w, ((v - cy) / ch) * h));
      ctx.closePath();
      ctx.clip();
    }
    ctx.drawImage(img, cx * iw, cy * ih, cw * iw, ch * ih, 0, 0, w, h);
    ctx.restore();
  }
}
