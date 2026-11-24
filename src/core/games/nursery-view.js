// Nursery Round-up (education, DESIGN.md section 3): babies wander in the meadow, mothers wait along the
// bottom. Tap a baby, then its mother (or drag the baby onto her). The right mother calls it home along an
// arc and gives a small nuzzle; a wrong one says who she is and the baby goes back.
import { TopicGameView, esc } from "../topic-games-kit.js";
import { SETTINGS, buildRound, nameOf, motherOf, rightLine, wrongLine, PICK_FIRST, START_PICTURES, START_CARDS } from "../../topics/games/nursery.js";
import { roundStars } from "../../topics/topic-games.js";

const word = (n) => ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"][n] || String(n);
const capitalWord = (n) => word(n)[0].toUpperCase() + word(n).slice(1);
const LEVEL_ART = { easy: "joey", medium: "lamb", hard: "foal" };
const an = (w) => (/^[aeiou]/i.test(w) ? "an" : "a");

export class View extends TopicGameView {
  constructor(game, root, meta) {
    super(game, root, meta);
    this.levels();
  }
  levelArt(level) {
    return this.art(LEVEL_ART[level]);
  }
  // The deer mother is a hind with no antlers, not the stag of the deer word picture.
  art(id) {
    return id === "deer" ? "assets/topics/mammals/games/hind.webp" : super.art(id);
  }
  levelNote(level) {
    const s = SETTINGS[level];
    return `${capitalWord(s.pairs)} babies, ${s.picture ? "with pictures and names" : "name cards only"}.`;
  }
  onReset() {
    this.drag?.clone?.remove();
    this.drag = null;
    this.s = null;
  }

  play() {
    this.setStage("play");
    const cfg = (this.cfg = SETTINGS[this.level]);
    this.round = buildRound(this.level);
    this.s = { picked: null, done: new Set(), slips: 0, busy: false, finished: false };
    const n = this.round.babies.length;
    const babies = this.round.babies.map((id, i) => {
      const look = cfg.picture
        ? `<span class="nu-baby__art"><img src="${esc(this.art(id))}" alt="" draggable="false"></span><span class="nu-baby__name">${esc(nameOf(id))}</span>`
        : `<span class="nu-baby__card">${esc(nameOf(id))}</span>`;
      return `<div class="nu-spot" data-spot="${i}"><button class="nu-baby${cfg.picture ? "" : " nu-baby--card"}" type="button" data-baby="${id}" aria-pressed="false" aria-label="${esc(cfg.picture ? `Baby ${nameOf(id)}` : `Name card: ${nameOf(id)}`)}"><span class="nu-baby__bob">${look}</span></button></div>`;
    }).join("");
    const mothers = this.round.mothers.map((id) => `<button class="nu-mother" type="button" data-mother="${id}" aria-label="Mother: ${esc(nameOf(id))}"><span class="nu-mother__art"><img src="${esc(this.art(id))}" alt="" draggable="false"></span><span class="nu-mother__name">${esc(nameOf(id))}</span><span class="nu-mother__kid" aria-hidden="true"></span><span class="nu-mother__say" aria-hidden="true"></span></button>`).join("");
    this.root.innerHTML = `<div class="ig-play nu-play"><div class="ig-dock nu-dock"><p class="nu-status" role="status" aria-live="polite"></p><span class="nu-count"></span></div><div class="ig-stage nu-stage nu-stage--${n}"><div class="nu-meadow" role="group" aria-label="Babies in the meadow">${babies}</div><div class="nu-mothers" role="group" aria-label="Mothers">${mothers}</div></div></div>`;
    this.statusEl = this.root.querySelector(".nu-status");
    this.babyEls = [...this.root.querySelectorAll("[data-baby]")];
    this.motherEls = [...this.root.querySelectorAll("[data-mother]")];
    // Babies stand a little off the grid, as if they had wandered there.
    this.root.querySelectorAll(".nu-spot").forEach((el, i) => {
      const jx = ((i * 37) % 23) - 11, jy = ((i * 53) % 29) - 14;
      el.style.setProperty("--jx", `${jx}px`);
      el.style.setProperty("--jy", `${jy}px`);
    });
    this.babyEls.forEach((el, i) => this.bindBaby(el, i));
    this.motherEls.forEach((el) => {
      this.on(el, "click", () => this.chooseMother(el));
      this.on(el, "keydown", (e) => this.arrows(e, this.motherEls, el));
    });
    this.on(this.root, "keydown", (e) => {
      if (e.key === "Escape" && this.s?.picked) {
        e.preventDefault();
        const el = this.babyEl(this.s.picked);
        this.unpick();
        this.say("Put down. Pick a baby.");
        el?.focus({ preventScroll: true });
      }
    });
    this.updateCount();
    this.say(cfg.picture ? START_PICTURES : START_CARDS);
    this.game.audio.speak(cfg.picture ? START_PICTURES : START_CARDS);
    if (!this.reduced) {
      this.fromTo(this.motherEls, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.06, ease: "back.out(1.6)" });
      this.fromTo(this.babyEls, { scale: 0.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.45, stagger: 0.08, delay: 0.2, ease: "back.out(2)" });
      this.babyEls.forEach((el, i) => this.wander(el, i));
    }
    this.babyEls[0].focus({ preventScroll: true });
  }
  // A gentle bob and a slow drift, each baby on its own timing.
  wander(el, i) {
    const bob = el.querySelector(".nu-baby__bob");
    const dx = matchMedia("(max-width: 500px)").matches ? 4 : 9; // less room to drift on a phone
    el.moves = [
      this.to(bob, { y: -7, duration: 0.8 + ((i * 0.17) % 0.5), yoyo: true, repeat: -1, ease: "sine.inOut", delay: i * 0.11 }),
      this.to(el.parentElement, { x: i % 2 ? dx : -dx, rotation: i % 2 ? 2 : -2, duration: 2.2 + ((i * 0.37) % 1.1), yoyo: true, repeat: -1, ease: "sine.inOut" }),
    ];
  }
  still(el) {
    for (const t of el.moves || []) {
      t.kill();
      this.tweens.delete(t);
    }
    el.moves = [];
  }
  babyEl(id) {
    return this.babyEls.find((b) => b.dataset.baby === id);
  }

  /* ---- Picking a baby: tap, keyboard or drag ---- */
  bindBaby(el, i) {
    this.on(el, "click", () => {
      if (this.dragged) { this.dragged = false; return; }
      this.pick(el);
    });
    this.on(el, "keydown", (e) => this.arrows(e, this.babyEls, el));
    this.on(el, "pointerdown", (e) => {
      if (e.button > 0 || el.disabled || this.s.busy) return;
      this.drag = { el, id: el.dataset.baby, x0: e.clientX, y0: e.clientY, clone: null, over: null, pointer: e.pointerId };
      el.setPointerCapture?.(e.pointerId);
    });
    this.on(el, "pointermove", (e) => {
      const d = this.drag;
      if (!d || d.el !== el) return;
      if (!d.clone) {
        if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 8) return;
        this.startDrag(d);
      }
      d.clone.style.left = `${e.clientX - d.dx}px`;
      d.clone.style.top = `${e.clientY - d.dy}px`;
      const over = this.motherAt(e.clientX, e.clientY);
      if (over !== d.over) {
        d.over?.classList.remove("is-over");
        over?.classList.add("is-over");
        d.over = over;
      }
    });
    const end = (e) => {
      const d = this.drag;
      if (!d || d.el !== el) return;
      this.drag = null;
      if (!d.clone) return;
      this.dragged = true;
      // A drag's click (if any) comes straight after pointerup; drop the flag after that.
      this.after(60, () => (this.dragged = false));
      d.over?.classList.remove("is-over");
      const target = e.type === "pointerup" ? this.motherAt(e.clientX, e.clientY) : null;
      if (target && !target.disabled) {
        this.pick(el, true);
        this.chooseMother(target, d.clone);
      } else this.floatBack(d.clone, el);
    };
    this.on(el, "pointerup", end);
    this.on(el, "pointercancel", end);
  }
  startDrag(d) {
    const box = d.el.querySelector(".nu-baby__bob").getBoundingClientRect();
    const clone = d.el.querySelector(".nu-baby__bob").cloneNode(true);
    clone.className = "ig-card--nursery nu-drag";
    d.dx = d.x0 - box.left;
    d.dy = d.y0 - box.top;
    clone.style.cssText = `left:${box.left}px;top:${box.top}px;width:${box.width}px;height:${box.height}px`;
    document.getElementById("effects").append(clone);
    d.clone = clone;
    d.el.classList.add("is-lifted");
  }
  motherAt(x, y) {
    return this.motherEls.find((m) => {
      if (m.disabled) return false;
      const r = m.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    }) || null;
  }
  floatBack(clone, el) {
    const done = () => {
      clone.remove();
      el.classList.remove("is-lifted");
    };
    if (this.reduced) return done();
    const r = el.querySelector(".nu-baby__bob").getBoundingClientRect();
    this.to(clone, { left: r.left, top: r.top, duration: 0.3, ease: "power2.out", onComplete: done });
  }
  pick(el, quiet = false) {
    if (!this.s || this.s.finished || this.s.busy || el.disabled) return;
    const id = el.dataset.baby;
    if (this.s.picked === id && !quiet) {
      this.unpick();
      this.say("Put down. Pick a baby.");
      return;
    }
    this.unpick();
    this.s.picked = id;
    el.classList.add("is-picked");
    el.setAttribute("aria-pressed", "true");
    this.game.audio.tone(660, 0.07);
    if (quiet) return;
    // Every level says the baby's name when it is picked.
    this.game.audio.speak(nameOf(id));
    if (!this.reduced) this.fromTo(el.querySelector(".nu-baby__bob"), { scale: 1.12 }, { scale: 1, duration: 0.35, ease: "back.out(3)" });
    this.say(this.cfg.picture ? `The ${nameOf(id)}. Now tap its mother.` : `${an(nameOf(id)) === "an" ? "An" : "A"} ${nameOf(id)}. Who is its mother?`);
    // Keyboard and switch users go straight on to the mothers.
    if (el.matches(":focus-visible")) this.motherEls.find((m) => !m.disabled)?.focus({ preventScroll: true });
  }
  unpick() {
    if (!this.s?.picked) return;
    const el = this.babyEl(this.s.picked);
    el?.classList.remove("is-picked");
    el?.setAttribute("aria-pressed", "false");
    this.s.picked = null;
  }
  arrows(e, group, el) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const live = group.filter((x) => !x.disabled);
    const i = live.indexOf(el);
    live[(i + step + live.length) % live.length]?.focus({ preventScroll: true });
  }

  /* ---- Choosing a mother ---- */
  async chooseMother(mother, clone = null) {
    const s = this.s;
    if (!s || s.finished || s.busy || mother.disabled) return;
    if (!s.picked) {
      this.say(PICK_FIRST);
      this.game.audio.speak([nameOf(mother.dataset.mother), PICK_FIRST]);
      this.nudge(mother);
      return;
    }
    const baby = s.picked;
    const el = this.babyEl(baby);
    const mum = mother.dataset.mother;
    if (motherOf(baby) !== mum) {
      // A wrong mother says who she is; the baby goes back and the pick clears.
      s.slips++;
      const line = wrongLine(baby, mum);
      this.say(line);
      this.speakLine(line);
      this.game.audio.tone(230, 0.16);
      const bubble = mother.querySelector(".nu-mother__say");
      bubble.textContent = `I'm ${an(nameOf(mum))} ${nameOf(mum)}!`;
      bubble.classList.add("is-on");
      this.after(2200, () => bubble.classList.remove("is-on"));
      this.nudge(mother);
      if (clone) this.floatBack(clone, el);
      else if (!this.reduced) this.nudge(el);
      this.unpick();
      if (el.matches(":focus-visible") || mother.matches(":focus-visible")) el.focus({ preventScroll: true });
      return;
    }
    // Right: the baby runs to her along an arc, she nuzzles it, and her line plays.
    s.busy = true;
    s.done.add(baby);
    this.unpick();
    this.still(el);
    el.disabled = true;
    el.classList.add("is-home");
    el.setAttribute("aria-label", `${nameOf(baby)}, home with its mother`);
    const from = clone || el.querySelector(".nu-baby__bob");
    const slot = mother.querySelector(".nu-mother__kid");
    const size = Math.min(110, from.getBoundingClientRect().width);
    const token = this.token;
    if (clone) clone.style.visibility = "hidden";
    el.classList.add("is-gone");
    await this.flyBetween(this.art(baby), from, slot, { size, lift: clone ? 40 : 110, duration: clone ? 0.5 : 0.85, keep: true });
    clone?.remove();
    if (token !== this.token || !this.s) return;
    slot.innerHTML = `<img src="${esc(this.art(baby))}" alt="" draggable="false"><span>${esc(nameOf(baby))}</span>`;
    mother.disabled = true;
    mother.classList.add("is-done");
    mother.setAttribute("aria-label", `${nameOf(mum)}, with her ${nameOf(baby)}`);
    if (!this.reduced) {
      this.fromTo(slot, { scale: 0.6 }, { scale: 1, duration: 0.35, ease: "back.out(2.4)" });
      this.to(mother.querySelector(".nu-mother__art img"), { rotation: -7, x: 6, transformOrigin: "50% 90%", duration: 0.18, yoyo: true, repeat: 3, ease: "sine.inOut" });
    }
    const line = rightLine(baby);
    this.say(line);
    this.speakLine(line);
    this.game.audio.tone(880, 0.14);
    this.updateCount();
    s.busy = false;
    if (s.done.size === this.round.babies.length) {
      s.finished = true;
      this.after(1400, () => this.results());
      return;
    }
    const next = this.babyEls.find((b) => !b.disabled);
    if (document.activeElement === mother || document.activeElement === document.body || !document.activeElement || document.activeElement.disabled) next?.focus({ preventScroll: true });
  }
  results() {
    const s = this.s;
    const stars = roundStars(s.slips, this.cfg.two);
    const isBest = this.game.saveGameBest("nursery", this.level, stars);
    const n = this.round.babies.length;
    this.showResults({
      title: "Every baby is home!",
      stars,
      lines: [
        `${capitalWord(n)} babies found their mothers, and every one is drinking milk.`,
        s.slips ? `${s.slips === 1 ? "One wrong mother" : `${capitalWord(s.slips)} wrong mothers`} along the way.` : "No wrong mothers at all. Super nursery keeper!",
      ],
      best: isBest,
      bestLine: isBest ? "New best for this level!" : "",
    });
  }

  /* ---- Small pieces ---- */
  say(text) {
    this.statusEl.textContent = text;
  }
  speakLine(text) {
    this.game.audio.speak(text);
  }
  updateCount() {
    this.root.querySelector(".nu-count").textContent = `Matched ${this.s.done.size} of ${this.round.babies.length}`;
  }
  nudge(el) {
    if (!el || this.reduced) return;
    this.to(el, { x: 7, duration: 0.06, yoyo: true, repeat: 5, ease: "sine.inOut", clearProps: "x" });
  }
}
