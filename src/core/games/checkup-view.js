// Mammal Check-up (education): run the three vet checks on each visitor, then stamp the card.
// A mammal has hair or fur, breathes air and feeds its babies milk. Design: DESIGN.md, section 1.
import { CHECKS, SETTINGS, STAR_SLIPS, buildRound, isMammal, why, withA } from "../../topics/games/checkup.js";
import { roundStars } from "../../topics/topic-games.js";
import { TopicGameView, esc } from "../topic-games-kit.js";

const LEVEL_NOTES = {
  easy: `${SETTINGS.easy.visitors} visitors that are easy to tell apart. The next check glows.`,
  medium: `${SETTINGS.medium.visitors} visitors. Some of them live in the sea.`,
  hard: `${SETTINGS.hard.visitors} tricky visitors. Eggs, wings and flippers can fool you.`,
};
const LEVEL_ART = { easy: "dog", medium: "seal", hard: "platypus" };

export class View extends TopicGameView {
  constructor(game, root, meta) {
    super(game, root, meta);
    this.on(document, "keydown", (e) => this.onKey(e));
    this.levels();
  }
  levelNote(level) {
    return LEVEL_NOTES[level];
  }
  levelArt(level) {
    return this.art(LEVEL_ART[level]);
  }
  name(id) {
    return (this.item(id)?.name || id).toLowerCase();
  }
  play() {
    this.setStage("play");
    this.cfg = SETTINGS[this.level];
    this.round = buildRound(this.level);
    this.index = 0;
    this.slips = 0;
    const checks = CHECKS.map((c) => `<button class="cu-check" type="button" data-check="${c.id}"><span class="cu-check__art"><img src="${esc(this.art(c.art))}" alt="" draggable="false"></span><span class="cu-check__text"><strong>${esc(c.label)}</strong><span class="cu-check__answer" aria-live="polite"></span></span><kbd aria-hidden="true">${c.key}</kbd></button>`).join("");
    this.root.innerHTML = `<div class="ig-play cu-play"><div class="ig-stage cu-room"><div class="cu-visitor"><span class="cu-pic"><img alt="" draggable="false"></span><span class="cu-name"></span><span class="cu-stamp" aria-hidden="true"></span></div><div class="cu-panel"><div class="cu-checks" role="group" aria-label="Checks">${checks}</div><div class="cu-stamps" role="group" aria-label="Stamp the card"><button class="cu-stamp-btn cu-stamp-btn--yes" type="button" data-stamp="yes">Mammal<kbd aria-hidden="true">M</kbd></button><button class="cu-stamp-btn cu-stamp-btn--no" type="button" data-stamp="no">Not a mammal<kbd aria-hidden="true">N</kbd></button></div></div></div><div class="ig-dock cu-dock"><p class="cu-status" role="status" aria-live="polite"></p><span class="cu-count"></span></div></div>`;
    const room = this.root.querySelector(".cu-room");
    if (this.layered(room, "checkup")) room.classList.add("is-layered");
    this.status = this.root.querySelector(".cu-status");
    this.root.querySelectorAll("[data-check]").forEach((el) => (el.onclick = () => this.check(el.dataset.check)));
    this.root.querySelectorAll("[data-stamp]").forEach((el) => (el.onclick = () => this.stamp(el.dataset.stamp === "yes")));
    this.nextVisitor();
  }
  say(text) {
    this.status.textContent = text;
  }
  nextVisitor() {
    this.visitor = this.round[this.index];
    this.done = new Set();
    this.running = new Set();
    this.busy = false;
    const v = this.visitor;
    const box = this.root.querySelector(".cu-visitor");
    box.querySelector(".cu-name").textContent = this.name(v.id);
    const img = box.querySelector(".cu-pic img");
    img.src = this.art(v.id);
    img.alt = this.name(v.id);
    box.querySelector(".cu-stamp").className = "cu-stamp";
    box.querySelector(".cu-stamp").textContent = "";
    this.root.querySelectorAll("[data-check]").forEach((el) => {
      el.classList.remove("is-yes", "is-no", "is-done");
      el.querySelector(".cu-check__answer").textContent = "";
      el.disabled = false;
    });
    this.root.querySelector(".cu-count").textContent = `Visitor ${this.index + 1} of ${this.round.length}`;
    this.setStamps(false);
    this.say(`Here comes ${withA(this.name(v.id))}. Run the three checks.`);
    this.game.audio.speak(`Here comes ${withA(this.name(v.id))}.`);
    this.glow();
    if (!this.reduced) this.fromTo(box, { x: 120, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, ease: "power2.out" });
    else this.gsap.set(box, { x: 0, autoAlpha: 1 });
    this.root.querySelector("[data-check]:not(.is-done)")?.focus({ preventScroll: true });
  }
  // Easy: the next check to run glows; once all are run, both stamps glow (never just the right one).
  glow() {
    const next = this.cfg.glow && CHECKS.find((c) => !this.done.has(c.id));
    this.root.querySelectorAll("[data-check]").forEach((el) => el.classList.toggle("is-glow", !!next && el.dataset.check === next.id));
  }
  setStamps(on) {
    this.root.querySelectorAll("[data-stamp]").forEach((el) => {
      el.setAttribute("aria-disabled", String(!on));
      el.classList.toggle("is-ready", on);
    });
  }
  async check(id) {
    // Checks can run side by side, so a quick second tap is never lost.
    if (this.busy || this.done.has(id) || this.running.has(id) || !this.visitor) return;
    const c = CHECKS.find((x) => x.id === id);
    const el = this.root.querySelector(`[data-check="${id}"]`);
    this.running.add(id);
    el.classList.add("is-running");
    const token = this.token;
    await this.flyBetween(this.art(c.art), el.querySelector(".cu-check__art"), this.root.querySelector(".cu-pic"), { size: 74, lift: 90, duration: 0.7 });
    if (token !== this.token) return;
    const [yes, reason] = this.visitor[id];
    this.running.delete(id);
    this.done.add(id);
    el.classList.remove("is-running");
    el.classList.add("is-done", yes ? "is-yes" : "is-no");
    el.querySelector(".cu-check__answer").textContent = reason;
    el.setAttribute("aria-label", `${c.label} ${reason}`);
    this.game.audio.tone(yes ? 660 : 330);
    if (!this.reduced) this.fromTo(el.querySelector(".cu-check__answer"), { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: "back.out(2)", transformOrigin: "0% 50%" });
    this.glow();
    if (this.done.size === CHECKS.length) {
      this.setStamps(true);
      this.say(`${reason} Now stamp the card.`);
      this.root.querySelector("[data-stamp]").focus({ preventScroll: true });
    } else {
      this.say(reason);
      this.root.querySelector("[data-check]:not(.is-done)")?.focus({ preventScroll: true });
    }
  }
  stamp(yes) {
    if (this.busy || !this.visitor) return;
    const btn = this.root.querySelector(`[data-stamp="${yes ? "yes" : "no"}"]`);
    if (this.done.size < CHECKS.length) {
      this.say("Run all three checks first.");
      this.nudge(this.root.querySelector(".cu-checks"));
      return;
    }
    const v = this.visitor;
    if (yes !== isMammal(v)) {
      this.slips++;
      this.say(why(v, this.name(v.id)));
      this.game.audio.tone(230);
      this.nudge(btn);
      return;
    }
    this.busy = true;
    const mark = this.root.querySelector(".cu-stamp");
    mark.textContent = yes ? "Mammal" : "Not a mammal";
    mark.className = `cu-stamp is-on ${yes ? "is-yes" : "is-no"}`;
    this.game.audio.tone(880);
    this.say(`${yes ? "Yes!" : "Right!"} ${withA(this.name(v.id)).replace(/^a/, "A")} is ${yes ? "" : "not "}a mammal.`);
    if (!this.reduced) this.fromTo(mark, { scale: 1.8, autoAlpha: 0, rotation: -14 }, { scale: 1, autoAlpha: 1, rotation: -8, duration: 0.35, ease: "back.out(2)" });
    this.after(1500, () => this.leave());
  }
  leave() {
    const box = this.root.querySelector(".cu-visitor");
    const go = () => {
      this.index++;
      if (this.index >= this.round.length) this.finish();
      else this.nextVisitor();
    };
    if (this.reduced) return go();
    this.to(box, { x: -140, autoAlpha: 0, duration: 0.45, ease: "power2.in", onComplete: go });
  }
  finish() {
    this.visitor = null;
    this.setStamps(false);
    const stars = roundStars(this.slips, STAR_SLIPS);
    const isBest = this.game.saveGameBest(this.meta.id, this.level, stars);
    const mammals = this.round.filter((v) => v.mammal).map((v) => this.name(v.id));
    this.showResults({
      title: stars === 3 ? "Super vet!" : "Clinic closed!",
      stars,
      lines: [`Mammals today: ${mammals.join(", ")}.`, this.slips ? `${this.slips} wrong ${this.slips === 1 ? "stamp" : "stamps"} fixed along the way.` : "Every stamp right first time!"],
      best: isBest,
      bestLine: isBest ? "New best for this level!" : "",
    });
  }
  nudge(el) {
    if (!el || this.reduced) return;
    this.to(el, { x: 7, duration: 0.06, yoyo: true, repeat: 5, ease: "sine.inOut", clearProps: "x" });
  }
  // Keys while playing: 1 2 3 run the checks, M and N stamp. Ignored under a hold or in a text field.
  onKey(e) {
    if (this.stage !== "play" || !this.visitor || this.isHeld() || e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.querySelector(".ig-rules-wrap, .ig-results-wrap")) return;
    const c = CHECKS.find((x) => x.key === e.key);
    if (c) { e.preventDefault(); this.check(c.id); return; }
    const k = e.key.toLowerCase();
    if (k === "m" || k === "n") { e.preventDefault(); this.stamp(k === "m"); }
  }
  onReset() {
    this.visitor = null;
  }
}
