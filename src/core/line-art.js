/* Line art -> replayable strokes. Used by Draw & Trace (Arts & Crafts) and by the tools/drawing-replay prototype.
   Takes a clean outline picture (coloured lines on white or transparent), gives every ink pixel
   its palette colour, finds the centre of every line one colour at a time (so a line never runs on
   into a part of another colour), splits it into pen strokes, groups the strokes into steps by colour
   and orders them the way a person would draw. Output uses the same picture format as a recorded drawing.

   Step order follows the colour of the parts (the Codex brief asks for this palette):
   brown (pot, ground, trunk) -> green (stem, leaves) -> yellow/gold -> orange -> red/pink -> purple -> blue -> black (details). */
const W = 1000, H = 750, MARGIN = 36;
const PALETTE = [
  { name: 'brown',  rgb: [138, 90, 59] },
  { name: 'green',  rgb: [47, 125, 62] },
  { name: 'gold',   rgb: [217, 162, 27] },
  { name: 'orange', rgb: [224, 102, 42] },
  { name: 'red',    rgb: [200, 50, 60] },
  { name: 'pink',   rgb: [217, 72, 122] },
  { name: 'purple', rgb: [128, 70, 160] },
  { name: 'blue',   rgb: [47, 111, 181] },
  { name: 'black',  rgb: [43, 43, 40] }
];
const RING = [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]];   // N NE E SE S SW W NW
const N4 = [[0,-1],[1,0],[0,1],[-1,0]], ND = [[1,-1],[1,1],[-1,1],[-1,-1]];

function loadImage(src){
  return new Promise((ok, fail) => { const img = new Image(); img.onload = () => ok(img); img.onerror = () => fail(new Error('image')); img.src = src; });
}

function rasterise(img){
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  const iw = img.naturalWidth || img.width || W, ih = img.naturalHeight || img.height || H;
  const s = Math.min((W - 2 * MARGIN) / iw, (H - 2 * MARGIN) / ih);
  ctx.drawImage(img, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s);
  return ctx.getImageData(0, 0, W, H).data;
}

function inkMask(px){
  const ink = new Uint8Array(W * H);
  for (let i = 0, j = 0; i < ink.length; i++, j += 4){
    const r = px[j], g = px[j+1], b = px[j+2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const lum = .299 * r + .587 * g + .114 * b;
    ink[i] = (lum < 175 || (mx - mn > 70 && lum < 235)) ? 1 : 0;
  }
  for (let x = 0; x < W; x++){ ink[x] = 0; ink[(H-1) * W + x] = 0; }
  for (let y = 0; y < H; y++){ ink[y * W] = 0; ink[y * W + W - 1] = 0; }
  return ink;
}

// Gives every ink pixel a palette colour (index into PALETTE).
// Pixels that are clearly one palette colour seed the map; the soft pixels where a line meets the paper
// or another colour (they blend into a third colour: green + pink looks brown) take the colour of the
// nearest seed instead of their own. Small seed patches are thrown away so a blend never becomes a part.
function labelInk(px, ink){
  const n = W * H, near = new Int8Array(n).fill(-1), conf = new Uint8Array(n), lab = new Int8Array(n).fill(-1);
  const inkPix = [];
  for (let i = 0; i < n; i++){
    if (!ink[i]) continue; inkPix.push(i);
    const r = px[i*4], g = px[i*4+1], b = px[i*4+2]; let bi = 0, d1 = Infinity, d2 = Infinity;
    for (let k = 0; k < PALETTE.length; k++){ const q = PALETTE[k].rgb, d = Math.hypot(q[0] - r, q[1] - g, q[2] - b); if (d < d1){ d2 = d1; d1 = d; bi = k; } else if (d < d2) d2 = d; }
    near[i] = bi; conf[i] = (d1 < .6 * d2 && 765 - r - g - b >= 220) ? 1 : 0;
  }
  for (const i of inkPix){
    if (!conf[i]) continue; const c = near[i];
    if (conf[i-1] && near[i-1] === c && conf[i+1] && near[i+1] === c && conf[i-W] && near[i-W] === c && conf[i+W] && near[i+W] === c) lab[i] = c;
  }
  const mark = new Uint8Array(n), queue = new Int32Array(inkPix.length); let qn = 0;
  for (const s of inkPix){   // seed patches under 40 px are blends or specks, not parts
    if (lab[s] < 0 || mark[s]) continue;
    const c = lab[s], comp = [s]; mark[s] = 1;
    for (let k = 0; k < comp.length; k++){ const i = comp[k]; for (const j of [i-1, i+1, i-W, i+W]) if (lab[j] === c && !mark[j]){ mark[j] = 1; comp.push(j); } }
    if (comp.length < 40) for (const i of comp) lab[i] = -1; else for (const i of comp) queue[qn++] = i;
  }
  for (let k = 0; k < qn; k++){ const i = queue[k], c = lab[i]; for (const j of [i-1, i+1, i-W, i+W]) if (ink[j] && lab[j] < 0){ lab[j] = c; queue[qn++] = j; } }
  for (const s of inkPix){   // shapes with no clear palette colour at all (thin or off-palette lines): one colour per shape, by vote
    if (lab[s] !== -1) continue;
    const comp = [s], votes = new Array(PALETTE.length).fill(0); lab[s] = -2;
    for (let k = 0; k < comp.length; k++){ const i = comp[k]; votes[near[i]] += conf[i] ? 4 : 1;
      for (const [dx, dy] of RING){ const j = i + dy * W + dx; if (ink[j] && lab[j] === -1){ lab[j] = -2; comp.push(j); } } }
    const c = votes.indexOf(Math.max(...votes)); for (const i of comp) lab[i] = c;
  }
  return lab;
}

// Zhang-Suen thinning: shrinks every line to a one-pixel centre line. `live` lists the ink pixels; returns those left.
function thin(img, live){
  const del = [];
  for (let changed = true, guard = 0; changed && guard < 200; guard++){
    changed = false;
    for (let pass = 0; pass < 2; pass++){
      del.length = 0;
      for (const i of live){
        if (!img[i]) continue;
        const p2 = img[i-W], p3 = img[i-W+1], p4 = img[i+1], p5 = img[i+W+1], p6 = img[i+W], p7 = img[i+W-1], p8 = img[i-1], p9 = img[i-W-1];
        const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9; if (B < 2 || B > 6) continue;
        const A = (!p2 && p3) + (!p3 && p4) + (!p4 && p5) + (!p5 && p6) + (!p6 && p7) + (!p7 && p8) + (!p8 && p9) + (!p9 && p2);
        if (A !== 1) continue;
        if (pass === 0 ? (p2 && p4 && p6) || (p4 && p6 && p8) : (p2 && p4 && p8) || (p2 && p6 && p8)) continue;
        del.push(i);
      }
      for (const i of del) img[i] = 0;
      if (del.length) changed = true;
    }
    if (changed) live = live.filter(i => img[i]);
  }
  return live;
}

// number of separate runs of line around a pixel: 1 = line end, 2 = middle of a line, 3+ = a fork
function runs(sk, i){
  let a = 0;
  for (let k = 0; k < 8; k++){
    const [dx, dy] = RING[k], [ex, ey] = RING[(k + 1) % 8];
    if (!sk[i + dy * W + dx] && sk[i + ey * W + ex]) a++;
  }
  return a;
}

function trace(sk, pix){
  const kind = new Uint8Array(W * H);   // 1 end, 2 line, 3 fork
  for (const i of pix){ const a = runs(sk, i); kind[i] = a <= 1 ? 1 : a === 2 ? 2 : 3; }
  const seen = new Uint8Array(W * H), strokes = [];
  const nbrs = i => { const out = []; for (const [dx, dy] of N4) { const j = i + dy * W + dx; if (sk[j]) out.push(j); } for (const [dx, dy] of ND) { const j = i + dy * W + dx; if (sk[j]) out.push(j); } return out; };
  function walk(start, first){
    const path = [start, first]; if (kind[start] !== 3) seen[start] = 1;
    let prev = start, cur = first;
    while (true){
      if (kind[cur] === 3 && path.length > 2) break;
      seen[cur] = 1;
      const ns = nbrs(cur).filter(j => j !== prev && j !== path[path.length - 3]);
      let next = ns.find(j => kind[j] !== 3 && !seen[j]);
      if (next === undefined) next = ns.find(j => kind[j] === 3 && !(j === start && path.length < 6));
      if (next === undefined){
        if (kind[start] !== 3 && path.length > 8 && nbrs(cur).includes(start)) path.push(start);   // closed loop
        break;
      }
      path.push(next); prev = cur; cur = next;
      if (path.length > 60000) break;
    }
    return path;
  }
  for (const i of pix) if (kind[i] === 1 && !seen[i]){ const n = nbrs(i).find(j => !seen[j]); if (n !== undefined) strokes.push(walk(i, n)); else seen[i] = 1; }
  for (const i of pix) if (kind[i] === 3) for (const n of nbrs(i)) if (kind[n] !== 3 && !seen[n]) strokes.push(walk(i, n));
  for (const i of pix) if (kind[i] === 2 && !seen[i]){ const n = nbrs(i).find(j => !seen[j] && kind[j] !== 3); if (n !== undefined) strokes.push(walk(i, n)); else seen[i] = 1; }
  return strokes.map(p => p.map(i => [i % W, (i / W) | 0]));
}

function lengthOf(pts){ let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i-1][0], pts[i][1] - pts[i-1][1]); return L; }

function simplify(pts, eps){   // Ramer-Douglas-Peucker; a closed loop is split at its far side first
  if (pts.length < 3) return pts.slice();
  const [sx, sy] = pts[0], [ex, ey] = pts[pts.length - 1];
  if (Math.hypot(ex - sx, ey - sy) < 3){
    let far = 1, fd = -1;
    pts.forEach((p, i) => { const d = Math.hypot(p[0] - sx, p[1] - sy); if (d > fd){ fd = d; far = i; } });
    if (far > 0 && far < pts.length - 1) return simplify(pts.slice(0, far + 1), eps).concat(simplify(pts.slice(far), eps).slice(1));
  }
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length){
    const [a, b] = stack.pop(); const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1; let best = -1, bi = -1;
    for (let i = a + 1; i < b; i++){ const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / len; if (d > best){ best = d; bi = i; } }
    if (best > eps){ keep[bi] = 1; stack.push([a, bi], [bi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
function smooth(pts){
  if (pts.length < 4) return pts;
  const closed = Math.hypot(pts[0][0] - pts[pts.length-1][0], pts[0][1] - pts[pts.length-1][1]) < 2;
  return pts.map((p, i) => {
    if (!closed && (i === 0 || i === pts.length - 1)) return p;
    const a = pts[(i - 1 + pts.length) % pts.length], c = pts[(i + 1) % pts.length];
    return [(a[0] + 2 * p[0] + c[0]) / 4, (a[1] + 2 * p[1] + c[1]) / 4];
  });
}

// Joins the traced pieces of ONE colour into whole lines.
// Pieces whose ends meet (within 5 px, at a fork or a corner) are joined: two ends simply join; where three or
// more meet, the two that carry straight on are joined and the side branch stays its own line. A ring cut into
// pieces by the lines that touch it comes back as one closed line. Short spurs left by thinning are dropped.
// Returns [{ pts, free: [startIsLoose, endIsLoose] }]; a loose end meets no other line of its own colour.
function joinPieces(paths){
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];
  const cluster = list => {   // groups line ends that sit within 5 px of each other
    const ends = [];
    list.forEach((p, pi) => { if (!same(p[0], p[p.length - 1])) ends.push({ pi, side: 0, pt: p[0] }, { pi, side: 1, pt: p[p.length - 1] }); });
    const root = ends.map((_, i) => i), find = i => { while (root[i] !== i) i = root[i] = root[root[i]]; return i; };
    for (let i = 0; i < ends.length; i++) for (let j = i + 1; j < ends.length; j++)
      if (Math.abs(ends[i].pt[0] - ends[j].pt[0]) <= 5 && Math.abs(ends[i].pt[1] - ends[j].pt[1]) <= 5 && Math.hypot(ends[i].pt[0] - ends[j].pt[0], ends[i].pt[1] - ends[j].pt[1]) <= 5) root[find(i)] = find(j);
    const groups = new Map();
    ends.forEach((e, i) => { const r = find(i); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(e); e.group = groups.get(r); });
    return { ends, groups: [...groups.values()] };
  };
  let pieces = paths.filter(p => p.length >= 2);
  {   // spurs and specks: short pieces with an end that meets nothing
    const { ends } = cluster(pieces), loose = new Set();
    for (const e of ends) if (e.group.length === 1) loose.add(e.pi);
    pieces = pieces.filter((p, pi) => !(lengthOf(p) < 12 && (loose.has(pi) || same(p[0], p[p.length - 1]))));
  }
  const { groups } = cluster(pieces);
  const link = new Int32Array(pieces.length * 2).fill(-1), alone = new Uint8Array(pieces.length * 2);
  const id = e => e.pi * 2 + e.side;
  const heading = e => { const p = pieces[e.pi], k = Math.min(8, p.length - 1), q = e.side ? p[p.length - 1 - k] : p[k], d = Math.hypot(q[0] - e.pt[0], q[1] - e.pt[1]) || 1; return [(q[0] - e.pt[0]) / d, (q[1] - e.pt[1]) / d]; };
  const loopOk = (a, b) => a.pi !== b.pi || lengthOf(pieces[a.pi]) > 30;
  for (const g of groups){
    if (g.length === 1){ alone[id(g[0])] = 1; continue; }
    if (g.length === 2){ if (loopOk(g[0], g[1])){ link[id(g[0])] = id(g[1]); link[id(g[1])] = id(g[0]); } continue; }
    const dirs = g.map(heading), pairs = [];
    for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) if (loopOk(g[i], g[j])) pairs.push([dirs[i][0] * dirs[j][0] + dirs[i][1] * dirs[j][1], i, j]);
    pairs.sort((x, y) => x[0] - y[0]);
    for (const [dot, i, j] of pairs){ if (dot > -.5) break; if (link[id(g[i])] < 0 && link[id(g[j])] < 0){ link[id(g[i])] = id(g[j]); link[id(g[j])] = id(g[i]); } }
  }
  const used = new Uint8Array(pieces.length), out = [];
  const run = (pi, side) => {   // follows the links from one end of a piece
    const pts = [], startEnd = pi * 2 + side; let exit = startEnd;
    while (!used[pi]){
      used[pi] = 1; const p = side ? pieces[pi].slice().reverse() : pieces[pi];
      for (const q of p) if (!pts.length || !same(pts[pts.length - 1], q)) pts.push(q);
      exit = pi * 2 + (1 - side); const nx = link[exit]; if (nx < 0) break;
      pi = nx >> 1; side = nx & 1;
    }
    return { pts, startEnd, exit };
  };
  pieces.forEach((p, pi) => {
    if (used[pi]) return;
    if (same(p[0], p[p.length - 1])){ used[pi] = 1; out.push({ pts: p, free: [false, false] }); return; }
    const side = link[pi * 2] < 0 ? 0 : link[pi * 2 + 1] < 0 ? 1 : -1; if (side < 0) return;
    const r = run(pi, side); out.push({ pts: r.pts, free: [!!alone[r.startEnd], !!alone[r.exit]] });
  });
  pieces.forEach((p, pi) => { if (used[pi]) return; const r = run(pi, 0); r.pts.push(r.pts[0]); out.push({ pts: r.pts, free: [false, false] }); });   // what is left are rings
  return out;
}

// A line's centre stops short of the part it touches (half its own width, and the other line has width too).
// A loose end that runs straight into another colour is carried on to that line's centre, so a stem still
// reaches its pot and a petal still reaches the flower middle. An end that stops on white paper is left alone.
function extendEnds(line, c, ink, lab, skAll){
  for (const side of [0, 1]){
    if (!line.free[side]) continue;
    const p = line.pts, n = p.length, e = side ? p[n - 1] : p[0], k = Math.min(8, n - 1), b = side ? p[n - 1 - k] : p[k];
    const d = Math.hypot(e[0] - b[0], e[1] - b[1]); if (d < 2) continue;
    const ux = (e[0] - b[0]) / d, uy = (e[1] - b[1]) / d; let hit = 0, target = null;
    for (let t = 1; t <= 24; t++){
      const x = Math.round(e[0] + ux * t), y = Math.round(e[1] + uy * t), i = y * W + x;
      if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1 || !ink[i]) break;
      if (!hit && lab[i] !== c) hit = t;
      let found = null;
      for (const [dx, dy] of [[0, 0], ...RING]){ const s = skAll[i + dy * W + dx]; if (s >= 0 && s !== c){ found = [x + dx, y + dy]; break; } }
      if (found){ target = found; break; }
      if (hit && t >= hit + 8) break;
    }
    if (!target && hit) target = [Math.round(e[0] + ux * (hit + 1)), Math.round(e[1] + uy * (hit + 1))];
    if (!target) continue;
    if (side) p.push(target); else p.unshift(target);
  }
}
// Last pass: any loose end that still stops short of a line it touches in the picture is carried on to that
// line's centre. Only across solid ink (never over white paper), and at most 30 px, so parts the artist kept
// apart stay apart. A closed ring that was left open closes the same way.
function snapEnds(lines, ink){
  const onInk = (x, y) => { x = Math.round(x); y = Math.round(y);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){ const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < W && yy < H && ink[yy * W + xx]) return true; }
    return false; };
  const solid = (a, b) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])); for (let j = 1; j < n; j++) if (!onInk(a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n)) return false; return true; };
  const ends = [];
  for (const l of lines){ const p = l.pts; if (p.length < 2) continue;
    if (Math.hypot(p[0][0] - p[p.length - 1][0], p[0][1] - p[p.length - 1][1]) < 1.5) continue;   // already a closed ring
    ends.push([l, 0], [l, 1]); }
  const adds = [];
  for (const [l, side] of ends){
    const p = l.pts, e = side ? p[p.length - 1] : p[0];
    // how far along its own line each point is from this end, so the end never snaps onto its own neighbourhood
    const along = [0]; for (let k = 1; k < p.length; k++) along.push(along[k-1] + Math.hypot(p[k][0] - p[k-1][0], p[k][1] - p[k-1][1]));
    const total = along[along.length - 1], fromEnd = k => side ? total - along[k] : along[k];
    let best = 30, hit = null;
    for (const m of lines){ const q = m.pts;
      for (let k = 1; k < q.length; k++){
        if (m === l && (fromEnd(k) < 40 || fromEnd(k - 1) < 40)) continue;
        const a = q[k-1], b = q[k], vx = b[0] - a[0], vy = b[1] - a[1], LL = vx * vx + vy * vy || 1;
        const u = Math.max(0, Math.min(1, ((e[0] - a[0]) * vx + (e[1] - a[1]) * vy) / LL)), f = [a[0] + u * vx, a[1] + u * vy];
        const d = Math.hypot(f[0] - e[0], f[1] - e[1]); if (d < best){ best = d; hit = f; }
      }
    }
    if (hit && best > 1.5 && solid(e, hit)) adds.push([l, side, hit]);
  }
  for (const [l, side, f] of adds){ if (side) l.pts.push(f); else l.pts.unshift(f); }
}
const hex = c => '#' + c.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// Steps per level (owner, 19 November 2026): about 3 for Easy, 6 for Medium, 10 for Hard. A step is a whole thing
// (a bee, a flower, the log), never half a shape and never a creature spread over far-apart steps: lines that touch
// make one thing, the biggest things are cut at a colour change (body, then wings, then legs) or a lifted pen, and
// small neighbouring things share a step.
const STEP_TARGET = { easy: 3, medium: 6, hard: 10 };
const LABEL = { brown: 'Draw the brown parts', green: 'Draw the green parts', gold: 'Add the yellow parts', orange: 'Add the orange parts',
  red: 'Add the red parts', pink: 'Add the pink parts', purple: 'Add the purple parts', blue: 'Add the blue parts', black: 'Add the last details' };
const MORE = { brown: 'More brown parts', green: 'More green parts', gold: 'More yellow parts', orange: 'More orange parts',
  red: 'More red parts', pink: 'More pink parts', purple: 'More purple parts', blue: 'More blue parts', black: 'More details' };

const rankOf = rgb => { let bi = 0, bd = Infinity; PALETTE.forEach((p, i) => { const d = dist(p.rgb, rgb); if (d < bd){ bd = d; bi = i; } }); return bi; };
const boxOf = pts => pts.reduce((b, p) => [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])], [Infinity, Infinity, -Infinity, -Infinity]);
const sizeOf = lines => lines.reduce((a, l) => a + lengthOf(l.pts), 0);
function gapTo(p, pts){
  if (pts.length === 1) return Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1]);
  let best = Infinity;
  for (let i = 1; i < pts.length; i++){
    const a = pts[i-1], b = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], L = dx*dx + dy*dy;
    const t = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)) : 0;
    best = Math.min(best, Math.hypot(a[0] + t*dx - p[0], a[1] + t*dy - p[1]));
  }
  return best;
}
// two lines are one thing when an end of either one meets the other
function touching(a, b, d = 16){
  if (a.box[0] - d > b.box[2] || b.box[0] - d > a.box[2] || a.box[1] - d > b.box[3] || b.box[1] - d > a.box[3]) return false;
  return [a.pts[0], a.pts[a.pts.length - 1]].some(p => gapTo(p, b.pts) < d) || [b.pts[0], b.pts[b.pts.length - 1]].some(p => gapTo(p, a.pts) < d);
}
const boxGap = (a, b) => Math.hypot(Math.max(0, a[0] - b[2], b[0] - a[2]), Math.max(0, a[1] - b[3], b[1] - a[3]));

// orders one thing's lines like a person drawing: colour by colour, the big shapes first, then the nearest line
function orderLines(lines){
  const ordered = [];
  for (const rank of [...new Set(lines.map(l => l.rank))].sort((a, b) => a - b)){
    const mine = lines.filter(l => l.rank === rank), longest = Math.max(...mine.map(l => l.len));
    const left = mine.filter(l => l.len >= longest * .5), small = mine.filter(l => l.len < longest * .5);
    let pen = null;
    while (left.length || small.length){
      if (!left.length) left.push(...small.splice(0));
      let bi = 0, flip = false, bd = Infinity;
      left.forEach((l, i) => {
        const s = l.pts[0], e = l.pts[l.pts.length - 1];
        if (!pen){ const top = Math.min(s[1], e[1]); if (top < bd){ bd = top; bi = i; flip = e[1] < s[1]; } return; }   // start at the top, with a big shape
        const ds = Math.hypot(s[0] - pen[0], s[1] - pen[1]), de = Math.hypot(e[0] - pen[0], e[1] - pen[1]);
        if (ds < bd){ bd = ds; bi = i; flip = false; } if (de < bd){ bd = de; bi = i; flip = true; }
      });
      const l = left.splice(bi, 1)[0], pts = flip ? l.pts.slice().reverse() : l.pts;
      ordered.push({ rgb: l.rgb, rank, pts: pts.slice() });
      pen = pts[pts.length - 1];
    }
  }
  return ordered;
}

// cuts a step in two: at a colour change if that is fair, else where the pen lifts, else anywhere
function cutInTwo(lines){
  if (lines.length === 1){
    const l = lines[0]; if (l.pts.length < 8) return null;
    const mid = l.pts.length >> 1;
    return [[{ ...l, pts: l.pts.slice(0, mid + 1) }], [{ ...l, pts: l.pts.slice(mid) }]];
  }
  const len = lines.map(l => lengthOf(l.pts)), total = len.reduce((a, v) => a + v, 0);
  let run = 0, colour = null, any = null;
  for (let c = 1; c < lines.length; c++){
    run += len[c - 1];
    const worst = Math.max(run, total - run);
    if (lines[c].rank !== lines[c - 1].rank && (!colour || worst < colour.worst)) colour = { c, worst };
    const end = lines[c - 1].pts[lines[c - 1].pts.length - 1], start = lines[c].pts[0];
    const cost = worst * (Math.hypot(end[0] - start[0], end[1] - start[1]) < 16 ? 1.3 : 1);
    if (!any || cost < any.cost) any = { c, cost };
  }
  // one long line (three wings traced in one go) may be most of the step: then cut inside it, halfway along the step
  run = 0;
  for (let c = 0; c < lines.length; c++){
    if (run + len[c] > total / 2 && total / 2 * 1.2 < any.cost && len[c] > total * .3){
      const pts = lines[c].pts, want = total / 2 - run; let k = 1, got = 0;
      while (k < pts.length - 1 && got + Math.hypot(pts[k][0] - pts[k-1][0], pts[k][1] - pts[k-1][1]) < want){ got += Math.hypot(pts[k][0] - pts[k-1][0], pts[k][1] - pts[k-1][1]); k++; }
      if (k > 1 && k < pts.length - 2) return [[...lines.slice(0, c), { ...lines[c], pts: pts.slice(0, k + 1) }], [{ ...lines[c], pts: pts.slice(k) }, ...lines.slice(c + 1)]];
    }
    run += len[c];
  }
  const c = colour && colour.worst <= any.cost * 1.5 ? colour.c : any.c;
  return [lines.slice(0, c), lines.slice(c)];
}

// Turns one step's lines into pen strokes the way a person draws (owner, 25 Nov 2026: the demo was "scared to pick
// up the pen", running one long line from a head into an ear and on into a wing). The lines are cut wherever they
// meet or cross, which gives a little map of nodes and edges; every closed shape in it (a head, an ear, a wing panel)
// is a face of that map. The biggest shape is drawn first as one whole loop, then the shapes beside it, each adding
// only the part of its outline not drawn yet (an ear is one arch on the head); then the open lines (a tail, legs,
// whiskers), each carried on through a junction only where it runs straight on. The pen lifts between strokes.
// `before` are lines drawn in earlier steps nearby: they close a shape (a body under a head drawn first) but are not redrawn.
function restroke(lines, before = [], ink = null){
  const SNAP = 9;
  const L = [...lines.map(l => ({ ...l, ctx: false })), ...before.map(l => ({ ...l, ctx: true }))].filter(l => l.pts.length > 1)
    .map(l => ({ rgb: l.rgb, rank: l.rank, ctx: l.ctx, pts: l.pts.map(p => [p[0], p[1]]) }));
  if (!L.some(l => !l.ctx)) return [];
  // a piece the plan gave to another step can leave a gap at a joint (a beam stopping short of the roof's middle):
  // close it again over solid ink
  if (ink) snapEnds(L, ink);
  const isClosed = pts => Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 1.5;
  const cuts = L.map(() => []);
  // an end that stops on another line (a leg on a body) cuts that line there
  L.forEach((li, i) => { if (isClosed(li.pts)) return; for (const end of [li.pts[0], li.pts[li.pts.length - 1]]) L.forEach((lj, j) => {
    let run = 0;
    for (let k = 1; k < lj.pts.length; k++){
      const a = lj.pts[k-1], b = lj.pts[k], dx = b[0] - a[0], dy = b[1] - a[1], q = dx*dx + dy*dy, seg = Math.sqrt(q);
      const t = q ? Math.max(0, Math.min(1, ((end[0] - a[0]) * dx + (end[1] - a[1]) * dy) / q)) : 0;
      if (Math.hypot(a[0] + t*dx - end[0], a[1] + t*dy - end[1]) <= SNAP){
        // on its own line, only far along from that end (a hook or a loop closing on itself)
        const own = j === i && Math.min(run + t * seg, lengthOf(lj.pts) - run - t * seg) < 20;
        if (!own) cuts[j].push(k - 1 + t);
      }
      run += seg;
    }
  }); });
  // lines that cross cut each other
  for (let i = 0; i < L.length; i++) for (let j = i; j < L.length; j++){
    const A = L[i].pts, B = L[j].pts;
    for (let k = 1; k < A.length; k++) for (let m = (i === j ? k + 2 : 1); m < B.length; m++){
      const a = A[k-1], b = A[k], c = B[m-1], d = B[m];
      const den = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0]); if (!den) continue;
      const t = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / den, u = ((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])) / den;
      if (t > 0 && t < 1 && u > 0 && u < 1){ cuts[i].push(k - 1 + t); cuts[j].push(m - 1 + u); }
    }
  }
  // the pieces between cuts become the edges, their ends the nodes
  const at = (pts, s) => { const k = Math.min(pts.length - 2, Math.floor(s)), t = s - k, a = pts[k], b = pts[k + 1]; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; };
  const pieces = [];
  L.forEach((l, i) => {
    const n = l.pts.length - 1, cs = [...new Set(cuts[i].map(s => +s.toFixed(4)))].filter(s => s > 0 && s < n).sort((a, b) => a - b);
    if (!cs.length){ pieces.push({ ...l, loop: isClosed(l.pts) }); return; }
    const bounds = [0, ...cs, n];
    let parts = [];
    for (let b = 1; b < bounds.length; b++){
      const s0 = bounds[b-1], s1 = bounds[b], pts = [at(l.pts, s0)];
      for (let k = Math.floor(s0) + 1; k < s1; k++) pts.push(l.pts[k]);
      pts.push(at(l.pts, s1)); parts.push(pts);
    }
    if (isClosed(l.pts) && parts.length > 1){ const last = parts.pop(); parts[0] = last.concat(parts[0].slice(1)); }   // a ring's seam is no node
    for (const pts of parts) if (lengthOf(pts) >= 1.5) pieces.push({ rgb: l.rgb, rank: l.rank, ctx: l.ctx, pts });
  });
  const ends = [];
  pieces.forEach((p, e) => { if (!p.loop){ ends.push([e, 0, p.pts[0]], [e, 1, p.pts[p.pts.length - 1]]); } });
  const up = ends.map((_, i) => i), find = i => (up[i] === i ? i : (up[i] = find(up[i])));
  for (let i = 0; i < ends.length; i++) for (let j = i + 1; j < ends.length; j++)
    if (Math.hypot(ends[i][2][0] - ends[j][2][0], ends[i][2][1] - ends[j][2][1]) <= SNAP) up[find(i)] = find(j);
  const nodeOf = new Map(), nodes = [];
  ends.forEach((en, i) => { const r = find(i); if (!nodeOf.has(r)){ nodeOf.set(r, nodes.length); nodes.push({ x: 0, y: 0, n: 0, out: [] }); } const nd = nodes[nodeOf.get(r)]; nd.x += en[2][0]; nd.y += en[2][1]; nd.n++; });
  nodes.forEach(nd => { nd.x /= nd.n; nd.y /= nd.n; });
  const edges = [], loops = [];
  for (const p of pieces) if (p.loop && !p.ctx) loops.push(p);
  ends.forEach((en, i) => { const p = pieces[en[0]], v = nodeOf.get(find(i)); (p.nodes || (p.nodes = []))[en[1]] = v; });
  for (const p of pieces){
    if (p.loop) continue;
    const pts = p.pts.slice(); pts[0] = [nodes[p.nodes[0]].x, nodes[p.nodes[0]].y]; pts[pts.length - 1] = [nodes[p.nodes[1]].x, nodes[p.nodes[1]].y];
    if (p.nodes[0] === p.nodes[1] && lengthOf(pts) < 4 * SNAP) continue;   // a speck of a loop at a junction
    edges.push({ rgb: p.rgb, rank: p.rank, ctx: p.ctx, pts, a: p.nodes[0], b: p.nodes[1], len: lengthOf(pts) });
  }
  // half-edge h = 2e (a to b) or 2e + 1 (b to a), leaving its first node at angle ang[h]
  const hp = h => (h & 1 ? edges[h >> 1].pts.slice().reverse() : edges[h >> 1].pts);
  const from = h => (h & 1 ? edges[h >> 1].b : edges[h >> 1].a), to = h => from(h ^ 1);
  const ang = edges.flatMap((e, ei) => [0, 1].map(s => { const pts = hp(ei * 2 + s), o = pts[0]; let q = pts[pts.length - 1], run = 0;
    for (let k = 1; k < pts.length; k++){ run += Math.hypot(pts[k][0] - pts[k-1][0], pts[k][1] - pts[k-1][1]); if (run >= 10){ q = pts[k]; break; } }
    return Math.atan2(q[1] - o[1], q[0] - o[0]); }));
  edges.forEach((e, ei) => { nodes[e.a].out.push(ei * 2); nodes[e.b].out.push(ei * 2 + 1); });
  nodes.forEach(nd => nd.out.sort((x, y) => ang[x] - ang[y]));
  const next = h => { const out = nodes[to(h)].out, k = out.indexOf(h ^ 1); return out[(k - 1 + out.length) % out.length]; };
  const area = hs => { let s = 0; for (const h of hs){ const pts = hp(h); for (let k = 1; k < pts.length; k++) s += pts[k-1][0] * pts[k][1] - pts[k][0] * pts[k-1][1]; } return s / 2; };
  // faces, and which of them are closed shapes: in each connected piece of the map the biggest face is the outside
  const seen = new Uint8Array(edges.length * 2), faces = [];
  for (let h0 = 0; h0 < edges.length * 2; h0++){
    if (seen[h0]) continue; const hs = []; let h = h0;
    while (!seen[h] && hs.length <= edges.length * 2){ seen[h] = 1; hs.push(h); h = next(h); }
    faces.push({ hs, area: area(hs) });
  }
  const cu = nodes.map((_, i) => i), cf = i => (cu[i] === i ? i : (cu[i] = cf(cu[i])));
  edges.forEach(e => { cu[cf(e.a)] = cf(e.b); });
  const outside = new Map();
  for (const f of faces){ const c = cf(from(f.hs[0])), o = outside.get(c); if (!o || Math.abs(f.area) > Math.abs(o.area)) outside.set(c, f); }
  const shapes = faces.filter(f => { const o = outside.get(cf(from(f.hs[0]))); return f !== o && Math.sign(f.area) === -Math.sign(o.area) && Math.abs(f.area) > 40; })
    .map(f => { const mine = new Set(f.hs); return { hs: f.hs.filter(h => !mine.has(h ^ 1)), area: Math.abs(f.area) }; })   // a line poking into a shape is not its outline
    .filter(f => f.hs.length);
  // a plain outline cut up inside (a roof with its trusses, a fence) is drawn round the outside first, then the inside
  const hull = ps => { ps = ps.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = []; for (const p of ps){ while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (const p of ps.reverse()){ while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
    const h = lo.slice(0, -1).concat(hi.slice(0, -1)); let A = 0; h.forEach((p, i) => { const q = h[(i + 1) % h.length]; A += p[0] * q[1] - q[0] * p[1]; }); return Math.abs(A) / 2; };
  for (const [c, o] of outside){
    const inside = shapes.filter(f => cf(from(f.hs[0])) === c); if (inside.length < 2) continue;
    const mine = new Set(o.hs), hs = o.hs.filter(h => !mine.has(h ^ 1)); if (!hs.length) continue;
    const A = Math.abs(o.area), H = hull(hs.flatMap(h => hp(h)));
    if (H && A / H >= .85 && Math.max(...inside.map(f => f.area)) < A * .6) shapes.push({ hs, area: A * 2, outline: true });
  }
  for (const p of loops) shapes.push({ loop: p, area: Math.abs(p.pts.reduce((s, q, k, a) => (k ? s + a[k-1][0] * q[1] - q[0] * a[k-1][1] : 0), 0) / 2) });
  // strokes
  // drawn: an edge is spoken for (a shape or an open line has it); done: it is on the paper
  const drawn = Uint8Array.from(edges, e => (e.ctx ? 1 : 0)), done = drawn.slice(), out = []; let pen = null;
  const near = p => (pen ? Math.hypot(p[0] - pen[0], p[1] - pen[1]) : 0);
  // the ink so far, as points in 20 px cells, to tell how far a part is from it (owner's recorded mouse, 25 Nov 2026:
  // a part that hangs off the drawing is drawn from where it joins, whiskers out from the nose, a floating eye last)
  const CELL = 20, ATTACH = 30, grid = new Map();
  const addInk = pts => { for (let k = 0; k < pts.length; k++){ const a = pts[k], b = pts[k + 1] || a, n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 8));
    for (let s = 0; s < n; s++){ const x = a[0] + (b[0] - a[0]) * s / n, y = a[1] + (b[1] - a[1]) * s / n, key = Math.floor(x / CELL) * 1000 + Math.floor(y / CELL);
      if (!grid.has(key)) grid.set(key, []); grid.get(key).push([x, y]); } } };
  const gapAt = p => { const cx = Math.floor(p[0] / CELL), cy = Math.floor(p[1] / CELL); let best = Infinity;
    for (let i = cx - 3; i <= cx + 3; i++) for (let j = cy - 3; j <= cy + 3; j++){ const b = grid.get(i * 1000 + j); if (b) for (const q of b){ const d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < best) best = d; } }
    return best; };
  const gapOf = pts => pts.reduce((m, p) => Math.min(m, gapAt(p)), Infinity);
  edges.forEach(e => { if (e.ctx) addInk(e.pts); }); pieces.forEach(p => { if (p.loop && p.ctx) addInk(p.pts); });
  const emit = (pts, rgb, rank, flip = true, anchor = true) => {
    // from the end nearest the pen; the first line of a step from its top end (the back from the head down)
    if (flip && (pen ? near(pts[pts.length - 1]) < near(pts[0]) : pts[pts.length - 1][1] < pts[0][1])) pts = pts.slice().reverse();
    out.push({ rgb, rank, pts }); pen = pts[pts.length - 1]; if (anchor) addInk(pts);   // a short flick (a whisker) is no anchor for the next part
  };
  // where to start round a closed outline: by the pen if it is close, else where it joins the ink, else its top
  const startAt = ps => {
    if (pen){ const k = ps.reduce((b, p, i) => (near(p) < near(ps[b]) ? i : b), 0); if (near(ps[k]) <= 60) return k; }
    let k = -1, g = ATTACH; ps.forEach((p, i) => { const d = gapAt(p); if (d <= g){ g = d; k = i; } });
    return k >= 0 ? k : ps.reduce((b, p, i) => (p[1] < ps[b][1] ? i : b), 0);
  };
  // a tiny undrawn piece from the ink to node v (a tail's root on the back) is drawn as the start of what begins at v
  const leadInto = v => { for (const o of nodes[v].out){ const e = edges[o >> 1]; if (done[o >> 1] || e.len > 30) continue;
    if (nodes[to(o)].out.some(p => p !== (o ^ 1) && done[p >> 1])) return o ^ 1; } return null; };
  const chainOut = hs => {   // half-edges in order, one stroke per colour run
    let cur = null;
    for (const h of hs){ const e = edges[h >> 1], pts = hp(h); drawn[h >> 1] = done[h >> 1] = 1;
      if (cur && cur.rank === e.rank) cur.pts = cur.pts.concat(pts.slice(1)); else { if (cur) emit(cur.pts, cur.rgb, cur.rank, false); cur = { rgb: e.rgb, rank: e.rank, pts: pts.slice() }; } }
    if (cur) emit(cur.pts, cur.rgb, cur.rank, false);
  };
  // a closed loop goes round anticlockwise on the page, as the owner mostly draws them (60 of 83 loops recorded)
  const clockwise = ps => ps.reduce((a, p, i) => { const q = ps[(i + 1) % ps.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0) > 0;
  const drawShape = s => {
    if (s.loop){ let ring = s.loop.pts.slice(0, -1); if (clockwise(ring)) ring = ring.reverse(); ring.push(ring[0]);
      const k = startAt(ring.slice(0, -1)), pts = ring.slice(k).concat(ring.slice(1, k + 1)); emit(pts, s.loop.rgb, s.loop.rank, false); return; }
    const fresh = s.hs.map(h => !drawn[h >> 1]);
    if (!fresh.some(Boolean)) return;
    if (fresh.every(Boolean)){   // a whole new shape: round in one go, from the pen, where it joins, or its top
      if (clockwise(s.hs.map(h => [nodes[from(h)].x, nodes[from(h)].y]))) s = { ...s, hs: s.hs.map(h => h ^ 1).reverse() };
      const k = startAt(s.hs.map(h => [nodes[from(h)].x, nodes[from(h)].y])), lead = leadInto(from(s.hs[k]));
      if (lead != null) drawn[lead >> 1] = 1;
      chainOut([...(lead != null ? [lead] : []), ...s.hs.slice(k), ...s.hs.slice(0, k)]); return;
    }
    // only the new part of its outline, one run at a time (an ear's arch on the head)
    const n = s.hs.length, start = fresh.findIndex((f, i) => f && !fresh[(i - 1 + n) % n]);
    let run = [];
    const flush = () => { if (!run.length) return; const fwd = hp(run[0])[0], back = hp(run[run.length - 1]); const end = back[back.length - 1];
      if (pen && near(end) < near(fwd)) run = run.map(h => h ^ 1).reverse(); chainOut(run); run = []; };
    for (let c = 0; c < n; c++){ const i = (start + c) % n; if (fresh[i]) run.push(s.hs[i]); else flush(); }
    flush();
  };
  // how much new line a shape adds, and the step's whole length: a big shape is drawn first, a small one (a tail's
  // tuft, a toenail) takes its turn with the open lines, after the long back it hangs from
  const freshLen = s => (s.loop ? lengthOf(s.loop.pts) : [...new Set(s.hs.map(h => h >> 1))].reduce((a, e) => a + (drawn[e] ? 0 : edges[e].len), 0));
  const stepLen = edges.reduce((a, e) => a + (e.ctx ? 0 : e.len), 0) + loops.reduce((a, p) => a + lengthOf(p.pts), 0);
  // a hub (a body with wings and feet on it) is a big shape too, even when its own outline is short
  const ties = s => { if (s.loop) return 0; const own = new Set(s.hs.map(h => h >> 1)), at = new Set();
    for (const h of s.hs) for (const o of nodes[from(h)].out) if (!own.has(o >> 1) && !edges[o >> 1].ctx) at.add(o >> 1); return at.size; };
  const turn = (hIn, hOut) => { const a = ang[hIn ^ 1] + Math.PI, b = ang[hOut]; let d = Math.abs(a - b) % (2 * Math.PI); return d > Math.PI ? 2 * Math.PI - d : d; };
  // ...but not a shape an outline runs straight along (an ear on the head's line: the back runs on over its base)
  const along = s => { if (s.loop) return false; const own = new Set(s.hs.map(h => h >> 1));
    return s.hs.some(h => { const out = nodes[from(h)].out; return out.some(o => !own.has(o >> 1) && !edges[o >> 1].ctx && out.some(q => own.has(q >> 1) && turn(o ^ 1, q) < .6)); }); };
  // (the step's main hub stays big even so: the bat's body, which both wing edges run along)
  const hub = shapes.reduce((b, s) => (!s.loop && ties(s) >= 3 && (!b || ties(s) * s.area > ties(b) * b.area) ? s : b), null);
  const big = shapes.filter(s => freshLen(s) >= stepLen * .3 || (freshLen(s) >= stepLen * .12 && ties(s) >= 3 && (s === hub || !along(s))));
  // a small shape is one loop only when it is round (a paw, a foot, a hand: owner's recordings, 25 Nov 2026); a long
  // narrow space (between two leg lines, a haunch closed off by a paw) is just lines, drawn as lines
  const round = s => s.loop || 4 * Math.PI * s.area / s.hs.reduce((a, h) => a + edges[h >> 1].len, 0) ** 2 >= .8;
  const small = shapes.filter(s => !big.includes(s) && round(s));
  const touches = s => (s.loop ? false : s.hs.some(h => nodes[from(h)].out.some(o => drawn[o >> 1])));
  while (big.length){   // the biggest shape, then the shapes that touch what is drawn, biggest first
    const touching = big.filter(touches), pool = touching.length ? touching : big;
    // the hub first (the bat's body, which its wings and feet hang off), then by size (owner's recordings, 25 Nov 2026)
    const rank = c => (ties(c) >= 3 ? 1e9 : 0) + c.area;
    const s = pool.reduce((b, c) => (rank(c) > rank(b) ? c : b));
    big.splice(big.indexOf(s), 1); drawShape(s);
  }
  // open lines: from the longest, carried on through a node only where the line runs straight on
  // a small shape (a hand, a foot) keeps its lines for itself; an open line takes one only as a short bridge to more
  // open line beyond it (the chest runs on past the hand to the belly, the head's top under an ear), so the outline is
  // one long sweep and the hand is its own loop afterwards
  const onShape = new Uint8Array(edges.length); for (const s of small) if (!s.loop) for (const h of s.hs) onShape[h >> 1] = 1;
  const plain = o => !drawn[o >> 1] && !onShape[o >> 1];
  // (two such pieces in a row too: the head's top runs under both ears to the forehead)
  const bridge = (o, room = 140) => !drawn[o >> 1] && onShape[o >> 1] && edges[o >> 1].len <= room && nodes[to(o)].out.some(p => p !== (o ^ 1) &&
    ((plain(p) && edges[p >> 1].len >= 40 && turn(o, p) < 2) || (room === 140 && turn(o, p) < .9 && bridge(p, room - edges[o >> 1].len))));
  const items = small.map(s => ({ shape: s }));
  for (;;){
    let seed = -1; edges.forEach((e, i) => { if (plain(i * 2) && (seed < 0 || e.len > edges[seed].len)) seed = i; });
    if (seed < 0) break;
    drawn[seed] = 1; const hs = [seed * 2];
    for (const side of [1, 0]){
      for (;;){
        const last = side ? hs[hs.length - 1] : hs[0] ^ 1, v = to(last), outs = nodes[v].out.filter(o => o !== (last ^ 1));
        const ways = outs.filter(o => plain(o) || bridge(o)).map(o => [o, turn(last, o)]).sort((x, y) => x[1] - y[1]);
        let pick = null;
        if (outs.length === 1 && ways.length === 1) pick = ways[0][0];
        else if (ways.length && ways[0][1] < .9) pick = ways[0][0];
        // round a corner only where a shape sits on the outline there and the outline is the one way on
        else if (ways.length === 1 && ways[0][1] < 2 && outs.some(o => onShape[o >> 1])) pick = ways[0][0];
        if (pick == null || edges[pick >> 1].rank !== edges[seed].rank) break;
        drawn[pick >> 1] = 1;
        if (side) hs.push(pick); else hs.unshift(pick ^ 1);
      }
    }
    items.push({ hs });
  }
  const itemLen = it => (it.shape ? freshLen(it.shape) : it.hs.reduce((a, h) => a + edges[h >> 1].len, 0));
  const ptsOf = it => (it.shape ? (it.shape.loop ? it.shape.loop.pts : it.shape.hs.flatMap(h => hp(h))) : it.hs.flatMap(h => hp(h)));
  const endsOf = it => (it.shape ? ptsOf(it) : [hp(it.hs[0])[0], hp(it.hs[it.hs.length - 1]).slice(-1)[0]]);
  // a closed shape inside a longer open outline (an ear inside the head's line) waits until that outline is done
  const box = new Map(items.map(it => [it, boxOf(ptsOf(it))]));
  const within = (a, b) => a[0] >= b[0] && a[1] >= b[1] && a[2] <= b[2] && a[3] <= b[3];
  const inner = it => it.shape && items.some(c => c.hs && itemLen(c) > itemLen(it) && within(box.get(it), box.get(c)));
  const pickMin = (pool, f) => pool.reduce((b, it) => (f(it) < f(b) ? it : b));
  const longest = Math.max(0, ...items.map(itemLen));
  for (const group of [items.filter(it => itemLen(it) >= longest * .4), items.filter(it => itemLen(it) < longest * .4)]){
    while (group.length){
      // what joins the ink first (gap of 30 px or less), outlines before what sits inside them; then the nearest to the
      // pen; a step that starts on bare paper starts with its longest line
      let pool = group;
      const outer = pool.filter(it => !inner(it)); if (outer.length) pool = outer;
      if (grid.size){ const joined = pool.filter(it => gapOf(ptsOf(it)) <= ATTACH); if (joined.length) pool = joined; }
      // (equally joined, a long outline goes before a shape that hangs off it: the beaver's back and bottom, then its foot)
      const sweep = c => (c.hs && itemLen(c) >= 150 ? 0 : 1);
      const it = pen ? pickMin(pool, c => Math.min(...endsOf(c).map(near))) : grid.size ? pickMin(pool, c => Math.floor(gapOf(ptsOf(c)) / 10) * 2 + sweep(c)) : pickMin(pool, c => -itemLen(c));
      group.splice(group.indexOf(it), 1);
      if (it.hs && it.hs.every(h => done[h >> 1])) continue;   // already drawn as the lead of a shape
      if (it.shape){ drawShape(it.shape); continue; }
      // a short line (a whisker) starts where it joins the ink and flicks outward; a long one from the pen, or its top
      it.hs.forEach(h => { done[h >> 1] = 1; });
      const pts = it.hs.flatMap((h, k) => (k ? hp(h).slice(1) : hp(h))), a = pts[0], b = pts[pts.length - 1];
      let ga = Infinity, gb = Infinity; if (itemLen(it) < 150){ ga = gapAt(a); gb = gapAt(b); }
      const fwd = ga !== gb ? ga < gb : pen ? near(a) <= near(b) : a[1] <= b[1];
      emit(fwd ? pts : pts.slice().reverse(), edges[it.hs[0] >> 1].rgb, edges[it.hs[0] >> 1].rank, false, itemLen(it) >= 150);
    }
  }
  return out;
}

// earlier lines that come near a step's own (within 12 px of its box)
const nearby = (st, earlier) => { if (!st.length) return []; const b = boxOf(st.flatMap(l => l.pts)); return earlier.filter(l => boxGap(boxOf(l.pts), b) <= 12); };

function arrange(lines, target = 6, ink = null){
  const all = lines.map(l => { const rank = rankOf(l.rgb); return { pts: l.pts, rank, rgb: PALETTE[rank].rgb, len: l.len || lengthOf(l.pts), box: boxOf(l.pts) }; });
  // the ground, a branch or a log's long edge runs under everything, so it never ties things together
  const wide = l => l.box[2] - l.box[0] > W * .55;
  const up = all.map((_, i) => i), find = i => (up[i] === i ? i : (up[i] = find(up[i])));
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++)
    if (!wide(all[i]) && !wide(all[j]) && find(i) !== find(j) && touching(all[i], all[j])) up[find(i)] = find(j);
  const byRoot = new Map();
  all.forEach((l, i) => { const r = find(i); if (!byRoot.has(r)) byRoot.set(r, []); byRoot.get(r).push(l); });
  const corners = ls => ls.flatMap(l => [[l.box[0], l.box[1]], [l.box[2], l.box[3]]]);
  let things = [...byRoot.values()].map(ls => ({ lines: ls, len: ls.reduce((a, l) => a + l.len, 0), box: boxOf(corners(ls)), back: ls.every(wide) }));
  // a speck (an eye, a dot of dew) belongs to the nearest thing rather than being drawn on its own
  const total = things.reduce((a, t) => a + t.len, 0);
  for (const t of things.slice().sort((a, b) => a.len - b.len)){
    if (t.back || t.len >= total * .05 || things.length < 2) continue;
    let host = null, bd = Infinity;
    for (const o of things) if (o !== t){ const d = boxGap(t.box, o.box) + (o.back ? 1e5 : 0); if (d < bd){ bd = d; host = o; } }
    host.lines.push(...t.lines); host.len += t.len; host.box = boxOf(corners(host.lines));
    things = things.filter(o => o !== t);
  }
  // a small piece standing just apart from a bigger thing (a leg that misses the body) is part of it
  for (const t of things.slice().sort((a, b) => a.len - b.len)){
    if (t.back || t.len >= total * .1) continue;
    const host = things.find(o => o !== t && !o.back && o.len > t.len && boxGap(t.box, o.box) < 1 && o.lines.some(l => t.lines.some(m => touching(l, m, 30))));
    if (!host) continue;
    host.lines.push(...t.lines); host.len += t.len; host.box = boxOf(corners(host.lines));
    things = things.filter(o => o !== t);
  }
  // the ground first, then the biggest things
  things.sort((a, b) => (b.back - a.back) || b.len - a.len);
  let steps = things.map(t => orderLines(t.lines));
  const ground = new WeakSet(steps.filter((st, i) => things[i].back));
  const merge = () => {
    let bi = -1, bv = Infinity;
    for (const free of [true, false]){
      for (let i = 0; i + 1 < steps.length; i++){
        if (free && (ground.has(steps[i]) || ground.has(steps[i + 1]))) continue;   // the ground keeps a step of its own
        const v = sizeOf(steps[i]) + sizeOf(steps[i + 1]); if (v < bv){ bv = v; bi = i; }
      }
      if (bi >= 0) break;
    }
    steps.splice(bi, 2, steps[bi].concat(steps[bi + 1]));
  };
  const split = () => {
    const order = steps.map((st, i) => i).sort((a, b) => sizeOf(steps[b]) - sizeOf(steps[a]));
    for (const i of order){ const two = cutInTwo(steps[i]); if (two){ if (ground.has(steps[i])) two.forEach(st => ground.add(st)); steps.splice(i, 1, ...two); return true; } }
    return false;
  };
  while (steps.length > target) merge();
  while (steps.length < target) if (!split()) break;
  // even them out when one step is far bigger than the rest: cut it and join the two smallest neighbours
  const fair = sizeOf(steps.flat()) / steps.length;
  for (let k = 0; k < 30 && steps.length > 2; k++){
    const before = steps.slice(), worst = Math.max(...steps.map(sizeOf));
    if (worst < fair * 1.8) break;
    if (!split()) break;
    merge();
    if (Math.max(...steps.map(sizeOf)) >= worst * .97){ steps = before; break; }
  }
  steps = steps.map((st, i) => restroke(st, nearby(st, steps.slice(0, i).flat()), ink));
  const seen = new Set();
  return steps.map(lines => {
    const ranks = new Set(lines.map(l => l.rank)), rgb = lines[0].rgb;
    if (ranks.size === 1){ const part = PALETTE[lines[0].rank].name, title = seen.has(part) ? MORE[part] : LABEL[part]; seen.add(part); return { part, rgb, title, lines }; }
    const b = boxOf(lines.flatMap(l => l.pts)), x = (b[0] + b[2]) / 2 / W, y = (b[1] + b[3]) / 2 / H;
    const where = y < .3 ? 'at the top' : y > .7 ? 'at the bottom' : x < .35 ? 'on the left' : x > .65 ? 'on the right' : 'in the middle';
    return { part: 'mixed', rgb, title: `Draw the part ${where}`, lines };
  });
}

// A hand-set plan (src/topics/draw-trace-plans.js) names each step and says where its lines are, so a busy picture
// traces one whole creature or part at a time. Each step is { title, find: [place, ...] } and a place is one of
//   [x0, y0, x1, y1] or ['colour', x0, y0, x1, y1]   a box
//   { c, path: [[x, y], ...], d, closed }           lines running along a rough path (an outline, a leaf's middle)
//   { c, ring: [cx, cy, rx, ry], d }                lines running round an oval (a ring of a web)
//   { c, spoke: [cx, cy] }                          lines running out from a centre (the spokes of a web)
// in drawing space (1000 x 750). A point goes to the smallest place that holds it, so a small box inside a big one
// wins; a scrap shorter than a fingertip joins the run beside it.
function placeFit(pl, p, dir, colour){
  if (pl.c && pl.c !== colour) return Infinity;
  if (pl.box){ const [x0, y0, x1, y1] = pl.box; return p[0] >= x0 && p[0] <= x1 && p[1] >= y0 && p[1] <= y1 ? Math.sqrt((x1 - x0) * (y1 - y0)) : Infinity; }
  const d = pl.d || 20;
  if (pl.ring){
    const [cx, cy, rx, ry] = pl.ring, u = [(p[0] - cx) / rx, (p[1] - cy) / ry];
    if (Math.abs(Math.hypot(u[0], u[1]) - 1) * (rx + ry) / 2 > d) return Infinity;
    const n = [u[0] / rx, u[1] / ry], cos = Math.abs(n[0] * dir[0] + n[1] * dir[1]) / (Math.hypot(n[0], n[1]) || 1);
    return cos < .6 ? 2 * d : Infinity;   // running round, not across
  }
  if (pl.spoke){
    const v = [p[0] - pl.spoke[0], p[1] - pl.spoke[1]], cos = Math.abs(v[0] * dir[0] + v[1] * dir[1]) / (Math.hypot(v[0], v[1]) || 1);
    return cos > .75 ? 1000 : Infinity;
  }
  if (pl.path){
    const pts = pl.closed ? pl.path.concat([pl.path[0]]) : pl.path;
    let best = Infinity, along = null;
    for (let i = 1; i < pts.length; i++){
      const a = pts[i-1], b = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], L = dx*dx + dy*dy;
      const t = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)) : 0, g = Math.hypot(a[0] + t*dx - p[0], a[1] + t*dy - p[1]);
      if (g < best){ best = g; along = [dx / (Math.sqrt(L) || 1), dy / (Math.sqrt(L) || 1)]; }
    }
    return best <= d && Math.abs(along[0] * dir[0] + along[1] * dir[1]) > .6 ? 2 * d : Infinity;
  }
  return Infinity;
}
function resample(pts, gap = 5){
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++){
    const a = pts[i-1], b = pts[i], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / gap));
    for (let k = 1; k <= n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
  }
  return out;
}
function byPlan(lines, plan, ink){
  const places = plan.flatMap((st, si) => st.find.map(f => Array.isArray(f) ? (typeof f[0] === 'string' ? { c: f[0], box: f.slice(1), si } : { box: f, si }) : { ...f, si }));
  const boxes = places.filter(pl => pl.box);
  const steps = plan.map(() => []);
  for (const line of lines){
    const rank = rankOf(line.rgb), colour = PALETTE[rank].name, rgb = PALETTE[rank].rgb, pts = resample(line.pts);
    const at = pts.map((p, i) => {
      const a = pts[Math.max(0, i - 2)], b = pts[Math.min(pts.length - 1, i + 2)], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, dir = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
      let si = -1, bv = Infinity; for (const pl of places){ const v = placeFit(pl, p, dir, colour); if (v < bv){ bv = v; si = pl.si; } }
      return si;
    });
    if (at.every(si => si < 0)){   // nowhere: the nearest box takes the whole line
      const b = boxOf(pts); let bd = Infinity, si = plan.length - 1;
      for (const pl of boxes){ const g = boxGap(b, pl.box) + (pl.c && pl.c !== colour ? 1e4 : 0); if (g < bd){ bd = g; si = pl.si; } }
      at.fill(si);
    }
    for (let i = 1; i < at.length; i++) if (at[i] < 0) at[i] = at[i-1];
    for (let i = at.length - 2; i >= 0; i--) if (at[i] < 0) at[i] = at[i+1];
    // runs of one step; a short scrap joins its longer neighbour
    let runs = [];
    for (let i = 0; i < at.length; i++){ const r = runs[runs.length - 1]; if (r && r.si === at[i]) r.b = i; else runs.push({ si: at[i], a: Math.max(0, i - 1), b: i }); }
    runs[0].a = 0;
    const lenOf = r => lengthOf(pts.slice(r.a, r.b + 1));
    for (;;){
      if (runs.length < 2) break;
      let k = -1, kl = 16;
      runs.forEach((r, i) => { const L = lenOf(r); if (L < kl){ kl = L; k = i; } });
      if (k < 0) break;
      const left = runs[k - 1], right = runs[k + 1], into = !left ? right : !right ? left : (lenOf(left) >= lenOf(right) ? left : right);
      into.a = Math.min(into.a, runs[k].a); into.b = Math.max(into.b, runs[k].b); runs.splice(k, 1);
      runs = runs.reduce((out, r) => { const last = out[out.length - 1]; if (last && last.si === r.si) last.b = r.b; else out.push(r); return out; }, []);
    }
    for (const r of runs){ const piece = simplify(pts.slice(r.a, r.b + 1), .6); if (piece.length > 1) steps[r.si].push({ rgb, rank, pts: piece, len: lengthOf(piece) }); }
  }
  return plan.map((st, si) => ({ part: 'plan', title: st.title, rgb: (steps[si][0] || {}).rgb || [40, 40, 40], lines: restroke(steps[si], nearby(steps[si], steps.slice(0, si).flat()), ink) }))
    .filter(st => st.lines.length);
}

function toDrawing(steps, name){
  const strokes = []; let t = 0;
  // a big picture draws a little faster so a whole replay stays near half a minute
  const total = steps.reduce((a, st) => a + st.lines.reduce((b, l) => b + lengthOf(l.pts) / 560 * 1000 + 460, 0), 0);
  const pace = Math.max(1, total / 30000);
  steps.forEach((st, si) => st.lines.forEach(l => {
    const L = lengthOf(l.pts), dur = (L / 560 * 1000 + 140) / pace, cum = [0];
    for (let k = 1; k < l.pts.length; k++) cum.push(cum[k-1] + Math.hypot(l.pts[k][0] - l.pts[k-1][0], l.pts[k][1] - l.pts[k-1][1]));
    const pts = l.pts.map((p, k) => { const s = L ? cum[k] / L : 0, e = s < .5 ? 2*s*s : 1 - Math.pow(-2*s + 2, 2) / 2;
      return [+p[0].toFixed(1), +p[1].toFixed(1), Math.round(t + dur * (.15 * s + .85 * e))]; });
    strokes.push({ color: hex(l.rgb || st.rgb), step: si, pts }); t += dur + 320 / pace;
  }));
  return { name, width: W, height: H, stepNames: steps.map(s => s.title || LABEL[s.part] || ''), strokes, source: 'line-art' };
}

async function convert(src, name = 'Line art', level, plan){
  const img = typeof src === 'string' ? await loadImage(src) : src;
  const px = rasterise(img), ink = inkMask(px), lab = labelInk(px, ink);
  // one colour at a time: its own pixels are thinned and traced alone, so every line has exactly one colour
  const pixels = PALETTE.map(() => []), skAll = new Int8Array(W * H).fill(-1), parts = [];
  for (let i = 0; i < lab.length; i++) if (lab[i] >= 0) pixels[lab[i]].push(i);
  pixels.forEach((list, c) => {
    if (!list.length) return;
    const mask = new Uint8Array(W * H); for (const i of list) mask[i] = 1;
    const live = thin(mask, list); for (const i of live) skAll[i] = c;
    parts.push({ c, joined: joinPieces(trace(mask, live)) });
  });
  const lines = [];
  for (const { c, joined } of parts) for (const line of joined){
    line.pts = line.pts.slice(); extendEnds(line, c, ink, lab, skAll);
    const L = lengthOf(line.pts); if (L < 12 && (line.free[0] || line.free[1] || L < 4)) continue;   // specks; a short link between two forks stays
    // smooth the pixel steps first, then thin the points out: smoothing the few points left after simplify pulled
    // every square corner (a barn wall meeting the floor) 100 px inwards into a long diagonal
    lines.push({ pts: simplify(smooth(line.pts), .9), len: L, rgb: PALETTE[c].rgb });
  }
  if (!lines.length) throw new Error('No lines found in that picture.');
  snapEnds(lines, ink);
  return toDrawing(plan ? byPlan(lines, plan, ink) : arrange(lines, STEP_TARGET[level], ink), name);
}
async function fromFile(file){
  const url = URL.createObjectURL(file);
  try { return await convert(url, file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').trim() || 'Line art'); }
  finally { URL.revokeObjectURL(url); }
}
// Converting takes a moment, so each picture is converted once per page and shared.
const cache = new Map();
function convertCached(src, name, level, plan){
  const key = `${src}|${level || ''}`;
  if (!cache.has(key)) cache.set(key, convert(src, name, level, plan).catch(error => { cache.delete(key); throw error; }));
  return cache.get(key);
}
// Pictures drawn as vectors (scripts/draw-outlines.py) bring their own steps and strokes in a .json file, so
// nothing has to be guessed from pixels: { steps: [{ title, rgb, lines: [{ rgb, pts: [[x, y], ...] }, ...] }] }.
function fromSteps(data, name){
  return toDrawing(data.steps.map(st => ({ part: st.part, title: st.title, rgb: st.rgb, lines: st.lines.map(l => ({ rgb: l.rgb, pts: l.pts })) })), name);
}
function loadSteps(src, name){
  const key = `${src}|steps`;
  if (!cache.has(key)) cache.set(key, fetch(src).then(r => { if (!r.ok) throw Error('steps'); return r.json(); }).then(d => fromSteps(d, name)).catch(error => { cache.delete(key); throw error; }));
  return cache.get(key);
}
export { convert, convertCached, fromFile, fromSteps, loadSteps };
