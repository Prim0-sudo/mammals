import { SORT_ICONS } from "../topics/sort-icons.js";
import { LOOK_ALIKES } from "../topics/look-alikes.js";
import {
  shuffle,
  normalise,
  letters,
  mistakeStage,
  makeFlipDeck,
  removeWheelItem,
  stars,
  eligible as eligibleAll,
  supportedCounts,
  takeSession,
  restoreSession,
} from "./logic.js";
import { AudioManager } from "./audio.js";
import { getSkin } from "./skins/index.js";
import { renderScene } from "./theme.js";
import { mountFlyingBugs } from "./flying-bugs.js";
import { createProgress, fromIds } from "./progress.js";
import { kindOf, kindOfLabel } from "../topics/kind-of.js";
import { sortingRules, sortingRule, sortingGroup, sortingPool } from "../topics/sorting.js";
import { familyById, familiesOf, inPick } from "../topics/families.js";
import { DetectiveView, REVEAL_KINDS, REVEAL_TIMES, canSilhouette, createReveal, detectiveChoices } from "./detective.js";
import { drawIcons, setIcon, installHolds, installSettings, installTeacher } from "./shell-controls.js";
import { PhonicsView, PHONICS_SECTIONS } from "./phonics-view.js";
import { MediaView } from "./media-view.js";
import { TOPIC_GAMES } from "../topics/topic-games.js";
import { PlaceholderGameView } from "./placeholder-game-view.js";
import { painted, SCENES, LANDING_SPOTS, spotsReady } from "../topics/painted-art.js";
import { mountScene } from "./layered-scene.js";
import { installPictureZoom, zoomButton } from "./picture-zoom.js";
import { ARTS_SECTIONS, ArtsSectionView } from "./arts-crafts-view.js";
import { normaliseScope, isFiltered, inScope, questionInScope, scopeLabel } from "../topics/curriculum.js";

// The More Topics tile goes back to Ludimi's games list: the app list inside the installed app,
// the website list on ludimi.org, and the public site anywhere else.
function ludimiGamesHref() {
  const { hostname, pathname } = window.location;
  if (/(^|\.)ludimi\.org$/.test(hostname)) return pathname.startsWith("/app/") ? "/app/" : "/games/";
  return "https://ludimi.org/games/";
}
const ROUND_LABELS = { learn: "Word", knowledge: "Question", spelling: "Word", flip: "Matches", wheel: "Words", detective: "Picture" };
// Word-count picker choices per game; counts not smaller than the pool are hidden and All is always offered.
const COUNT_OPTIONS = { identify: [10, 20, 30, 60], spelling: [10, 20, 30] };
const GROUP_TITLES = {
  learn: "Which words shall we meet?",
  wheel: "Which words shall we pick?",
  spelling: "Which words shall we spell?",
};
const FAMILY_TITLES = {
  learn: "Which family shall we meet?",
  wheel: "Which family shall we pick?",
  spelling: "Which family shall we spell?",
};
const START_OVER_MODES = ["identify", "spelling"];
// The Staying Safe card's picture until its own card art arrives.
const KNOWLEDGE_SAFETY_PICTURE = "sniff";
const KNOWLEDGE_ALL_PICTURE = "elephant";
const esc = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
// The Insects jar style waits for a Mammals container drawing; with one style the switch is hidden.
const PICK_STYLES = [["reel", "Picture Reel"]];
const button = (label, action, cls = "button", attrs = "") =>
  `<button class="${cls}" data-action="${action}" ${attrs}>${label}</button>`;

export class GameEngine {
  // progressId names the saved-progress store; tests pass their own so they never touch real saves.
  constructor(topic, { progressId = topic.id } = {}) {
    this.topic = topic;
    this.audio = new AudioManager(topic.locale);
    this.app = document.getElementById("app");
    this.effects = document.getElementById("effects");
    this.timers = new Set();
    this.epoch = 0;
    this.progress = createProgress(progressId);
    // Words and quiz questions are kept apart: 44 questions share an id with a word (nectar, larva…).
    this.lookup = new Map(topic.items.map((x) => [x.id, x]));
    this.questionLookup = new Map(topic.knowledgeQuestions.map((x) => [x.id, x]));
    this.queues = {};
    for (const [key, ids] of Object.entries(this.progress.data.cycles)) {
      const items = fromIds(ids, key.startsWith("knowledge") ? this.questionLookup : this.lookup);
      if (items) this.queues[key] = items;
    }
    this.state = { screen: "launch" };
    this.paused = false;
    this.deferred = [];
    this.reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.detectiveSettings = { kind: "mosaic", duration: 45 };
    // Teacher scope (level, lesson, collection) is kept on this device with the other saves.
    this.scope = normaliseScope(this.progress.data.prefs.scope);
  }
  // Every activity draws its words from here, so the Teacher selection filters them all.
  pool(mode) {
    return eligibleAll(this.topic, mode).filter((item) => inScope(item, this.scope));
  }
  // Applying a new Teacher selection starts every game afresh inside it.
  applyScope(scope) {
    const next = normaliseScope(scope);
    if (Object.keys(next).every((k) => next[k] === this.scope[k])) return false;
    this.returnUnplayed();
    this.scope = next;
    Object.assign(this.progress.data, { rounds: {}, learn: {} });
    this.progress.data.prefs.scope = next;
    this.progress.write();
    return true;
  }
  // Why a game cannot start in the current selection, or null when it can.
  scopeProblem(mode) {
    const words = this.pool(mode).length;
    if (mode === "knowledge") return this.knowledgeQuestions("all").length ? null : "No questions match this selection.";
    if (mode === "sort") return sortingRules.some((r) => r.groups.every((g) => sortingPool(r, this.pool("sort")).some((i) => g.members.includes(i.id)))) ? null : "Sort It needs words in both groups. None of the sorts fit this selection.";
    if (mode === "flip") return words >= 2 ? null : "The matching game needs at least two words.";
    if (["identify", "detective"].includes(mode)) return words >= 3 ? null : "This game needs at least three words to choose from.";
    return words ? null : "There are no words for this game in this selection.";
  }
  scopeEmpty(mode, message) {
    const label = this.topic.modes.find((m) => m.id === mode)?.label || "This game";
    this.shell(label, "", `<div class="scope-empty"><p class="scope-empty__label">${esc(scopeLabel(this.scope, this.topic.subject))}</p><p>${esc(message)}</p><div class="scope-empty__actions">${button("Change selection", "change-scope", "button")}${button("Use all words", "clear-scope", "button button--secondary")}</div></div>`, 0, 0, { setup: true, label: "Teacher selection", listen: false });
    this.bind("change-scope", () => this.teacher.open());
    this.bind("clear-scope", () => { this.applyScope({}); this.teacher.refresh(); this.start(mode); });
    this.focus();
  }
  init() {
    document.getElementById("home").onclick = () => this.launch();
    document.getElementById("mute").onclick = () => this.mute();
    document.getElementById("fullscreen").onclick = () => this.fullscreen();
    document.addEventListener("fullscreenchange", () => {
      document
        .getElementById("fullscreen")
        .setAttribute("aria-pressed", String(!!document.fullscreenElement));
    });
    drawIcons();
    // Every background is layered; the backdrop switches to its painted planes once they are in.
    const backdrop = document.querySelector(".background");
    this.backdrop = backdrop && mountScene(backdrop, "backdrop", { reduced: this.reduced() });
    backdrop?.classList.toggle("is-layered", !!this.backdrop);
    this.holds = installHolds(this);
    this.zoom = installPictureZoom({ root: this.app, holds: this.holds, reduced: this.reduced });
    this.teacher = installTeacher({
      holds: this.holds,
      topic: this.topic,
      words: (scope) => eligibleAll(this.topic, "learn").filter((i) => i.kind === "word" && inScope(i, scope)).length,
      getScope: () => this.scope,
      // A changed selection returns to the games so nothing half-played is left outside it.
      onApply: (scope) => { if (this.applyScope(scope) && this.state.screen !== "launch") this.menu(); },
    });
    this.settings = installSettings({ holds: this.holds, onTeacher: () => this.teacher.open() });
    document.addEventListener("keydown", (e) => this.key(e));
    // Closing or hiding the app mid-round still keeps its place.
    addEventListener("pagehide", () => this.saveRound());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.saveRound();
    });
    document.addEventListener(
      "error",
      (e) => {
        if (e.target.tagName === "IMG") {
          e.target.classList.add("image-unavailable");
          e.target.setAttribute(
            "aria-label",
            e.target.alt || "Picture unavailable",
          );
          this.announce(
            "A picture could not load. Its description is still available.",
          );
        }
      },
      true,
    );
    this.launch();
  }
  clean() {
    this.view?.destroy();
    this.view = null;
    this.motion = [];
    this.letGoFlyers?.();
    this.letGoFlyers = null;
    this.flyers?.destroy();
    this.flyers = null;
    this.flipObserver?.disconnect();
    this.flipObserver = null;
    this.rowObserver?.disconnect();
    this.rowObserver = null;
    getSkin(this.topic.modeSkins.spelling.id).cancel?.(this);
    this.epoch++;
    for (const t of this.timers) clearTimeout(t);
    this.timers.clear();
    this.deferred = [];
    this.audio.stop();
    this.announce("");
    this.app.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    const effects = document.getElementById("effects");
    effects.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    effects.replaceChildren();
  }
  later(fn, ms) {
    const epoch = this.epoch;
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      if (epoch !== this.epoch) return;
      if (this.paused) this.deferred.push({ epoch, fn });
      else fn();
    }, ms);
    this.timers.add(timer);
    return timer;
  }
  // Hidden tabs and open popouts hold the game; delayed steps wait, then carry on.
  setPaused(paused) {
    this.paused = paused;
    this.view?.setPaused(paused);
    this.backdrop?.setHeld(paused);
    for (const a of this.motion || []) if (a.playState !== "finished") paused ? a.pause() : a.play();
    if (paused) {
      this.audio.stop();
      return;
    }
    const waiting = this.deferred.splice(0);
    for (const { epoch, fn } of waiting) if (epoch === this.epoch) fn();
  }
  announce(text) {
    document.getElementById("announcer").textContent = text;
  }
  focus(selector = "h1") {
    const el = this.app.querySelector(selector);
    if (el) {
      if (!el.matches("button")) el.tabIndex = -1;
      el.focus({ preventScroll: true });
    }
  }
  img(item, cls = "art", alt = item.imageAlt || "", attrs = "") {
    return `<img class="${cls}" src="${esc(item.image)}" alt="${esc(alt)}" draggable="false" ${attrs}>`;
  }
  // A big word picture, with an arrow at the body part when the topic marks one (partPointers),
  // and a magnifier that opens it at its full sharp size (picture-zoom.js).
  // The box it sits in gets has-pointer, which lets the arrow find the square picture inside it.
  picture(item, cls) {
    const p = this.topic.partPointers?.[item.id];
    if (!p) return { box: " has-zoom", html: this.img(item, cls) + zoomButton() };
    const arrow = `<span class="part-pointer" style="--x:${p[0]};--y:${p[1]};--a:${p[2]}deg" aria-hidden="true"><svg viewBox="0 0 100 28"><path d="M5 14H70" stroke="#fff" stroke-width="15" stroke-linecap="round"/><path d="M64 2 98 14 64 26Z" fill="#fff" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><path d="M5 14H70" stroke="#1f5a3d" stroke-width="8" stroke-linecap="round"/><path d="M67 6 94 14 67 22Z" fill="#1f5a3d"/></svg></span>`;
    return { box: " has-pointer has-zoom", html: this.img(item, cls) + arrow + zoomButton() };
  }
  bind(action, fn) {
    this.app
      .querySelectorAll(`[data-action="${action}"]`)
      .forEach((el) => (el.onclick = () => fn(el)));
  }
  // Leaving a game keeps its place: the unfinished round is saved on the device.
  returnUnplayed() {
    this.saveRound();
  }
  saveCycles() {
    const cycles = {};
    for (const [key, items] of Object.entries(this.queues)) cycles[key] = items.map((x) => x.id);
    this.progress.data.cycles = cycles;
    this.progress.write();
  }
  // Snapshot of the round in play, as ids. Finished or not-yet-started rounds are not saved.
  saveRound() {
    const s = this.state, data = this.progress.data;
    if (s.screen !== "game" || s.stage !== "play" || !s.items?.length) return;
    const ids = (list) => list.map((x) => x.id);
    if (s.mode === "learn") {
      if (s.category) data.learn[s.category] = s.index;
    } else if (s.mode === "flip") {
      if (s.matches >= s.items.length) return;
      data.rounds.flip = { count: s.flipCount, turns: s.turns || 0, tiles: s.tiles.map((t) => [t.id, t.item.id, !!t.matched]) };
    } else if (s.mode === "wheel") {
      if (!s.remaining?.length) return;
      data.rounds.wheel = {
        category: s.category, score: s.score, batch: s.batch,
        remaining: ids(s.remaining), pool: ids(s.wheelPool),
        selected: s.spinning ? null : s.selected?.id || null,
      };
    } else {
      const done = s.answered || (s.spellingStatus && !s.animating) ? 1 : 0;
      const index = s.index + done;
      if (index >= s.items.length) return;
      data.rounds[s.mode] = {
        category: s.category || null, count: s.count ?? null, queueKey: s.queueKey || s.mode,
        items: ids(s.items), index, score: s.score,
      };
    }
    this.progress.write();
  }
  dropRound(mode) {
    delete this.progress.data.rounds[mode];
    this.progress.write();
  }
  hasSavedRound(mode) {
    if (mode === "learn") return Object.values(this.progress.data.learn).some((i) => i > 0);
    return !!this.progress.data.rounds[mode];
  }
  launch() {
    this.returnUnplayed();
    this.clean();
    this.state = { screen: "launch" };
    document.getElementById("home").hidden = true;
    this.app.className = "launch-screen";
    const emblem = this.topic.launch.emblem;
    // The painted Explore emblem from the landing brief replaces the bee badge once it is in.
    const paintedEmblem = painted("landing/emblem");
    const emblemMarkup = paintedEmblem
      ? `<img class="launch-emblem-image" src="${esc(paintedEmblem)}" alt="${esc(emblem?.paintedAlt || emblem?.imageAlt || this.topic.launch.logoAlt || "")}">`
      : emblem
      ? `<div class="launch-emblem" role="img" aria-label="${esc(emblem.imageAlt)}"><div class="launch-bee"><img class="launch-bee-base" src="${esc(emblem.baseImage)}" alt="">${emblem.wings.map((wing) => `<span class="launch-wing ${esc(wing.className)}"><img src="${esc(wing.image)}" alt=""></span>`).join("")}</div></div>`
      : `<img class="launch-emblem-image" src="${esc(this.topic.launch.logoImage)}" alt="${esc(this.topic.launch.logoAlt)}">`;
    // User's four preview markers, relative to the launch area at 1330 × 902.
    const markedSparkles = [
      [68.365, 71.307, 0],
      [75.437, 66.586, -1.6],
      [88.441, 64.528, -3.2],
      [78.175, 53.874, -4.8],
    ].map(([left, top, delay]) =>
      `<svg class="marked-sparkle water-stars" viewBox="-10 -10 20 20" style="left:${left}%;top:${top}%"><g class="water-star" style="animation-delay:${delay}s"><path d="M0-8 C1-2.5 2.5-1 8 0 C2.5 1 1 2.5 0 8 C-1 2.5-2.5 1-8 0 C-2.5-1-1-2.5 0-8Z"/><circle r="1.7"/></g></svg>`
    ).join("");
    this.app.innerHTML =
      renderScene(this.topic.launch.scene, esc) +
      '<div class="launch-atmosphere" aria-hidden="true">' +
      '<i class="firefly firefly--one"></i><i class="firefly firefly--two"></i>' +
      '<i class="firefly firefly--three"></i><i class="firefly firefly--four"></i>' +
      '<svg class="water-reflections" viewBox="0 0 540 250" preserveAspectRatio="none">' +
      '<defs><linearGradient id="water-light"><stop stop-color="#e9ffff" stop-opacity="0"/><stop offset=".38" stop-color="#f3fff3" stop-opacity=".78"/><stop offset=".58" stop-color="#fff8df" stop-opacity=".88"/><stop offset="1" stop-color="#efffff" stop-opacity="0"/></linearGradient></defs>' +
      '<g class="water-waves"><path d="M88 55 Q138 47 181 55 T276 53"/><path d="M222 88 Q275 80 326 88 T434 84"/><path d="M121 123 Q169 116 212 123 T306 120"/><path d="M260 157 Q310 149 357 156 T464 153"/><path d="M155 193 Q203 185 249 192 T346 190"/></g>' +
      '<g class="water-glints"><path d="M88 55 Q138 47 181 55 T276 53"/><path d="M222 88 Q275 80 326 88 T434 84"/><path d="M121 123 Q169 116 212 123 T306 120"/><path d="M260 157 Q310 149 357 156 T464 153"/><path d="M155 193 Q203 185 249 192 T346 190"/></g>' +
      '<g class="water-points"><circle cx="425" cy="62" r="1.8"/><circle cx="475" cy="130" r="1.4"/><circle cx="390" cy="203" r="1.6"/></g>' +
      '<g class="water-stars"><g transform="translate(500 54)" class="water-star"><path d="M0-8 C1-2.5 2.5-1 8 0 C2.5 1 1 2.5 0 8 C-1 2.5-2.5 1-8 0 C-2.5-1-1-2.5 0-8Z"/><circle r="1.7"/></g>' +
      '<g transform="translate(492 150)" class="water-star"><path d="M0-6 C.8-2 2-1 6 0 C2 1 .8 2 0 6 C-.8 2-2 1-6 0 C-2-1-.8-2 0-6Z"/><circle r="1.3"/></g>' +
      '<g transform="translate(423 218)" class="water-star"><path d="M0-7 C.9-2.2 2.2-.9 7 0 C2.2 .9 .9 2.2 0 7 C-.9 2.2-2.2 .9-7 0 C-2.2-.9-.9-2.2 0-7Z"/><circle r="1.5"/></g></g></svg>' +
      markedSparkles + '</div>' +
      // Spec section 3: title, tagline pill, one round Explore button holding the emblem.
      '<section class="launch-composition" aria-labelledby="launch-title">' +
      '<h1 class="launch-title" id="launch-title">' +
      esc(this.topic.title) +
      '</h1><span class="launch-tagline">' +
      esc(this.topic.subject || this.topic.subtitle) +
      '</span><button class="launch-explore" data-action="launch" aria-label="' +
      esc(`${this.topic.text.launchPrompt || "Explore"} ${this.topic.title}`) +
      '">' +
      emblemMarkup +
      "<strong>" +
      esc(this.topic.text.launchPrompt || "Explore") +
      "</strong><span>" +
      esc(this.topic.text.launchHint || "Choose an activity") +
      "</span></button></section>";
    this.bind("launch", () => this.menu());
    if (this.topic.launch.flyingBugs) {
      // Once the landing spots are measured the fliers visit them, riding the plane the spots are on.
      const layer = LANDING_SPOTS.layer;
      const plane = spotsReady() && this.backdrop?.root.querySelector(`[data-layer="${layer.split("/").pop()}"]`);
      this.flyers = mountFlyingBugs(this.app, this.topic.launch.flyingBugs, plane ? { spots: { ...LANDING_SPOTS, plane } } : {});
      this.flyers.ready.catch(error => console.warn("Landing animation unavailable", error));
      if (plane) this.letGoFlyers = this.backdrop.attach(this.flyers.layer, SCENES.backdrop.layers.find(([id]) => id === layer)?.[1] ?? 0.5);
    }
    this.focus('[data-action="launch"]');
  }
  // Home: featured game banner, then the eight tiles (blueprint v6.1).
  menu(focusId) {
    this.returnUnplayed();
    this.clean();
    this.state = { screen: "menu" };
    document.getElementById("home").hidden = false;
    this.app.className = "menu-screen home-screen";
    const m = this.topic.menu,
      f = m.featured;
    const tile = (t) => {
      const inner = `<span class="tile-art"><img src="${esc(t.image)}" alt="" draggable="false"></span><strong>${esc(t.label)}</strong>${this.badge(t.id)}`;
      return t.id === "more"
        ? `<a class="home-tile home-tile--more" href="${esc(ludimiGamesHref())}" target="_top" data-tile="more">${inner}</a>`
        : `<button class="home-tile" type="button" data-tile="${t.id}">${inner}</button>`;
    };
    this.app.innerHTML = `<h1 class="home-title">${esc(m.title)}</h1><button class="featured-game" type="button" data-tile="${esc(f.target)}"><span class="featured-art"><img src="${esc(f.image)}" alt="" draggable="false"></span><span class="featured-copy"><strong>${esc(f.title)}</strong><span>${esc(f.subtitle)}</span></span></button><div class="home-grid">${m.tiles.map(tile).join("")}</div>`;
    this.app
      .querySelectorAll("button[data-tile]")
      .forEach((el) => (el.onclick = () => this.openTile(el.dataset.tile)));
    this.focus(focusId ? `.home-grid [data-tile="${focusId}"]` : "h1");
  }
  // SCREEN-SPEC: a saved game shows a "Continue" badge top-right on its tile.
  badge(mode) {
    return this.hasSavedRound(mode) ? '<span class="continue-badge">Continue</span>' : "";
  }
  openTile(id) {
    if (id === "activities") this.activities();
    else if (id === "phonics") this.phonics();
    else if (id === "media") this.media();
    else if (id === "games") this.games();
    else if (id === "arts") this.arts();
    else if (TOPIC_GAMES.some((g) => g.id === id)) this.games(id);
    else if (this.topic.modes.some((x) => x.id === id)) this.start(id);
    else this.hub(id);
  }
  // Activities folder: the six standard games. Leaving a game comes back here.
  activities(focusMode) {
    this.returnUnplayed();
    this.clean();
    this.state = { screen: "activities" };
    document.getElementById("home").hidden = false;
    this.app.className = "menu-screen folder-screen";
    const modes = this.topic.menu.activities.map((id) =>
      this.topic.modes.find((x) => x.id === id),
    );
    this.app.innerHTML = `<div class="folder-heading">${button("Games", "back", "back-button", 'data-icon="previous"')}<h1>Activities</h1></div><div class="folder-grid">${modes.map((x) => `<button class="home-tile folder-tile" type="button" data-mode="${x.id}" aria-label="${esc(`${x.label}. ${x.description}`)}"><span class="tile-art"><img src="${esc(x.image)}" alt="" draggable="false"></span><strong>${esc(x.label)}</strong>${this.badge(x.id)}</button>`).join("")}</div>`;
    drawIcons(this.app);
    this.bind("back", () => this.menu("activities"));
    this.app
      .querySelectorAll("[data-mode]")
      .forEach((el) => (el.onclick = () => this.start(el.dataset.mode)));
    this.focus(focusMode ? `[data-mode="${focusMode}"]` : "h1");
  }
  // Parts still being built show an honest note, never a pretend game.
  hub(id) {
    this.returnUnplayed();
    this.clean();
    const h = this.topic.menu.hubs[id];
    const parent = this.parentOf(id);
    this.state = { screen: "hub", hub: id, parent };
    document.getElementById("home").hidden = false;
    this.app.className = "game-screen";
    this.app.innerHTML = `<div class="game-toolbar">${button(parent === "activities" ? "Activities" : "Games", "back", "back-button", 'data-icon="previous"')}<div class="toolbar-progress"><span class="round-pill">${esc(h.label)}</span></div></div><section class="game-card"><div class="card-heading"><h1>${esc(h.title)}</h1></div><div class="hub-empty"><p>${esc(h.note)}</p></div></section>`;
    drawIcons(this.app);
    this.bind("back", () => this.back());
    this.focus();
  }
  // Phonics & Sight Words: the six-tile menu, or one section (alphabet, blends, families...).
  phonics(section = null) {
    this.returnUnplayed();
    this.clean();
    this.state = { screen: "game", mode: "phonics", section, stage: "setup", score: 0 };
    document.getElementById("home").hidden = false;
    const title = section ? PHONICS_SECTIONS.find((x) => x.id === section).label : this.topic.menu.hubs.phonics.title;
    this.shell(title, "", '<div class="phonics-root"></div>', 0, 0, { setup: true, label: section ? "Phonics" : "Reading practice", listen: false });
    this.app.querySelector(".game-card").classList.add("phonics-card");
    this.view = new PhonicsView(this, this.app.querySelector(".phonics-root"), section);
    this.focus();
  }
  // Media: Printables and the whole-topic Presentation (its tabs re-render this screen).
  media() {
    this.returnUnplayed();
    this.clean();
    this.state = { screen: "game", mode: "media", stage: "setup", score: 0 };
    document.getElementById("home").hidden = false;
    this.shell("Media", "", '<div class="media-root"></div>', 0, 0, { setup: true, label: "", listen: false });
    this.app.querySelector(".game-card").classList.add("media-card");
    this.view = new MediaView(this, this.app.querySelector(".media-root"));
    this.focus();
  }
  // Mammal Games and Arts & Crafts choosers: three big cards inside the game card, with the
  // The card title names the section, so the round label stays empty (no name shown twice).
  chooser(title, cards) {
    this.app.className = "game-screen chooser-screen";
    const card = (c) => `<button class="choice-card" type="button" ${c.data} aria-label="${esc(`${c.title}. ${c.line}`)}"><span class="choice-card__art"><img src="${esc(c.art)}" alt="" draggable="false"></span><strong>${esc(c.title)}</strong></button>`;
    this.app.innerHTML = `<div class="game-toolbar">${button("Games", "back", "back-button", 'data-icon="previous"')}<div class="toolbar-progress"><span class="round-pill"></span></div></div><section class="game-card chooser-card"><div class="card-heading"><h1>${esc(title)}</h1></div><div class="choice-cards">${cards.map(card).join("")}</div></section>`;
    drawIcons(this.app);
  }
  // Mammal Games: the folder of three topic games, or one game. Each game's view runs its own
  // level picker, play and results; Back steps out through them, then to this folder.
  games(id = null, focusId = null) {
    this.returnUnplayed();
    this.clean();
    document.getElementById("home").hidden = false;
    if (!id) {
      this.state = { screen: "topic-games" };
      this.chooser("Mammal Games", TOPIC_GAMES.map((g) => ({ data: `data-game="${g.id}"`, title: g.title, line: g.line, art: painted(`games/card-${g.id}`) || this.topic.items.find((x) => x.id === g.image)?.image || "" })));
      this.bind("back", () => this.menu("games"));
      this.app.querySelectorAll("[data-game]").forEach((el) => (el.onclick = () => this.games(el.dataset.game)));
      this.focus(focusId ? `[data-game="${focusId}"]` : "h1");
      return;
    }
    const g = TOPIC_GAMES.find((x) => x.id === id);
    this.state = { screen: "game", mode: "games", game: id, stage: "setup", score: 0 };
    this.shell(g.title, "", '<div class="ig-root"></div>', 0, 0, { setup: true, label: g.kind, listen: false });
    this.app.querySelector(".game-card").classList.add("ig-card", `ig-card--${id}`);
    const View = g.pending ? PlaceholderGameView : { }[id];
    this.view = new View(this, this.app.querySelector(".ig-root"), g);
    this.focus();
  }
  // Arts & Crafts: the folder of three sections (Arts & Sheets, Draw & Trace, Crafts), or one section.
  arts(section = null, focusId = null) {
    this.returnUnplayed();
    this.clean();
    document.getElementById("home").hidden = false;
    if (!section) {
      this.state = { screen: "arts-folder" };
      this.chooser("Arts & Crafts", ARTS_SECTIONS.map((x) => ({ data: `data-arts="${x.id}"`, title: x.title, line: x.line, art: x.art || this.topic.items.find((i) => i.id === x.image)?.image || "" })));
      this.bind("back", () => this.menu("arts"));
      this.app.querySelectorAll("[data-arts]").forEach((el) => (el.onclick = () => this.arts(el.dataset.arts)));
      this.focus(focusId ? `[data-arts="${focusId}"]` : "h1");
      return;
    }
    const x = ARTS_SECTIONS.find((a) => a.id === section);
    this.state = { screen: "game", mode: "arts", section, stage: "setup", score: 0 };
    this.shell(x.title, "", '<div class="arts-root"></div>', 0, 0, { setup: true, label: "", listen: false });
    this.app.querySelector(".game-card").classList.add("arts-card", `arts-card--${section}`);
    this.view = new ArtsSectionView(this, this.app.querySelector(".arts-root"), section);
    this.refreshBack();
    this.focus();
  }
  // The named Back button follows the screen inside a game (Levels, then Mammal Games).
  refreshBack() {
    const b = this.app.querySelector('.game-toolbar [data-action="back"]');
    if (b?.lastChild) b.lastChild.textContent = this.backLabel();
  }
  // Best results per game and level, kept on this device.
  gameBest(game) {
    const all = (this.progress.data.prefs.topicGames ||= {});
    return (all[game] ||= {});
  }
  saveGameBest(game, level, value) {
    const best = this.gameBest(game);
    if (!(value > (best[level] || 0))) return false;
    best[level] = value;
    this.progress.write();
    return true;
  }
  parentOf(mode) {
    return this.topic.menu.activities.includes(mode) ? "activities" : "menu";
  }
  leaveTo(mode) {
    if (this.parentOf(mode) === "activities") this.activities(mode);
    else this.menu(mode);
  }
  start(mode) {
    this.returnUnplayed();
    if (this.topic.modes.find((m) => m.id === mode)?.pending) {
      this.hub(mode);
      return;
    }
    this.clean();
    const problem = this.scopeProblem(mode);
    this.state = {
      screen: "game",
      mode,
      score: 0,
      index: 0,
      items: [],
      category: null,
      answered: false,
      wrong: false,
      showTarget: true,
      showAnswers: true,
    };
    if (problem) this.scopeEmpty(mode, problem);
    else if (GROUP_TITLES[mode]) this.categories();
    else if (mode === "flip") this.flipSetup();
    else if (mode === "sort") this.sortSetup();
    else if (mode === "detective") this.detectiveSetup();
    else if (mode === "knowledge") this.knowledgeGroups();
    else this.wordCount();
    this.focus();
  }
  // Game frame: one toolbar (named Back, progress, score), then the game card.
  // listen: text the Listen button reads (defaults to the title; false hides it).
  // hiddenTitle keeps the heading for screen readers and focus when the spec shows no title.
  shell(title, helper = "", content = "", current = 0, total = 0, { setup = false, label = "Choose", listen, hiddenTitle = false } = {}) {
    const s = this.state;
    this.app.className = "game-screen";
    const word = ROUND_LABELS[s.mode] || "Round";
    // Word-count and choice pickers show only Back (spec section 5), like Plants.
    const progress = setup
      ? (content.includes('class="count-options"') ? "" : `<span class="round-pill">${esc(label)}</span>`)
      : `<span class="round-pill" id="round-count">${word} ${current}/${total}</span><div class="progress" role="progressbar" aria-label="Activity progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${total ? Math.round((current / total) * 100) : 0}"><span style="width:${total ? (current / total) * 100 : 0}%"></span></div>`;
    const score = setup ? "" : `<span class="score" aria-label="${s.score} stars">★ <b>${s.score}</b></span>`;
    const startOver = !setup && s.stage === "play" && START_OVER_MODES.includes(s.mode)
      ? button("Start over", "start-over", "start-over")
      : "";
    const spoken = listen === undefined ? title : listen;
    const chip = setup && s.mode !== "phonics" && isFiltered(this.scope) ? `<p class="scope-chip"><span class="sr-only">Teacher selection: </span>${esc(scopeLabel(this.scope, this.topic.subject))}</p>` : "";
    const listenButton = spoken ? button("Listen", "listen", "listen-button", `aria-label="${Array.isArray(spoken) ? "Listen to the word and its meaning" : "Listen to the instructions"}"`) : "";
    this.app.innerHTML = `<div class="game-toolbar">${button(esc(this.backLabel()), "back", "back-button", 'data-icon="previous"')}<div class="toolbar-progress">${progress}</div>${startOver}${score}</div><section class="game-card game-panel" data-game="${s.mode}"><div class="card-heading game-heading${listenButton ? " has-listen" : ""}${hiddenTitle ? " title-hidden" : ""}"><h1${hiddenTitle ? ' class="sr-only"' : ""}>${esc(title)}</h1>${helper ? `<p>${esc(helper)}</p>` : ""}${listenButton}</div>${chip}<div id="content">${content}</div><div id="feedback" class="feedback" role="status" aria-live="polite"></div></section>`;
    drawIcons(this.app);
    this.bind("back", () => this.back());
    if (spoken) this.bind("listen", () => this.audio.speak(spoken));
    if (startOver) this.bind("start-over", (el) => this.startOver(el));
  }
  // Start over needs two taps within three seconds; the second clears the game's cycle.
  startOver(el) {
    if (!el.classList.contains("armed")) {
      el.classList.add("armed");
      el.textContent = "Tap again";
      this.later(() => {
        if (!el.isConnected) return;
        el.classList.remove("armed");
        el.textContent = "Start over";
      }, 3000);
      return;
    }
    const s = this.state;
    s.sessionKind = null;
    delete this.queues[s.queueKey || s.mode];
    this.saveCycles();
    this.dropRound(s.mode);
    this.beginSession(s.count);
  }
  backLabel() {
    const s = this.state;
    if (s.mode === "phonics") return s.section ? "Phonics" : "Games";
    if (s.mode === "media") return "Games";
    if (s.mode === "games") return this.view?.backLabel?.() || "Mammal Games";
    if (s.mode === "arts") return this.view?.backLabel?.() || "Arts & Crafts";
    if (s.stage === "play" && COUNT_OPTIONS[s.mode]) return "Word count";
    if (s.stage === "play" && s.mode === "sort") return "Sorting rules";
    if (s.stage === "play" && s.mode === "knowledge") return "Categories";
    if (s.stage === "families") return "Categories";
    const fromFamilies = s.category && (familyById(s.category) || this.familyList(s.category).length);
    if (s.stage === "count" && GROUP_TITLES[s.mode]) return fromFamilies ? "Families" : "Categories";
    if (s.category && (s.mode === "learn" || s.mode === "wheel")) return fromFamilies ? "Families" : "Categories";
    return this.parentOf(s.mode) === "activities" ? "Activities" : "Games";
  }
  back() {
    const s = this.state;
    if (s.mode === "games") {
      if (this.view?.back?.()) return;
      this.games(null, s.game);
      return;
    }
    if (s.mode === "arts") {
      if (this.view?.back?.()) return;
      this.arts(null, s.section);
      return;
    }
    if (s.mode === "phonics" && s.section) {
      const id = s.section;
      this.phonics();
      this.focus(`[data-phonics="${id}"]`);
      return;
    }
    if (s.screen === "game" && s.stage === "play" && COUNT_OPTIONS[s.mode]) {
      this.returnUnplayed();
      this.clean();
      this.wordCount();
      return;
    }
    if (s.screen === "game" && s.stage === "play" && s.mode === "knowledge") {
      const id = s.category;
      this.returnUnplayed();
      this.clean();
      this.knowledgeGroups();
      this.focus(`[data-knowledge-group="${id}"]`);
      return;
    }
    if (s.screen === "game" && s.stage === "play" && s.mode === "sort") {
      const id = s.category;
      this.returnUnplayed();
      this.clean();
      this.sortSetup();
      this.focus(`[data-sort-rule="${id}"]`);
      return;
    }
    if (s.screen === "game" && s.stage === "families") {
      const id = s.familyGroup;
      this.clean();
      this.categories();
      this.focus(`[data-category="${id}"]`);
      return;
    }
    if (s.screen === "game" && s.stage === "count" && GROUP_TITLES[s.mode]) {
      this.backToPicker(s.category);
      return;
    }
    if (s.screen === "hub") {
      if (s.parent === "activities") this.activities(s.hub);
      else this.menu(s.hub);
      return;
    }
    if (s.screen === "results") {
      this.leaveTo(s.mode);
      return;
    }
    if (s.category && (s.mode === "learn" || s.mode === "wheel")) {
      const id = s.category;
      s.score = 0;
      s.items = [];
      s.index = 0;
      this.backToPicker(id);
    } else this.leaveTo(s.mode);
  }
  // Group picker: All Words first, then the groups in teaching order, as picture cards.
  categories() {
    const s = this.state;
    s.stage = "groups";
    const pool = this.pool(s.mode);
    const allImage = (s.mode === "wheel" && this.topic.pickAllImage) || this.topic.menu.tiles.find((t) => t.id === "learn")?.image || this.topic.categories[0].image;
    const list = [
      { id: "all", label: "All Words", image: allImage, imageAlt: "", count: pool.length },
      ...this.topic.categories.map((c) => ({
        ...c,
        count: pool.filter((i) => i.categoryId === c.id).length,
      })),
    ].filter((c) => c.count > 0 || (this.topic.showEmptyGroups && c.id !== "all"));
    // A group whose words are not drawn yet shows as a "Coming soon" card that cannot be chosen
    // (topic.showEmptyGroups, Mammals 21 November 2026), so the picker keeps its final layout.
    const cards = list
      .map(
        (c) =>
          c.count
            ? `<button class="category-card" data-category="${c.id}"><span class="category-icon">${this.img(c, "category-art", "")}</span><strong>${esc(c.label)}</strong><span class="count-pill">${c.count}<span class="count-unit"> ${c.count === 1 ? "word" : "words"}</span></span></button>`
            : `<button class="category-card category-card--soon" type="button" disabled aria-label="${esc(c.label)}: coming soon"><span class="category-icon">${c.image ? this.img(c, "category-art", "") : ""}</span><strong>${esc(c.label)}</strong><span class="count-pill">Coming soon</span></button>`,
      )
      .join("");
    this.shell(
      GROUP_TITLES[s.mode],
      "",
      `<div class="picker-layout"><div class="category-grid">${cards}</div></div>`,
      0,
      0,
      { setup: true, label: `Groups 0/${list.length - 1}` },
    );
    this.centreLastRow();
    this.app
      .querySelectorAll("[data-category]")
      .forEach(
        (el) => (el.onclick = () => (this.familyList(el.dataset.category).length ? this.familyPicker(el.dataset.category) : this.chooseCategory(el.dataset.category))),
      );
    this.focus();
  }
  // Families with words in play for a teaching group (Meet the Mammals, Other Animals).
  familyList(groupId) {
    const pool = this.pool(this.state.mode);
    return familiesOf(groupId)
      .map((f) => ({ ...f, count: pool.filter((i) => f.members.includes(i.id)).length }))
      .filter((f) => f.count > 0);
  }
  // Second layer: "All Mammals" first, then each family as a picture card.
  familyPicker(groupId) {
    this.clean();
    const s = this.state;
    s.stage = "families";
    s.category = null;
    s.familyGroup = groupId;
    const group = this.topic.categories.find((c) => c.id === groupId);
    const total = this.pool(s.mode).filter((i) => i.categoryId === groupId).length;
    const card = (id, label, picture, count) =>
      `<button class="category-card" data-family="${id}"><span class="category-icon">${picture ? this.img(picture, "category-art", "") : ""}</span><strong>${esc(label)}</strong><span class="count-pill">${count}<span class="count-unit"> ${count === 1 ? "word" : "words"}</span></span></button>`;
    const list = this.familyList(groupId);
    const cards = [card(groupId, `All ${group.label.replace(/^Meet the /, "")}`, group, total), ...list.map((f) => card(f.id, f.label, this.lookup.get(f.imageId), f.count))].join("");
    this.shell(FAMILY_TITLES[s.mode], "", `<div class="picker-layout"><div class="category-grid">${cards}</div></div>`, 0, 0, { setup: true, label: `Families 0/${list.length}` });
    this.centreLastRow();
    this.app.querySelectorAll("[data-family]").forEach((el) => (el.onclick = () => this.chooseCategory(el.dataset.family)));
    this.focus();
  }
  // Back from a game to the picker it came from: the family picker for a family or one of the
  // two animal groups, otherwise the group picker.
  backToPicker(id) {
    const parent = familyById(id)?.groupId || (this.familyList(id).length ? id : null);
    this.clean();
    const s = this.state;
    s.category = null;
    if (parent) {
      this.familyPicker(parent);
      this.focus(`[data-family="${id}"]`);
    } else {
      this.categories();
      this.focus(id === "all" ? '[data-category="all"]' : `[data-category="${id}"]`);
    }
  }
  chooseCategory(id) {
    this.clean();
    const s = this.state;
    s.category = id;
    if (COUNT_OPTIONS[s.mode]) {
      this.wordCount();
      this.focus();
      return;
    }
    s.stage = "play";
    s.items = this.pool(s.mode).filter((i) => inPick(i, id));
    s.index = 0;
    s.score = 0;
    if (s.mode === "wheel") {
      s.remaining = [...s.items];
      s.batch = 1;
      s.totalBatches = Math.ceil(
        s.items.length / this.topic.sessions.wheel.capacity,
      );
      s.selected = null;
      this.newWheelBatch();
      const saved = this.progress.data.rounds.wheel;
      if (saved) {
        const remaining = fromIds(saved.remaining, this.lookup), pool = fromIds(saved.pool, this.lookup);
        if (saved.category === id && remaining?.length && pool) {
          Object.assign(s, {
            remaining, score: saved.score || 0, batch: saved.batch || 1,
            wheelPool: pool.length ? pool : remaining.slice(0, this.topic.sessions.wheel.capacity),
            selected: saved.selected ? this.lookup.get(saved.selected) || null : null,
          });
        } else this.dropRound("wheel");
      }
      this.wheel();
    } else {
      // Meet the Words: reopening a group resumes at its last card.
      if (s.mode === "learn") {
        s.index = Math.min(Math.max(0, this.progress.data.learn[id] | 0), s.items.length - 1);
        s.score = s.index;
      }
      this.round();
    }
    this.focus();
  }
  // The words this game draws from: the chosen group for spelling, otherwise every eligible word.
  sessionPool() {
    const s = this.state,
      pool = this.pool(s.mode);
    if (s.mode === "sort") return sortingPool(sortingRule(s.category), pool);
    if (s.mode === "detective") return s.category === "outline" ? pool.filter(canSilhouette) : pool;
    return s.category && s.category !== "all" ? pool.filter((i) => inPick(i, s.category)) : pool;
  }
  // "How many words?": picture cards for each count smaller than the pool, then All.
  wordCount() {
    const s = this.state;
    s.stage = "count";
    s.score = 0;
    const pool = this.sessionPool();
    const counts = COUNT_OPTIONS[s.mode].filter((n) => n < pool.length);
    const art = (i) => {
      const item = pool[i % pool.length];
      return `<span class="count-art" aria-hidden="true"><span class="count-art__back"></span><span class="count-art__front">${this.img(item, "count-art__img", "")}</span></span>`;
    };
    const card = (n, i) =>
      button(
        `${art(i)}<strong>${n === "all" ? `All ${pool.length} words` : `${n} words`}</strong><span>${n === "all" ? "The whole set" : "Picked at random"}</span>`,
        "count",
        "count-card",
        `data-count="${n}"`,
      );
    this.shell(
      "How many words?",
      "",
      `<div class="count-options">${[...counts, "all"].map(card).join("")}</div>`,
      0,
      0,
      { setup: true },
    );
    this.bind("count", (el) => this.beginSession(el.dataset.count === "all" ? "all" : +el.dataset.count));
    this.focus();
  }
  beginSession(count) {
    this.clean();
    const s = this.state,
      pool = this.sessionPool();
    s.stage = "play";
    s.count = count;
    s.index = 0;
    s.score = 0;
    s.queueKey = (s.category && s.category !== "all" ? `${s.mode}:${s.category}` : s.mode) + (isFiltered(this.scope) ? `@${Object.values(this.scope).join(".")}` : "");
    s.sessionPool = pool;
    // Same group and count as the saved round: pick it up where it was left.
    const saved = this.progress.data.rounds[s.mode];
    if (saved) {
      const items = fromIds(saved.items, this.lookup);
      if (items && saved.category === (s.category || null) && saved.count === count && saved.index < items.length) {
        Object.assign(s, { items, index: saved.index, score: saved.score || 0, sessionKind: "saved" });
        this.round();
        this.focus();
        return;
      }
      // A different setup: the unplayed words go back into their cycle first.
      if (items && saved.count !== "all") {
        const key = saved.queueKey || s.mode;
        this.queues[key] = restoreSession(items.slice(saved.index), this.queues[key] || []);
      }
      this.dropRound(s.mode);
    }
    const all = count === "all" || count >= pool.length;
    const session = all ? { items: shuffle(pool) } : takeSession(pool, count, this.queues[s.queueKey]);
    if (!all) this.queues[s.queueKey] = session.remaining;
    this.saveCycles();
    s.items = session.items;
    s.sessionKind = all ? "all" : "short";
    this.round();
    this.focus();
  }
  // Picker grids use two tracks per card, so an unfinished last row can start half a card in
  // and sit centred (house rule). Re-run when a breakpoint changes the column count.
  centreLastRow() {
    const grid = this.app.querySelector(".category-grid");
    if (!grid) return;
    const fit = () => {
      const cards = [...grid.children];
      cards.forEach((c) => (c.style.gridColumnStart = ""));
      const cols = Math.floor(getComputedStyle(grid).gridTemplateColumns.split(" ").length / 2);
      const left = cols ? cards.length % cols : 0;
      if (left) cards[cards.length - left].style.gridColumnStart = String(cols - left + 1);
    };
    fit();
    if (typeof ResizeObserver === "function") {
      this.rowObserver?.disconnect();
      this.rowObserver = new ResizeObserver(fit);
      this.rowObserver.observe(grid);
    }
  }
  // Knowledge & Safety: All Questions, Staying Safe, then each word group that has questions.
  knowledgeQuestions(id) {
    const all = this.topic.knowledgeQuestions.filter((q) => questionInScope(q, this.scope, this.lookup));
    if (id === "all") return all;
    if (id === "safety") return all.filter((q) => q.safe);
    return all.filter((q) => q.groupId === id);
  }
  knowledgeGroups() {
    const s = this.state;
    s.stage = "groups";
    s.category = null;
    const picture = (id) => this.topic.items.find((x) => x.id === id);
    const allImage = this.topic.menu.tiles.find((t) => t.id === "knowledge")?.image || picture(KNOWLEDGE_ALL_PICTURE)?.image;
    const list = [
      { id: "all", label: "All Questions", image: allImage, count: this.knowledgeQuestions("all").length },
      { id: "safety", label: "Staying Safe", image: this.topic.knowledgeSafetyImage || picture(KNOWLEDGE_SAFETY_PICTURE)?.image, count: this.knowledgeQuestions("safety").length },
      ...this.topic.categories.map((c) => ({ ...c, count: this.knowledgeQuestions(c.id).length })),
    ].filter((c) => c.count > 0 && c.image);
    const saved = this.progress.data.rounds.knowledge;
    const cards = list
      .map(
        (c) =>
          `<button class="category-card" data-knowledge-group="${c.id}"><span class="category-icon">${this.img(c, "category-art", "")}</span><strong>${esc(c.label)}</strong><span class="count-pill">${c.count}<span class="count-unit"> ${c.count === 1 ? "question" : "questions"}</span></span>${saved?.category === c.id ? '<span class="continue-badge">Continue</span>' : ""}</button>`,
      )
      .join("");
    this.shell(
      "Which questions shall we try?",
      "",
      `<div class="picker-layout"><div class="category-grid">${cards}</div></div>`,
      0,
      0,
      { setup: true, label: `Groups 0/${list.length - 1}` },
    );
    this.centreLastRow();
    this.app
      .querySelectorAll("[data-knowledge-group]")
      .forEach((el) => (el.onclick = () => this.chooseKnowledgeGroup(el.dataset.knowledgeGroup)));
    this.focus();
  }
  // Every question in the group, shuffled; the same group picks up where it was left.
  chooseKnowledgeGroup(id) {
    this.clean();
    const s = this.state,
      saved = this.progress.data.rounds.knowledge,
      items = saved && fromIds(saved.items, this.questionLookup);
    Object.assign(s, { category: id, stage: "play", index: 0, score: 0 });
    if (items && saved.category === id && saved.index < items.length) {
      Object.assign(s, { items, index: saved.index, score: saved.score || 0 });
    } else {
      if (saved) this.dropRound("knowledge");
      s.items = shuffle(this.knowledgeQuestions(id));
    }
    this.round();
    this.focus();
  }
  round() {
    const s = this.state;
    s.answered = false;
    s.wrong = false;
    this.saveRound();
    const item = s.items[s.index];
    if (s.mode === "learn") this.learn(item);
    if (s.mode === "sort") this.sort(item);
    if (s.mode === "identify") this.identify(item);
    if (s.mode === "detective") this.detective(item);
    if (s.mode === "knowledge") this.knowledge(item);
    if (s.mode === "spelling") {
      this.clean();
      s.guessed = [];
      s.misses = 0;
      s.visualStage = 0;
      s.animating = false;
      s.winExitDone = false;
      s.spellingStatus = "";
      delete s.leafWorldX;
      delete s.leafEndPhase;
      const skin = this.topic.modeSkins.spelling, adapter = getSkin(skin.id);
      if (adapter.prepare && !adapter.isReady(skin)) {
        const epoch = this.epoch;
        s.animating = true;
        this.shell(skin.title, "Getting the trail ready…", '<p role="status">Loading the game pictures…</p>');
        adapter.prepare(skin).then(() => {
          if (this.epoch !== epoch || this.state !== s) return;
          s.animating = false;
          this.spelling(item);
          this.focus();
        }).catch(() => {
          if (this.epoch !== epoch || this.state !== s) return;
          this.feedback("The pictures could not load. Please try again.", () => this.round());
        });
      } else this.spelling(item);
    }
  }
  next() {
    this.clean();
    this.state.index++;
    if (this.state.index >= this.state.items.length) {
      this.state.sessionKind = null;
      this.results();
    } else {
      this.round();
      this.focus();
    }
  }
  // Word card: picture panel left; word, meaning, example and a 2 × 2 grid of actions right.
  learn(item) {
    const s = this.state;
    const last = s.index === s.items.length - 1;
    const pic = this.picture(item, "feature-art");
    this.shell(
      `Meet the word: ${item.name}`,
      "",
      `<div class="learn-layout"><div class="word-picture${pic.box}">${pic.html}</div><div class="learn-copy"><div class="vocab-word">${esc(item.name)}</div>${this.kindOfTag(item)}<p class="definition">${esc(item.definition)}</p><div class="say-together"><span>LET’S SAY</span><p>${esc(item.sentence)}</p></div><div class="word-actions">${button("Previous", "previous", "button button--outline", s.index === 0 ? "disabled" : "")}${button(`Say “${esc(item.name)}”`, "word", "button button--outline")}${button("Hear the meaning", "meaning", "button button--secondary")}${button(last ? "Finish" : "Next word", "next", "button")}</div></div></div>`,
      s.index + 1,
      s.items.length,
      { hiddenTitle: true, listen: [item.name, item.definition] },
    );
    this.bind("word", () => this.audio.speak(item.name));
    this.bind("meaning", () => this.audio.speak(item.definition));
    this.bind("previous", () => {
      if (s.index === 0) return;
      this.clean();
      s.index--;
      this.round();
      this.focus('[data-action="next"]');
    });
    this.bind("next", () => {
      s.score = Math.max(s.score, s.index + 1);
      this.next();
    });
  }
  // "A kind of bee": shows that a word is one example of a wider word (kind-of.js).
  kindOfTag(item) {
    const wider = kindOf[item.id] && this.topic.items.find((x) => x.id === kindOf[item.id]);
    const label = kindOf[item.id] ? wider && (kindOfLabel[item.id] || `A kind of ${wider.name}`) : kindOfLabel[item.id];
    return label ? `<p class="kind-of-tag">${esc(label)}</p>` : "";
  }
  // The visible word an answer names ("A ladybird", "Spiders"), matched the way Plants does it.
  itemForChoice(label) {
    const norm = (v) => String(v).toLowerCase().replace(/^(a|an|the|with)\s+/u, "").replace(/[^a-z ]/gu, "").trim();
    const choice = norm(label);
    return this.topic.items.find((item) => {
      const name = norm(item.name);
      return choice === name || choice === `${name}s` || choice === `${name}es` || choice.startsWith(`${name} `) || choice.endsWith(` ${name}`) || choice.includes(` ${name} `);
    });
  }
  answerMarkup(choices) {
    return `<div class="answers ${choices.length > 3 ? "many-answers" : ""}">${choices.map((c, i) => `<button class="answer" data-answer="${esc(c.id)}" data-key="${i + 1}">${c.icon ? `<span class="answer-art sort-icon">${SORT_ICONS[c.icon]}</span>` : c.image ? this.img(c, "answer-art") : ""}<span>${esc(c.label || c.name)}</span></button>`).join("")}</div>`;
  }
  answerEvents(correct, explanation) {
    this.app.querySelectorAll("[data-answer]").forEach(
      (el) =>
        (el.onclick = () => {
          const s = this.state;
          if (s.answered) return;
          if (el.dataset.answer !== correct) {
            s.wrong = true;
            el.disabled = true;
            el.classList.add("wrong");
            this.feedback("Not that one. Try again!", null, "wrong");
            this.audio.tone(230);
            return;
          }
          s.answered = true;
          if (!s.wrong) s.score++;
          this.saveRound();
          el.classList.add("correct");
          this.app
            .querySelectorAll("[data-answer]")
            .forEach((b) => (b.disabled = true));
          this.updateScore();
          this.audio.tone();
          this.confetti(25);
          this.feedback("Correct! " + explanation, () => this.next(), "right");
        }),
    );
    this.reserveFeedback("Correct! " + explanation);
  }
  // The feedback row is sized for the longest message this round can show (the right answer's
  // explanation and Next) before anyone answers, so a long explanation never moves the card.
  reserveFeedback(message) {
    const el = document.getElementById("feedback");
    if (!el) return;
    el.style.minHeight = "";
    el.className = "feedback feedback--right";
    el.innerHTML = `<span>${esc(message)}</span>${button("Next", "continue")}`;
    const h = el.getBoundingClientRect().height;
    el.innerHTML = "";
    el.className = "feedback";
    if (h) el.style.minHeight = `${Math.ceil(h)}px`;
  }
  // Sort It setup "What shall we sort?": a picture-pair card per authored rule, with an (i) note.
  sortSetup() {
    const s = this.state;
    s.stage = "rules";
    s.category = null;
    s.score = 0;
    const words = this.pool("sort");
    const side = (group) => {
      const item = this.lookup.get(group.imageId);
      const art = group.icon ? `<span class="sort-card__art sort-icon">${SORT_ICONS[group.icon]}</span>` : item ? this.img(item, "sort-card__art", "") : "";
      return `<span class="sort-card__side"><span class="sort-card__picture">${art}</span><span class="sort-card__label">${esc(group.label)}</span></span>`;
    };
    const cards = sortingRules.map((rule) => {
      const pool = sortingPool(rule, words);
      const filled = rule.groups.filter((g) => pool.some((item) => g.members.includes(item.id))).length;
      const playable = rule.choices ? filled >= rule.choices : filled === rule.groups.length;
      const [a, b] = rule.cover ? rule.cover.map((id) => rule.groups.find((g) => g.id === id)) : rule.groups;
      return `<div class="sort-card"><button class="sort-card__play" type="button" data-sort-rule="${rule.id}" ${playable ? "" : "disabled"}><span class="sort-card__pair">${side(a)}<span class="sort-card__or" aria-hidden="true">or</span>${side(b)}</span><strong>${esc(rule.question)}</strong><span class="count-pill">${playable ? `${pool.length} words` : "Needs both groups"}</span></button><button class="sort-card__info" type="button" data-sort-info="${rule.id}" aria-label="About ${esc(rule.question)}">i</button></div>`;
    }).join("");
    this.shell("What shall we sort?", "", `<div class="sort-rules">${cards}</div><dialog class="popout sort-info" aria-labelledby="sortInfoTitle"><div class="popout__heading"><h2 id="sortInfoTitle"></h2></div><p class="sort-info__note"></p><button class="button" type="button" data-sort-info-close>Got it</button></dialog>`, 0, 0, { setup: true, listen: false });
    const dialog = this.app.querySelector(".sort-info");
    this.app.querySelectorAll("[data-sort-rule]").forEach((el) => (el.onclick = () => this.chooseSortRule(el.dataset.sortRule)));
    this.app.querySelectorAll("[data-sort-info]").forEach((el) => (el.onclick = () => {
      const rule = sortingRule(el.dataset.sortInfo);
      dialog.querySelector("h2").textContent = rule.question;
      dialog.querySelector(".sort-info__note").textContent = rule.note;
      dialog.showModal();
    }));
    dialog.querySelector("[data-sort-info-close]").onclick = () => dialog.close();
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
    this.focus();
  }
  chooseSortRule(id) {
    this.clean();
    this.state.category = id;
    this.beginSession("all");
  }
  sort(item) {
    const s = this.state,
      rule = sortingRule(s.category),
      name = item.name[0].toLocaleUpperCase(this.topic.locale) + item.name.slice(1);
    const group = sortingGroup(rule, item);
    let groups = rule.groups;
    // Which family?: the right family and two others from the same side that have words in play.
    // A family holding a look-alike (bee for a hoverfly or bee-fly) is never a wrong choice.
    if (rule.choices) {
      const pool = s.sessionPool || this.sessionPool();
      const alike = new Set(LOOK_ALIKES.flatMap(([a, b]) => (a === item.id ? [b] : b === item.id ? [a] : [])));
      const others = rule.groups.filter((g) => g !== group && g.side === group.side && pool.some((w) => g.members.includes(w.id)) && !g.members.some((m) => alike.has(m)));
      groups = shuffle([group, ...shuffle(others).slice(0, rule.choices - 1)]);
    }
    const choices = groups.map((g) => ({ id: g.id, label: g.label, icon: g.icon, image: g.icon ? null : this.lookup.get(g.imageId)?.image, imageAlt: "" }));
    const pic = this.picture(item, "feature-art");
    this.shell(
      `${rule.question} ${name}.`,
      "",
      `<div class="sort-play"><div class="word-picture sort-picture${pic.box}">${pic.html}</div>${this.answerMarkup(choices)}</div>`,
      s.index + 1,
      s.items.length,
    );
    this.answerEvents(group.id, `${name}: ${group.explanation}`);
  }
  // Detective setup "Choose your picture clues": reveal style and time, then Start.
  // Outlines use the whole-animal pictures; the other styles use every word. The same pool resumes.
  detectiveSetup() {
    const s = this.state, d = this.detectiveSettings;
    s.stage = "setup";
    s.category = null;
    // Silhouette needs whole-animal cut-outs; until a topic has any (Mammals, 21 November 2026) it shows as coming soon.
    const outlines = this.pool("detective").some(canSilhouette);
    const kinds = REVEAL_KINDS.map(([id, label]) => id === "silhouette" && !outlines ? `<option value="${id}" disabled>${label} (coming soon)</option>` : `<option value="${id}">${label}</option>`).join("");
    const times = REVEAL_TIMES.map((t) => `<option value="${t}">${t} seconds</option>`).join("");
    if (d.kind === "silhouette" && !outlines) d.kind = "mosaic";
    this.shell("Choose your picture clues", "", `<div class="detective-setup"><div class="detective-settings"><label>Reveal <select data-setup-kind>${kinds}</select></label><label>Time <select data-setup-duration>${times}</select></label></div>${button("Start", "detective-begin", "button start-button")}</div>`, 0, 0, { setup: true, listen: false });
    const kind = this.app.querySelector("[data-setup-kind]"), duration = this.app.querySelector("[data-setup-duration]");
    kind.value = d.kind;
    duration.value = String(d.duration);
    this.bind("detective-begin", () => this.beginDetective(kind.value, Number(duration.value)));
    this.focus();
  }
  beginDetective(kind, duration) {
    this.clean();
    this.detectiveSettings = { kind, duration };
    this.state.category = kind === "silhouette" ? "outline" : "all";
    this.beginSession("all");
  }
  detective(item) {
    const s = this.state, d = this.detectiveSettings;
    this.shell("What is hiding in the woods?", "", "", s.index + 1, s.items.length);
    const kind = d.kind === "silhouette" && !canSilhouette(item) ? "mosaic" : d.kind;
    this.view = new DetectiveView(this, item, detectiveChoices(item, s.sessionPool || this.sessionPool(), this.pool(s.mode)), createReveal(kind, d.duration));
  }
  identify(item) {
    const s = this.state;
    const pic = this.picture(item, "clue-art");
    this.shell(
      `Find the picture for ${item.name}.`,
      "",
      `<div class="teacher-tools">${button(s.showAnswers ? "Hide answer pictures" : "Show answer pictures", "answers-toggle", "toggle", `aria-pressed="${!s.showAnswers}"`)}${button(s.showTarget ? "Hide middle picture" : "Show middle picture", "target-toggle", "toggle", `aria-pressed="${!s.showTarget}"`)}</div><div class="identify-target${pic.box} ${s.showTarget ? "" : "concealed"}">${pic.html}</div>${this.answerMarkup(detectiveChoices(item, s.sessionPool || this.pool("identify"), this.pool("identify")))}`,
      s.index + 1,
      s.items.length,
    );
    this.app
      .querySelector(".answers")
      .classList.toggle("conceal-answers", !s.showAnswers);
    this.bind("target-toggle", (el) => {
      s.showTarget = !s.showTarget;
      el.setAttribute("aria-pressed", String(!s.showTarget));
      el.textContent = s.showTarget ? "Hide middle picture" : "Show middle picture";
      this.app
        .querySelector(".identify-target")
        .classList.toggle("concealed", !s.showTarget);
    });
    this.bind("answers-toggle", (el) => {
      s.showAnswers = !s.showAnswers;
      el.setAttribute("aria-pressed", String(!s.showAnswers));
      el.textContent = s.showAnswers ? "Hide answer pictures" : "Show answer pictures";
      this.app
        .querySelector(".answers")
        .classList.toggle("conceal-answers", !s.showAnswers);
    });
    this.answerEvents(item.id, `${item.name}: ${item.definition}`);
  }
  knowledge(q) {
    const s = this.state,
      visual = this.topic.items.find((x) => x.id === q.visualItemId);
    // Like Plants: each answer shows its word's picture, but only when every answer has one,
    // since a half-pictured set looks broken and can hint at the answer.
    const pictured = q.choices.map((c) => ({ ...c, image: this.itemForChoice(c.label)?.image, imageAlt: "" }));
    const choices = pictured.every((c) => c.image) ? pictured : q.choices;
    this.shell(
      q.prompt,
      "",
      `${q.sceneImage ? `<div class="sort-clue sort-clue--scene"><img class="scene-art" src="${esc(q.sceneImage)}" alt="" draggable="false"></div>` : visual ? `<div class="sort-clue">${this.img(visual, "clue-art")}</div>` : ""}${this.answerMarkup(shuffle(choices))}`,
      s.index + 1,
      s.items.length,
    );
    this.answerEvents(q.correctChoiceId, q.explanation);
  }
  feedback(message, onNext, tone = "") {
    const el = document.getElementById("feedback");
    el.className = `feedback${tone ? " feedback--" + tone : ""}`;
    el.innerHTML = `<span>${esc(message)}</span>${onNext ? button("Next", "continue") : ""}`;
    if (onNext) {
      this.bind("continue", onNext);
      this.focus('[data-action="continue"]');
    }
  }
  updateScore() {
    this.app.querySelector(".score b").textContent = this.state.score;
    this.app
      .querySelector(".score")
      .setAttribute("aria-label", this.state.score + " stars");
  }
  spelling(item) {
    getSkin(this.topic.modeSkins.spelling.id).cancel?.(this);
    const s = this.state,
      normal = normalise(item.name, this.topic),
      all = letters(item.name, this.topic),
      limit = this.topic.modeSkins.spelling.attempts ?? Math.min(10, all.length),
      skin = this.topic.modeSkins.spelling;
    const word = normal
      .split(" ")
      .map(
        (w) =>
          '<span class="word-part">' +
          [...w]
            .map((c) =>
              this.topic.text.alphabet.includes(c)
                ? '<span class="letter-slot">' +
                  (s.guessed.includes(c) || s.spellingStatus
                    ? esc(c.toLocaleUpperCase(this.topic.locale))
                    : '<span class="sr-only">Hidden letter</span>') +
                  "</span>"
                : "<span>" + esc(c) + "</span>",
            )
            .join("") +
          "</span>",
      )
      .join('<span class="word-space" aria-label="space"></span>');
    const keyboard = [...this.topic.text.alphabet]
      .map(
        (c) =>
          '<button class="letter-key ' +
          (s.guessed.includes(c)
            ? all.includes(c)
              ? "used-correct"
              : "used-wrong"
            : "") +
          '" data-letter="' +
          c +
          '" ' +
          (s.guessed.includes(c) || s.spellingStatus || s.animating
            ? "disabled"
            : "") +
          ">" +
          esc(c.toLocaleUpperCase(this.topic.locale)) +
          "</button>",
      )
      .join("");
    const wrong = s.guessed
      .filter((c) => !all.includes(c))
      .join(", ")
      .toUpperCase();
    // Laid out like Plants: the picture clue and the scene on the left, the word and letters on the right.
    this.shell(
      skin.title,
      "",
      '<div class="spelling-layout"><div class="spelling-left"><div class="spelling-clue-card">' +
        this.img(item, "spelling-clue") +
        '</div><div class="spelling-play">' +
        getSkin(skin.id).render(skin, s.visualStage, esc, s.winExitDone, s.spellingStatus, s) +
        '</div></div><div class="spelling-right"><div class="spelling-word" aria-label="' +
        (s.spellingStatus ? esc(item.name) : "Hidden word") +
        '">' +
        word +
        '</div><div class="spelling-attempts"><strong class="guess-count">' +
        Math.max(0, limit - s.misses) +
        (limit - s.misses === 1 ? " try left" : " tries left") + "</strong><span>Wrong letters: " +
        esc(wrong || "none yet") +
        '</span></div><div class="keyboard" aria-label="Letter keyboard">' +
        keyboard +
        "</div></div></div>",
      s.index + 1,
      s.items.length,
      { hiddenTitle: true, listen: skin.instruction || skin.title },
    );
    this.app
      .querySelectorAll("[data-letter]")
      .forEach((el) => (el.onclick = () => this.guess(el.dataset.letter)));
    getSkin(skin.id).mount?.(this, skin, item);
    if (s.spellingStatus && !s.animating)
      this.feedback(
        s.spellingStatus === "won"
          ? "You spelled “" + item.name + "”!"
          : "The word is “" + item.name + "”. Let’s try another together.",
        () => this.next(),
      );
  }
  guess(letter) {
    const s = this.state;
    if (
      s.screen !== "game" ||
      s.mode !== "spelling" ||
      !s.guessed ||
      s.spellingStatus ||
      s.animating ||
      s.guessed.includes(letter) ||
      !this.topic.text.alphabet.includes(letter)
    )
      return;
    const item = s.items[s.index],
      all = letters(item.name, this.topic),
      limit = this.topic.modeSkins.spelling.attempts ?? Math.min(10, all.length),
      skin = this.topic.modeSkins.spelling,
      epoch = this.epoch;
    const valid = () => this.epoch === epoch && this.state === s;
    s.guessed.push(letter);
    getSkin(skin.id).capture?.(this);
    getSkin(skin.id).cancel?.(this);
    if (all.includes(letter)) {
      if (all.every((c) => s.guessed.includes(c))) {
        s.spellingStatus = "won";
        s.animating = true;
        this.spelling(item);
        this.announce(skin.winAnnouncement);
        getSkin(skin.id).win(this, () => {
          if (!valid()) return;
          s.animating = false;
          s.winExitDone = true;
          s.score++;
          this.saveRound();
          this.spelling(item);
          this.audio.tone(780);
          this.confetti(75);
          this.focus('[data-action="continue"]');
        });
      } else {
        this.audio.tone();
        // A skin with its own found-letter move (the Homeward Trail hop) holds the keys until it lands.
        const adapter = getSkin(skin.id);
        s.animating = !!adapter.correct;
        this.spelling(item);
        this.announce("Letter found!");
        if (adapter.correct) adapter.correct(this, () => {
          if (!valid()) return;
          s.animating = false;
          this.spelling(item);
          this.focus(".letter-key:not(:disabled)");
        });
        else this.focus(".letter-key:not(:disabled)");
      }
      return;
    }
    s.misses++;
    s.animating = true;
    this.spelling(item);
    this.audio.tone(230);
    this.announce(skin.wrongAnnouncement);
    const final = s.misses >= limit;
    getSkin(skin.id).mistake(
      this,
      mistakeStage(s.misses, limit),
      final,
      item,
      () => {
        if (!valid()) return;
        s.animating = false;
        if (final) {
          s.spellingStatus = "lost";
          this.saveRound();
        }
        this.spelling(item);
        this.announce(
          final
            ? "The word is " + item.name + ". Let’s try another together."
            : "Try another letter.",
        );
        this.focus(
          final ? '[data-action="continue"]' : ".letter-key:not(:disabled)",
        );
      },
    );
  }
  flipSetup() {
    this.flipCountSetup();
  }
  flipCountSetup() {
    const pool = this.pool("flip");
    const counts = this.topic.sessions.supportedFlipWordCounts.filter((n) => n <= pool.length);
    if (!counts.length && pool.length >= 2) counts.push(pool.length);
    this.shell(
      "Choose your matching game",
      "",
      `<div class="count-options">${counts.map((n, i) => button(`<span class="count-art" aria-hidden="true"><span class="count-art__back"></span><span class="count-art__front">${this.img(pool[i % pool.length], "count-art__img", "")}</span></span><strong>Up to ${n} words</strong><span>${n * 2} tiles</span>`, "flip-count", "count-card", `data-count="${n}"`)).join("")}</div>`,
      0,
      pool.length,
      { setup: true },
    );
    this.bind("flip-count", (el) => this.startFlip(+el.dataset.count));
    this.focus();
  }
  startFlip(count) {
    this.clean();
    const s = this.state;
    const pool = this.pool("flip");
    // The same board size as the saved board reopens it with its found pairs and turns.
    const saved = this.progress.data.rounds.flip;
    const savedTiles = saved?.count === count && Array.isArray(saved.tiles)
      ? saved.tiles.map(([id, itemId, matched]) => ({ id, item: this.lookup.get(itemId), matched: !!matched }))
      : null;
    const resume = savedTiles?.every((t) => t.item) && savedTiles.some((t) => !t.matched);
    if (saved && !resume) this.dropRound("flip");
    s.tiles = resume ? savedTiles : makeFlipDeck(pool, count);
    s.items = [...new Map(s.tiles.map((t) => [t.item.id, t.item])).values()];
    s.matches = s.tiles.filter((t) => t.matched).length / 2;
    s.score = s.matches;
    s.flipCount = count;
    s.locked = false;
    s.first = null;
    s.mismatch = null;
    s.turns = resume ? saved.turns || 0 : 0;
    s.stage = "play";
    this.shell(
      "Find the matching pairs",
      "",
      `<div class="flip-board flip-board--${count}" data-size="${count * 2}">${s.tiles.map((t, i) => `<button class="tile" data-tile="${t.id}" aria-label="Tile ${i + 1}"><span class="tile-inner"><span class="tile-back" aria-hidden="true">${i + 1}</span><span class="tile-front" aria-hidden="true">${this.img(t.item, "tile-art", "")}<span>${esc(t.item.name)}</span></span></span></button>`).join("")}</div><p class="flip-turns" aria-live="off">Turns: <b>${s.turns}</b></p>`,
      s.matches,
      s.items.length,
      { hiddenTitle: true },
    );
    this.app
      .querySelectorAll("[data-tile]")
      .forEach((el) => (el.onclick = () => this.flip(el.dataset.tile)));
    s.tiles.filter((t) => t.matched).forEach((t) => this.updateTile(t));
    const board = this.app.querySelector(".flip-board");
    this.flipObserver = new ResizeObserver(() => this.layoutFlip(board));
    this.flipObserver.observe(board.parentElement);
    this.layoutFlip(board);
    this.focus();
  }
  // Board shape and tile size per GAME-CONTENTS: columns divide the tile count, nearest
  // sqrt(tiles x 1.4) wide or sqrt(tiles x 0.7) upright; biggest tile that fits, up to 190.
  layoutFlip(board) {
    const area = board.parentElement, turns = area.querySelector(".flip-turns");
    const n = board.children.length, gap = 7, ratio = 126 / 132;
    const pad = getComputedStyle(area), side = parseFloat(pad.paddingLeft) + parseFloat(pad.paddingRight);
    const ends = parseFloat(pad.paddingTop) + parseFloat(pad.paddingBottom);
    const w = area.clientWidth - side, h = area.clientHeight - ends - (turns ? turns.offsetHeight + 10 : 0);
    if (!w || !h) return;
    const target = Math.sqrt(n * (w >= h ? 1.4 : 0.7));
    let cols = 1;
    for (let c = 1; c <= n; c++) if (n % c === 0 && Math.abs(c - target) < Math.abs(cols - target)) cols = c;
    const rows = n / cols;
    const width = Math.floor(Math.min(190, (w - (cols - 1) * gap) / cols, (h - (rows - 1) * gap) / rows / ratio));
    board.style.setProperty("--cols", cols);
    board.style.setProperty("--rows", rows);
    board.style.gridTemplateColumns = `repeat(${cols}, ${width}px)`;
    board.style.gridAutoRows = `${Math.floor(width * ratio)}px`;
    board.style.setProperty("--tile", `${width}px`);
  }
  tileEl(id) {
    return this.app.querySelector(`[data-tile="${id}"]`);
  }
  updateTile(tile) {
    const el = this.tileEl(tile.id),
      shown = tile.open || tile.matched;
    el.classList.toggle("open", !!shown);
    el.classList.toggle("matched", !!tile.matched);
    el.disabled = !!tile.matched;
    el.setAttribute(
      "aria-label",
      shown ? tile.item.name : "Tile " + (this.state.tiles.indexOf(tile) + 1),
    );
    el.querySelector(".tile-front").setAttribute("aria-hidden", String(!shown));
  }
  flip(id) {
    const s = this.state,
      tile = s.tiles.find((t) => t.id === id);
    if (s.locked || tile.matched) return;
    if (s.mismatch) {
      for (const previous of s.mismatch) {
        previous.open = false;
        this.updateTile(previous);
      }
      s.mismatch = null;
      s.first = null;
    }
    if (tile.open) return;
    tile.open = true;
    this.updateTile(tile);
    if (!s.first) {
      s.first = tile;
      return;
    }
    const first = s.first,
      match = first.item.id === tile.item.id;
    s.turns = (s.turns || 0) + 1;
    const turns = this.app.querySelector(".flip-turns b");
    if (turns) turns.textContent = s.turns;
    if (!match) {
      s.mismatch = [first, tile];
      s.first = null;
      this.announce(
        "Have another look. Choose another tile when you are ready.",
      );
      return;
    }
    s.locked = true;
    this.later(
      () => {
        first.matched = tile.matched = true;
        s.matches++;
        s.score = s.matches;
        this.confetti(s.matches === s.items.length ? 130 : 22);
        this.audio.tone();
        this.announce("A matching pair!");
        this.updateTile(first);
        this.updateTile(tile);
        s.locked = false;
        s.first = null;
        this.updateScore();
        this.updateProgress(s.matches, s.items.length);
        this.saveRound();
        if (s.matches === s.items.length)
          this.feedback("Every pair found!", () => this.results());
        else this.focus(".tile:not(:disabled)");
      },
      this.reduced() ? 500 : 850,
    );
  }
  updateProgress(current, total) {
    document.getElementById("round-count").textContent =
      `${ROUND_LABELS[this.state.mode] || "Round"} ${current}/${total}`;
    const el = this.app.querySelector(".progress");
    el.setAttribute("aria-valuenow", Math.round((current / total) * 100));
    el.firstElementChild.style.width = (current / total) * 100 + "%";
  }
  newWheelBatch() {
    const s = this.state;
    s.wheelPool = s.remaining.slice(0, this.topic.sessions.wheel.capacity);
    s.spinning = false;
  }
  // Picture Pick (SCREEN-SPEC section 7): a picture reel (or, once drawn, a container) picks the next word from
  // up to twelve on show, then a reading card opens. The mode id stays "wheel" so saved rounds
  // keep working. The style is remembered on the device. The jar is Codex art: the open jar with its lid as a separate layer.
  pickStyle() {
    return PICK_STYLES.some(([id]) => id === "packet") && this.progress.data.prefs.pickStyle === "packet" ? "packet" : "reel";
  }
  setPickStyle(style) {
    if (this.state.spinning || !PICK_STYLES.some(([id]) => id === style)) return;
    this.progress.data.prefs.pickStyle = style;
    this.progress.write();
    this.wheel();
    this.focus(`[data-pick-style="${style}"]`);
  }
  wheel() {
    const s = this.state;
    if (s.selected) {
      const item = s.selected;
      const pic = this.picture(item, "feature-art");
      this.shell(
        "Picture Pick",
        "",
        `<div class="pick-card"><div class="pick-card__picture${pic.box}">${pic.html}</div><div class="pick-word">${esc(item.name)}</div>${this.kindOfTag(item)}<p class="definition">${esc(item.definition)}</p><div class="pick-actions">${button("Next", "wheel-next", "button")}</div></div>`,
        s.score,
        s.items.length,
        { hiddenTitle: true, listen: [item.name, item.definition] },
      );
      this.bind("wheel-next", () => this.nextWheel());
      this.focus('[data-action="wheel-next"]');
      return;
    }
    const style = this.pickStyle(), pool = s.wheelPool, n = pool.length;
    const switcher = PICK_STYLES.length < 2 ? "" : `<div class="pick-switch" role="group" aria-label="Picker style">${PICK_STYLES.map(([id, label]) => `<button type="button" data-pick-style="${id}" aria-pressed="${id === style}">${label}</button>`).join("")}</div>`;
    const stage = style === "reel"
      ? `<div class="reel-stage"><div class="reel-window"><div class="reel-strip" style="--reel-pos:${n}">${Array.from({ length: n * 6 }, (_, i) => `<span class="reel-card">${this.img(pool[i % n], "reel-art", "")}</span>`).join("")}</div><span class="reel-frame" aria-hidden="true"></span></div><p class="pick-label" aria-live="polite"></p>${button("Start", "spin", "button pick-go start-button")}</div>`
      : `<div class="jar-stage"><div class="jar-scene">${button('<img class="bug-jar__glass" src="assets/menu/bug-jar-open-v1.webp" alt="" draggable="false"><img class="bug-jar__lid" src="assets/menu/bug-jar-lid-v1.webp" alt="" draggable="false">', "spin", "bug-jar", 'aria-label="Open the bug jar"')}<span class="jar-prize" aria-hidden="true"></span></div><div class="jar-chips" aria-hidden="true">${pool.map((x) => `<span class="jar-chip">${this.img(x, "chip-art", "")}</span>`).join("")}</div><p class="pick-label" aria-live="polite">Tap the jar</p></div>`;
    this.shell("Picture Pick", "", `<div class="pick-play pick-play--${style}">${switcher}${stage}</div>`, s.score, s.items.length, { hiddenTitle: true, listen: false });
    this.app.querySelectorAll("[data-pick-style]").forEach((el) => (el.onclick = () => this.setPickStyle(el.dataset.pickStyle)));
    this.bind("spin", () => this.spin());
  }
  spin() {
    const s = this.state;
    if (s.spinning || s.selected || !s.wheelPool?.length) return;
    s.spinning = true;
    const index = Math.floor(Math.random() * s.wheelPool.length);
    s.pending = s.wheelPool[index];
    this.app.querySelectorAll('[data-pick-style], [data-action="spin"]').forEach((el) => (el.disabled = true));
    // Reduced motion: no movement, the reading card opens straight away.
    if (this.reduced()) this.finishPick();
    else if (this.pickStyle() === "reel") this.rollReel(index);
    else this.openJar(index);
  }
  // Animations go through here so a popout or hidden tab holds them with the rest of the game.
  animate(el, frames, options) {
    const a = el.animate(frames, { fill: "forwards", ...options });
    if (this.paused) a.pause();
    (this.motion ||= []).push(a);
    return a;
  }
  // Checked on the game's own timer, which holds while paused and stops when the screen changes.
  whenDone(animation, fn) {
    const check = () => (animation.playState === "finished" ? fn() : this.later(check, 40));
    this.later(check, 40);
  }
  // The strip is six sets of the cards on show: it rests on the second set and stops on the
  // picked card in the fifth, slowing over 3.4 seconds with a soft tick per card.
  rollReel(index) {
    const n = this.state.wheelPool.length, target = n * 4 + index;
    const strip = this.app.querySelector(".reel-strip"), card = strip.firstElementChild;
    const step = card.offsetWidth + parseFloat(getComputedStyle(strip).columnGap || 0);
    const at = (pos) => `translateX(${-(pos * step + card.offsetWidth / 2)}px)`;
    const roll = this.animate(strip, [{ transform: at(n) }, { transform: at(target) }], { duration: 3400, easing: "cubic-bezier(.165,.84,.44,1)" });
    let shown = n;
    const tick = () => {
      const p = roll.effect.getComputedTiming().progress ?? 1, centred = Math.round(n + (target - n) * p);
      if (centred !== shown) {
        shown = centred;
        this.audio.tone(980, 0.025);
      }
      if (roll.playState !== "finished") this.later(tick, 30);
    };
    this.later(tick, 30);
    this.whenDone(roll, () => {
      strip.style.setProperty("--reel-pos", target);
      roll.cancel();
      strip.children[target]?.classList.add("is-landed");
      this.landPick();
    });
  }
  // The jar shakes for about 1.3 seconds while the small pictures flicker, the lid comes off
  // (0.45 s) and the picked picture rises out (0.8 s, small overshoot).
  openJar(index) {
    const jar = this.app.querySelector(".bug-jar"), prize = this.app.querySelector(".jar-prize");
    const chips = [...this.app.querySelectorAll(".jar-chip")];
    prize.innerHTML = this.img(this.state.pending, "prize-art", "");
    this.app.querySelector(".pick-label").textContent = "";
    let hot = -1;
    for (let i = 0; i < 14; i++)
      this.later(() => {
        this.audio.tone(980, 0.025);
        if (chips.length < 2) return;
        chips[hot]?.classList.remove("is-hot");
        hot = (hot + 1 + Math.floor(Math.random() * (chips.length - 1))) % chips.length;
        chips[hot].classList.add("is-hot");
      }, i * 90);
    this.animate(jar, [{ transform: "rotate(0deg)" }, { transform: "rotate(-6deg)" }, { transform: "rotate(6deg)" }, { transform: "rotate(0deg)" }], { duration: 360, iterations: 3.5, easing: "ease-in-out", fill: "none" });
    this.animate(jar.querySelector(".bug-jar__lid"), [{ transform: "translateY(0) rotate(0deg)", opacity: 1 }, { transform: "translateY(-70%) rotate(-24deg)", opacity: 0 }], { duration: 450, delay: 1300, easing: "ease-out" });
    const rise = this.animate(prize, [{ transform: "translateY(35%) scale(.25)", opacity: 0 }, { transform: "translateY(0) scale(1)", opacity: 1 }], { duration: 800, delay: 1550, easing: "cubic-bezier(.34,1.56,.64,1)" });
    this.whenDone(rise, () => {
      chips.forEach((chip, i) => {
        chip.classList.remove("is-hot");
        chip.classList.toggle("is-picked", i === index);
      });
      this.landPick();
    });
  }
  // On landing the name shows on the stage with a success sound; the reading card opens 1.2 s later.
  landPick() {
    const label = this.app.querySelector(".pick-label");
    if (label) label.textContent = this.state.pending.name;
    this.audio.tone(660, 0.12);
    this.later(() => this.audio.tone(990, 0.18), 130);
    this.later(() => this.finishPick(), 1200);
  }
  finishPick() {
    const s = this.state;
    if (!s.spinning) return;
    s.spinning = false;
    s.selected = s.pending;
    s.pending = null;
    this.saveRound();
    this.wheel();
  }
  nextWheel() {
    this.clean();
    const s = this.state,
      id = s.selected.id;
    s.remaining = removeWheelItem(s.remaining, id);
    s.wheelPool = removeWheelItem(s.wheelPool, id);
    s.selected = null;
    s.score++;
    if (!s.remaining.length) {
      this.results();
      return;
    }
    if (!s.wheelPool.length) {
      s.batch++;
      this.newWheelBatch();
    }
    this.saveRound();
    this.wheel();
    this.focus('[data-action="spin"]');
  }
  results() {
    this.clean();
    const s = this.state;
    s.screen = "results";
    // A finished round is done: next time this game or group starts fresh.
    if (s.mode === "learn") delete this.progress.data.learn[s.category];
    if (s.mode) this.dropRound(s.mode);
    const count = stars(s.score, s.items.length);
    this.app.className = "results-screen";
    const picture = this.topic.menu.tiles.find((t) => t.id === "learn")?.image;
    this.app.innerHTML = `<section class="results-panel">${picture ? `<img class="result-picture" src="${esc(picture)}" alt="" draggable="false">` : ""}<span class="eyebrow">Activity complete</span><h1>${esc(this.topic.text.resultsTitle || "Well done!")}</h1><div class="result-stars" aria-label="${count} stars">${'<img src="assets/menu/result-star-full-v1.webp" alt="" draggable="false">'.repeat(count)}${'<img class="result-star--empty" src="assets/menu/result-star-empty-v1.webp" alt="" draggable="false">'.repeat(Math.max(0, 3 - count))}</div><div class="result-score">${s.score} / ${s.items.length}</div><p>${esc(this.topic.completionMessages[s.mode])}</p><div class="result-actions">${button("Next session", "again")}${button("Choose Another Game", "menu", "button button--outline")}</div></section>`;
    this.bind("again", () => this.nextSession(s));
    this.bind("menu", () => this.leaveTo(s.mode));
    this.focus();
    this.confetti(110);
  }
  // Next session keeps the chosen group and word count; the word cycle carries on.
  nextSession(previous) {
    const { mode, category, count } = previous;
    if (mode === "detective" && category) {
      this.start(mode);
      this.beginDetective(this.detectiveSettings.kind, this.detectiveSettings.duration);
      return;
    }
    if (mode === "knowledge" && category) {
      this.start(mode);
      this.chooseKnowledgeGroup(category);
      return;
    }
    if (mode === "sort" && category) {
      this.start(mode);
      this.chooseSortRule(category);
      return;
    }
    if (COUNT_OPTIONS[mode] && count !== undefined) {
      this.start(mode);
      Object.assign(this.state, { category, screen: "game" });
      this.beginSession(count);
      return;
    }
    this.start(mode);
  }
  confetti(count) {
    if (this.reduced()) return;
    const root = document.getElementById("effects");
    root.replaceChildren();
    for (let i = 0; i < count; i++) {
      const el = document.createElement("i");
      el.style.cssText = `left:${Math.random() * 100}%;background:${this.topic.theme.cardColors[i % this.topic.theme.cardColors.length]};animation-delay:${Math.random() * 0.3}s;--drift:${Math.random() * 200 - 100}px`;
      root.append(el);
    }
    this.later(() => root.replaceChildren(), 2100);
  }
  mute() {
    const muted = this.audio.toggle(),
      el = document.getElementById("mute");
    el.setAttribute("aria-pressed", String(muted));
    el.setAttribute("aria-label", muted ? "Turn sound on" : "Turn sound off");
    el.title = muted ? "Turn sound on (M)" : "Turn sound off (M)";
    setIcon(el, muted ? "muted" : "sound");
    // The shared phonics cards stop their sound on this series event.
    window.dispatchEvent(new Event("plants-sound"));
    this.announce(muted ? "Sound muted" : "Sound on");
  }
  async fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      this.announce("Full screen is unavailable in this browser.");
    }
  }
  key(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    const s = this.state;
    if (document.querySelector("dialog[open]")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      if (["game", "results", "reading", "hub"].includes(s.screen)) this.back();
      else if (s.screen === "activities") this.menu("activities");
      else if (s.screen === "topic-games") this.menu("games");
      else if (s.screen === "arts-folder") this.menu("arts");
      else if (s.screen === "menu") this.launch();
      return;
    }
    // Letter keys belong to spelling while its keyboard is active; utility buttons remain available.
    if (
      s.screen === "game" &&
      s.mode === "spelling" &&
      s.guessed &&
      this.topic.text.alphabet.includes(
        e.key.toLocaleLowerCase(this.topic.locale),
      )
    ) {
      e.preventDefault();
      this.guess(e.key.toLocaleLowerCase(this.topic.locale));
      return;
    }
    if (e.key.toLowerCase() === "m") {
      e.preventDefault();
      this.mute();
      return;
    }
    if (e.key.toLowerCase() === "f") {
      e.preventDefault();
      this.fullscreen();
      return;
    }
    if (s.screen !== "game") return;
    if (/^[1-9]$/.test(e.key)) {
      const el = this.app.querySelector(`[data-key="${e.key}"]`);
      if (el && !el.disabled) {
        e.preventDefault();
        el.click();
      }
    }
    if (e.key === "Enter" && e.target.tagName !== "BUTTON") {
      const el = this.app.querySelector('[data-action="continue"]');
      if (el) {
        e.preventDefault();
        el.click();
      }
    }
  }
}
