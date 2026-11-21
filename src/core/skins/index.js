import { homewardTrail } from "./homeward-trail.js";
const simpleSkin = {
  render: (skin, stage) =>
    `<div class="simple-progress" aria-label="${stage} of 10 mistake steps"><span style="width:${stage * 10}%"></span></div>`,
  mistake(game, stage, final, item, finish) {
    game.state.visualStage = stage;
    game.later(finish, game.reduced() ? 0 : 250);
  },
  win(game, finish) {
    game.later(finish, game.reduced() ? 0 : 250);
  },
};
const skins = { "homeward-trail": homewardTrail, "simple-progress": simpleSkin };
export function getSkin(id) {
  if (!skins[id]) throw Error("Unsupported spelling skin " + id);
  return skins[id];
}
