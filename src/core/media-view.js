// Media for Mammal Discovery Club (ported from Plants, the series reference): Printables (flashcards in
// four A4 layouts, tracing sheets and sound mats), the storybook Videos, and the whole-topic Presentation with the
// narrated lessons below it. Books and Songs tabs show even while empty, with a "coming soon" note (owner, 19 November 2026).
import { topicFlashcards } from "../topics/flashcards.js";
import { soundMats } from "../topics/sound-mats.js";
import { tracingPrintables } from "../topics/tracing-printables.js";
import { topicPresentation } from "../topics/presentation.js";
import { storyVideos, lessonVideos } from "../topics/story-videos.js";

const LAYOUTS = [[1, "A4 · 1 large card"], [2, "A4 · 2 cards"], [4, "A4 · 4 cards"], [8, "A4 landscape · 8 cards"]];
const SECTIONS = [["printables", "Printables"], ["books", "Books"], ["videos", "Videos"], ["songs", "Songs"], ["presentation", "Presentation"]];
const EMPTY = { books: ["Mammal books", "words in Meet the Words"], songs: ["Mammal songs", "words in Meet the Words"] };
// A list with nothing in it yet shows this note in place of its cards (Mammals, 21 November 2026).
const soon = (what) => `<p class="printables-hint media-soon">${what} are coming soon.</p>`;
const esc = (t) => String(t).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const size = (b) => (b < 1e6 ? `${Math.round(b / 1e3)} KB` : `${(b / 1e6).toFixed(1)} MB`);
const links = (title, path) => `<div class="printable-actions"><a href="${esc(path)}" target="_blank" rel="noopener" aria-label="Open ${esc(title)} PDF, new tab">Open</a><a href="${esc(path)}" download aria-label="Download ${esc(title)} PDF">Download</a></div>`;

export class MediaView {
  constructor(game, root) {
    this.game = game;
    // Choices survive moving between tabs while the app stays open.
    const m = (game.mediaState ??= { section: "printables", cards: 4, trace: "A4", mat: "A4", slide: 0 });
    root.innerHTML = `<nav class="media-sections" aria-label="Media type">${SECTIONS.map(([id, label]) => `<button type="button" data-media-section="${id}" aria-pressed="${id === m.section}">${label}</button>`).join("")}</nav><div class="media-body"></div>`;
    root.querySelectorAll("[data-media-section]").forEach((b) => (b.onclick = () => {
      if (game.paused || b.dataset.mediaSection === m.section) return;
      m.section = b.dataset.mediaSection;
      game.media();
      game.focus(`[data-media-section="${m.section}"]`);
    }));
    const body = root.querySelector(".media-body");
    this.players = [];
    if (m.section === "presentation") {
      this.presentation(body, m);
      body.insertAdjacentHTML("beforeend", '<h2 class="media-lessons-title">Narrated lessons</h2>');
      this.videos(body, lessonVideos, "lessons");
    } else if (m.section === "videos") this.videos(body, storyVideos, "videos");
    else if (EMPTY[m.section]) this.empty(body, m.section);
    else this.printables(body, m);
  }
  printables(body, m) {
    const game = this.game;
    const art = new Map(game.topic.categories.map((c) => [c.id, c.image]));
    art.set("all", game.topic.menu.tiles.find((t) => t.id === "media").image);
    const packs = topicFlashcards.filter((p) => p.cardsPerSheet === m.cards);
    const hint = { 1: "", 2: " Cut along the centre line.", 4: " Trim along the dashed card edges.", 8: " Trim along the dashed card edges." }[m.cards];
    const traces = tracingPrintables.map((x) => (m.trace === "A5" ? { ...x, title: `${x.title} · 2 per page`, path: x.a5Path, bytes: x.a5Bytes, pages: x.a5PageCount } : { ...x, pages: x.pageCount }));
    const mats = soundMats.map((x) => (m.mat === "A5" && x.a5Path ? { ...x, title: `${x.title} · 2 per page`, path: x.a5Path, bytes: x.a5Bytes, detail: x.a5Detail } : m.mat === "A5" ? { ...x, title: `${x.title} · A4 only` } : x));
    body.innerHTML = `
     <section class="printables-library" aria-labelledby="flashcards-title">
      <div class="printables-toolbar"><h2 id="flashcards-title">Picture flashcards</h2>
       ${packs.length ? `<label>Print layout <select data-media-layout>${LAYOUTS.map(([n, l]) => `<option value="${n}">${l}</option>`).join("")}</select></label>` : ""}</div>
      ${packs.length ? `<p class="printables-hint">Print on A4${m.cards === 8 ? " in landscape" : ""} at actual size (100%).${hint}</p>` : ""}
      ${packs.length ? `<div class="printables-grid">${packs.map((p) => `<article class="printable-card${p.scopeId === "all" ? " printable-card--complete" : ""}"><img src="${esc(art.get(p.scopeId))}" alt="" width="88" height="72" loading="lazy"><div class="printable-details"><h3>${esc(p.title)}</h3><p>${p.wordCount} words · ${p.pageCount} ${p.pageCount === 1 ? "page" : "pages"} · ${size(p.bytes)}</p></div>${links(p.title, p.path)}</article>`).join("")}</div>` : soon("Picture flashcards")}
     </section>
     <section class="printables-library" aria-labelledby="tracing-title">
      <div class="printables-toolbar"><h2 id="tracing-title">Tracing sheets</h2>
       ${traces.length ? `<label>Print layout <select data-media-trace><option value="A4">A4 landscape · 1 picture</option><option value="A5">A4 · 2 A5 pictures</option></select></label>` : ""}</div>
      ${traces.length ? `<p class="printables-hint">Trace over the grey dashes. Print on A4${m.trace === "A5" ? "" : " in landscape"} at actual size (100%).${m.trace === "A5" ? " Cut the sheets in half along the centre line." : ""}</p>` : ""}
      ${traces.length ? `<div class="printables-grid">${traces.map((p) => `<article class="printable-card"><img src="${esc(p.cover)}" alt="" width="88" height="72" loading="lazy"><div class="printable-details"><h3>${esc(p.title)}</h3><p>${p.pageCount} pictures · ${p.pages} pages · ${size(p.bytes)}</p></div>${links(p.title, p.path)}</article>`).join("")}</div>` : soon("Tracing sheets")}
     </section>
     <section class="printables-library" aria-labelledby="mats-title">
      <div class="printables-toolbar"><h2 id="mats-title">Sound mats</h2>
       ${mats.length ? `<label>Print layout <select data-media-mat><option value="A4">A4 · 1 mat</option><option value="A5">A4 landscape · 2 A5 mats</option></select></label>` : ""}</div>
      ${mats.length ? `<p class="printables-hint">Print on A4${m.mat === "A5" ? " in landscape" : ""} at actual size (100%).${m.mat === "A5" ? " Cut the mats apart along the centre line." : ""}</p>` : ""}
      ${mats.length ? `<div class="printables-grid">${mats.map((p) => `<article class="printable-card"><img src="${esc(p.cover)}" alt="" width="88" height="72" loading="lazy"><div class="printable-details"><h3>${esc(p.title)}</h3><p>${esc(p.detail)} · ${size(p.bytes)}</p></div>${links(p.title, p.path)}</article>`).join("")}</div>` : soon("Sound mats")}
     </section>`;
    const pick = (sel, key, parse) => {
      const el = body.querySelector(sel);
      if (!el) return; // an empty shelf has no print layout to pick
      el.value = String(m[key]);
      el.onchange = () => {
        if (game.paused) return;
        m[key] = parse(el.value);
        game.media();
        game.focus(sel);
      };
    };
    pick("[data-media-layout]", "cards", Number);
    pick("[data-media-trace]", "trace", (v) => (v === "A5" ? "A5" : "A4"));
    pick("[data-media-mat]", "mat", (v) => (v === "A5" ? "A5" : "A4"));
  }
  empty(body, id) {
    const label = SECTIONS.find(([x]) => x === id)[1];
    body.innerHTML = `<section class="printables-library media-empty" aria-labelledby="media-empty-title"><h2 id="media-empty-title">${label}</h2><p class="printables-hint">${EMPTY[id][0]} are coming soon. Until then, try the ${EMPTY[id][1]}.</p></section>`;
  }
  presentation(body, m) {
    const game = this.game, deck = topicPresentation, slides = deck.slides, count = slides.length;
    if (!count) { body.innerHTML = `<section class="printables-library media-empty" aria-labelledby="presentation-title"><h2 id="presentation-title">${esc(deck.title)}</h2>${soon("The slides")}</section>`; return; }
    let index = Math.max(0, Math.min(count - 1, m.slide | 0));
    const parts = slides.map((slide, at) => ({ slide, at })).filter(({ slide, at }) => at === 0 || slide.id.endsWith("-intro") || slide.id === "recap");
    body.innerHTML = `<section class="media-presentation" aria-labelledby="presentation-title">
     <header class="presentation-header"><div><h2 id="presentation-title">${esc(deck.title)}</h2><p>${count} slides · every word, with quick checks and safety</p></div>
      <label>Jump to <select data-presentation-jump>${parts.map(({ slide, at }) => `<option value="${at}">${at === 0 ? "Start" : esc(slide.title)}</option>`).join("")}</select></label></header>
     <div class="presentation-player" data-presentation-player>
      <div class="presentation-stage" data-presentation-stage tabindex="0" role="group" aria-roledescription="slide"><div class="presentation-canvas" style="width:${deck.width}px;height:${deck.height}px"></div></div>
      <nav class="presentation-controls" aria-label="Slides">
       <button type="button" data-presentation-previous>Previous</button>
       <span class="presentation-count" aria-live="polite"></span>
       <button type="button" class="is-main" data-presentation-next>Next</button>
       <button type="button" data-presentation-fullscreen>Full screen</button>
      </nav>
     </div>
     <details class="presentation-notes"><summary>Teacher notes</summary><p data-presentation-notes></p></details>
    </section>`;
    const $ = (s) => body.querySelector(s);
    const player = $("[data-presentation-player]"), stage = $("[data-presentation-stage]"), canvas = $(".presentation-canvas");
    const previous = $("[data-presentation-previous]"), next = $("[data-presentation-next]"), counter = $(".presentation-count");
    const notes = $("[data-presentation-notes]"), jump = $("[data-presentation-jump]"), full = $("[data-presentation-fullscreen]");
    const waiting = () => canvas.querySelector("[data-build-in]:not(.is-shown)");
    const fit = () => {
      const box = stage.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const scale = Math.min(box.width / deck.width, box.height / deck.height);
      canvas.style.transform = `translate(${(box.width - deck.width * scale) / 2}px,${(box.height - deck.height * scale) / 2}px) scale(${scale})`;
    };
    const syncNext = () => { next.textContent = waiting() ? "Show answer" : index === count - 1 ? "Start over" : "Next"; };
    const show = (at) => {
      index = Math.max(0, Math.min(count - 1, at));
      m.slide = index;
      const slide = slides[index];
      canvas.innerHTML = slide.html;
      canvas.querySelectorAll("img").forEach((img) => { img.decoding = "async"; img.onerror = () => { img.style.visibility = "hidden"; }; });
      stage.setAttribute("aria-label", `Slide ${index + 1} of ${count}: ${slide.title}`);
      counter.textContent = `${index + 1} / ${count}`;
      notes.textContent = slide.notes || "No notes for this slide.";
      previous.disabled = index === 0;
      let part = 0;
      parts.forEach(({ at: start }, i) => { if (start <= index) part = i; });
      jump.selectedIndex = part;
      syncNext();
      fit();
    };
    const forward = () => {
      if (game.paused) return;
      const step = waiting();
      if (step) { step.classList.add("is-shown"); syncNext(); return; }
      show(index === count - 1 ? 0 : index + 1);
    };
    const back = () => { if (!game.paused && index > 0) show(index - 1); };
    previous.onclick = back;
    next.onclick = forward;
    jump.onchange = () => { if (!game.paused) show(Number(jump.value)); };
    stage.onkeydown = (e) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); forward(); }
      else if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); back(); }
    };
    full.hidden = !player.requestFullscreen;
    full.onclick = () => {
      if (game.paused) return;
      if (document.fullscreenElement) document.exitFullscreen?.();
      else player.requestFullscreen?.().then(() => stage.focus()).catch(() => {});
    };
    this.onFullscreen = () => { full.textContent = document.fullscreenElement === player ? "Exit full screen" : "Full screen"; requestAnimationFrame(fit); };
    document.addEventListener("fullscreenchange", this.onFullscreen);
    this.observer = new ResizeObserver(fit);
    this.observer.observe(stage);
    show(index);
  }
  // Storybook and lesson cards: a native player with its poster, English captions and a Download link (as Plants).
  videos(body, items, key) {
    const game = this.game;
    if (!items.length) { body.insertAdjacentHTML("beforeend", key === "lessons" ? soon("Narrated lessons") : `<section class="printables-library media-empty"><h2>Videos</h2>${soon("Storybook videos")}</section>`); return; }
    const list = document.createElement("div");
    list.className = "media-resources";
    items.forEach((item, i) => {
      const card = document.createElement("article");
      card.className = "media-resource";
      card.innerHTML = `<h3 id="media-${key}-${i}">${esc(item.title)}</h3><p>${esc(item.summary)}</p>`;
      const player = document.createElement("video");
      Object.assign(player, { controls: true, preload: "none", playsInline: true, poster: item.poster, src: item.src, muted: game.audio.muted });
      player.setAttribute("aria-labelledby", `media-${key}-${i}`);
      const track = Object.assign(document.createElement("track"), { kind: "captions", label: "English", srclang: "en", src: item.captions });
      player.append(track);
      const status = Object.assign(document.createElement("p"), { hidden: true, className: "media-resource-status" });
      status.setAttribute("role", "status");
      player.onplay = () => {
        if (game.paused) { player.pause(); return; }
        game.audio.stop();
        this.players.forEach((other) => other !== player && other.pause());
      };
      player.onerror = () => { status.hidden = false; status.textContent = "This video could not load."; };
      const captions = Object.assign(document.createElement("button"), { type: "button", className: "media-caption-toggle", textContent: "English captions" });
      const sync = () => captions.setAttribute("aria-pressed", String(track.track.mode === "showing"));
      captions.onclick = () => { if (game.paused) return; track.track.mode = track.track.mode === "showing" ? "disabled" : "showing"; sync(); };
      player.textTracks.onchange = sync;
      const actions = document.createElement("div");
      actions.className = "media-resource-actions";
      actions.append(captions, Object.assign(document.createElement("a"), { className: "media-download", href: item.src, download: "", textContent: "Download" }));
      actions.lastChild.setAttribute("aria-label", `Download ${item.title} video`);
      card.append(player, status, actions, Object.assign(document.createElement("p"), { className: "media-resource-credit", textContent: item.credit }));
      this.players.push(player);
      list.append(card);
      sync();
    });
    body.append(list);
  }
  setPaused(paused) { if (paused) this.players?.forEach((p) => p.pause()); }
  destroy() {
    this.players?.forEach((p) => p.pause());
    this.observer?.disconnect();
    if (this.onFullscreen) {
      document.removeEventListener("fullscreenchange", this.onFullscreen);
      if (document.fullscreenElement) document.exitFullscreen?.();
    }
  }
}
