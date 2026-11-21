import "./harness-shell.js";
import { topic } from "../src/topics/mammals.js";
import { GameEngine } from "../src/core/game-engine.js";
import { applyTheme } from "../src/core/theme.js";
import { getSkin } from "../src/core/skins/index.js";
applyTheme(topic);
try { localStorage.removeItem("ludimi.mammals-test.progress.v1"); } catch {}
const game = new GameEngine(topic, { progressId: "mammals-test" });
game.init();
game.audio.muted = true;
game.reduced = () => true;
const query = new URLSearchParams(location.search),
  mode = query.get("mode") || "menu";
if (mode === "spelling") await getSkin("homeward-trail").prepare(topic.modeSkins.spelling);
if (mode === "menu") game.menu();
else if (mode === "gallery") {
  game.app.innerHTML =
    '<h1>Vocabulary art review</h1><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;padding:20px">' +
    topic.items
      .map(
        (x) =>
          '<div style="background:#fffbee;text-align:center;border-radius:12px;padding:10px"><img style="width:130px;height:130px" src="' +
          x.image +
          '" alt="' +
          x.imageAlt +
          '"><p>' +
          x.name +
          "</p></div>",
      )
      .join("") +
    "</div>";
} else {
  game.menu();
  game.start(mode);
  if (mode === "flip") {
    game.startFlip(Number(query.get("count") || 10));
    if (query.has("open"))
      for (const tile of game.state.tiles) {
        tile.open = true;
        game.updateTile(tile);
      }
    if (query.has("complete"))
      game.feedback("Every pair found!", () => game.results());
  }
  if (mode === "learn") game.chooseCategory(query.get("category") || "mammals");
  if (mode === "wheel") game.chooseCategory("all");
  if (mode === "knowledge" && !query.has("setup")) game.chooseKnowledgeGroup(query.get("group") || "all");
  if (mode === "sort" && !query.has("setup")) game.chooseSortRule(query.get("rule") || "land-or-water");
  if (["identify", "spelling"].includes(mode)) {
    if (mode === "spelling") game.chooseCategory("all");
    document.querySelector('[data-count="all"]').click();
  }
  if (mode === "spelling" && query.has("long")) {
    game.state.items = [topic.items.find((x) => x.id === "hippopotamus")];
    game.round();
  }
  if (mode === "spelling" && query.has("motion")) game.reduced = () => false;
  if (mode === "spelling" && ["won", "lost"].includes(query.get("ending"))) {
    game.state.spellingStatus = query.get("ending");
    game.state.visualStage = query.get("ending") === "lost" ? 10 : 0;
    game.state.winExitDone = query.get("ending") === "won";
    game.state.misses = query.get("ending") === "lost" ? 9 : Number(query.get("misses") || 0);
    game.spelling(game.state.items[game.state.index]);
  }
  if (mode === "spelling" && !query.has("ending") && query.has("misses")) {
    game.state.misses = Number(query.get("misses"));
    game.spelling(game.state.items[game.state.index]);
  }
  if (mode === "identify" && query.has("text")) {
    document.querySelector('[data-action="target-toggle"]').click();
    document.querySelector('[data-action="answers-toggle"]').click();
  }
  if (query.has("feedback") && ["identify", "knowledge", "sort"].includes(mode))
    game.feedback("Yes! A careful observation helps us learn.", () =>
      game.next(),
    );
}
await Promise.all(
  [...document.images].map((img) => img.decode().catch(() => {})),
);
const horizontal = document.documentElement.scrollWidth > innerWidth;
document.title =
  (horizontal ? "OVERFLOW" : "Layout") +
  " — " +
  mode +
  " — " +
  innerWidth +
  "×" +
  innerHeight;
