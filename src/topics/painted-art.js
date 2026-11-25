// Painted art from Codex that the games, the landing and the app backdrop use once it arrives.
// Install a piece by converting it to WebP at quality 85 as assets/painted/<id>.webp, then add its
// id to READY. Until then every screen keeps its fallback look (the landing background picture),
// so nothing breaks while art is out.
// 23 November 2026: the owner chose landing concept A, Burrow Bank (docs/landing-art/).
const LANDING = ["sky", "distant", "middle", "tunnels", "bank", "bank-lip", "foreground", "cloud-1", "cloud-2", "cloud-3"];
// 25 November 2026: the owner approved the six painted game cards (docs/menu-art/).
const GAME_CARDS = ["checkup", "homes", "nursery", "otter", "dash", "bat"];
export const READY = new Set([...LANDING.map((n) => `landing/${n}`), ...GAME_CARDS.map((g) => `games/card-${g}`)]);

let where = (id) => `assets/painted/${id}.webp`;
export const painted = (id) => (READY.has(id) ? where(id) : null);
// The browser checks point painted ids at stand-in pictures with this.
export const usePaintedSource = (fn) => { where = fn; };

// Every background is layered (blueprint ART-AND-ANIMATION, "Layered backgrounds"): planes painted
// from one camera, each with a depth from 0 (still) to 1 (moves the most), plus loose clouds.
// A scene only switches over when all its planes are ready; clouds are added one by one.
export const SCENES = {
  // The landing and the app backdrop behind every screen: the Burrow Bank. The dark tunnel insides
  // sit right behind the bank (same depth) so the peeking animals rise out of the cut-out holes. The
  // lip is the bank's own lower rim round each hole, drawn again in front of the animal, so the rim
  // hides its body instead of a straight clip line.
  backdrop: {
    layers: [["landing/sky", 0], ["landing/distant", 0.2], ["landing/middle", 0.5], ["landing/tunnels", 0.62], ["landing/bank", 0.62], ["landing/bank-lip", 0.62], ["landing/foreground", 1]],
    clouds: [["landing/cloud-1", 7, 34], ["landing/cloud-2", 19, 24], ["landing/cloud-3", 12, 16]],
  },
};

// Burrow Bank peeks, measured on the 3344 x 1882 layers (docs/landing-art/2026-11-23-layers/holes.png).
// x: centre of the opening; edge: the line the animal rises from behind (low in the opening); width: how
// wide the animal's 512 canvas is drawn, in layer pixels.
// layer: the plane it rides with. Poses: ahead, left, right, blink and one special.
const peek = (animal, special) => ["ahead", "left", "right", "blink", special].map((p) => `assets/painted/landing/peeks/${animal}-${p}.webp`);
// The peek planes go in just before `front`. Holes moved or added here need bank-lip.png rebuilt.
export const LANDING_PEEKS = {
  width: 3344,
  height: 1882,
  front: "bank-lip",
  animals: [
    { name: "rabbit", x: 148, edge: 1066, width: 200, depth: 0.62, poses: peek("rabbit", "ears") },
    { name: "fox", x: 528, edge: 1262, width: 350, depth: 0.62, poses: peek("fox", "sniff") },
    { name: "badger", x: 295, edge: 1515, width: 360, depth: 0.62, poses: peek("badger", "sniff") },
    // The mouse's hump moved from mid-meadow (x 1410) to the right (x 2300, in view on 4:3 too) on 23 Nov (owner).
    { name: "mouse", x: 2300, edge: 1560, width: 130, depth: 0.62, poses: peek("mouse", "whiskers") },
    // 23 Nov: the owner had the leaf pile and its hedgehog removed; the meadow is open there now.
  ],
};

// Landing spots where flying animals stop. Mammals has no fliers; the animals peek instead.
export const LANDING_SPOTS = { layer: "landing/middle", width: 0, height: 0, left: [], right: [] };
export const spotsReady = (spots = LANDING_SPOTS, source = painted) =>
  !!(spots.width && spots.height && source(spots.layer) && (spots.left.length || spots.right.length));
