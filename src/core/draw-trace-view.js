import { convertCached, loadSteps } from './line-art.js';
import { colourPickerHtml, ColourPicker } from './colour-picker.js';
import { drawTraceLevels, drawTraceStyles, drawTraceFile, drawTraceSteps, drawTracePicture } from '../topics/draw-trace-pictures.js';
import { drawTracePlans } from '../topics/draw-trace-plans.js';
import { drawColours, drawOptions, getSettings, saveSettings, subscribe, myPictures, myPicture, addPicture, loadDraft, saveDraft, cleanDrawing, downloadBlob, fileSlug } from './draw-trace-store.js';

// Draw & Trace (Arts & Crafts): pick a picture, watch the pencil draw each step, then trace it;
// or draw your own picture and add it to "My pictures".
// DrawTraceView is the picture picker. DrawTracePlay (trace) and DrawOwnPlay (draw my own) share
// PencilBoard: the SVG board, the pencil replay, finger drawing, Watch mine and Save picture.
// All follow the child-view contract used by Plant Games: setPaused(paused) and destroy() with
// full listener and GSAP cleanup.
const NS = 'http://www.w3.org/2000/svg', W = 1000, H = 750;
const PAPER = '#fffdf6';
const PEN_WIDTH = { pencil: 6, crayon: 12, marker: 15, watercolour: 22, chalk: 14, rainbow: 13 };
const PEN_ALPHA = { marker: .9, watercolour: .55 };   // see-through strokes darken where they overlap
// Rainbow pen (owner, 13 November 2026): one board-wide gradient that reflects back and forth, so a
// line shifts through the rainbow as it travels. It ignores the picked colour.
const RAINBOW = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e44ad'], RAINBOW_STEP = [260, 180];
function rainbowStroke(ctx) {
  const [dx, dy] = RAINBOW_STEP, period = Math.hypot(dx, dy), ux = dx / period, uy = dy / period;
  const length = W * ux + H * uy, gradient = ctx.createLinearGradient(0, 0, ux * length, uy * length), last = RAINBOW.length - 1;
  for (let n = 0; n * period < length; n++) for (let i = 0; i <= last; i++) {
    const at = (n * period + i * period / last) / length;
    if (at <= 1) gradient.addColorStop(at, RAINBOW[n % 2 ? last - i : i]);
  }
  return gradient;
}
const STAR = 'M17 2L22 12L33 14L25 22L27 33L17 28L7 33L9 22L1 14L12 12Z';
const OWN = 'own', MINE = 'mine';
// small snail and hare at the two ends of the pencil speed slider
const SNAIL = '<svg viewBox="0 0 32 24" width="30" height="22"><path d="M3 20h22c3 0 5-2 5-4l-3 1" fill="none" stroke="#244e3b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="15" cy="12" r="7.5" fill="#f0b429" stroke="#244e3b" stroke-width="2.2"/><path d="M15 12m-3 0a3 3 0 1 0 3-3" fill="none" stroke="#244e3b" stroke-width="1.8" stroke-linecap="round"/><path d="M26 17l1-8M29 17l2-7" stroke="#244e3b" stroke-width="1.8" stroke-linecap="round"/></svg>';
const HARE = '<svg viewBox="0 0 32 24" width="30" height="22"><ellipse cx="14" cy="15" rx="9" ry="6" fill="#d9b68c" stroke="#244e3b" stroke-width="2.2"/><circle cx="24" cy="11" r="4.2" fill="#d9b68c" stroke="#244e3b" stroke-width="2.2"/><path d="M23 7l-2-6M26 7l1-6" stroke="#244e3b" stroke-width="2.4" stroke-linecap="round"/><path d="M5 14l-3-1M8 21l-2 2M18 21l3 2" stroke="#244e3b" stroke-width="2" stroke-linecap="round"/></svg>';
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const clear = node => node.replaceChildren();

function pathD(pts) {
  const f = n => n.toFixed(1);
  if (pts.length === 1) return `M${f(pts[0][0])} ${f(pts[0][1])} L${f(pts[0][0] + .1)} ${f(pts[0][1])}`;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) { const [x, y] = pts[i], [nx, ny] = pts[i + 1]; d += ` Q${f(x)} ${f(y)} ${f((x + nx) / 2)} ${f((y + ny) / 2)}`; }
  const l = pts[pts.length - 1]; return d + ` L${f(l[0])} ${f(l[1])}`;
}
function makePath(stroke, parent, className) {
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', pathD(stroke.pts)); p.setAttribute('stroke', stroke.color);
  p.setAttribute('fill', 'none'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
  if (className) p.setAttribute('class', className);
  parent.appendChild(p); return p;
}
const thumbSvg = drawing => `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">${drawing.strokes.map(stroke => `<path d="${pathD(stroke.pts)}" stroke="${stroke.color}" fill="none" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`;
const OWN_THUMB = '<svg viewBox="0 0 100 75" aria-hidden="true" focusable="false"><g transform="translate(46 38) rotate(40)"><rect x="-6" y="-30" width="12" height="42" fill="#f0b429"/><rect x="-6" y="-30" width="4" height="42" fill="#f7cc5c"/><rect x="-6" y="-37" width="12" height="7" fill="#b8b8ae"/><rect x="-6" y="-46" width="12" height="9" rx="3" fill="#e58aa0"/><polygon points="-6,12 6,12 0,27" fill="#f2d3a2"/><polygon points="-2.2,21.5 2.2,21.5 0,27" fill="#3a3a36"/></g><path d="M72 50h16M80 42v16" stroke="#2f7d3e" stroke-width="4.5" stroke-linecap="round"/></svg>';

// Pen look: one grain picture per look, made once per page and used as a mask on the ink layers.
// Nothing is recomputed while lines animate, so it stays smooth on classroom tablets. Marker and rainbow have no grain;
// watercolour's big soft cells read as pigment pooling on paper, chalk's fine cut leaves dusty gaps.
const GRAIN = { pencil: [2, 1.45, 1.5, 4], crayon: [3, 1.75, 2.4, 3], watercolour: [10, 1.25, 1, 7], chalk: [2, 1.7, 2.2, 9] };   // cell px, base, cut, seed
const grains = {};
function penGrain(pen) {
  if (!GRAIN[pen]) return Promise.resolve(null);
  return grains[pen] ||= new Promise(resolve => {
    try {
      const [cell, base, cut, start] = GRAIN[pen]; let seed = start;
      const r = () => (seed = (seed * 16807) % 2147483647, (seed - 1) / 2147483646);
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const ctx = c.getContext('2d'), img = ctx.createImageData(W, H), px = img.data;
      const cols = Math.ceil(W / cell) + 2, rows = Math.ceil(H / cell) + 2, lat = new Float32Array(cols * rows);
      for (let i = 0; i < lat.length; i++) lat[i] = r();
      for (let y = 0, i = 0; y < H; y++) {
        const gy = y / cell, y0 = gy | 0, fy = gy - y0, a = y0 * cols, b = a + cols;
        for (let x = 0; x < W; x++, i += 4) {
          const gx = x / cell, x0 = gx | 0, fx = gx - x0;
          const soft = (lat[a + x0] * (1 - fx) + lat[a + x0 + 1] * fx) * (1 - fy) + (lat[b + x0] * (1 - fx) + lat[b + x0 + 1] * fx) * fy;
          px[i] = px[i + 1] = px[i + 2] = 255; px[i + 3] = clamp(base - cut * (soft * .6 + r() * .4), 0, 1) * 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      c.toBlob(blob => resolve(blob ? URL.createObjectURL(blob) : null));
    } catch { resolve(null); }
  });
}

/* ================= picture picker ================= */
export class DrawTraceView {
  constructor(game) {
    this.game = game; this.root = game.els.content; this.active = true;
    // The level and the way to play are remembered in game state, and across fresh sessions on the game.
    const saved = game.state.drawTrace || game.drawTracePrefs || {};
    this.levels = [...drawTraceLevels, { id: MINE, label: 'My pictures' }];
    this.prefs = game.state.drawTrace = game.drawTracePrefs = {
      level: this.levels.some(level => level.id === saved.level) ? saved.level : this.levels[0].id,
      style: drawTraceStyles.some(style => style.id === saved.style) ? saved.style : drawTraceStyles[0].id
    };
    this.onClick = event => {
      if (this.child || game.paused) return;
      const button = event.target.closest('[data-trace-level],[data-trace-style],[data-trace-pen],[data-trace-picture]');
      if (!button) return;
      if (button.dataset.traceLevel) { this.prefs.level = button.dataset.traceLevel; this.paintPicker(); return; }
      if (button.dataset.traceStyle) { this.prefs.style = button.dataset.traceStyle; this.paintPicker(); return; }
      if (button.dataset.tracePen) { saveSettings({ pen: button.dataset.tracePen }); return; }
      const picture = this.resolve(button.dataset.tracePicture); if (!picture) return;
      game.state.tracePicture = picture.id;
      this.render();
      // Say the word only when Amy has already recorded it; otherwise stay silent.
      if (picture.say) game.audio.hasRecording(picture.say).then(ready => {
        if (ready && this.active && !game.paused && game.state.tracePicture === picture.id) game.audio.speak(picture.say);
      });
    };
    this.root.addEventListener('click', this.onClick);
    // The Teacher dialog can add or remove My pictures and the pen look can change: repaint the list.
    this.unsubscribe = subscribe(() => { if (this.active && !this.child) this.paintPicker(true); });
    this.render();
  }
  // A picture id is a line-art id, "mine:<id>" for one of My pictures, or "own" for the free board.
  resolve(id) {
    if (id === OWN) return { id, own: true };
    if (typeof id === 'string' && id.startsWith(`${MINE}:`)) { const d = myPicture(id.slice(MINE.length + 1)); return d ? { id, name: d.name, load: async () => d } : null; }
    const picture = drawTracePicture(id);
    return picture ? { id: picture.id, name: picture.name, say: picture.say, load: () => (picture.steps ? loadSteps(drawTraceSteps(picture), picture.name) : convertCached(drawTraceFile(picture), picture.name, picture.level, drawTracePlans[picture.id])) } : null;
  }
  render(focusId) {
    this.child?.destroy(); this.child = null;
    const game = this.game, picture = this.resolve(game.state.tracePicture);
    game.state.tracePicture = picture?.id || null;
    game.refreshBackButton();
    game.els.helper.hidden = true; game.els.listen.hidden = true;
    const choose = id => { game.audio.stop(); game.state.tracePicture = null; this.render(id); };
    if (picture?.own) {
      this.child = new DrawOwnPlay(game, () => choose(OWN), id => { this.prefs.level = MINE; choose(`${MINE}:${id}`); });
      return;
    }
    if (picture) { this.child = new DrawTracePlay(game, picture, this.prefs.style, () => choose(picture.id)); return; }
    game.els.title.hidden = false; game.els.title.textContent = 'Draw & Trace'; game.els.round.textContent = '';
    const segment = (label, key, options, current) => `<div class="media-sections trace-segment" role="group" aria-label="${label}">${options.map(option => `<button type="button" class="learn-action" data-trace-${key}="${option.id}" aria-pressed="${option.id === current}">${escape(option.label)}</button>`).join('')}</div>`;
    const pens = drawOptions.pen.choices.map(([id, label]) => ({ id, label }));
    // Until outline pictures are ready, only My pictures exists: no level or way-to-play switches.
    const tracing = drawTraceLevels.length ? segment('Level', 'level', this.levels, this.prefs.level) + segment('How to play', 'style', drawTraceStyles, this.prefs.style) : '';
    this.root.innerHTML = `<div class="trace-options">${tracing}${segment('Pen look', 'pen', pens, getSettings().pen)}</div><div class="trace-picture-grid" data-trace-grid></div>${drawTraceLevels.length ? '' : '<p class="printables-hint media-soon">Mammal tracing pictures are coming soon. Until then, draw your own.</p>'}`;
    this.paintPicker();
    if (focusId) (this.root.querySelector(`[data-trace-picture="${focusId}"]`) || game.els.title).focus({ preventScroll: true });
  }
  paintPicker(force) {
    const grid = this.root.querySelector('[data-trace-grid]'); if (!grid) return;
    const level = this.levels.find(entry => entry.id === this.prefs.level), pen = getSettings().pen;
    const press = (key, value) => this.root.querySelectorAll(`[data-trace-${key}]`).forEach(button => button.setAttribute('aria-pressed', String(button.getAttribute(`data-trace-${key}`) === value)));
    press('level', this.prefs.level); press('style', this.prefs.style); press('pen', pen);
    if (grid.dataset.level === level.id && !force) return;
    grid.dataset.level = level.id;
    const card = (id, thumb, name, extra = '') => `<button type="button" class="trace-picture${extra}" data-trace-picture="${escape(id)}"><span class="trace-thumb">${thumb}</span><strong>${escape(name)}</strong></button>`;
    grid.innerHTML = level.id === MINE
      ? card(OWN, OWN_THUMB, 'Draw my own', ' trace-picture--own') + myPictures().map(drawing => card(`${MINE}:${drawing.id}`, thumbSvg(drawing), drawing.name)).join('')
      : level.pictures.map(picture => card(picture.id, `<img src="${escape(drawTraceFile(picture))}" alt="" decoding="async"/>`, picture.name)).join('');
  }
  setPaused(paused) { this.child?.setPaused(paused); }
  destroy() { this.active = false; this.unsubscribe(); this.child?.destroy(); this.child = null; this.root.removeEventListener('click', this.onClick); this.game.els.title.hidden = false; }
}

/* ================= the board shared by tracing and "Draw my own" ================= */
class PencilBoard {
  constructor(game, { label, top, dock, finish }) {
    this.game = game; this.root = game.els.content; this.active = true; this.phase = 'loading';
    this.strokes = []; this.clock = null; this.resume = 0; this.pen = null; this.settings = getSettings();
    this.demoTl = null; this.mineTl = null; this.fade = null; this.nudge = null; this.pop = null; this.waiting = false;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)');
    game.els.title.hidden = true; game.els.title.textContent = label; game.els.round.textContent = label;
    // the pencil speed slider sits beside the step line on both boards (owner, 25 Nov: a child may miss a fast demo);
    // it is the Teacher "Speed" option, so the two stay in step
    const speeds = drawOptions.speed.choices;
    this.root.innerHTML = `<div class="trace-play" data-phase="loading"><div class="trace-top">${top}
      <label class="trace-speed"><span class="trace-speed-icon" aria-hidden="true">${SNAIL}</span>
        <input type="range" min="0" max="${speeds.length - 1}" step="1" data-trace-speed aria-label="Pencil speed"/>
        <span class="trace-speed-icon" aria-hidden="true">${HARE}</span></label></div>
      <div class="trace-stage"><div class="trace-board">
        <svg data-trace-board viewBox="0 0 ${W} ${H}" role="img" aria-label="Drawing board: ${escape(label)}">
          <defs>
            <pattern id="tracePaperDots" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1.6" fill="#e6e1cc"/></pattern>
            <linearGradient id="traceRainbow" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${RAINBOW_STEP[0]}" y2="${RAINBOW_STEP[1]}" spreadMethod="reflect">${RAINBOW.map((c, i) => `<stop offset="${i / (RAINBOW.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>
            <mask id="tracePenMask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><image width="${W}" height="${H}" preserveAspectRatio="none"/></mask>
          </defs>
          <rect width="${W}" height="${H}" fill="${PAPER}"/><rect width="${W}" height="${H}" fill="url(#tracePaperDots)"/>
          <g class="trace-guide" data-layer="guide"></g>
          <g class="trace-lines trace-lines--kid" data-layer="kid"></g>
          <g class="trace-lines trace-lines--demo" data-layer="demo"></g>
          <g data-layer="tip" style="display:none" pointer-events="none"><g transform="rotate(28) scale(1.35)">
            <polygon points="0,0 -7,-18 7,-18" fill="#f2d3a2"/><polygon points="0,0 -2.6,-6.5 2.6,-6.5" fill="#3a3a36"/>
            <rect x="-7" y="-80" width="14" height="62" fill="#f0b429"/><rect x="-7" y="-80" width="4.5" height="62" fill="#f7cc5c"/>
            <rect x="-7" y="-88" width="14" height="8" fill="#b8b8ae"/><rect x="-7" y="-100" width="14" height="12" rx="3" fill="#e58aa0"/>
          </g></g>
        </svg>
      </div></div>
      <div class="trace-dock" data-trace-dock>${dock}</div>
      <div class="trace-finish" data-trace-finish hidden>${finish}</div>
    </div>`;
    const find = selector => this.root.querySelector(selector);
    this.wrap = find('.trace-play'); this.line = find('[data-trace-line]'); this.status = find('[data-trace-status]');
    this.svg = find('[data-trace-board]'); this.dock = find('[data-trace-dock]'); this.finishRow = find('[data-trace-finish]');
    this.layers = Object.fromEntries(['guide', 'kid', 'demo', 'tip'].map(name => [name, find(`[data-layer="${name}"]`)]));
    this.buttons = Object.fromEntries([...this.root.querySelectorAll('[data-trace-act]')].map(button => [button.dataset.traceAct, button]));
    this.speed = find('[data-trace-speed]');
    this.speed.addEventListener('input', () => { const choice = speeds[+this.speed.value]; if (choice) saveSettings({ speed: choice[0] }); });

    this.onClick = event => {
      const button = event.target.closest('[data-trace-act]');
      if (!button || button.disabled || !this.active || game.paused) return;
      this.act(button.dataset.traceAct, button);
    };
    this.onDown = event => {
      if (!this.canDraw() || game.paused || this.pen || (event.pointerType === 'mouse' && event.button !== 0)) return;
      const ctm = this.svg.getScreenCTM(); if (!ctm) return;
      event.preventDefault();
      this.stopMine();   // drawing again ends a "Watch mine" replay
      try { this.svg.setPointerCapture(event.pointerId); } catch {}
      const m = ctm.inverse(), [x, y] = this.toBoard(event, m), now = this.stamp(event);
      if (this.clock === null) this.clock = now - this.resume;
      const stroke = { ...this.newStroke(x, y), pts: [[x, y, Math.max(0, Math.round(now - this.clock))]] };
      this.strokes.push(stroke); this.inked(stroke.pts, 0);
      this.pen = { id: event.pointerId, stroke, m, path: makePath(stroke, this.layers.kid), frame: 0 };
      this.paint();
    };
    this.onMove = event => {
      const pen = this.pen; if (!pen || event.pointerId !== pen.id || game.paused) return;
      const pts = pen.stroke.pts, events = event.getCoalescedEvents ? event.getCoalescedEvents() : [];
      for (const ev of (events.length ? events : [event])) {
        const [x, y] = this.toBoard(ev, pen.m), last = pts[pts.length - 1];
        if (Math.hypot(x - last[0], y - last[1]) < 1.5) continue;
        pts.push([x, y, Math.max(last[2], Math.round(this.stamp(ev) - this.clock))]);
        this.inked(pts, pts.length - 1);
      }
      if (!pen.frame) pen.frame = requestAnimationFrame(() => { if (this.pen !== pen) return; pen.frame = 0; pen.path.setAttribute('d', pathD(pts)); this.paint(); });   // paint once per frame
    };
    this.onUp = event => { if (this.pen && event.pointerId === this.pen.id) this.finishStroke(); };
    this.onContext = event => event.preventDefault();
    this.onBlur = () => this.finishStroke();
    this.onReduced = () => { if (!this.active) return; this.stopMine(); this.stopDemo(); this.motionChanged(); };
    this.root.addEventListener('click', this.onClick);
    this.svg.addEventListener('pointerdown', this.onDown); this.svg.addEventListener('pointermove', this.onMove);
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) this.svg.addEventListener(type, this.onUp);
    this.svg.addEventListener('contextmenu', this.onContext);
    window.addEventListener('blur', this.onBlur);
    this.reduced.addEventListener('change', this.onReduced);
    this.resize = new ResizeObserver(() => { if (this.active) this.resized(); });
    this.resize.observe(this.svg);
    // Teacher options (path look, speed, timing, steps) and the pen look apply to an open board at once.
    this.unsubscribe = subscribe(what => { if (this.active && what === 'settings') { this.settings = getSettings(); this.applySettings(); } });
    this.applySettings();
  }
  /* hooks for the two boards */
  act() {}
  canDraw() { return false; }
  newStroke() { return { color: '#2b2b28', step: 0 }; }
  inked() {}
  paint() {}
  resized() {}
  motionChanged() { this.paint(); }
  cleanup() {}

  applySettings() {
    const { pen, guide, speed } = this.settings, layers = [this.layers.kid, this.layers.demo];
    this.svg.dataset.pen = pen; this.layers.guide.dataset.style = guide;
    this.demoTl?.timeScale(speed); this.mineTl?.timeScale(speed);
    const stop = drawOptions.speed.choices.findIndex(([value]) => value === speed);
    this.speed.value = String(Math.max(0, stop));
    this.speed.setAttribute('aria-valuetext', drawOptions.speed.choices[Math.max(0, stop)][1]);
    const image = this.svg.querySelector('#tracePenMask image');
    layers.forEach(layer => layer.removeAttribute('mask'));
    penGrain(pen).then(url => {
      if (!url || !this.active || this.settings.pen !== pen) return;
      const use = () => { if (this.active && this.settings.pen === pen && image.getAttribute('href') === url) layers.forEach(layer => layer.setAttribute('mask', 'url(#tracePenMask)')); };
      if (image.getAttribute('href') === url && image.dataset.ready) { use(); return; }
      image.addEventListener('load', () => { image.dataset.ready = '1'; use(); }, { once: true });
      delete image.dataset.ready; image.setAttribute('href', url);
    });
  }
  setPhase(phase) { this.phase = phase; this.wrap.dataset.phase = phase; this.svg.classList.toggle('can-draw', this.canDraw()); }
  showFinish(on) { this.dock.hidden = on; this.finishRow.hidden = !on; }
  redrawKid() { clear(this.layers.kid); this.strokes.forEach(stroke => makePath(stroke, this.layers.kid)); }
  say(text) { (this.status.querySelector('[data-trace-message]') || this.status).textContent = text; }
  // A gold "tap me" button gently breathes (GSAP; no motion when reduced).
  setReady(button, on) {
    button.classList.toggle('is-ready', on);
    const run = on && !this.reduced.matches && Boolean(window.gsap);
    if (run && !this.nudge) this.nudge = this.hold(window.gsap.to(button, { scale: 1.04, duration: .8, ease: 'sine.inOut', repeat: -1, yoyo: true }));
    else if (!run && this.nudge) { this.nudge.kill(); this.nudge = null; window.gsap.set(button, { clearProps: 'transform' }); }
  }

  /* ---------- pencil replay (GSAP) ---------- */
  hold(animation) { animation.paused(Boolean(this.game.paused)); return animation; }   // nothing runs while the game is paused
  hideTip() { this.layers.tip.style.display = 'none'; }
  setTip(x, y) { this.layers.tip.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`); this.layers.tip.style.display = ''; }
  // Builds one paused timeline that draws the lines into `group`: dash-offset drawing with the pencil
  // tip, a lift and glide between lines. Reduced motion: each line simply appears, no pencil.
  // opts: stepPauses, timing ('drawn' or 'even'; default is the Timing option), onStep(step), onPause(nextStep), onDone().
  timeline(strokes, group, opts = {}) {
    const gsap = window.gsap, still = this.reduced.matches, even = (opts.timing || this.settings.timing) === 'even';
    const t = gsap.timeline({ paused: true, onComplete: () => { this.hideTip(); opts.onDone?.(); } });
    let at = .15, prev = null;
    for (const s of strokes) {
      const p = makePath(s, group), n = s.pts.length, newStep = !prev || s.step !== prev.step;
      p.style.visibility = 'hidden';
      if (prev) {
        let stopped = false;
        if (opts.stepPauses && newStep) {
          const step = s.step; t.addPause(at + .02, () => { this.hideTip(); opts.onPause?.(step); });
          at += .04; stopped = true;
        }
        // rest between lines: as drawn (kept between 0.12 and 0.6 s), short after a stop
        const gap = still ? .35 : stopped ? .12 : even ? .2 : clamp((s.pts[0][2] - prev.pts[prev.pts.length - 1][2]) / 1000, .12, .6);
        if (!still && !stopped) {   // the pencil lifts and glides to the next line
          const a = prev.pts[prev.pts.length - 1], b = s.pts[0], hop = { k: 0 };
          t.to(hop, { k: 1, duration: gap, ease: 'sine.inOut', onUpdate: () => this.setTip(a[0] + (b[0] - a[0]) * hop.k, a[1] + (b[1] - a[1]) * hop.k - Math.sin(Math.PI * hop.k) * 16) }, at);
        }
        at += gap;
      }
      if (newStep && opts.onStep) { const step = s.step; t.call(() => opts.onStep(step), null, at); }
      if (still) t.call(() => { p.style.visibility = 'visible'; }, null, at);
      else {
        const length = Math.max(p.getTotalLength(), .5), t0 = s.pts[0][2], span = s.pts[n - 1][2] - t0, timed = !even && n > 1 && span > 0;
        let cum = null, total = 1;
        if (timed) { cum = [0]; for (let k = 1; k < n; k++) cum.push(cum[k - 1] + Math.hypot(s.pts[k][0] - s.pts[k - 1][0], s.pts[k][1] - s.pts[k - 1][1])); total = cum[n - 1] || 1; }
        const duration = timed ? Math.max(span / 1000, .08) : n > 1 ? Math.max(length / 650, .2) : .1;
        p.style.strokeDasharray = `${length} ${length + 20}`; p.style.strokeDashoffset = length;
        const draw = { k: 0 }; let seg = 0;
        t.to(draw, { k: 1, duration, ease: timed ? 'none' : 'sine.inOut',
          onStart: () => { p.style.visibility = 'visible'; },
          onUpdate: () => {
            let L = draw.k * length;
            if (timed) {   // follow the hand: where was the pen at this moment?
              const tt = t0 + draw.k * span;
              if (s.pts[seg][2] > tt) seg = 0;
              while (seg < n - 2 && s.pts[seg + 1][2] < tt) seg++;
              const a = s.pts[seg][2], b = s.pts[seg + 1][2], f = b > a ? clamp((tt - a) / (b - a), 0, 1) : 1;
              L = (cum[seg] + (cum[seg + 1] - cum[seg]) * f) / total * length;
            }
            p.style.strokeDashoffset = length - L;
            const q = p.getPointAtLength(L); this.setTip(q.x, q.y);
          },
          onComplete: () => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; } }, at);
        at += duration;
      }
      prev = s;
    }
    return t.timeScale(this.settings.speed);
  }
  // The pencil draws the lines once over the guide, then they fade away so the child can trace.
  showDemo(strokes, opts = {}) {
    this.stopMine(); this.stopDemo();
    if (!strokes.length || !window.gsap) { opts.after?.(); return; }
    this.demoTl = this.hold(this.timeline(strokes, this.layers.demo, { ...opts, onDone: () => {
      this.demoTl = null;
      this.fade = this.hold(window.gsap.to(this.layers.demo, { opacity: 0, duration: this.reduced.matches ? 0 : .6, delay: .9, onComplete: () => { this.fade = null; this.stopDemo(); opts.after?.(); } }));
    } }));
  }
  stopDemo() {
    this.demoTl?.kill(); this.demoTl = null; this.fade?.kill(); this.fade = null; this.waiting = false;
    window.gsap?.set(this.layers.demo, { clearProps: 'opacity' }); clear(this.layers.demo); this.hideTip();
  }
  stopPop() { if (!this.pop) return; this.pop.kill(); this.pop = null; }
  // "Watch mine": the child's own lines replay with the pencil, in the order and rhythm they were drawn.
  watchMine() {
    this.finishStroke(); this.stopMine(); this.stopDemo();
    if (!this.strokes.length || !window.gsap) return;
    clear(this.layers.kid); this.wrap.dataset.replay = '1';
    this.mineTl = this.hold(this.timeline(this.strokes, this.layers.kid, { timing: 'drawn', onDone: () => { this.mineTl = null; delete this.wrap.dataset.replay; } }));
  }
  stopMine() {
    if (!this.mineTl) return;
    this.mineTl.kill(); this.mineTl = null; delete this.wrap.dataset.replay; this.hideTip(); this.redrawKid();
  }

  /* ---------- save picture ---------- */
  savePicture(title) {
    this.finishStroke();
    if (!this.strokes.length) return;
    const k = 2, canvas = document.createElement('canvas'), pen = this.settings.pen; canvas.width = W * k; canvas.height = H * k;   // 2000 x 1500
    try {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = PAPER; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save(); ctx.scale(k, k); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = PEN_WIDTH[pen] || 6;
      ctx.globalAlpha = PEN_ALPHA[pen] || 1;
      const rainbow = pen === 'rainbow' ? rainbowStroke(ctx) : null;
      for (const stroke of this.strokes) { ctx.strokeStyle = rainbow || stroke.color; ctx.stroke(new Path2D(pathD(stroke.pts))); }
      ctx.restore();
      ctx.fillStyle = '#b3ad90'; ctx.font = `800 30px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('Mammal Discovery Club', canvas.width - 44, canvas.height - 38);
    } catch { this.say('The picture could not be saved.'); return; }
    const now = new Date(), two = n => String(n).padStart(2, '0');
    const fileName = `${fileSlug(title, 'my-drawing')}-${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}.webp`;
    canvas.toBlob(async blob => {
      if (!this.active) return;
      if (!blob) { this.say('The picture could not be saved.'); return; }
      // Tablets and phones: the share sheet first (it has "Save Image"); everything else downloads the file.
      const touch = navigator.maxTouchPoints > 0 && matchMedia('(pointer: coarse)').matches;
      if (touch && navigator.canShare && typeof File === 'function') {
        try {
          const file = new File([blob], fileName, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title }); if (this.active) this.say('Picture saved.'); return; }
        } catch (error) { if (error?.name === 'AbortError') return; }   // closed the sheet: nothing to do; any other problem: download instead
      }
      downloadBlob(blob, fileName);
      if (this.active) this.say('Picture saved.');
    }, 'image/png');
  }

  /* ---------- drawing with finger, pen or mouse ---------- */
  stamp(event) { return event.timeStamp > 0 ? event.timeStamp : performance.now(); }
  toBoard(event, matrix) {
    const point = this.svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
    const q = point.matrixTransform(matrix);
    return [+clamp(q.x, 0, W).toFixed(1), +clamp(q.y, 0, H).toFixed(1)];
  }
  finishStroke() {
    const pen = this.pen; if (!pen) return;
    this.pen = null; cancelAnimationFrame(pen.frame); pen.path.setAttribute('d', pathD(pen.stroke.pts));
    try { this.svg.releasePointerCapture(pen.id); } catch {}
    this.paint();
  }

  setPaused(paused) {
    if (paused) this.finishStroke();
    for (const animation of [this.demoTl, this.mineTl, this.fade, this.nudge, this.pop]) {
      if (!animation || (!paused && animation === this.demoTl && this.waiting)) continue;   // still waiting for "Next step"
      animation.paused(Boolean(paused));
    }
  }
  destroy() {
    this.finishStroke(); this.cleanup(); this.active = false;
    this.stopDemo(); this.mineTl?.kill(); this.mineTl = null; this.stopPop();
    if (this.nudge) { this.nudge.kill(); this.nudge = null; }
    this.resize.disconnect(); this.unsubscribe();
    this.root.removeEventListener('click', this.onClick);
    this.svg.removeEventListener('pointerdown', this.onDown); this.svg.removeEventListener('pointermove', this.onMove);
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) this.svg.removeEventListener(type, this.onUp);
    this.svg.removeEventListener('contextmenu', this.onContext);
    window.removeEventListener('blur', this.onBlur);
    this.reduced.removeEventListener('change', this.onReduced);
    this.game.els.title.hidden = false;
  }
}

/* ================= watch and trace a picture ================= */
class DrawTracePlay extends PencilBoard {
  constructor(game, picture, style, onChoose) {
    super(game, {
      label: picture.name,
      top: '<p class="trace-step" role="status" aria-live="polite" tabindex="-1" data-trace-line><span data-trace-status>Getting the picture ready…</span><span class="trace-ink" data-trace-ink aria-hidden="true"></span></p>',
      dock: `<button type="button" class="learn-action" data-trace-act="show" data-ui-icon="observe" disabled>Show me again</button>
        <button type="button" class="primary-button trace-next" data-trace-act="next" disabled>Next step</button>
        <button type="button" class="learn-action" data-trace-act="undo" disabled>Undo</button>`,
      finish: `<button type="button" class="learn-action" data-trace-act="mine" data-ui-icon="play">Watch mine</button>
        <button type="button" class="learn-action" data-trace-act="save" data-ui-icon="download">Save picture</button>
        <button type="button" class="learn-action" data-trace-act="again" data-ui-icon="restart">Draw again</button>
        <button type="button" class="learn-action" data-trace-act="choose" data-ui-icon="games">Choose picture</button>`
    });
    this.picture = picture; this.style = style; this.onChoose = onChoose;
    this.drawing = null; this.steps = 0; this.step = 0; this.stepScores = [];
    this.guideStrokes = []; this.score = { pts: [], hit: new Uint8Array(0), hits: 0, on: 0, off: 0, r2: 900, far2: 2304 };
    this.inkDots = this.root.querySelector('[data-trace-ink]');
    this.paint(); this.load();
  }
  async load() {
    try {
      await new Promise(resolve => setTimeout(resolve, 30));   // let "Getting the picture ready" paint first
      const drawing = await this.picture.load();
      if (!this.active) return;
      this.drawing = drawing; this.steps = drawing.strokes.reduce((most, stroke) => Math.max(most, stroke.step + 1), 0);
      if (!this.steps) throw Error('No lines');
      this.begin();
    } catch {
      if (!this.active) return;
      this.setPhase('error'); this.status.textContent = 'That picture could not be opened.'; this.paint();
    }
  }
  stepName(step) { return this.drawing.stepNames?.[step] || 'Draw this part'; }
  canDraw() { return this.phase === 'trace' && this.guideStrokes?.length > 0; }
  newStroke(x, y) { return { color: this.colourAt(x, y), step: this.step }; }
  inked(pts, i) { this.scoreSegment(pts, i); }
  resized() { if (this.phase === 'trace') this.rescore(); }   // the reach of a finger depends on the board's size
  motionChanged() { if (this.phase === 'watch') this.beginTrace(false); else this.paint(); }
  act(name) {
    if (name === 'show') this.showDemo(this.guideStrokes);
    else if (name === 'next') this.next();
    else if (name === 'undo') this.undo();
    else if (name === 'mine') this.watchMine();
    else if (name === 'save') this.savePicture(this.picture.name);
    else if (name === 'again') { this.begin(); this.line.focus({ preventScroll: true }); }
    else if (name === 'choose') this.onChoose();
  }

  /* ---------- flow ---------- */
  begin() {
    this.finishStroke(); this.stopMine(); this.stopDemo(); this.stopPop(); this.game.effects.clear();
    this.strokes = []; this.clock = null; this.stepScores = []; this.step = 0; this.guideStrokes = [];
    for (const name of ['guide', 'kid']) clear(this.layers[name]);
    if (this.style === 'watch' && window.gsap) {
      this.setPhase('watch'); clear(this.inkDots);
      const say = step => { this.status.textContent = `Watch step ${step + 1} of ${this.steps}: ${this.stepName(step)}`; };
      say(0); this.paint();
      // Teacher option "Steps": the whole picture in one go, or a stop before each step.
      this.showDemo(this.drawing.strokes, {
        stepPauses: this.settings.steps === 'pause',
        onStep: step => { this.waiting = false; say(step); this.paint(); },
        onPause: step => { this.waiting = true; this.status.textContent = `Ready for step ${step + 1} of ${this.steps}`; this.paint(); },
        after: () => this.beginTrace(false)
      });
    } else this.beginTrace(this.style === 'step');
  }
  beginTrace(demo) { this.setPhase('trace'); this.startStep(0, demo); }
  startStep(step, demo) {
    this.step = step; this.renderGuide(); this.setPhase('trace');
    this.status.textContent = `Step ${step + 1} of ${this.steps}: ${this.stepName(step)}`;
    this.inkDots.innerHTML = [...new Set(this.guideStrokes.map(stroke => stroke.color))].map(colour => `<i style="background:${colour}"></i>`).join('');
    this.rescore();
    if (demo) this.showDemo(this.guideStrokes);
  }
  next() {
    if (this.phase === 'watch') {
      if (this.waiting && this.demoTl) { this.waiting = false; this.paint(); this.demoTl.play(); return; }   // on to the next step of the show
      this.stopDemo(); this.beginTrace(false); return;
    }
    if (this.phase !== 'trace') return;
    this.finishStroke(); this.stepScores[this.step] = this.percent();
    if (this.step >= this.steps - 1) this.finish(); else this.startStep(this.step + 1, this.style === 'step');
  }
  undo() {
    if (this.phase !== 'trace') return;
    this.finishStroke();
    for (let i = this.strokes.length - 1; i >= 0; i--) if (this.strokes[i].step === this.step) { this.strokes.splice(i, 1); break; }
    this.redrawKid(); this.rescore();
  }
  finish() {
    this.stopDemo(); clear(this.layers.guide); clear(this.inkDots); this.guideStrokes = [];
    this.setPhase('done');
    // Generous stars for small hands: the average of the steps, and never fewer than one.
    const average = this.stepScores.reduce((sum, value) => sum + (value || 0), 0) / this.steps;
    const stars = average >= 45 ? 3 : average >= 15 ? 2 : 1;
    this.status.innerHTML = `<span class="trace-stars" role="img" aria-label="${stars} ${stars === 1 ? 'star' : 'stars'}">${[1, 2, 3].map(n => `<svg viewBox="0 0 34 34" class="${n <= stars ? 'is-on' : ''}" aria-hidden="true"><path d="${STAR}"/></svg>`).join('')}</span><span data-trace-message>${stars === 3 ? 'Wonderful drawing!' : stars === 2 ? 'Lovely drawing!' : 'Good try!'}</span>`;
    this.paint();
    this.game.audio.correct();
    if (!this.reduced.matches) {
      this.game.effects.confetti(28);
      if (window.gsap) this.pop = this.hold(window.gsap.from(this.status.querySelectorAll('.trace-stars svg.is-on'), { scale: 0, rotation: -40, transformOrigin: '50% 50%', duration: .45, ease: 'back.out(2.2)', stagger: .16, clearProps: 'transform', onComplete: () => { this.pop = null; } }));
    }
    (this.strokes.length ? this.buttons.mine : this.buttons.again).focus({ preventScroll: true });
  }

  /* ---------- guide + scoring ---------- */
  renderGuide() {
    const guide = this.layers.guide; clear(guide); this.guideStrokes = []; this.score.pts = [];
    const now = this.drawing.strokes.filter(stroke => stroke.step === this.step);
    for (const stroke of this.drawing.strokes) if (stroke.step !== this.step) makePath(stroke, guide, stroke.step < this.step ? 'g-done' : 'g-later');
    for (const stroke of now) makePath(stroke, guide, 'g-road');   // the path to follow, in the teacher's "Path look"
    for (const stroke of now) {
      const p = makePath(stroke, guide, 'g-now'), index = this.guideStrokes.push(stroke) - 1, length = p.getTotalLength(), n = Math.max(1, Math.ceil(length / 10));
      for (let i = 0; i <= n; i++) { const q = p.getPointAtLength(length * i / n); this.score.pts.push([q.x, q.y, index]); }
    }
  }
  /* "Cover" = how much of the path has ink close to it. "Neat" = how much of the child's ink is near
     the path. Scribbling over the whole board covers the path but is not neat. The reach grows on
     small screens (fat fingers). */
  rescore() {
    const score = this.score, scale = this.svg.getBoundingClientRect().width / W || 1, r = clamp(22 / scale, 30, 60);
    score.r2 = r * r; score.far2 = r * r * 2.56;
    score.hit = new Uint8Array(score.pts.length); score.hits = score.on = score.off = 0;
    for (const stroke of this.strokes) if (stroke.step === this.step) for (let i = 0; i < stroke.pts.length; i++) this.scoreSegment(stroke.pts, i);
    this.paint();
  }
  scorePoint(x, y, weight) {
    const score = this.score, g = score.pts; let min = Infinity;
    for (let i = 0; i < g.length; i++) {
      const dx = g[i][0] - x, dy = g[i][1] - y, d2 = dx * dx + dy * dy;
      if (d2 < min) min = d2;
      if (d2 < score.r2 && !score.hit[i]) { score.hit[i] = 1; score.hits++; }
    }
    if (min <= score.far2) score.on += weight; else score.off += weight;
  }
  scoreSegment(pts, i) {   // counts point i and the stretch of ink leading to it
    const [bx, by] = pts[i];
    if (!i) { this.scorePoint(bx, by, 2); return; }
    const [ax, ay] = pts[i - 1], d = Math.hypot(bx - ax, by - ay), m = Math.max(1, Math.ceil(d / 8));
    for (let k = 1; k <= m; k++) this.scorePoint(ax + (bx - ax) * k / m, ay + (by - ay) * k / m, d / m);
  }
  percent() {
    const score = this.score, ink = score.on + score.off;
    const cover = score.pts.length ? score.hits / score.pts.length : 0, neat = ink ? score.on / ink : 1;
    return Math.round(cover * clamp((neat - .35) / .35, 0, 1) * 100);
  }
  colourAt(x, y) {   // the child gets the colour of the nearest line in this step
    let best = null, min = Infinity;
    for (const g of this.score.pts) { const d = (g[0] - x) * (g[0] - x) + (g[1] - y) * (g[1] - y); if (d < min) { min = d; best = g; } }
    return best ? this.guideStrokes[best[2]].color : '#2b2b28';
  }

  paint() {
    if (!this.active || !this.score) return;
    const { show, next, undo, mine, save, again } = this.buttons, phase = this.phase, tracing = phase === 'trace', watching = phase === 'watch';
    show.disabled = !tracing || !window.gsap;
    undo.disabled = !tracing || !this.strokes.some(stroke => stroke.step === this.step);
    next.disabled = !(tracing || watching);
    const label = watching ? (this.waiting ? 'Next step' : 'Start drawing') : this.steps && this.step >= this.steps - 1 ? 'Finish' : 'Next step';
    if (next.textContent !== label) next.textContent = label;
    this.showFinish(phase === 'done' || phase === 'error');
    mine.disabled = save.disabled = !this.strokes.length;
    mine.hidden = save.hidden = again.hidden = phase === 'error';
    // A step traced well, or a show waiting for its next step, makes the big button glow.
    this.setReady(next, (tracing && this.percent() >= 60) || (watching && this.waiting));
  }
}

/* ================= draw my own ================= */
class DrawOwnPlay extends PencilBoard {
  constructor(game, onChoose, onAdded) {
    super(game, {
      label: 'Draw my own',
      top: `<div class="trace-head"><p class="trace-step" role="status" aria-live="polite" tabindex="-1" data-trace-line><span data-trace-status></span></p>
        <div class="trace-tools" data-trace-tools>
          ${colourPickerHtml(drawColours)}
          <input type="text" class="trace-step-name" data-trace-step-name maxlength="40" autocomplete="off" aria-label="Step name" placeholder="Step name (optional)"/>
        </div></div>`,
      dock: `<button type="button" class="learn-action" data-trace-act="clear">Start over</button>
        <button type="button" class="learn-action" data-trace-act="undo">Undo</button>
        <button type="button" class="primary-button trace-next" data-trace-act="step">Step done</button>
        <button type="button" class="learn-action" data-trace-act="finish">Finish</button>`,
      finish: `<button type="button" class="learn-action" data-trace-act="mine" data-ui-icon="play">Watch mine</button>
        <button type="button" class="learn-action" data-trace-act="save" data-ui-icon="download">Save picture</button>
        <button type="button" class="learn-action" data-trace-act="add">Add to the picture list</button>
        <button type="button" class="learn-action" data-trace-act="more">Keep drawing</button>
        <button type="button" class="learn-action" data-trace-act="choose" data-ui-icon="games">Choose picture</button>
        <dialog class="popout trace-name-dialog" aria-labelledby="traceNameTitle">
          <form data-trace-name-form>
            <header class="popout__heading"><h2 id="traceNameTitle">Add to the picture list</h2></header>
            <label class="trace-name-field">Name<input type="text" data-trace-name maxlength="60" autocomplete="off" placeholder="e.g. Lion"/></label>
            <footer><button type="button" class="scope-reset" data-trace-act="add-cancel">Cancel</button><button type="submit" class="primary-button">Add</button></footer>
          </form>
        </dialog>`
    });
    this.onChoose = onChoose; this.onAdded = onAdded;
    this.wrap.classList.add('trace-play--own');
    this.step = 0; this.names = []; this.colour = drawColours[0][0]; this.armed = null;
    this.tools = this.root.querySelector('[data-trace-tools]');
    this.picker = new ColourPicker(this.tools, drawColours, colour => { this.disarm(); this.colour = colour; this.paint(); }, () => game.paused);
    this.nameInput = this.root.querySelector('[data-trace-step-name]'); this.dialog = this.root.querySelector('.trace-name-dialog');
    this.form = this.root.querySelector('[data-trace-name-form]'); this.listName = this.root.querySelector('[data-trace-name]');
    this.onName = () => { this.names[this.step] = this.nameInput.value; };
    this.onNameDone = () => this.keep();
    this.onSubmit = event => { event.preventDefault(); this.addToList(); };
    // Escape closes the name box only; it must not also act as the game's Back key.
    this.onDialogKey = event => { if (event.key === 'Escape') event.stopPropagation(); };
    this.nameInput.addEventListener('input', this.onName); this.nameInput.addEventListener('change', this.onNameDone);
    this.form.addEventListener('submit', this.onSubmit); this.dialog.addEventListener('keydown', this.onDialogKey);
    // A half-finished drawing survives a reload and a trip back to the picture list.
    const draft = loadDraft();
    if (draft) {
      this.strokes = draft.strokes; this.names = draft.names;
      const last = draft.strokes[draft.strokes.length - 1]; this.step = last.step; this.resume = Math.max(...draft.strokes.map(stroke => stroke.pts[stroke.pts.length - 1][2])) + 600;
      this.redrawKid();
    }
    this.ready = true; this.setPhase('draw'); this.paint();
  }
  canDraw() { return this.phase === 'draw'; }
  newStroke() { this.disarm(); return { color: this.colour, step: this.step }; }
  keep() { saveDraft(this.strokes, this.names); }
  cleanup() {
    this.disarm(); this.keep(); if (this.dialog.open) this.dialog.close();
    this.picker.destroy();
    this.nameInput.removeEventListener('input', this.onName); this.nameInput.removeEventListener('change', this.onNameDone);
    this.form.removeEventListener('submit', this.onSubmit); this.dialog.removeEventListener('keydown', this.onDialogKey);
  }
  // "Start over" throws work away, so it asks for a second tap.
  disarm() { if (!this.armed) return; clearTimeout(this.armed); this.armed = null; this.buttons.clear.textContent = 'Start over'; this.buttons.clear.classList.remove('is-armed'); }
  act(name, button) {
    if (name !== 'clear') this.disarm();
    if (name === 'step') { this.finishStroke(); this.stopMine(); this.step++; this.paint(); this.keep(); }
    else if (name === 'undo') {   // takes back the last thing done: the newest line, or, on an empty step, the "Step done"
      this.finishStroke(); this.stopMine();
      const last = this.strokes[this.strokes.length - 1];
      if (last && last.step === this.step) { this.strokes.pop(); this.layers.kid.lastChild?.remove(); } else this.step = last ? last.step : 0;
      this.paint(); this.keep();
    } else if (name === 'clear') {
      if (!this.armed) { button.textContent = 'Tap again'; button.classList.add('is-armed'); this.armed = setTimeout(() => this.disarm(), 3500); return; }
      this.disarm(); this.finishStroke(); this.stopMine();
      this.strokes = []; this.names = []; this.step = 0; this.clock = null; this.resume = 0; clear(this.layers.kid);
      this.paint(); this.keep();
    } else if (name === 'finish') { this.finishStroke(); this.setPhase('done'); this.paint(); this.say('All done!'); this.buttons.mine.focus({ preventScroll: true }); }
    else if (name === 'more') { this.stopMine(); this.setPhase('draw'); this.paint(); this.line.focus({ preventScroll: true }); }
    else if (name === 'mine') this.watchMine();
    else if (name === 'save') this.savePicture('My drawing');
    else if (name === 'add') { this.stopMine(); this.listName.value = ''; this.dialog.showModal(); this.listName.focus(); }
    else if (name === 'add-cancel') { this.dialog.close(); this.buttons.add.focus({ preventScroll: true }); }
    else if (name === 'choose') this.onChoose();
  }
  addToList() {
    const added = addPicture({ stepNames: this.names, strokes: this.strokes }, this.listName.value.trim());
    this.dialog.close();
    if (!added) { this.say('Draw something first.'); return; }
    // The drawing now lives in My pictures; the board starts fresh next time.
    this.strokes = []; this.names = []; this.keep();
    this.onAdded(added.drawing.id);
  }
  paint() {
    if (!this.active || !this.ready) return;
    const drawing = this.phase === 'draw', inStep = this.strokes.filter(stroke => stroke.step === this.step).length, any = this.strokes.length > 0;
    const { step, undo, clear: startOver, finish, mine, save, add } = this.buttons;
    if (drawing) this.status.textContent = `Step ${this.step + 1}: ${inStep ? `${inStep} ${inStep === 1 ? 'line' : 'lines'}` : any ? 'draw the next part' : 'draw the first part'}`;
    this.tools.hidden = !drawing; if (!drawing) this.picker.close();
    if (document.activeElement !== this.nameInput) this.nameInput.value = this.names[this.step] || '';
    this.nameInput.setAttribute('aria-label', `Step ${this.step + 1} name`);
    this.picker.show(this.colour); this.picker.open.hidden = this.settings.pen === 'rainbow';   // rainbow picks its own colours
    step.disabled = !inStep; undo.disabled = startOver.disabled = !any && !this.step; finish.disabled = !any;
    if (!any && !this.step) this.disarm();
    mine.disabled = save.disabled = add.disabled = !any;
    this.showFinish(!drawing);
  }
  finishStroke() { const drawing = Boolean(this.pen); super.finishStroke(); if (drawing) this.keep(); }
}
