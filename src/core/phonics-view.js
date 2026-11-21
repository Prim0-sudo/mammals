// Phonics & Sight Words for Mammal Discovery Club. Alphabet, Consonant blends and Sound families mount the
// series' shared foundations (approved recordings, players and cards) with Mammals picture cards.
// Short vowels and Sound & Blend read one Mammals word at a time from the hand-written sound plans
// (word-practice-view.js). Listen & Read reads the Mammals sentences on the narration
// (same view, one sentence at a time).
import { mountFoundations } from "../topics/shared-foundations.js";
import { letterPictures } from "../topics/letter-pictures.js";
import { blendPictures, familyPictures } from "../topics/sound-pictures.js";
import { cancelVoice } from "./shared-voice-player.js";
import { phonicsLife } from "./phonics-life.js";
import { WordPracticeView } from "./word-practice-view.js";

const art = (id) => `assets/topics/mammals/vocabulary/${id}.webp`;
// Menu order runs simple to hard (blueprint GAME-CONTENTS).
export const PHONICS_SECTIONS = [
  { id: "alphabet", label: "Alphabet names & sounds", image: art("antlers"), sound: "Aa" },
  { id: "cvc", label: "Short vowels (CVC)", image: art("cat"), sound: "cat" },
  { id: "blends", label: "Consonant blends", image: art("sloth"), sound: "sl" },
  { id: "families", label: "Sound families", image: art("sheep"), sound: "ee" },
  { id: "words", label: "Sound & Blend", image: art("rabbit"), sound: "rabbit" },
  { id: "reading", label: "Listen & Read", image: art("lion"), sound: "read" },
];
let dataPromise;
const loadFoundations = () =>
  (dataPromise ??= fetch(new URL("../topics/shared-foundations.json", import.meta.url))
    .then((r) => { if (!r.ok) throw Error("Foundations unavailable"); return r.json(); })
    .catch((e) => { dataPromise = null; throw e; }));

export class PhonicsView {
  constructor(game, root, section) {
    this.game = game;
    this.life = phonicsLife(game);
    this.settings = { get muted() { return game.audio.muted; } };
    const info = PHONICS_SECTIONS.find((x) => x.id === section);
    if (!info) this.menu(root);
    else if (info.pending) root.innerHTML = `<div class="hub-empty"><p>${info.pending}</p></div>`;
    else if (section === "cvc" || section === "words" || section === "reading") this.words = new WordPracticeView(game, root, section);
    else this.foundations(root, section);
    const credits = document.createElement("details");
    credits.className = "foundation-credits";
    credits.innerHTML = "<summary>Audio credits</summary><p>British English recordings shared across the Ludimi series, including Phonicademy material.</p>";
    root.append(credits);
  }
  menu(root) {
    const grid = document.createElement("div");
    grid.className = "phonics-menu";
    for (const s of PHONICS_SECTIONS) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "phonics-tile";
      b.dataset.phonics = s.id;
      b.innerHTML = `<span class="phonics-tile__art" aria-hidden="true"><img src="${s.image}" alt="" loading="lazy"><span class="phonics-tile__sound">${s.sound}</span></span><span class="phonics-tile__label">${s.label}</span>${s.pending ? '<span class="tile-note">Coming soon</span>' : ""}`;
      b.onclick = () => { if (!this.game.paused) this.game.phonics(s.id); };
      grid.append(b);
    }
    root.append(grid);
  }
  foundations(root, section) {
    const mount = document.createElement("div");
    mount.className = "foundation-mount";
    mount.textContent = "Loading recordings and letter cards…";
    root.append(mount);
    loadFoundations()
      .then((data) => {
        if (this.life.ended) return;
        mount.replaceChildren();
        mountFoundations(mount, {
          kind: section, data, scope: { level: "all", lesson: "all", collection: "all" },
          settings: this.settings, life: this.life,
          pictures: section === "alphabet" ? letterPictures : section === "blends" ? blendPictures : familyPictures,
        });
        // The search box keeps what was typed while the page stays open.
        const search = mount.querySelector(".foundation-search"), saved = this.game.state.phonicsSearch?.[section];
        if (saved) { search.value = saved; search.dispatchEvent(new Event("input")); }
        this.life.listen(search, "input", () => { (this.game.state.phonicsSearch ??= {})[section] = search.value; });
      })
      .catch(() => { if (!this.life.ended) mount.textContent = "The letter cards did not load. Go back to Phonics and try again."; });
  }
  // The shared foundations listen for these window events (names kept from the series code).
  setPaused(paused) { this.life.setPaused(paused); this.words?.setPaused(paused); window.dispatchEvent(new Event("plants-pause")); }
  destroy() { this.words?.destroy(); this.life.destroy(); cancelVoice(); }
}
