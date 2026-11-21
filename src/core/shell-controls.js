import { scopeChoices, normaliseScope, isFiltered, scopeLabel } from "../topics/curriculum.js";
import { iconSvg } from "./ui-icons.js";
import { installTeacherDrawing } from "./teacher-drawing.js";

// Draws the shared control marks inside buttons that ask for one with data-icon.
export function setIcon(button, name) {
  button.dataset.icon = name;
  let mark = button.querySelector(":scope > .ui-icon");
  if (!mark) {
    mark = document.createElement("span");
    mark.className = "ui-icon";
    mark.setAttribute("aria-hidden", "true");
    button.prepend(mark);
  }
  mark.innerHTML = iconSvg(name);
}
export function drawIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((b) => setIcon(b, b.dataset.icon));
}

// Holds pause the game while a tab is hidden or a popout is open. No visible Pause button.
export function installHolds(game) {
  const main = document.getElementById("app");
  const holds = new Set();
  let stopped = false;
  let animations = [];
  let previousFocus = null;
  function sync() {
    const paused = holds.size > 0 || document.hidden;
    if (paused === stopped) return;
    stopped = paused;
    game.setPaused(paused);
    if (paused) {
      previousFocus = document.activeElement;
      animations = document.getAnimations().filter((a) => a.playState === "running");
      animations.forEach((a) => a.pause());
      main.inert = true;
    } else {
      main.inert = false;
      animations.forEach((a) => { if (a.effect?.target?.isConnected) a.play(); });
      animations = [];
      if (previousFocus?.isConnected && !previousFocus.closest("[hidden],dialog")) previousFocus.focus({ preventScroll: true });
    }
    document.body.classList.toggle("is-paused", paused);
  }
  document.addEventListener("visibilitychange", sync);
  return {
    hold(reason) { holds.add(reason); sync(); },
    release(reason) { holds.delete(reason); sync(); },
    get paused() { return stopped; },
  };
}

// One Settings popout holds Teacher, Full screen and, inside Ludimi, All games and Reload game.
// Ludimi adds its own menu to the controls row; we hide it and click its links from here.
export function installSettings({ holds, onTeacher }) {
  const button = document.getElementById("settingsButton");
  const panel = document.getElementById("settingsPanel");
  const close = document.getElementById("closeSettingsButton");
  const teacher = document.getElementById("teacherButton");
  const fullscreen = document.getElementById("settingsFullscreenButton");
  const hiddenFullscreen = document.getElementById("fullscreen");
  const games = document.getElementById("ludimiGamesButton");
  const reload = document.getElementById("ludimiReloadButton");
  const host = button.parentElement;
  let ludimi = null;
  function findLudimi() {
    const menu = host.querySelector(".ludimi-game-menu");
    if (menu && !menu.hidden) { menu.open = false; menu.hidden = true; }
    ludimi = menu;
    games.hidden = reload.hidden = !menu;
  }
  function syncFullscreen() {
    const active = Boolean(document.fullscreenElement);
    fullscreen.lastChild.textContent = active ? "Leave full screen" : "Full screen";
    setIcon(fullscreen, active ? "collapse" : "fullscreen");
  }
  function open() {
    if (panel.open) return;
    findLudimi();
    holds.hold("settings");
    panel.showModal();
    button.setAttribute("aria-expanded", "true");
    teacher.focus();
  }
  const dismiss = () => { if (panel.open) { panel.close(); onClose(); } };
  function onClose() { button.setAttribute("aria-expanded", "false"); holds.release("settings"); }
  button.addEventListener("click", open);
  close.addEventListener("click", dismiss);
  panel.addEventListener("close", onClose);
  panel.addEventListener("click", (e) => { if (e.target === panel) dismiss(); });
  teacher.addEventListener("click", () => { dismiss(); onTeacher(); });
  fullscreen.addEventListener("click", () => { dismiss(); hiddenFullscreen.click(); });
  games.addEventListener("click", () => { const link = ludimi?.querySelector("a[href]"); dismiss(); link?.click(); });
  reload.addEventListener("click", () => { const action = ludimi?.querySelector("[data-ludimi-reload]"); dismiss(); action?.click(); });
  document.addEventListener("fullscreenchange", syncFullscreen);
  new MutationObserver(findLudimi).observe(host, { childList: true });
  findLudimi();
  syncFullscreen();
  return { open, close: dismiss, get isOpen() { return panel.open; } };
}

// Teacher dialog: a draft that only changes the game when applied. Each choice shows how many
// words it leaves; Apply (or "Got it" when nothing changed) applies the draft, Cancel or the backdrop throws it away.
export function installTeacher({ holds, topic, words, getScope, onApply }) {
  const panel = document.getElementById("teacherPanel");
  const close = document.getElementById("closeTeacherButton");
  const done = document.getElementById("teacherDone");
  const controls = document.getElementById("scopeControls");
  const summary = document.getElementById("scopeSummary");
  const subject = topic.subject || topic.title;
  const fields = [["level", "Level", "All levels"], ["lesson", "Lesson", "All lessons"], ["collection", "Collection", "All collections"]];
  const html = (v) => String(v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[c]);
  let draft = normaliseScope(getScope());
  // Drawing (Draw & Trace) settings ride on the same draft and Done button.
  const drawing = installTeacherDrawing({ root: document.getElementById("drawingControls"), onChange: () => label() });
  const scopeChanged = () => Object.keys(draft).some((k) => draft[k] !== getScope()[k]);
  const label = () => { done.textContent = scopeChanged() || drawing.differs() ? "Apply" : "Got it"; };
  function render(focusKey) {
    const count = (change) => words({ ...draft, ...change });
    controls.innerHTML =
      fields.map(([key, label, all]) =>
        `<label class="scope-field"><span>${label}</span><select data-scope="${key}"><option value="all">${all} (${count({ [key]: "all" })})</option>${scopeChoices[key].map((o) => `<option value="${o.id}">${html(o.label)} (${count({ [key]: o.id })})</option>`).join("")}</select></label>`).join("") +
      `<p class="scope-note" id="scopeNote">${html(scopeNote(draft))}</p><button class="scope-reset" type="button" data-scope-reset ${isFiltered(draft) ? "" : "hidden"}>Clear filters</button>`;
    controls.querySelectorAll("[data-scope]").forEach((select) => {
      select.value = draft[select.dataset.scope];
      select.onchange = () => { draft = normaliseScope({ ...draft, [select.dataset.scope]: select.value }); render(select.dataset.scope); };
    });
    controls.querySelector("[data-scope-reset]").onclick = () => { draft = normaliseScope(); render("level"); };
    const total = words(draft);
    summary.textContent = `${total} ${total === 1 ? "word" : "words"} · ${scopeLabel(draft, subject)}${total ? "" : ". Change a choice or clear filters."}`;
    label();
    if (focusKey) controls.querySelector(`[data-scope="${focusKey}"]`)?.focus();
  }
  function open() {
    if (panel.open) return;
    draft = normaliseScope(getScope());
    drawing.reset();
    render();
    holds.hold("teacher");
    panel.showModal();
    done.focus();
  }
  const dismiss = () => { if (panel.open) panel.close(); };
  panel.addEventListener("close", () => {
    holds.release("teacher");
  });
  panel.addEventListener("click", (e) => { if (e.target === panel) dismiss(); });
  close.addEventListener("click", dismiss);
  done.addEventListener("click", () => { const next = draft; drawing.apply(); dismiss(); onApply(next); });
  render();
  return { open, close: dismiss, refresh: () => { draft = normaliseScope(getScope()); render(); }, get isOpen() { return panel.open; } };
}
// One line under the choices describing what the selection teaches.
function scopeNote(scope) {
  const picked = Object.entries(scopeChoices).flatMap(([key, list]) => list.filter((o) => o.id === scope[key]));
  return picked.length ? picked.map((o) => o.description).join(" ") : "Choose a level, lesson or collection to focus every game on those words.";
}
