// Draw & Trace and Colouring pictures (Arts & Crafts): coloured outline art in assets/line-art, sorted
// simple to hard within each level (the Insects pattern). A picture shows in the game only once its file is in
// and its id is in READY, and a level with no ready pictures stays hidden, so children never meet a broken
// picture. `say` is the word spoken when a picture is picked; it stays silent until a recording exists.
// Mammals outlines are not drawn yet (21 November 2026): the levels are empty, so Draw & Trace and
// Colouring show their "coming soon" note. One subject on its own is Easy, a subject with a little scene
// is Medium, several animals or a busy scene is Hard.
const planned = [
  { id: "easy", label: "Easy", pictures: [] },
  { id: "medium", label: "Medium", pictures: [] },
  { id: "hard", label: "Hard", pictures: [] },
];

const READY = new Set([]);

export const drawTracePlanned = planned;
export const drawTraceLevels = planned
  .map(level => ({ ...level, pictures: level.pictures.filter(picture => READY.has(picture.id)).map(picture => ({ ...picture, level: level.id })) }))
  .filter(level => level.pictures.length);

export const drawTraceStyles = [
  { id: 'step', label: 'Step by step' },
  { id: 'watch', label: 'Watch it all first' }
];

export const drawTraceFile = picture => `assets/line-art/${picture.id}-${picture.version || 'v1'}.webp`;
// Pictures drawn by scripts/draw-outlines.py (`steps: true`) carry their own tracing steps in a .json twin.
export const drawTraceSteps = picture => (picture.steps ? `assets/line-art/${picture.id}-${picture.version || 'v1'}.json` : null);
export const drawTracePicture = id => drawTraceLevels.flatMap(level => level.pictures).find(picture => picture.id === id) || null;
