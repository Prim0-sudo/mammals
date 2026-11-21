import { DrawTraceView } from "./draw-trace-view.js";
import { CraftsView } from "./crafts-view.js";
import { ColouringView } from "./colouring-view.js";

// Arts & Crafts (step 9, 16 November 2026): the three sections ported from Plants.
// The engine draws the folder of three cards and the game shell; this view runs one section
// (Arts & Sheets, Draw & Trace or Crafts) inside the shell. The Plants section views expect the
// Plants engine, so `host` gives them the same small surface: els, state, paused, audio, effects
// and refreshBackButton. Back steps from a picture or craft to its list, then to the folder.
export const ARTS_SECTIONS = [
  { id: "arts", title: "Arts & Sheets", line: "Colouring pages and worksheets to print", image: "zebra" },
  { id: "trace", title: "Draw & Trace", line: "Watch, trace, or draw your own", image: "elephant" },
  { id: "crafts", title: "Crafts", line: "Make mammals at home or in class", image: "lion" },
];
const VIEWS = { arts: ColouringView, trace: DrawTraceView, crafts: CraftsView };

export class ArtsSectionView {
  constructor(game, root, section) {
    this.game = game;
    this.section = section;
    const card = root.closest(".game-card");
    const title = card.querySelector(".card-heading h1");
    title.tabIndex = -1;
    const spare = () => Object.assign(document.createElement("span"), { hidden: true });
    // Arts prefs (level, colour, way to play) last for the visit to the app, like Plants.
    const state = (game.artsState ||= {});
    Object.assign(state, { craft: section, tracePicture: null, colourPicture: null, craftItem: null, craftStep: 0 });
    this.host = {
      els: { content: root, title, round: card.parentElement.querySelector(".round-pill") || spare(), helper: spare(), listen: spare(), feedback: card.querySelector("#feedback") || spare() },
      state,
      get paused() { return game.paused; },
      drawTracePrefs: null,
      refreshBackButton: () => game.refreshBack(),
      // Words are spoken only from the recorded af_heart bank.
      audio: { hasRecording: (t) => game.audio.hasRecording(t), speak: (t) => game.audio.speak(t), stop: () => game.audio.stop(), correct: () => game.audio.tone(880, 0.18) },
      effects: { confetti: (n) => game.confetti(n), clear: () => document.getElementById("effects")?.replaceChildren() },
    };
    this.child = new VIEWS[section](this.host);
  }
  open() {
    const s = this.host.state;
    return (this.section === "trace" && s.tracePicture) || (this.section === "arts" && s.colourPicture) || (this.section === "crafts" && s.craftItem) || null;
  }
  backLabel() {
    if (!this.open()) return "Arts & Crafts";
    return this.section === "crafts" ? "Crafts" : "Pictures";
  }
  // A picture or craft goes back to its list (focus on it); otherwise the engine leaves to the folder.
  back() {
    const id = this.open();
    if (!id) return false;
    const s = this.host.state;
    this.game.audio.stop();
    s.tracePicture = null; s.colourPicture = null; s.craftItem = null; s.craftStep = 0;
    this.child.render();
    this.game.refreshBack();
    const root = this.host.els.content;
    (root.querySelector(`[data-trace-picture="${id}"],[data-colour-picture="${id}"],[data-craft-item="${id}"]`) || this.host.els.title).focus({ preventScroll: true });
    return true;
  }
  setPaused(paused) { this.child?.setPaused(paused); }
  destroy() { this.child?.destroy(); this.child = null; }
}
