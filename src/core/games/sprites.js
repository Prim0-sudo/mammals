// Motion frames for the arcade animals (owner approved, 24 November 2026). Each sheet is one row of
// 512 px cells: the same animal in the same side view, facing right. Frame 0 is the still pose, shown
// before a round starts and under reduced motion.
const DIR = "assets/topics/mammals/games/sprites/";
export const CELL = 512;

export function loadSheet(name) {
  const img = new Image();
  img.decoding = "async";
  img.src = `${DIR}${name}.webp`;
  return img;
}
export const sheetReady = (img) => !!(img && img.complete && img.naturalWidth);

// The frame a looping cycle shows at a time (seconds): ms per frame, through a sequence of frames.
export function cycleFrame(time, ms, seq) {
  return seq[Math.floor(((time || 0) * 1000) / ms) % seq.length];
}

// Draw one cell with its anchor point (in cell pixels) at the current origin, size px across.
export function drawCell(ctx, sheet, frame, [ax, ay], size) {
  ctx.drawImage(sheet, frame * CELL, 0, CELL, CELL, (-ax / CELL) * size, (-ay / CELL) * size, size, size);
}
