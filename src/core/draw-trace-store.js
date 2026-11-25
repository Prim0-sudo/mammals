import { fromFile } from './line-art.js';

// Draw & Trace, kept on this device: the "My pictures" list, the half-finished "Draw my own"
// drawing and the drawing options. Everything is checked on the way in and on the way out, and
// every localStorage call is guarded, so a full or blocked store never breaks the activity.
const W = 1000, H = 750;
const STORE = 'ludimi.mammals.drawTrace.v1', DRAFT = `${STORE}.draft`, SETTINGS = `${STORE}.settings`;

// 16 pen colours in rainbow order, then skin tones (owner, 13 November 2026). Black stays first as the default pen.
export const drawColours = [['#2b2b28', 'Black'], ['#8a8a82', 'Grey'], ['#c8323c', 'Red'], ['#e0662a', 'Orange'], ['#d9a21b', 'Yellow'], ['#8bbf3f', 'Light green'], ['#2f7d3e', 'Green'], ['#1f9e93', 'Turquoise'], ['#5bb8e8', 'Sky blue'], ['#2f6fb5', 'Blue'], ['#7a4bb0', 'Purple'], ['#d9487a', 'Pink'], ['#f29bc0', 'Light pink'], ['#f4c7a1', 'Peach'], ['#d9a066', 'Tan'], ['#8a5a3b', 'Brown']];
// Pen look is the child's choice on the picture list; the other four belong to the Teacher dialog.
export const drawOptions = {
  pen: { label: 'Pen look', choices: [['pencil', 'Pencil'], ['crayon', 'Crayon'], ['marker', 'Marker'], ['watercolour', 'Watercolour'], ['chalk', 'Chalk'], ['rainbow', 'Rainbow']] },
  steps: { label: 'Steps', choices: [['all', 'All in one go'], ['pause', 'Step by step']] },
  guide: { label: 'Path look', choices: [['road', 'Wide road'], ['dots', 'Dotted'], ['ghost', 'Faded']] },
  speed: { label: 'Speed', choices: [[.25, 'Very slow'], [.5, 'Slow'], [1, 'Normal'], [2, 'Fast'], [4, 'Very fast']] },
  timing: { label: 'Timing', choices: [['drawn', 'As I drew it'], ['even', 'Even and smooth']] }
};
const DEFAULTS = { pen: 'pencil', steps: 'all', guide: 'road', speed: 1, timing: 'drawn' };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const num = v => typeof v === 'number' && isFinite(v);
const newId = () => 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const read = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
const write = (key, value) => { try { value === null ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };

// Turns anything (a saved entry, an imported file, the recording) into a safe picture, or null.
export function cleanDrawing(d, fallbackName, keepId) {
  if (!d || typeof d !== 'object' || !Array.isArray(d.strokes)) return null;
  const sx = W / (num(d.width) && d.width > 0 ? d.width : W), sy = H / (num(d.height) && d.height > 0 ? d.height : H);
  const strokes = [];
  for (const s of d.strokes.slice(0, 3000)) {
    if (!s || !Array.isArray(s.pts)) continue;
    const pts = []; let last = -Infinity;
    for (const p of s.pts.slice(0, 20000)) {
      if (!Array.isArray(p) || !num(p[0]) || !num(p[1])) continue;
      last = Math.max(last, num(p[2]) ? p[2] : 0);   // time never runs backwards inside a line
      pts.push([+clamp(p[0] * sx, 0, W).toFixed(1), +clamp(p[1] * sy, 0, H).toFixed(1), Math.round(last)]);
    }
    if (pts.length) strokes.push({ color: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s.color) ? s.color : '#2b2b28', step: num(s.step) ? Math.max(0, Math.floor(s.step)) : 0, pts });
  }
  if (!strokes.length) return null;
  const base = Math.min(...strokes.map(s => s.pts[0][2]));   // the clock starts at the first line
  if (base) for (const s of strokes) for (const p of s.pts) p[2] -= base;
  // steps become 0,1,2… with no holes and lines grouped by step
  const used = [...new Set(strokes.map(s => s.step))].sort((a, b) => a - b), names = Array.isArray(d.stepNames) ? d.stepNames : [];
  strokes.forEach(s => { s.step = used.indexOf(s.step); });
  strokes.sort((a, b) => a.step - b.step);
  return {
    id: keepId && typeof d.id === 'string' && /^[\w-]{1,40}$/.test(d.id) ? d.id : newId(),
    name: String(d.name || fallbackName || '').trim().slice(0, 60) || 'My drawing',
    stepNames: used.map(i => typeof names[i] === 'string' ? names[i].trim().slice(0, 60) : ''), strokes
  };
}

/* ---------- change notices: the picture list and an open board follow the Teacher dialog ---------- */
const listeners = new Set();
export function subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
const notify = what => { for (const listener of [...listeners]) listener(what); };

/* ---------- options ---------- */
let settings = null;
export function getSettings() {
  if (!settings) {
    const saved = read(SETTINGS) || {};
    settings = Object.fromEntries(Object.entries(DEFAULTS).map(([key, fallback]) => [key, drawOptions[key].choices.some(([value]) => value === saved[key]) ? saved[key] : fallback]));
  }
  return { ...settings };
}
export function saveSettings(next) {
  const current = getSettings();
  for (const key of Object.keys(DEFAULTS)) if (drawOptions[key].choices.some(([value]) => value === next?.[key])) current[key] = next[key];
  settings = current; write(SETTINGS, current); notify('settings');
}

/* ---------- My pictures ---------- */
let mine = null;
export function myPictures() {
  if (!mine) {
    mine = []; const raw = read(STORE), seen = new Set();
    for (const d of (Array.isArray(raw) ? raw : [])) { const c = cleanDrawing(d, '', true); if (c && !seen.has(c.id)) { seen.add(c.id); mine.push(c); } }
  }
  return mine;
}
export const myPicture = id => myPictures().find(d => d.id === id) || null;
// Adds a picture to the list. `kept` is false when the device had no room: it then lasts until the page closes.
export function addPicture(drawing, name) {
  const d = cleanDrawing(name ? { ...drawing, name } : drawing, `My drawing ${myPictures().length + 1}`);
  if (!d) return null;
  myPictures().push(d);
  const kept = write(STORE, mine); notify('pictures');
  return { drawing: d, kept };
}
export function removePicture(id) {
  mine = myPictures().filter(d => d.id !== id); write(STORE, mine); notify('pictures');
}

/* ---------- the half-finished "Draw my own" drawing survives a reload ---------- */
export function loadDraft() {
  const d = cleanDrawing(read(DRAFT), 'draft');
  return d ? { strokes: d.strokes, names: d.stepNames } : null;
}
export function saveDraft(strokes, names) { write(DRAFT, strokes.length ? { stepNames: names, strokes } : null); }

/* ---------- files ---------- */
export function downloadBlob(blob, fileName) {
  const link = document.createElement('a'), url = URL.createObjectURL(blob); link.href = url; link.download = fileName;
  document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
}
export const fileSlug = (name, fallback) => String(name || '').normalize('NFKD').replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || fallback;
export function exportPicture(d) {
  const blob = new Blob([JSON.stringify({ format: 'ludimi-drawing', version: 1, width: W, height: H, name: d.name, stepNames: d.stepNames, strokes: d.strokes })], { type: 'application/json' });
  downloadBlob(blob, `${fileSlug(d.name, 'drawing')}.drawing.json`);
}
// A PNG, JPEG, WEBP or SVG goes through the line-art converter; a JSON file is a drawing.
// Resolves to { drawing, kept }, or rejects with a short message for the Teacher dialog.
export async function importPicture(file) {
  let d = null;
  if (/^image\//.test(file.type)) {
    try { if (file.size <= 20e6) d = cleanDrawing(await fromFile(file), 'Line art'); } catch {}
    if (!d) throw Error('No clear lines found in that picture.');
  } else {
    try { if (file.size <= 8e6) d = cleanDrawing(JSON.parse(await file.text()), file.name.replace(/(\.drawing)?\.json$/i, '')); } catch {}
    if (!d) throw Error('That file is not a drawing.');
  }
  return addPicture(d);
}
