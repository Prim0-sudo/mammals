// Bat Night Hunt (arcade): a dark wood on a canvas driven by gsap.ticker. The bat sends out echoes;
// the rings light up moths, branches and the owl, which fade again. The rules live in
// src/topics/games/bat.js (pure and seeded); this view reads input, steps the night and draws it.
// Word pictures stand in for the painted art. Design: DESIGN.md, section 6.
import { TopicGameView, esc } from "../topic-games-kit.js";
import {
  SETTINGS, LIVES, MAX_STREAK, ECHO_COOLDOWN, ECHO_RANGE, BRANCH_W, OWL_R, MOTH_R,
  createRun, step, stars, resizeRun,
} from "../../topics/games/bat.js";
import { loadSheet, sheetReady, cycleFrame, drawCell } from "./sprites.js";

const LEVEL_ART = { easy: "bat", medium: "nocturnal", hard: "owl" };
const ASPECT = [0.78, 2.4]; // the wood's shape: deeper than wide on a phone, wide on a desktop
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ready = (img) => !!(img && img.complete && img.naturalWidth);
// Each word picture has a wide clear margin: draw only the animal.
const CROP = { bat: [0.02, 0.21, 0.96, 0.58], owl: [0.25, 0.02, 0.5, 0.96] };
// Flight frames (owner approved, 24 November 2026), facing right. The wings fill the cells differently,
// so each frame is anchored by the animal's eye (cell pixels) plus a shift to the middle of its body.
// A real bat's body rises on the downstroke; only a fifth of that rise is kept, so it does not jump.
const BAT_EYES = [[440, 330], [438, 330], [433, 212], [433, 217]];
const BAT_FLY = {
  ms: 80, seq: [0, 1, 2, 3], size: 0.24,
  at: BAT_EYES.map(([x, y]) => [x - 110, y + 20 + (330 - y) * 0.2]),
};
// The barn owl glides, then gives two beats of its wings.
const OWL_EYES = [[393, 288], [446, 293], [426, 165]];
const OWL_FLY = { ms: 160, seq: [0, 0, 1, 2], size: 4.4, eye: [120, -15], at: OWL_EYES.map(([x, y]) => [x - 120, y + 15]) };
const WHAT = { branch: "Ouch, a branch!", owl: "Look out, an owl!" };

function loadImage(src) {
  const img = new Image();
  img.decoding = "async";
  if (src) img.src = src;
  return img;
}
// A fixed sky of stars and a row of tree tops, so the wood looks the same each frame.
function makeSky() {
  let a = 7;
  const r = () => ((a = (a * 16807) % 2147483647) / 2147483647);
  return {
    stars: Array.from({ length: 70 }, () => ({ x: r(), y: r() * 0.7, s: 0.6 + r() * 1.4, tw: r() * 6 })),
    trees: Array.from({ length: 14 }, (_, i) => ({ x: (i + r() * 0.6) / 13, h: 0.1 + r() * 0.12, w: 0.05 + r() * 0.04 })),
  };
}

export class View extends TopicGameView {
  constructor(game, root, meta) {
    super(game, root, meta);
    this.sky = makeSky();
    this.levels();
  }
  levelArt(level) {
    return this.art(LEVEL_ART[level]) || this.art("bat");
  }
  levelNote(level) {
    const s = SETTINGS[level];
    const pace = s.pace.charAt(0).toUpperCase() + s.pace.slice(1);
    const extra = s.autoEcho ? ` and a free echo every ${s.autoEcho} seconds` : s.owlEvery ? `, ${s.branches} branches and an owl` : `, ${s.branches} branches`;
    return `${pace} moths${extra}. ${s.night} seconds of night.`;
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
    if (paused) {
      this.keys?.clear();
      this.aim = null;
    }
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
    this.img = { bat: loadImage(this.art("bat")), owl: loadImage(this.art("owl")), batFly: loadSheet("bat-fly"), owlFly: loadSheet("owl-fly") };
    const c = this.cfg;
    const dangers = c.branches ? `Keep away from the branches${c.owlEvery ? " and the owl" : ""}!` : "";
    this.root.innerHTML = `<div class="ig-play bat-play">
      <div class="bat-bar">
        <div class="bat-hud">
          <span class="bat-chip bat-points"><b>0</b> points</span>
          <span class="bat-chip bat-streak" hidden></span>
          <span class="bat-chip bat-lives" role="img" aria-label="${LIVES} lives"></span>
          <span class="bat-chip bat-meter bat-time" role="meter" aria-label="Night left" aria-valuemin="0" aria-valuemax="${c.night}" aria-valuenow="${c.night}"><span class="bat-meter__label">Night</span><span class="bat-meter__bar"><i></i></span></span>
        </div>
        <button class="button bat-echo" type="button" data-echo aria-label="Echo"><span class="bat-echo__ring" aria-hidden="true"></span>Echo</button>
        <button class="button ig-main bat-start" type="button" data-ig-main>Start</button>
      </div>
      <div class="ig-stage bat-stage">
        <canvas class="bat-canvas" tabindex="0" role="img" aria-label="A dark wood at night. Fly the bat and send echoes to find the moths."></canvas>
        <div class="bat-toasts" aria-hidden="true"></div>
        <div class="bat-intro-wrap"><section class="bat-intro" aria-labelledby="batIntroTitle">
          <img class="bat-intro__art" src="${esc(this.art("bat"))}" alt="" draggable="false">
          <h2 id="batIntroTitle">Hunt by echo!</h2>
          <p>Bats are <strong>nocturnal</strong>: they hunt at night. It is too dark to see, so they <strong>listen</strong>.</p>
          <p>Send an <strong>echo</strong>. The rings light up the moths for a moment. Then fly into them!${c.autoEcho ? ` A free echo comes every ${c.autoEcho} seconds.` : ""}</p>
          <p class="bat-intro__how">Fly with the arrow keys (or W A S D), the mouse, or drag on the wood. Echo with Space, the Echo button or a double tap. ${dangers}</p>
        </section></div>
      </div>
      <p class="sr-only bat-status" role="status" aria-live="polite"></p>
    </div>`;
    this.stageEl = this.root.querySelector(".bat-stage");
    this.canvas = this.root.querySelector(".bat-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.toasts = this.root.querySelector(".bat-toasts");
    this.status = this.root.querySelector(".bat-status");
    this.main = this.root.querySelector("[data-ig-main]");
    this.echoBtn = this.root.querySelector("[data-echo]");
    this.hud = {
      points: this.root.querySelector(".bat-points b"),
      streak: this.root.querySelector(".bat-streak"),
      lives: this.root.querySelector(".bat-lives"),
      time: this.root.querySelector(".bat-time"),
      timeBar: this.root.querySelector(".bat-time i"),
    };
    this.roundEvents = new AbortController();
    this.keys = new Set();
    this.aim = null;
    this.wantEcho = false;
    this.running = false;
    this.ending = false;
    this.dawn = 0;
    this.clock = 0;
    this.shown = null;
    this.run = null;
    this.layout();
    this.run = createRun(this.level, { seed: (Date.now() ^ (Math.random() * 1e9)) >>> 0, view: this.view });
    this.observer = new ResizeObserver(() => this.layout());
    this.observer.observe(this.stageEl);
    this.bindInput();
    this.updateHud(true);
    this.main.onclick = () => this.start();
    this.echoBtn.onclick = () => {
      if (!this.running) this.start();
      this.wantEcho = true;
    };
    this.tick = () => this.frame();
    this.gsap.ticker.add(this.tick);
    this.main.focus({ preventScroll: true });
  }

  /* ---------- size and input ---------- */
  // The canvas fills the stage; the wood keeps its shape inside it (letterboxed in more night sky).
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
    if (this.run) resizeRun(this.run, aspect);
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
    const aimAt = (e) => {
      const box = this.canvas.getBoundingClientRect();
      this.aim = { tx: clamp((e.clientX - box.left - this.gx) / this.gh, 0, this.view), ty: clamp((e.clientY - box.top - this.gy) / this.gh, 0, 1) };
    };
    let lastTap = { t: 0, x: 0, y: 0 };
    this.canvas.addEventListener("pointerdown", (e) => {
      if (this.isHeld() || this.ending) return;
      aimAt(e);
      if (e.pointerType !== "mouse") {
        this.canvas.setPointerCapture?.(e.pointerId);
        // A double tap on the wood sends an echo.
        const now = performance.now();
        if (now - lastTap.t < 320 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 48) this.wantEcho = true;
        lastTap = { t: now, x: e.clientX, y: e.clientY };
      }
      if (!this.running) this.start();
    }, opts);
    this.canvas.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse" || e.buttons) aimAt(e); }, opts);
    const drop = (e) => { if (e.pointerType !== "mouse") this.aim = null; };
    this.canvas.addEventListener("pointerup", drop, opts);
    this.canvas.addEventListener("pointercancel", drop, opts);
    this.canvas.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") this.aim = null; }, opts);
    const keyOf = (e) => ({ ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" })[e.key];
    window.addEventListener("keydown", (e) => {
      if (this.isHeld() || !this.canvas.isConnected || this.ending) return;
      if (e.target.closest?.("input, textarea, select")) return;
      if (document.querySelector(".ig-rules-wrap, .ig-results-wrap")) return;
      if (e.key === " " || e.code === "Space") {
        // A focused button answers Space itself.
        if (e.target.closest?.("button")) return;
        e.preventDefault();
        if (!this.running) this.start();
        this.wantEcho = true;
        return;
      }
      const k = keyOf(e);
      if (!k) return;
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
    this.root.querySelector(".bat-play").classList.add("is-flying");
    const intro = this.root.querySelector(".bat-intro-wrap");
    if (this.reduced) intro.remove();
    else this.to(intro, { autoAlpha: 0, duration: 0.3, onComplete: () => intro.remove() });
    this.say("Fly! Send an echo to find the moths.");
    this.sayWord("nocturnal");
    if (document.activeElement === this.main || document.activeElement === document.body) this.canvas.focus({ preventScroll: true });
  }
  say(text) {
    if (this.status) this.status.textContent = text;
  }
  frame() {
    if (this.destroyed || !this.ctx) return;
    if (this.isHeld()) return;
    const dt = Math.min(0.05, this.gsap.ticker.deltaRatio() / 60);
    this.clock += dt;
    if (this.running && !this.run.over) {
      const dx = (this.keys.has("right") ? 1 : 0) - (this.keys.has("left") ? 1 : 0);
      const dy = (this.keys.has("down") ? 1 : 0) - (this.keys.has("up") ? 1 : 0);
      const input = dx || dy ? { dx, dy } : this.aim ? { ...this.aim } : {};
      input.echo = this.wantEcho;
      this.wantEcho = false;
      for (const e of step(this.run, input, dt)) this.react(e);
      this.updateHud();
      if (this.run.over) this.finish();
    }
    this.draw();
  }
  react(e) {
    if (e.type === "echo") {
      this.game.audio.tone(e.auto ? 980 : 1320, 0.06);
      if (!e.auto && !this.reduced) this.fromTo(this.echoBtn, { scale: 0.92 }, { scale: 1, duration: 0.25, ease: "back.out(2)" });
    } else if (e.type === "cooling") {
      if (!this.reduced) this.fromTo(this.echoBtn, { x: -4 }, { x: 0, duration: 0.25, ease: "elastic.out(1, 0.3)" });
    } else if (e.type === "moth") {
      this.toast(e.streak > 1 ? `×${e.streak} +${e.points}` : `+${e.points}`, "good", e.x, e.y - 0.08);
      this.game.audio.tone(560 + e.streak * 120, 0.1);
      this.say(`A moth! ${e.points} points.${e.streak === MAX_STREAK ? " Top streak!" : ""}`);
    } else if (e.type === "life") {
      this.game.audio.tone(180, 0.22);
      this.toast(WHAT[e.why], "bad", e.x, clamp(e.y - 0.1, 0.08, 0.9));
      const left = e.lives ? ` ${e.lives} ${e.lives === 1 ? "life" : "lives"} left.` : "";
      this.say(`${WHAT[e.why]}${left}`);
      this.updateHud(true);
    }
  }
  updateHud(force = false) {
    const r = this.run, h = this.hud;
    if (force || this.shown?.points !== r.points) h.points.textContent = r.points;
    const streak = r.streak > 1 ? `Streak ×${r.streak}` : "";
    if (force || this.shown?.streak !== streak) {
      h.streak.hidden = !streak;
      h.streak.textContent = streak;
      if (streak && !this.reduced) this.fromTo(h.streak, { scale: 1.25 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
    }
    if (force || this.shown?.lives !== r.lives) {
      h.lives.innerHTML = Array.from({ length: LIVES }, (_, i) => `<i class="${i < r.lives ? "" : "is-lost"}"></i>`).join("");
      h.lives.setAttribute("aria-label", `${r.lives} ${r.lives === 1 ? "life" : "lives"}`);
    }
    const left = Math.max(0, this.cfg.night - r.time);
    h.timeBar.style.transform = `scaleX(${left / this.cfg.night})`;
    h.time.classList.toggle("is-low", left < 10);
    const secs = Math.ceil(left);
    if (this.shown?.secs !== secs) h.time.setAttribute("aria-valuenow", secs);
    // The Echo button fills back up over the cooldown.
    const cool = r.cool / ECHO_COOLDOWN;
    this.echoBtn.style.setProperty("--cool", cool.toFixed(3));
    this.echoBtn.classList.toggle("is-cooling", cool > 0);
    this.shown = { points: r.points, streak, lives: r.lives, secs };
  }
  // Floating words over the wood, in wood units.
  toast(text, tone, x, y) {
    const el = document.createElement("span");
    el.className = `bat-toast bat-toast--${tone}`;
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
  finish() {
    if (this.ending) return;
    this.ending = true;
    this.running = false;
    this.keys.clear();
    this.aim = null;
    const why = this.run.end;
    this.say(why === "lives" ? "Time to rest. Back to the roost." : "Dawn is coming! Back to the roost.");
    const done = () => this.results(why);
    if (this.reduced) {
      this.dawn = 1;
      this.after(700, done);
      return;
    }
    this.to(this, { dawn: 1, duration: 1.4, ease: "sine.inOut", onComplete: done });
  }
  results(why) {
    const r = this.run;
    const got = stars(r.points, this.level);
    const isBest = this.game.saveGameBest(this.meta.id, this.level, r.points);
    this.showResults({
      title: why === "lives" ? "Back to the roost to rest" : "Dawn! Back to the roost",
      stars: got,
      lines: [
        `You caught ${r.moths} ${r.moths === 1 ? "moth" : "moths"} and scored ${r.points} points.`,
        r.bestStreak > 1 ? `Best echo streak: ×${r.bestStreak}.` : "Tip: catch more moths from the same echo to build a streak.",
        "Bats are nocturnal. They find their food in the dark by listening.",
      ],
      best: isBest,
      bestLine: isBest ? "New best for this level!" : `Best: ${this.game.gameBest(this.meta.id)[this.level]} points`,
    });
  }

  /* ---------- drawing ---------- */
  draw() {
    const { ctx, W, H } = this;
    if (!ctx || !W) return;
    this.drawSky();
    if (!this.run) return;
    const lit = (t) => clamp(t.lit / this.cfg.seen, 0, 1);
    for (const t of this.run.things) if (t.type === "branch") this.drawBranch(t, lit(t));
    for (const ring of this.run.rings) this.drawRing(ring);
    for (const t of this.run.things) if (t.type === "moth") this.drawMoth(t, lit(t));
    for (const t of this.run.things) if (t.type === "owl") this.drawOwl(t, lit(t));
    this.drawBat();
    ctx.globalAlpha = 1;
  }
  drawSky() {
    const { ctx, W, H, gh } = this;
    const d = this.dawn;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, mix("#081028", "#5d7fb8", d));
    g.addColorStop(0.7, mix("#15224a", "#e8a87c", d));
    g.addColorStop(1, mix("#1d2c50", "#f6d08a", d));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // Stars twinkle (held still with reduced motion) and fade at dawn.
    ctx.fillStyle = "#fff";
    for (const s of this.sky.stars) {
      const tw = this.reduced ? 0.7 : 0.45 + 0.35 * Math.sin(this.clock * 2 + s.tw);
      ctx.globalAlpha = tw * (1 - d);
      ctx.fillRect(s.x * W, s.y * H, s.s, s.s);
    }
    ctx.globalAlpha = 1;
    // The moon, top right of the wood.
    const mx = this.px(this.view - 0.22), my = this.py(0.17), mr = 0.07 * gh;
    const glow = ctx.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 3);
    glow.addColorStop(0, `rgba(250, 244, 210, ${0.35 * (1 - d)})`);
    glow.addColorStop(1, "rgba(250, 244, 210, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(mx - mr * 3, my - mr * 3, mr * 6, mr * 6);
    ctx.globalAlpha = 1 - d * 0.7;
    ctx.fillStyle = "#f4efd2";
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, 6.29);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Tree tops along the bottom of the canvas.
    ctx.fillStyle = mix("#050a1a", "#2c3a3a", d);
    for (const t of this.sky.trees) {
      const x = t.x * W, w = t.w * W, top = H - t.h * Math.min(H, W);
      ctx.beginPath();
      ctx.moveTo(x - w, H);
      ctx.lineTo(x, top);
      ctx.lineTo(x + w, H);
      ctx.fill();
    }
  }
  // Branches are hidden in the dark (owner, 24 Nov: no faint outlines, so the child must echo); an
  // echo shows the bark for a moment.
  drawBranch(t, lit) {
    const { ctx, gh } = this;
    const x1 = this.px(t.x1), y1 = this.py(t.y1), x2 = this.px(t.x2), y2 = this.py(t.y2);
    ctx.lineCap = "round";
    const twig = (f, side, len, w) => {
      const fx = x1 + (x2 - x1) * f, fy = y1 + (y2 - y1) * f;
      const a = Math.atan2(y2 - y1, x2 - x1) + side * 0.7;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + Math.cos(a) * len * gh, fy + Math.sin(a) * len * gh);
      ctx.stroke();
    };
    const paint = (color, alpha) => {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = BRANCH_W * 2 * gh;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      twig(0.45 + t.twig * 0.2, 1, 0.08, BRANCH_W * gh);
      twig(0.7, -1, 0.06, BRANCH_W * gh * 0.8);
    };
    if (lit > 0) paint("#b58b5c", lit);
    ctx.globalAlpha = 1;
  }
  drawRing(ring) {
    const { ctx, gh } = this;
    const k = ring.r / ECHO_RANGE;
    ctx.save();
    ctx.strokeStyle = ring.auto ? "#c6b7ff" : "#8fdcff";
    ctx.lineWidth = 3;
    if (ring.auto) ctx.setLineDash([8, 8]);
    // Reduced motion: the ring is drawn at full size and fades instead of growing.
    const r = this.reduced ? ECHO_RANGE : ring.r;
    ctx.globalAlpha = (1 - k) * 0.9;
    ctx.beginPath();
    ctx.arc(this.px(ring.x), this.py(ring.y), Math.max(1, r * gh), 0, 6.29);
    ctx.stroke();
    if (!this.reduced && ring.r > 0.12) {
      ctx.globalAlpha = (1 - k) * 0.4;
      ctx.beginPath();
      ctx.arc(this.px(ring.x), this.py(ring.y), (ring.r - 0.08) * gh, 0, 6.29);
      ctx.stroke();
    }
    ctx.restore();
  }
  // Moths are invisible until an echo finds them.
  drawMoth(t, lit) {
    const { ctx, gh } = this;
    if (t.caught) return;
    const x = this.px(t.x), y = this.py(t.y), s = MOTH_R * gh;
    const alpha = lit;
    if (lit > 0) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, s * 3);
      g.addColorStop(0, `rgba(255, 236, 160, ${0.5 * lit})`);
      g.addColorStop(1, "rgba(255, 236, 160, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - s * 3, y - s * 3, s * 6, s * 6);
    }
    const flap = this.reduced ? 0.8 : 0.45 + 0.55 * Math.abs(Math.sin(t.flap));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(Math.cos(t.ang) * 0.3);
    ctx.fillStyle = "#efe2bd";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(side * s * 0.55 * flap, -s * 0.15, s * 0.6 * flap, s * 0.75, side * 0.5, 0, 6.29);
      ctx.fill();
    }
    ctx.fillStyle = "#8a7656";
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.16, s * 0.55, 0, 0, 6.29);
    ctx.fill();
    ctx.restore();
  }
  // The owl: a shadow with glowing eyes, seen properly only when an echo finds it.
  drawOwl(t, lit) {
    const { ctx, gh } = this;
    const img = this.img.owl;
    const h = OWL_R * 2.6 * gh;
    const x = this.px(t.x), y = this.py(t.y);
    const sheet = this.img.owlFly;
    if (sheetReady(sheet)) {
      const size = OWL_FLY.size * OWL_R * gh;
      const f = this.reduced ? 0 : cycleFrame(this.clock + t.phase, OWL_FLY.ms, OWL_FLY.seq);
      ctx.save();
      ctx.translate(x, y);
      if (t.dir < 0) ctx.scale(-1, 1);
      ctx.globalAlpha = lit; // only its glowing eye shows until an echo finds it
      drawCell(ctx, sheet, f, OWL_FLY.at[f], size);
      // One glowing eye, side on, so the owl shows in the dark before an echo finds it.
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#ffd23f";
      ctx.beginPath();
      ctx.arc((OWL_FLY.eye[0] / 512) * size, (OWL_FLY.eye[1] / 512) * size, 0.008 * gh, 0, 6.29);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
      return;
    }
    if (ready(img)) {
      const [cx, cy, cw, ch] = CROP.owl;
      const w = (h * cw * img.naturalWidth) / (ch * img.naturalHeight);
      ctx.save();
      ctx.globalAlpha = lit; // only its glowing eye shows until an echo finds it
      ctx.translate(x, y);
      if (t.dir < 0) ctx.scale(-1, 1);
      ctx.drawImage(img, cx * img.naturalWidth, cy * img.naturalHeight, cw * img.naturalWidth, ch * img.naturalHeight, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "#ffd23f";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(x + side * 0.018 * gh, y - 0.025 * gh, 0.008 * gh, 0, 6.29);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  drawBat() {
    const { ctx, gh } = this;
    const b = this.run.bat;
    const x = this.px(b.x), y = this.py(b.y);
    // A soft glow so the child can always find the bat.
    const g = ctx.createRadialGradient(x, y, 0, x, y, 0.13 * gh);
    g.addColorStop(0, "rgba(140, 200, 255, .22)");
    g.addColorStop(1, "rgba(140, 200, 255, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - 0.13 * gh, y - 0.13 * gh, 0.26 * gh, 0.26 * gh);
    const blink = b.blink > 0 && Math.floor(b.blink * 10) % 2 === 0;
    const sheet = this.img.batFly;
    if (sheetReady(sheet)) {
      const f = this.reduced || !this.running ? 0 : cycleFrame(this.clock, BAT_FLY.ms, BAT_FLY.seq);
      ctx.save();
      ctx.globalAlpha = blink ? 0.35 : 1;
      ctx.translate(x, y);
      ctx.rotate(clamp(b.vy * 0.3, -0.25, 0.25) * (b.face || 1));
      if (b.face < 0) ctx.scale(-1, 1);
      drawCell(ctx, sheet, f, BAT_FLY.at[f], BAT_FLY.size * gh);
      ctx.restore();
      return;
    }
    const img = this.img.bat;
    if (!ready(img)) return;
    const [cx, cy, cw, ch] = CROP.bat;
    const w = 0.2 * gh, h = (w * ch * img.naturalHeight) / (cw * img.naturalWidth);
    const flap = this.reduced || !this.running ? 1 : 0.62 + 0.38 * Math.abs(Math.sin(this.clock * 11));
    ctx.save();
    ctx.globalAlpha = blink ? 0.35 : 1;
    ctx.translate(x, y);
    ctx.rotate(clamp(b.vx * 0.5, -0.35, 0.35));
    ctx.scale(1, flap);
    ctx.drawImage(img, cx * img.naturalWidth, cy * img.naturalHeight, cw * img.naturalWidth, ch * img.naturalHeight, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
}

// Blend two #rrggbb colours (dawn over night).
function mix(a, b, t) {
  if (t <= 0) return a;
  const p = (c, i) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
  const v = [0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t));
  return `rgb(${v.join(",")})`;
}
