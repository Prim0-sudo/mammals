// Detective (SCREEN-SPEC section 7): a word picture hides behind a 12 x 10 mosaic, a coarse
// pixel grid or a black outline, and comes into view while the reveal runs. The reveal counts
// active time only: it stops for Guess, popouts and hidden tabs. A star needs a first-try guess
// before the picture is fully shown. Ported from the Plants detective model and view.
import { shuffle } from "./logic.js";
import { kindOf } from "../topics/kind-of.js";
import { SHOWS, LOOK_ALIKES } from "../topics/look-alikes.js";

export const REVEAL_KINDS = [["mosaic", "Mosaic"], ["pixel", "Pixel"], ["silhouette", "Silhouette"]];
export const REVEAL_TIMES = [30, 45, 60];
export const TILE_COUNT = 120;
// Outlines only work for whole animals cut out on a clear background: the studio-photo
// mammals (21 November 2026). Body parts, actions and habitats stay mosaic or pixel.
const OUTLINE_GROUPS = new Set(["mammals"]);
export const canSilhouette = (item) => OUTLINE_GROUPS.has(item.categoryId);

export function createReveal(kind = "mosaic", duration = 45, order = shuffle(Array.from({ length: TILE_COUNT }, (_, i) => i))) {
  if (!REVEAL_KINDS.some(([id]) => id === kind) || !REVEAL_TIMES.includes(duration)) throw Error("Invalid reveal settings");
  return { kind, duration, order, elapsed: 0, running: false, guessing: false, assisted: false, complete: false, wrong: false };
}
export function advanceReveal(reveal, ms) {
  if (!reveal.running || reveal.complete) return;
  reveal.elapsed = Math.min(reveal.duration * 1000, reveal.elapsed + Math.max(0, ms));
  if (reveal.elapsed === reveal.duration * 1000) {
    reveal.running = false;
    reveal.assisted = true;
  }
}
export const revealedTiles = (reveal) => Math.min(TILE_COUNT, Math.floor((reveal.elapsed / (reveal.duration * 1000)) * TILE_COUNT));
// Returns the stars earned: one for a first-try guess before the picture was fully shown.
export function answerReveal(reveal, correct) {
  if (reveal.complete) return 0;
  if (!correct) {
    reveal.wrong = true;
    return 0;
  }
  reveal.complete = true;
  reveal.running = false;
  return reveal.assisted || reveal.wrong ? 0 : 1;
}
// A word and any word it is a kind of, at any depth (snail, pond snail, ramshorn), are never
// offered together, so a "wrong" picture is never really right. Used by Detective and Which One Is It?.
const wider = (id) => {
  const chain = [];
  for (let at = kindOf[id]; at && !chain.includes(at); at = kindOf[at]) chain.push(at);
  return chain;
};
// Look-alike pairs, and concept pictures that show an animal (topics/look-alikes.js): a picture
// counts as the word itself and every animal it shows.
const lookAlike = (a, b) => LOOK_ALIKES.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
const ids = (id) => [id, ...(SHOWS[id] || [])];
const close = (a, b) => a === b || wider(a).includes(b) || wider(b).includes(a) || lookAlike(a, b);
export const related = (a, b) => ids(a.id).some((x) => ids(b.id).some((y) => close(x, y)));
// Two fair wrong choices from the session; a small session (only spiders) borrows from `spare`.
export const detectiveChoices = (item, pool, spare = []) => {
  const fair = (list) => list.filter((x) => x.id !== item.id && !related(x, item));
  const picked = shuffle(fair(pool)).slice(0, 2);
  for (const x of shuffle(fair(spare))) if (picked.length < 2 && !picked.some((p) => p.id === x.id)) picked.push(x);
  return shuffle([item, ...picked]);
};

const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export class DetectiveView {
  constructor(game, item, choices, reveal) {
    Object.assign(this, { game, item, choices, reveal, active: true, last: null, run: 0 });
    this.root = game.app.querySelector("#content");
    this.root.innerHTML = this.markup();
    this.canvas = this.root.querySelector("canvas");
    this.root.querySelector("[data-kind]").value = reveal.kind;
    this.root.querySelector("[data-duration]").value = String(reveal.duration);
    this.bind();
    this.image = new Image();
    this.image.onload = () => this.active && this.paint();
    this.image.onerror = () => {
      if (!this.active) return;
      this.stop();
      reveal.assisted = true;
      game.feedback("This picture could not load. Skip it and try the next one.", () => game.next(), "wrong");
    };
    this.image.src = item.image;
    this.resize = new ResizeObserver(() => this.active && this.paint());
    this.resize.observe(this.root.querySelector(".detective-stage"));
    this.update();
  }
  markup() {
    const { reveal, item } = this;
    const kinds = REVEAL_KINDS.map(([id, label]) => `<option value="${id}" ${id === "silhouette" && !canSilhouette(item) ? "disabled" : ""}>${label}</option>`).join("");
    const times = REVEAL_TIMES.map((t) => `<option value="${t}">${t} seconds</option>`).join("");
    return `<div class="detective-settings detective-settings--play"><label>Reveal <select data-kind>${kinds}</select></label><label>Time <select data-duration>${times}</select></label></div><div class="detective-workspace"><div class="detective-stage" role="img" aria-label="Hidden picture"><canvas aria-hidden="true"></canvas><div class="detective-mosaic" aria-hidden="true">${Array.from({ length: TILE_COUNT }, (_, i) => `<i data-cover="${i}"></i>`).join("")}</div></div><div class="detective-controls"><p class="detective-time" aria-live="off"></p><div class="detective-actions"><button class="button button--secondary" data-start></button><button class="button button--secondary" data-guess>Guess</button><button class="button button--secondary" data-reveal>Reveal picture</button></div><div class="detective-answers" ${reveal.guessing ? "" : "hidden"}>${this.choices.map((c, i) => `<button class="answer detective-answer" data-detective-answer="${esc(c.id)}" data-key="${i + 1}">${esc(c.name)}</button>`).join("")}</div></div></div>`;
  }
  bind() {
    const { game, reveal, root } = this;
    root.querySelector("[data-kind]").onchange = (e) => {
      reveal.kind = e.target.value;
      if (reveal.kind === "silhouette") this.stop();
      game.detectiveSettings.kind = reveal.kind;
      this.update();
    };
    root.querySelector("[data-duration]").onchange = (e) => {
      // Keep how much has been shown: the same share of the new time has passed.
      const share = reveal.elapsed / (reveal.duration * 1000);
      reveal.duration = Number(e.target.value);
      reveal.elapsed = share * reveal.duration * 1000;
      game.detectiveSettings.duration = reveal.duration;
      this.update();
    };
    root.querySelector("[data-start]").onclick = () => {
      if (reveal.running) this.stop();
      else {
        reveal.guessing = false;
        reveal.running = true;
        this.start();
      }
      this.update();
    };
    root.querySelector("[data-guess]").onclick = () => {
      this.stop();
      reveal.guessing = true;
      this.update();
      this.game.focus("[data-detective-answer]");
    };
    root.querySelector("[data-reveal]").onclick = () => {
      this.stop();
      reveal.assisted = true;
      reveal.elapsed = reveal.duration * 1000;
      reveal.guessing = true;
      this.update();
      game.feedback("Picture shown for practice. No star for this one.", null, "wrong");
    };
    root.querySelectorAll("[data-detective-answer]").forEach((el) => (el.onclick = () => this.answer(el)));
  }
  answer(el) {
    const { game, reveal, item } = this;
    if (reveal.complete || this.root.querySelector(".detective-answers").hidden) return;
    const correct = el.dataset.detectiveAnswer === item.id;
    const star = answerReveal(reveal, correct);
    if (!correct) {
      el.disabled = true;
      el.classList.add("wrong");
      game.state.wrong = true;
      game.feedback("Not that one. Try again!", null, "wrong");
      game.audio.tone(230);
      return;
    }
    el.classList.add("correct");
    game.state.answered = true;
    game.state.score += star;
    game.saveRound();
    game.updateScore();
    game.audio.tone();
    if (star) game.confetti(25);
    this.stop();
    this.update();
    const name = item.name[0].toLocaleUpperCase(game.topic.locale) + item.name.slice(1);
    game.feedback(`Correct! ${name}: ${item.definition}${reveal.assisted ? " This one was practice." : ""}`, () => game.next(), "right");
  }
  full() {
    const r = this.reveal;
    return r.complete || r.elapsed >= r.duration * 1000;
  }
  update() {
    const r = this.reveal, root = this.root, full = this.full();
    const start = root.querySelector("[data-start]");
    start.textContent = r.running ? "Stop reveal" : "Start reveal";
    start.disabled = r.complete || full || r.kind === "silhouette";
    // Only the actions that still do something stay in the bar, so the child is never offered three at once.
    start.hidden = start.disabled;
    const guess = root.querySelector("[data-guess]"), show = root.querySelector("[data-reveal]");
    guess.disabled = r.complete;
    guess.hidden = r.complete || r.guessing;
    show.disabled = r.complete || full;
    show.hidden = show.disabled;
    root.querySelector("[data-kind]").disabled = r.complete;
    root.querySelector("[data-duration]").disabled = r.complete || r.kind === "silhouette";
    root.querySelector(".detective-answers").hidden = !r.guessing && !r.complete;
    root.querySelector(".detective-time").textContent = r.complete
      ? "Picture solved"
      : r.kind === "silhouette" && !full
        ? "Use the outline as your clue"
        : `${Math.ceil((r.duration * 1000 - r.elapsed) / 1000)} seconds of reveal remaining`;
    root.querySelector(".detective-stage").setAttribute("aria-label", full ? this.item.imageAlt || this.item.name : "Hidden picture");
    this.paint();
  }
  paint() {
    const r = this.reveal, full = this.full(), canvas = this.canvas, ctx = canvas.getContext("2d");
    const box = canvas.getBoundingClientRect(), ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(box.width * ratio)), height = Math.max(1, Math.round(box.height * ratio));
    if (canvas.width !== width || canvas.height !== height) Object.assign(canvas, { width, height });
    ctx.clearRect(0, 0, width, height);
    const img = this.image;
    if (img?.complete && img.naturalWidth) {
      const inset = Math.min(width, height) * 0.04;
      const scale = Math.min((width - inset * 2) / img.naturalWidth, (height - inset * 2) / img.naturalHeight);
      const w = img.naturalWidth * scale, h = img.naturalHeight * scale, x = (width - w) / 2, y = (height - h) / 2;
      if (r.kind === "pixel" && !full) {
        const size = Math.max(3, Math.round(3 + (r.elapsed / (r.duration * 1000)) ** 2 * 100));
        const small = document.createElement("canvas");
        small.width = small.height = size;
        small.getContext("2d").drawImage(img, 0, 0, size, size);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(small, x, y, w, h);
      } else {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, x, y, w, h);
      }
    }
    canvas.style.filter = r.kind === "silhouette" && !full ? "brightness(0)" : "";
    const grid = this.root.querySelector(".detective-mosaic");
    grid.hidden = r.kind !== "mosaic" || full;
    const shown = new Set(r.order.slice(0, revealedTiles(r)));
    grid.querySelectorAll("[data-cover]").forEach((tile) => (tile.style.visibility = shown.has(+tile.dataset.cover) ? "hidden" : "visible"));
  }
  advance() {
    if (this.last == null) return;
    const now = performance.now();
    advanceReveal(this.reveal, now - this.last);
    this.last = now;
  }
  // Each run of the reveal has its own number, so a tick left over from a pause never doubles up.
  start() {
    if (this.game.paused || !this.reveal.running || this.reveal.kind === "silhouette") return;
    this.last = performance.now();
    this.tick(++this.run);
  }
  tick(run) {
    this.game.later(() => {
      if (!this.active || run !== this.run) return;
      this.advance();
      this.update();
      if (this.reveal.running) this.tick(run);
    }, 50);
  }
  stop() {
    this.advance();
    this.last = null;
    this.run++;
    this.reveal.running = false;
  }
  // Paused time (popouts, hidden tab) never counts as reveal time.
  setPaused(paused) {
    if (paused) {
      this.advance();
      this.last = null;
      this.run++;
    } else if (this.reveal.running) this.start();
  }
  destroy() {
    this.active = false;
    this.last = null;
    this.run++;
    this.resize?.disconnect();
    if (this.image) this.image.onload = this.image.onerror = null;
  }
}
