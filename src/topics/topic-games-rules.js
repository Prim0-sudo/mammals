// Full rules for the six Mammal Games, shown from the "How to play" button on each game's level
// page. Each game keeps its rules next to its data (src/topics/games/<id>-rules.js), with level
// numbers taken from that game's SETTINGS table.
import { RULES as checkup } from "./games/checkup-rules.js";
import { RULES as homes } from "./games/homes-rules.js";
import { RULES as nursery } from "./games/nursery-rules.js";
import { RULES as otter } from "./games/otter-rules.js";
import { RULES as dash } from "./games/dash-rules.js";
import { RULES as bat } from "./games/bat-rules.js";

export const GAME_RULES = { checkup, homes, nursery, otter, dash, bat };
