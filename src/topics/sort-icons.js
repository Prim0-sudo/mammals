// Symbols on the Sort It buttons and setup cards in place of animal pictures, which children took
// for the answer (owner, 19 November 2026): a tick and a cross for Mammal or not, a hill and waves for
// Land or water, a house and a plate for Home or food, a body outline and a motion arrow for Body part or movement.
const svg = (body) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${body}</svg>`;
const number = (n, fill) => svg(`<rect x="8" y="8" width="84" height="84" rx="20" fill="${fill}"/><text x="50" y="52" text-anchor="middle" dominant-baseline="central" font-family="inherit" font-weight="800" font-size="70" fill="#fff">${n}</text>`);

export const SORT_ICONS = {
  tick: svg(`<circle cx="50" cy="50" r="44" fill="#2f8a4c"/><path d="M28 52 l15 15 l30 -32" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`),
  cross: svg(`<circle cx="50" cy="50" r="44" fill="#c8323c"/><path d="M33 33 L67 67 M67 33 L33 67" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round"/>`),
  land: svg(`<rect x="8" y="8" width="84" height="84" rx="20" fill="#7a5a2f"/><path d="M14 74 Q34 36 54 56 Q68 40 86 60 V80 H14Z" fill="#cfe3a0"/><circle cx="68" cy="28" r="9" fill="#ffd85c"/>`),
  water: svg(`<rect x="8" y="8" width="84" height="84" rx="20" fill="#2f6fb5"/><path d="M16 40 q8 -8 17 0 t17 0 t17 0 t17 0 M16 58 q8 -8 17 0 t17 0 t17 0 t17 0 M16 76 q8 -8 17 0 t17 0 t17 0 t17 0" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`),
  home: svg(`<path d="M14 50 L50 18 L86 50" fill="none" stroke="#8a5a3b" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 46 V84 H76 V46" fill="#f6e3c4" stroke="#8a5a3b" stroke-width="7" stroke-linejoin="round"/><rect x="42" y="58" width="16" height="26" rx="3" fill="#8a5a3b"/>`),
  food: svg(`<circle cx="50" cy="54" r="30" fill="#fff" stroke="#d9a21b" stroke-width="7"/><circle cx="50" cy="54" r="17" fill="#fbe8b0"/><path d="M10 26 V48 M6 26 V40 Q10 46 14 40 V26 M10 48 V84" fill="none" stroke="#6b6b62" stroke-width="5" stroke-linecap="round"/><path d="M90 84 V26 Q80 34 82 52 H90" fill="#6b6b62" stroke="#6b6b62" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`),
  body: svg(`<g fill="#e7f0dc" stroke="#2b5d3f" stroke-width="6"><circle cx="50" cy="20" r="12"/><ellipse cx="50" cy="44" rx="14" ry="12"/><ellipse cx="50" cy="74" rx="17" ry="20"/></g><path d="M44 9 L36 2 M56 9 L64 2" stroke="#2b5d3f" stroke-width="5" stroke-linecap="round"/>`),
  move: svg(`<path d="M14 72 Q38 20 74 40" fill="none" stroke="#e0662a" stroke-width="9" stroke-linecap="round"/><path d="M62 24 L80 42 L56 50" fill="none" stroke="#e0662a" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 88 H34 M44 88 H58" stroke="#e0662a" stroke-width="6" stroke-linecap="round" opacity=".55"/>`),
};
