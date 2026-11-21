// A topic game that is still being made: the real level page (three level cards and How to play),
// with each level opening an honest "being made" note instead of play (Mammals, 21 November 2026).
import { TopicGameView, esc } from "./topic-games-kit.js";

export class PlaceholderGameView extends TopicGameView {
  constructor(game, root, meta) {
    super(game, root, meta);
    this.levels();
  }
  levelArt() {
    return this.art(this.meta.image);
  }
  levelNote() {
    return "Being made";
  }
  play() {
    this.setStage("play");
    this.root.innerHTML = `<div class="ig-stage ig-stage--soon"><div class="ig-soon" role="status">${this.art(this.meta.image) ? `<img class="ig-soon-art" src="${esc(this.art(this.meta.image))}" alt="" draggable="false">` : ""}<h2>${esc(this.meta.title)}</h2><p>This game is being made. Please come back soon.</p><p>Until then, try the six games in Activities.</p><button class="button" type="button" data-ig-soon-back>Back to levels</button></div></div>`;
    const back = this.root.querySelector("[data-ig-soon-back]");
    back.onclick = () => { this.reset(); this.levels(this.level); };
    back.focus({ preventScroll: true });
  }
}
