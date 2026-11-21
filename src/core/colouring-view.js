import { drawTraceLevels, drawTraceFile, drawTracePicture } from '../topics/draw-trace-pictures.js';
import { downloadBlob, fileSlug } from './draw-trace-store.js';
import { colourPickerHtml, ColourPicker } from './colour-picker.js';
import { worksheets, worksheetsPack } from '../topics/worksheets.js';

// Arts (Arts & Crafts): colouring pages and worksheets. Tabs at the top hold the sections of Arts:
// Colouring, and Worksheets (printable A4 PDFs). Pick a level and a picture (or a blank page),
// then tap a space to fill it or pick a brush (Paint, Crayon, Marker, Spray, Glitter) and colour by hand. Undo, Start over and Save picture
// sit in the bottom dock. The pictures are the Draw & Trace line art.
// Child-view contract: setPaused(paused) and destroy() with listener cleanup.
const BLANK = 'blank', UNDO_LIMIT = 25;
// 21 colours in rainbow order, then skin tones and neutrals (owner, 13 November 2026); the rubber stays last.
const COLOURS = ['#e53935', '#9b1b30', '#fb8c00', '#fdd835', '#c0ca33', '#7cb342', '#2e7d32', '#26a69a', '#4fc3f7', '#1e63b8', '#1a237e', '#8e44ad', '#ce93d8', '#f06292', '#f8bbd0', '#ffcc99', '#d2a679', '#8d5a3b', '#4e342e', '#9e9e9e', '#212121', '#ffffff'];
const COLOUR_NAMES = ['Red', 'Dark red', 'Orange', 'Yellow', 'Lime', 'Light green', 'Green', 'Turquoise', 'Sky blue', 'Blue', 'Navy', 'Purple', 'Lilac', 'Pink', 'Light pink', 'Peach', 'Tan', 'Brown', 'Dark brown', 'Grey', 'Black', 'Rubber'];
const PALETTE = COLOURS.map((c, i) => [c, COLOUR_NAMES[i]]);
// Fill, then the brushes (owner, 19 November 2026): a flat round paint, a grainy crayon, a see-through marker that
// darkens where strokes cross, a spray can and glitter. The rubber always rubs out with a plain round tip.
const TOOLS = [['fill', 'Fill'], ['paint', 'Paint'], ['crayon', 'Crayon'], ['marker', 'Marker'], ['spray', 'Spray'], ['glitter', 'Glitter']];
const RUBBER = '#ffffff', MARKER_ALPHA = .5;
const rgbOf = hex => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const tint = (hex, k) => `rgb(${rgbOf(hex).map(v => Math.round(v + (255 - v) * k)).join(',')})`;
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const BLANK_THUMB = '<svg viewBox="0 0 100 75" aria-hidden="true" focusable="false"><rect x="18" y="10" width="64" height="55" rx="4" fill="#fff" stroke="#c9c2a4" stroke-width="2"/><path d="M40 37h20M50 27v20" stroke="#2f7d3e" stroke-width="5" stroke-linecap="round"/></svg>';

export class ColouringView {
  constructor(game) {
    this.game = game; this.root = game.els.content;
    // Until outline pictures are ready there are no levels; the blank page is always there.
    this.prefs = game.state.colouring ||= { level: drawTraceLevels[0]?.id || BLANK, colour: COLOURS[0], tool: 'fill' };
    if (!TOOLS.some(([id]) => id === this.prefs.tool)) this.prefs.tool = this.prefs.tool === 'brush' ? 'paint' : 'fill';
    this.grain = new Map();
    this.onClick = event => {
      if (game.paused) return;
      const t = event.target.closest('[data-arts-section],[data-arts-paper],[data-colour-level],[data-colour-picture],[data-colour-tool],[data-colour-act]');
      if (!t) return;
      if (t.dataset.artsSection) { this.prefs.section = t.dataset.artsSection; this.render(); return; }
      if (t.dataset.artsPaper) { this.prefs.paper = t.dataset.artsPaper; this.render(); return; }
      if (t.dataset.colourLevel) { this.prefs.level = t.dataset.colourLevel; this.render(); return; }
      if (t.dataset.colourPicture) { game.state.colourPicture = t.dataset.colourPicture; this.render(); game.els.title.focus({ preventScroll: true }); return; }
      if (t.dataset.colourTool) { this.prefs.tool = t.dataset.colourTool; this.paintTools(); return; }
      const act = t.dataset.colourAct;
      if (act === 'undo') this.undo();
      else if (act === 'clear') { this.push(); this.fillCtx.clearRect(0, 0, this.w, this.h); this.paintTools(); }
      else if (act === 'save') this.save();
    };
    this.root.addEventListener('click', this.onClick);
    this.render();
  }
  render() {
    this.stopBoard();
    const game = this.game, id = game.state.colourPicture;
    const picture = id === BLANK ? { id: BLANK, name: 'Blank page' } : drawTracePicture(id);
    game.state.colourPicture = picture?.id || null;
    game.refreshBackButton();
    game.els.helper.hidden = true; game.els.listen.hidden = true; game.els.title.hidden = false;
    if (picture) { this.renderBoard(picture); return; }
    game.els.title.textContent = 'Arts & Sheets'; game.els.round.textContent = '';
    const section = this.prefs.section === 'worksheets' ? 'worksheets' : 'colouring';
    const tabs = `<div class="media-sections trace-segment" role="group" aria-label="Arts &amp; Sheets">${[['colouring', 'Colouring'], ['worksheets', 'Worksheets']].map(([id, label]) => `<button type="button" class="learn-action" data-arts-section="${id}" aria-pressed="${id === section}">${label}</button>`).join('')}</div>`;
    if (section === 'worksheets') { this.renderWorksheets(tabs); return; }
    const level = drawTraceLevels.find(entry => entry.id === this.prefs.level) || drawTraceLevels[0];
    if (!level) this.prefs.level = BLANK;
    const levels = [...drawTraceLevels.map(entry => ({ id: entry.id, label: entry.label })), { id: BLANK, label: 'Blank page' }];
    const card = (pid, thumb, name) => `<button type="button" class="trace-picture" data-colour-picture="${escape(pid)}"><span class="trace-thumb">${thumb}</span><strong>${escape(name)}</strong></button>`;
    const grid = this.prefs.level === BLANK
      ? card(BLANK, BLANK_THUMB, 'Blank page')
      : level.pictures.map(p => card(p.id, `<img src="${escape(drawTraceFile(p))}" alt="" decoding="async"/>`, p.name)).join('');
    this.root.innerHTML = `<div class="trace-options">
        ${tabs}
        <div class="media-sections trace-segment" role="group" aria-label="Level"${drawTraceLevels.length ? '' : ' hidden'}>${levels.map(l => `<button type="button" class="learn-action" data-colour-level="${l.id}" aria-pressed="${l.id === this.prefs.level}">${escape(l.label)}</button>`).join('')}</div>
      </div><div class="trace-picture-grid">${grid}</div>`;
  }
  renderWorksheets(tabs) {
    // No worksheets yet (Mammals, 21 November 2026): the tab stays, with an honest note.
    if (!worksheetsPack) { this.root.innerHTML = `<div class="trace-options">${tabs}</div><section class="printables-library arts-worksheets media-empty" aria-label="Worksheets"><p class="printables-hint media-soon">Worksheets are coming soon. Until then, try a blank colouring page.</p></section>`; return; }
    const size = bytes => bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    // A4: one worksheet per page. A5: two copies side by side on landscape A4, cut in half.
    const a5 = this.prefs.paper === 'a5', paper = a5 ? 'A5' : 'A4';
    const file = sheet => a5 ? sheet.a5Path : sheet.path, bytes = sheet => a5 ? sheet.a5Bytes : sheet.bytes;
    const card = (sheet, detail, complete) => `<article class="printable-card arts-worksheet${complete ? ' printable-card--complete' : ''}">
        <div class="printable-details"><h3>${escape(sheet.title)}</h3><p>${escape(detail)}</p></div>
        <div class="printable-actions">
          <a href="${escape(file(sheet))}" target="_blank" rel="noopener" aria-label="Open ${escape(sheet.title)} PDF (${paper}), new tab">Open</a>
          <a href="${escape(file(sheet))}" download aria-label="Download ${escape(sheet.title)} PDF (${paper})">Download</a>
        </div></article>`;
    const papers = `<div class="media-sections trace-segment" role="group" aria-label="Paper size">${[['a4', 'A4'], ['a5', 'A5']].map(([id, label]) => `<button type="button" class="learn-action" data-arts-paper="${id}" aria-pressed="${id === (a5 ? 'a5' : 'a4')}">${label}</button>`).join('')}</div>`;
    this.root.innerHTML = `<div class="trace-options">${tabs}${papers}</div>
      <section class="printables-library arts-worksheets" aria-label="Worksheets">
        <p class="printables-hint">${a5 ? 'Two copies on each A4 page. Print in landscape at actual size (100%), then cut in half.' : 'Print on A4 at actual size (100%).'}</p>
        <div class="printables-grid">
          ${card(worksheetsPack, `${worksheetsPack.pageCount} worksheets · ${worksheetsPack.pageCount} pages · ${size(bytes(worksheetsPack))}`, true)}
          ${worksheets.map(sheet => card(sheet, `${sheet.level} · 1 page · ${size(bytes(sheet))}`)).join('')}
        </div>
      </section>`;
  }
  async renderBoard(picture) {
    const game = this.game, token = this.token = {};
    game.els.title.textContent = picture.name; game.els.round.textContent = 'Colouring';
    this.picture = picture;
    this.root.innerHTML = `<div class="colour-play">
      <div class="colour-tools">
        <div class="media-sections trace-segment" role="group" aria-label="Tool">${TOOLS.map(([id, label]) => `<button type="button" class="learn-action" data-colour-tool="${id}">${label}</button>`).join('')}</div>
        ${colourPickerHtml(PALETTE)}
      </div>
      <div class="trace-stage"><div class="trace-board colour-board"><canvas data-colour-fill></canvas><canvas data-colour-wet></canvas><canvas data-colour-lines></canvas></div></div>
      <div class="trace-dock colour-dock"><button type="button" class="learn-action" data-colour-act="undo" disabled>Undo</button><button type="button" class="primary-button trace-next" data-colour-act="save">Save picture</button><button type="button" class="learn-action" data-colour-act="clear">Start over</button></div>
    </div>`;
    this.picker = new ColourPicker(this.root, PALETTE, colour => { this.prefs.colour = colour; this.paintTools(); }, () => game.paused);
    const fill = this.root.querySelector('[data-colour-fill]'), wet = this.root.querySelector('[data-colour-wet]'), lines = this.root.querySelector('[data-colour-lines]');
    this.w = 1024; this.h = 768; this.undoStack = [];
    for (const c of [fill, wet, lines]) { c.width = this.w; c.height = this.h; }
    this.fillCtx = fill.getContext('2d', { willReadFrequently: true }); this.linesCtx = lines.getContext('2d');
    this.wetCtx = wet.getContext('2d'); wet.style.opacity = MARKER_ALPHA;
    this.mask = new Uint8Array(this.w * this.h);
    this.paintTools();
    if (picture.id !== BLANK) {
      const img = await new Promise(resolve => { const i = new Image(); i.onload = () => resolve(i); i.onerror = () => resolve(null); i.src = drawTraceFile(picture); });
      if (!img || token !== this.token) return;
      const off = document.createElement('canvas'); off.width = this.w; off.height = this.h;
      const o = off.getContext('2d'); o.fillStyle = '#fff'; o.fillRect(0, 0, this.w, this.h); o.drawImage(img, 0, 0, this.w, this.h);
      const data = o.getImageData(0, 0, this.w, this.h), px = data.data;
      for (let i = 0, p = 0; p < this.mask.length; i += 4, p++) {
        const low = Math.min(px[i], px[i + 1], px[i + 2]);
        this.mask[p] = low < 200 ? 1 : 0;
        px[i + 3] = Math.min(255, (255 - low) * 1.6);   // white becomes see-through, lines stay
      }
      this.linesCtx.putImageData(data, 0, 0);
    }
    this.board = fill;
    this.onDown = event => this.down(event); this.onMove = event => this.move(event); this.onUp = () => this.up();
    lines.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove); window.addEventListener('pointerup', this.onUp); window.addEventListener('pointercancel', this.onUp);
    this.linesEl = lines;
  }
  point(event) {
    const r = this.linesEl.getBoundingClientRect();
    return [Math.round((event.clientX - r.left) / r.width * this.w), Math.round((event.clientY - r.top) / r.height * this.h)];
  }
  down(event) {
    if (this.game.paused) return;
    event.preventDefault();
    const [x, y] = this.point(event);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.push();
    if (this.prefs.tool === 'fill') { this.flood(x, y); this.paintTools(); return; }
    this.drawing = [x, y]; this.linesEl.setPointerCapture?.(event.pointerId);
    this.stroke(x, y, x + .1, y);
  }
  move(event) {
    if (!this.drawing) return;
    const [x, y] = this.point(event), [px, py] = this.drawing;
    this.stroke(px, py, x, y); this.drawing = [x, y];
  }
  up() {
    if (!this.drawing) return;
    this.drawing = null;
    if (this.wetDirty) {   // the marker stroke goes down see-through, so crossing strokes darken but one stroke stays even
      const c = this.fillCtx; c.globalAlpha = MARKER_ALPHA; c.drawImage(this.wetCtx.canvas, 0, 0); c.globalAlpha = 1;
      this.wetCtx.clearRect(0, 0, this.w, this.h); this.wetDirty = false;
    }
    this.paintTools();
  }
  stroke(x1, y1, x2, y2) {
    const colour = this.prefs.colour, tool = colour === RUBBER ? 'rubber' : this.prefs.tool;
    const line = (c, style, width) => { c.strokeStyle = style; c.lineWidth = width; c.lineCap = c.lineJoin = 'round'; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); };
    const c = this.fillCtx;
    if (tool === 'rubber') { c.globalCompositeOperation = 'destination-out'; line(c, '#000', 40); c.globalCompositeOperation = 'source-over'; return; }
    if (tool === 'crayon') { line(c, this.crayon(colour), 20); return; }
    if (tool === 'marker') { line(this.wetCtx, colour, 30); this.wetDirty = true; return; }
    if (tool === 'paint') { line(c, colour, 22); return; }
    // spray and glitter: specks scattered along the move
    const len = Math.hypot(x2 - x1, y2 - y1), steps = Math.max(1, Math.ceil(len / 4));
    for (let s = 1; s <= steps; s++) {
      const cx = x1 + (x2 - x1) * s / steps, cy = y1 + (y2 - y1) * s / steps;
      if (tool === 'spray') {
        c.fillStyle = colour;
        for (let k = 0; k < 14; k++) { const [x, y] = this.scatter(cx, cy, 28); c.fillRect(x, y, 2, 2); }
      } else {
        for (let k = 0; k < 5; k++) {
          const [x, y] = this.scatter(cx, cy, 22), r = Math.random();
          c.fillStyle = r < .5 ? colour : r < .85 ? tint(colour, .55) : '#fff';
          if (Math.random() < .12) { const a = 3 + Math.random() * 4; c.fillRect(x - a, y - .75, a * 2, 1.5); c.fillRect(x - .75, y - a, 1.5, a * 2); }   // a twinkle
          else { c.beginPath(); c.arc(x, y, 1 + Math.random() * 1.6, 0, Math.PI * 2); c.fill(); }
        }
      }
    }
  }
  scatter(cx, cy, radius) { const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * radius; return [cx + Math.cos(a) * d, cy + Math.sin(a) * d]; }
  // a crayon colour is a tile of solid and empty specks fixed to the page, so the grain stays put and going over it
  // again never smears it solid; the paper (or the colour underneath) shows through
  crayon(colour) {
    if (this.grain.has(colour)) return this.grain.get(colour);
    const size = 128, tile = document.createElement('canvas'); tile.width = tile.height = size;
    const t = tile.getContext('2d'), img = t.createImageData(size, size), [r, g, b] = rgbOf(colour);
    const streak = Array.from({ length: size }, () => Math.random() * .25);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      if (Math.random() + streak[y] < .38) continue;
      const i = (y * size + x) * 4; img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
    }
    t.putImageData(img, 0, 0);
    const pattern = this.fillCtx.createPattern(tile, 'repeat');
    this.grain.set(colour, pattern); return pattern;
  }
  flood(x, y) {
    const { w, h, mask } = this;
    if (mask[y * w + x]) return;
    const img = this.fillCtx.getImageData(0, 0, w, h), px = img.data;
    const rubber = this.prefs.colour === '#ffffff';
    const n = parseInt(this.prefs.colour.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const seen = new Uint8Array(w * h), stack = [y * w + x];
    seen[stack[0]] = 1;
    while (stack.length) {
      const p = stack.pop(), i = p * 4;
      if (rubber) px[i + 3] = 0; else { px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255; }
      const px0 = p % w;
      for (const q of [px0 > 0 ? p - 1 : -1, px0 < w - 1 ? p + 1 : -1, p - w, p + w]) {
        if (q < 0 || q >= w * h || seen[q] || mask[q]) continue;
        seen[q] = 1; stack.push(q);
      }
    }
    // grow the fill one pixel under the lines so no white seam shows at the edge
    for (let p = 0; p < w * h; p++) {
      if (!mask[p] || seen[p]) continue;
      const px0 = p % w;
      if ((px0 > 0 && seen[p - 1]) || (px0 < w - 1 && seen[p + 1]) || (p >= w && seen[p - w]) || (p + w < w * h && seen[p + w])) {
        const i = p * 4; if (rubber) px[i + 3] = 0; else { px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255; }
      }
    }
    this.fillCtx.putImageData(img, 0, 0);
  }
  push() {
    this.undoStack.push(this.fillCtx.getImageData(0, 0, this.w, this.h));
    if (this.undoStack.length > UNDO_LIMIT) this.undoStack.shift();
  }
  undo() { const last = this.undoStack.pop(); if (last) this.fillCtx.putImageData(last, 0, 0); this.paintTools(); }
  paintTools() {
    this.root.querySelectorAll('[data-colour-tool]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.colourTool === this.prefs.tool)));
    this.picker?.show(this.prefs.colour);
    const undo = this.root.querySelector('[data-colour-act="undo"]'); if (undo) undo.disabled = !this.undoStack?.length;
  }
  save() {
    const out = document.createElement('canvas'); out.width = this.w; out.height = this.h;
    const c = out.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, this.w, this.h);
    c.drawImage(this.fillCtx.canvas, 0, 0); c.drawImage(this.linesCtx.canvas, 0, 0);
    out.toBlob(blob => { if (blob) downloadBlob(blob, `${fileSlug(this.picture?.name, 'colouring')}-colouring.png`); }, 'image/png');
  }
  stopBoard() {
    this.token = null; this.drawing = null; this.wetDirty = false; this.picker?.destroy(); this.picker = null;
    if (this.linesEl) this.linesEl.removeEventListener('pointerdown', this.onDown);
    if (this.onMove) { window.removeEventListener('pointermove', this.onMove); window.removeEventListener('pointerup', this.onUp); window.removeEventListener('pointercancel', this.onUp); }
    this.linesEl = null; this.onMove = null;
  }
  setPaused() { this.up(); }
  destroy() { this.stopBoard(); this.root.removeEventListener('click', this.onClick); this.game.els.title.hidden = false; }
}
