// Shared frame for the three Mammal Games: level picker, holds, GSAP tween tracking, results.
import { LEVELS } from "../topics/topic-games.js";
import { GAME_RULES } from "../topics/topic-games-rules.js";
import { painted } from "../topics/painted-art.js";
import { mountScene } from "./layered-scene.js";

export { painted };

export const esc = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
export const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export const starRow = (n, of = 3) => `<span class="ig-stars" aria-label="${n} of ${of} stars">${"★".repeat(n)}<span aria-hidden="true">${"☆".repeat(Math.max(0, of - n))}</span></span>`;

let pluginReady = false;
export function getGsap() {
  const gsap = window.gsap;
  if (gsap && !pluginReady && window.MotionPathPlugin) {
    gsap.registerPlugin(window.MotionPathPlugin);
    pluginReady = true;
  }
  return gsap;
}

export class TopicGameView {
  constructor(game, root, meta) {
    this.game = game;
    this.root = root;
    this.meta = meta;
    this.gsap = getGsap();
    this.events = new AbortController();
    this.tweens = new Set();
    this.scenes = new Set();
    this.paused = false;
    this.destroyed = false;
    this.token = 0;
    this.stage = "levels";
    this.level = null;
    this.card = root.closest(".game-card");
  }
  get reduced() {
    return this.game.reduced();
  }
  isHeld() {
    return this.paused || this.game.paused || document.hidden;
  }
  on(target, type, fn, options = {}) {
    target.addEventListener(type, fn, { ...options, signal: this.events.signal });
  }
  // Word pictures by id (the engine's lookup also holds question ids, so words get their own map).
  item(id) {
    this.words ||= new Map(this.game.topic.items.map((x) => [x.id, x]));
    return this.words.get(id);
  }
  art(id) {
    return this.item(id)?.image || "";
  }
  // A layered parallax background for this stage (null until its painted planes are in).
  layered(host, key, options = {}) {
    const s = mountScene(host, key, { gsap: this.gsap, reduced: this.reduced, ...options });
    if (!s) return null;
    this.scenes.add(s);
    if (this.isHeld()) s.setHeld(true);
    return s;
  }
  // A painted piece when it has arrived, else the fallback (a word picture or "").
  painted(id, fallback = "") {
    return painted(id) || fallback;
  }
  // Every tween is tracked so holds pause it and leaving kills it.
  track(tween) {
    if (!tween) return tween;
    this.tweens.add(tween);
    const done = tween.eventCallback("onComplete");
    tween.eventCallback("onComplete", (...args) => {
      this.tweens.delete(tween);
      done?.(...args);
    });
    if (this.isHeld()) tween.pause();
    return tween;
  }
  to(target, vars) {
    return this.track(this.gsap.to(target, vars));
  }
  fromTo(target, from, vars) {
    return this.track(this.gsap.fromTo(target, from, vars));
  }
  timeline(vars) {
    return this.track(this.gsap.timeline(vars));
  }
  // Delayed steps belong to the screen they were made on; a held game waits for them.
  after(ms, fn) {
    const token = this.token;
    this.game.later(() => {
      if (!this.destroyed && token === this.token) fn();
    }, ms);
  }
  setPaused(paused) {
    this.paused = paused;
    for (const t of this.tweens) paused ? t.pause() : t.resume();
    for (const s of this.scenes) s.setHeld(paused);
    this.onHold?.(paused);
  }
  killTweens() {
    for (const t of this.tweens) t.kill();
    this.tweens.clear();
  }
  // Leaving a stage: cancel its tweens, timers and keys.
  reset() {
    this.token++;
    this.killTweens();
    for (const s of this.scenes) s.destroy();
    this.scenes.clear();
    this.onReset?.();
    document.getElementById("effects")?.replaceChildren();
  }
  destroy() {
    this.destroyed = true;
    this.rulesClose?.();
    this.reset();
    this.events.abort();
    this.card?.classList.remove("is-playing");
  }
  setStage(stage) {
    this.stage = stage;
    this.card?.classList.toggle("is-playing", stage !== "levels");
    this.game.refreshBack();
  }
  backLabel() {
    return this.stage === "levels" ? "Mammal Games" : "Levels";
  }
  back() {
    if (this.stage === "levels") return false;
    this.reset();
    this.levels(this.level);
    return true;
  }
  // The first screen of each game: three level cards with the best result kept on this device.
  levels(focusLevel) {
    this.setStage("levels");
    const best = this.game.gameBest(this.meta.id);
    const cards = LEVELS.map((l) => {
      const b = best[l.id];
      const bestText = b ? (this.bestText ? this.bestText(b) : starRow(b)) : '<span class="ig-best__none">Not played yet</span>';
      return `<button class="count-card ig-level ig-level--${l.id}" type="button" data-level="${l.id}"><span class="ig-level__art"><img src="${esc(this.levelArt(l.id))}" alt="" draggable="false"></span><strong>${l.label}</strong><span class="ig-level__note">${esc(this.levelNote(l.id))}</span><span class="ig-best">${bestText}</span></button>`;
    }).join("");
    const rules = GAME_RULES[this.meta.id] ? '<button class="button button--outline ig-rules-open" type="button" data-ig-rules>How to play</button>' : "";
    this.root.innerHTML = `<div class="ig-levels"><div class="ig-levels__top"><p class="ig-intro">${esc(this.meta.line)}</p>${rules}</div><div class="count-options ig-level-grid">${cards}</div></div>`;
    const open = this.root.querySelector("[data-ig-rules]");
    if (open) open.onclick = () => this.showRules(open);
    this.root.querySelectorAll("[data-level]").forEach((el) => (el.onclick = () => {
      this.level = el.dataset.level;
      this.reset();
      this.play();
    }));
    const focus = focusLevel && this.root.querySelector(`[data-level="${focusLevel}"]`);
    if (focus) focus.focus({ preventScroll: true });
  }
  // The full rules: a centred popout over the level page. Esc, the backdrop or "Got it" closes it.
  showRules(opener) {
    document.querySelector(".ig-rules-wrap")?.remove();
    const sections = GAME_RULES[this.meta.id];
    const wrap = document.createElement("div");
    wrap.className = "ig-rules-wrap";
    wrap.innerHTML = `<section class="ig-rules" role="dialog" aria-modal="true" aria-labelledby="igRulesTitle"><h2 id="igRulesTitle">${esc(this.meta.title)}</h2><div class="ig-rules__body">${sections.map((sec) => `<h3>${esc(sec.title)}</h3><ul>${sec.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`).join("")}</div><div class="ig-results__actions"><button class="button" type="button" data-ig-rules-close>Got it</button></div></section>`;
    document.body.append(wrap);
    this.game.holds.hold("rules");
    // Untracked on purpose: the rules hold pauses the game's own tweens, and this one must still play.
    const pop = this.reduced ? null : this.gsap.fromTo(wrap.firstElementChild, { scale: 0.85, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: "back.out(1.7)" });
    const close = () => {
      if (!wrap.isConnected) return;
      pop?.kill();
      wrap.remove();
      this.game.holds.release("rules");
      document.removeEventListener("keydown", onKey, true);
      opener?.focus({ preventScroll: true });
    };
    const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); close(); } };
    document.addEventListener("keydown", onKey, true);
    wrap.addEventListener("click", (e) => { if (e.target === wrap) close(); });
    wrap.querySelector("[data-ig-rules-close]").onclick = close;
    this.rulesClose = close;
    wrap.querySelector("[data-ig-rules-close]").focus({ preventScroll: true });
  }
  // Centred results popout over the play area.
  showResults({ title, stars, lines = [], best = false, bestLine = "", primary = "Play again" }) {
    const host = this.root.querySelector(".ig-stage") || this.root;
    host.querySelector(".ig-results-wrap")?.remove();
    const wrap = document.createElement("div");
    wrap.className = "ig-results-wrap";
    wrap.innerHTML = `<section class="ig-results" role="dialog" aria-modal="true" aria-labelledby="igResultsTitle"><h2 id="igResultsTitle">${esc(title)}</h2>${stars === null ? "" : starRow(stars)}${lines.map((l) => `<p>${esc(l)}</p>`).join("")}${bestLine ? `<p class="ig-results__best${best ? " is-new" : ""}">${esc(bestLine)}</p>` : ""}<div class="ig-results__actions"><button class="button" type="button" data-ig-again>${esc(primary)}</button><button class="button button--outline" type="button" data-ig-levels>Levels</button></div></section>`;
    host.append(wrap);
    wrap.querySelector("[data-ig-again]").onclick = () => { this.reset(); this.play(); };
    wrap.querySelector("[data-ig-levels]").onclick = () => { this.reset(); this.levels(this.level); };
    if (!this.reduced) this.fromTo(wrap.firstElementChild, { scale: 0.85, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: "back.out(1.7)" });
    if (stars) this.game.confetti([0, 40, 75, 120][stars] || 40, { from: wrap.querySelector(".ig-stars"), gold: best });
    wrap.querySelector("[data-ig-again]").focus({ preventScroll: true });
  }
  // A picture flies along a curve from one element to another (MotionPathPlugin), then fades.
  flyBetween(src, from, to, { size = 90, lift = 140, duration = 0.9, keep = false } = {}) {
    const layer = document.getElementById("effects");
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.className = "ig-flyer";
    const x0 = a.left + a.width / 2 - size / 2, y0 = a.top + a.height / 2 - size / 2;
    img.style.cssText = `width:${size}px;height:${size}px;left:${x0}px;top:${y0}px`;
    layer.append(img);
    const dx = b.left + b.width / 2 - size / 2 - x0, dy = b.top + b.height / 2 - size / 2 - y0;
    return new Promise((resolve) => {
      if (this.reduced) {
        img.remove();
        resolve();
        return;
      }
      this.to(img, {
        motionPath: { path: [{ x: 0, y: 0 }, { x: dx * 0.5, y: Math.min(0, dy) - lift }, { x: dx, y: dy }], curviness: 1.25 },
        scale: keep ? 1 : 0.45, rotation: dx > 0 ? 18 : -18, duration, ease: "power1.inOut",
        onComplete: () => { img.remove(); resolve(); },
      });
    });
  }
}
