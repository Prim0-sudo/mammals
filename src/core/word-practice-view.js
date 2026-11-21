// Short vowels (CVC) and Sound & Blend for Mammal Discovery Club, ported from Plants (16 November 2026).
// One word card at a time: the picture, the word in letters, Spell the word (British letter names),
// Sound it out (the shared British sound recordings, following the hand-written sound plans in
// word-sound-plans.js), the meaning and Previous / Next. The blend step says the whole word from the
// af_heart narration bank. Listen & Read (17 November 2026) uses the same card for one sentence at a
// time: the reading sentences first, then every word's sentence, each lit word by word as it plays.
import { el, button } from "./foundation-dom.js";
import { playVoice } from "./shared-voice-player.js";
import { phonicsLife } from "./phonics-life.js";
import { mountWheelReading } from "../topics/word-reading.js";
import { PRONUNCIATION_NOTES } from "../topics/word-sound-plans.js";

// CVC here means consonant, short vowel, consonant sounds: sh, th, ck, ng, tch, ll and ss are one sound each.
export const CVC_IDS = new Set(["cat", "dog", "rat", "pig", "bat", "cub", "kid", "den", "dig", "run", "hop"]);

export class WordPracticeView {
  constructor(game, root, kind) {
    this.game = game; this.root = root; this.kind = kind;
    this.settings = { get muted() { return game.audio.muted; } };
    this.life = phonicsLife(game);
    // Teacher selection applies, like every other activity.
    this.items = kind === "reading" ? readingItems(game) : game.pool("learn").filter((w) => w.kind === "word" && (kind !== "cvc" || CVC_IDS.has(w.id)));
    this.noun = kind === "reading" ? "sentence" : "word";
    const filters = el("div", "phonics-word-filters");
    const find = el("label", "", `Find a ${this.noun}`);
    this.search = el("input", "foundation-search"); this.search.type = "search"; this.search.autocomplete = "off";
    find.append(this.search); filters.append(find);
    const groupLabel = el("label", "", "Group");
    this.group = el("select");
    const all = el("option", "", "All groups"); all.value = "all"; this.group.append(all);
    for (const c of game.topic.categories) {
      if (!this.items.some((w) => w.categoryId === c.id)) continue;
      const o = el("option", "", c.label); o.value = c.id; this.group.append(o);
    }
    groupLabel.append(this.group); filters.append(groupLabel);
    // The search, group and word last for the visit to the app.
    this.state = (game.phonicsWords ||= {})[kind] ||= { query: "", group: "all", id: null };
    this.search.value = this.state.query; this.group.value = this.state.group;
    if (!this.group.value) this.group.value = this.state.group = "all";
    this.card = el("section", "phonics-word-card");
    root.append(filters, this.card);
    const update = () => { this.state.query = this.search.value; this.state.group = this.group.value; this.state.id = null; this.renderCard(); };
    this.life.listen(this.search, "input", update);
    this.life.listen(this.group, "change", update);
    this.renderCard();
  }
  renderCard() {
    this.cardLife?.destroy();
    this.cardLife = phonicsLife(this.game);
    this.card.replaceChildren();
    const query = this.state.query.trim().toLocaleLowerCase("en-GB");
    const pool = this.items.filter((w) => (this.state.group === "all" || w.categoryId === this.state.group) && w.name.toLocaleLowerCase("en-GB").includes(query));
    if (!pool.length) {
      if (!this.items.length) {
        this.card.append(el("p", "empty-selection", "None of these words are in the Teacher selection. Change it in Settings, Teacher."));
      } else {
        this.card.append(el("p", "empty-selection", `No ${this.noun}s match.`), button("Clear search", () => {
          if (this.game.paused) return;
          this.search.value = ""; this.group.value = "all"; this.state.query = ""; this.state.group = "all";
          this.renderCard(); this.search.focus();
        }, "learn-action"));
      }
      return;
    }
    let index = pool.findIndex((w) => w.id === this.state.id);
    if (index < 0) index = 0;
    const item = pool[index];
    this.state.id = item.id;
    this.card.append(el("p", "phonics-word-position", `${this.kind === "reading" ? "Sentence" : "Word"} ${index + 1} of ${pool.length}`));
    const image = el("img", "phonics-word-picture");
    image.src = item.image; image.alt = item.imageAlt || item.name; image.draggable = false;
    const body = el("div", "phonics-word-body");
    if (this.kind === "reading") {
      this.mountSentence(body, item);
      this.card.append(image, body);
      this.addNav(pool, index);
      return;
    }
    const reader = el("div", "bug-word-reader");
    body.append(reader);
    mountWheelReading(reader, { ...item, label: item.name, speechText: item.name }, this.cardLife, this.settings);
    body.append(el("p", "phonics-word-definition", item.definition));
    const notes = item.name.toLowerCase().split(/\s+/).map((w) => PRONUNCIATION_NOTES[w]).filter(Boolean);
    if (notes.length) {
      const details = el("details", "foundation-credits phonics-word-note");
      details.append(el("summary", "", "Pronunciation note"), el("p", "", notes.join(" ")));
      body.append(details);
    }
    this.card.append(image, body);
    this.addNav(pool, index);
  }
  addNav(pool, index) {
    const nav = el("div", "learn-actions phonics-word-nav");
    const go = (to, which) => { if (this.game.paused) return; this.state.id = pool[to].id; this.renderCard(); this.card.querySelector(`[data-word-${which}]:not(:disabled)`)?.focus(); };
    const previous = button("Previous", () => go(index - 1, "previous"), "learn-action secondary-button");
    previous.disabled = index === 0; previous.dataset.wordPrevious = "";
    const next = button(`Next ${this.noun}`, () => go(index + 1, "next"), "learn-action primary-button");
    next.disabled = index === pool.length - 1; next.dataset.wordNext = "";
    nav.append(previous, next);
    this.card.append(nav);
  }
  // The sentence, word by word, lit along the recording's clock (word lengths estimate where each
  // word starts). Hear the sentence plays the af_heart clip; with sound off the class reads together.
  // Reading speed (owner, 19 November 2026) slows or quickens the clip without changing the voice's
  // pitch, and is kept while the app stays open.
  mountSentence(body, item) {
    const sentence = el("p", "phonics-reading-sentence");
    const words = [];
    for (const token of item.sentence.split(/(\s+)/)) {
      if (!token) continue;
      if (/^\s+$/.test(token)) { sentence.append(token); continue; }
      const word = el("span", "reading-word", token);
      words.push(word); sentence.append(word);
    }
    let total = 0, lit = -1, voice = null;
    const ends = words.map((w) => (total += Math.max(2, w.textContent.replace(/[^a-z]/gi, "").length)));
    const light = (i) => { if (i === lit) return; words[lit]?.classList.remove("is-reading"); words[i]?.classList.add("is-reading"); lit = i; };
    const status = el("p", "wheel-reading-status");
    status.setAttribute("aria-live", "polite");
    const hear = button("Hear the sentence", () => play(), "learn-action primary-button");
    const stopButton = button("Stop", () => { if (!voice) return; stop(); status.textContent = "Stopped."; }, "learn-action secondary-button");
    const playing = (on) => { stopButton.disabled = !on; };
    const stop = () => { voice?.cancel(); voice = null; light(-1); playing(false); };
    const speedLabel = el("label", "reading-speed", "Reading speed ");
    const speed = el("input"); speed.type = "range"; speed.min = "0.6"; speed.max = "1.2"; speed.step = "0.1";
    speed.value = String(this.game.readingRate ?? 1);
    const speedName = el("span", "reading-speed-value");
    const nameSpeed = () => { const r = Number(speed.value); speedName.textContent = r < 0.75 ? "Slow" : r < 0.95 ? "A bit slower" : r < 1.05 ? "Normal" : "Faster"; speed.setAttribute("aria-valuetext", speedName.textContent); };
    speed.oninput = () => { this.game.readingRate = Number(speed.value); voice?.setRate(this.game.readingRate); nameSpeed(); };
    nameSpeed();
    speedLabel.append(speed, speedName);
    const play = () => {
      if (this.game.paused) return;
      stop();
      if (this.settings.muted) { status.textContent = "Sound is off. Read the sentence together."; return; }
      status.textContent = "Listen…";
      playing(true);
      voice = playVoice(item.sentence, {
        rate: Number(speed.value),
        onProgress: (p) => light(ends.findIndex((end) => end > p * total)),
        onCancelled: () => light(-1),
        onEnded: () => { voice = null; light(-1); playing(false); status.textContent = "Your turn to read."; },
        onError: () => { voice = null; light(-1); playing(false); status.textContent = "Audio unavailable. Read together."; },
      });
    };
    const actions = el("div", "learn-actions phonics-reading-actions");
    actions.append(hear, stopButton);
    playing(false);
    this.cardLife.listen(window, "plants-pause", () => { if (this.game.paused) voice?.pause(); else voice?.resume(); });
    this.cardLife.cleanups.push(stop);
    body.append(sentence, actions, speedLabel, status);
    if (item.note) {
      const details = el("details", "foundation-credits phonics-word-note");
      details.append(el("summary", "", "Talk about it"), el("p", "", item.note));
      body.append(details);
    }
  }
  setPaused(paused) { this.life.setPaused(paused); this.cardLife?.setPaused(paused); }
  destroy() { this.cardLife?.destroy(); this.life.destroy(); }
}

// Listen & Read cards: the reading sentences (talk prompts with gaps are left out), then each word's
// own sentence, in teaching order. A sentence shows with its word's picture and only when that word
// is in the Teacher selection. Each sentence appears once.
function readingItems(game) {
  const words = game.pool("learn").filter((w) => w.kind === "word");
  const byId = new Map(words.map((w) => [w.id, w]));
  const seen = new Set(), out = [];
  const add = (id, text, word, note) => {
    if (!word || !text || seen.has(text)) return;
    seen.add(text);
    out.push({ id, name: text, sentence: text, image: word.image, imageAlt: word.imageAlt, categoryId: word.categoryId, note });
  };
  for (const r of game.topic.curriculum.readingPractice || []) if (!r.text.includes("…")) add(r.id, r.text, byId.get(r.itemId), r.note);
  for (const w of words) add(`sentence-${w.id}`, w.sentence, w);
  return out;
}
