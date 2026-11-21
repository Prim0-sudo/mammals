// Painted art from Codex that the games, the landing and the app backdrop use once it arrives.
// Install a piece by converting it to WebP at quality 85 as assets/painted/<id>.webp, then add its
// id to READY. Until then every screen keeps its fallback look (the landing background picture),
// so nothing breaks while art is out. Mammals has no painted art yet (21 November 2026); the
// layered landing scene comes after the owner picks the art style.
export const READY = new Set([]);

let where = (id) => `assets/painted/${id}.webp`;
export const painted = (id) => (READY.has(id) ? where(id) : null);
// The browser checks point painted ids at stand-in pictures with this.
export const usePaintedSource = (fn) => { where = fn; };

// Every background is layered (blueprint ART-AND-ANIMATION, "Layered backgrounds"): planes painted
// from one camera, each with a depth from 0 (still) to 1 (moves the most), plus loose clouds.
// A scene only switches over when all its planes are ready; clouds are added one by one.
export const SCENES = {
  // The landing and the app backdrop behind every screen (a woodland edge, planned).
  backdrop: {
    layers: [["landing/sky", 0], ["landing/distant", 0.2], ["landing/middle", 0.5], ["landing/foreground", 1]],
    clouds: [["landing/cloud-1", 7, 34], ["landing/cloud-2", 19, 24], ["landing/cloud-3", 12, 16]],
  },
};

// Landing spots where the landing's animals stop, read off the middle layer once it is painted.
// Until then the list is empty and the landing keeps still.
export const LANDING_SPOTS = { layer: "landing/middle", width: 0, height: 0, left: [], right: [] };
export const spotsReady = (spots = LANDING_SPOTS, source = painted) =>
  !!(spots.width && spots.height && source(spots.layer) && (spots.left.length || spots.right.length));
