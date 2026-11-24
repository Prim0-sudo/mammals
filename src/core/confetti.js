// Confetti (owner asked for cooler confetti, 24 November 2026). One canvas in the #effects layer, driven
// by the GSAP ticker. Pieces are fired, not dropped: they shoot up fast, slow in the air, then flutter
// down swaying, each a two-sided piece of paper that flips (its height squashes with the flip, and its
// back is a darker shade, so it glints). Most are paper strips and dots, with curly ribbons, paw prints,
// leaves and stars among them; gold and silver catch the light.
//
// The size of the burst follows the moment:
//   pop    (up to 40 pieces): a small burst from the thing that earned it (or the bottom middle);
//   cheer  (41 to 99):        two cannons from the bottom corners, plus a burst from the stars;
//   finale (100 or more):     the cannons fire twice, with more gold and ribbons.
// Reduced motion: no flying pieces. A cheer or finale shows still sparkles round the stars that fade in
// and out; a pop shows nothing.

const PALETTE = ["#ff5d73", "#ffb627", "#3ec1d3", "#5ad16a", "#9b6bff", "#ff8c42", "#2f9df4", "#f45bb5"];
const GOLD = ["#f2c14e", "#e8b23a", "#dfe6ee"]; // two golds and a silver
// How often each shape comes up (paper strips most of all).
const SHAPES = [["strip", 42], ["dot", 14], ["ribbon", 14], ["paw", 11], ["leaf", 10], ["star", 9]];
const SHAPE_TOTAL = SHAPES.reduce((n, [, w]) => n + w, 0);
const MAX_AGE = 7;
const LAUNCH_DRAG = 2.6; // per second: how fast a launch slows; distance travelled = speed / LAUNCH_DRAG // seconds; a piece still in the air then fades out

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function pickShape() {
  let r = Math.random() * SHAPE_TOTAL;
  for (const [name, w] of SHAPES) if ((r -= w) < 0) return name;
  return "strip";
}
// A colour a share darker (the back of the paper).
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * (1 - k)));
  return `rgb(${c.join(",")})`;
}

class Confetti {
  constructor(layer) {
    this.layer = layer;
    this.pieces = [];
    this.sparkles = [];
    this.timers = [];
    this.tick = (time, delta) => this.frame(delta / 1000);
  }
  ensureCanvas() {
    if (this.canvas?.isConnected) return true;
    if (!this.layer?.isConnected) return false;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "confetti-canvas";
    this.canvas.setAttribute("aria-hidden", "true");
    this.layer.append(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.size();
    return !!this.ctx;
  }
  size() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.canvas.width = Math.round(this.W * dpr);
    this.canvas.height = Math.round(this.H * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.k = clamp(Math.min(this.W, this.H) / 760, 0.8, 1.35); // one scale for sizes and speeds
  }
  start() {
    if (this.running) return;
    this.running = true;
    const gsap = window.gsap;
    if (gsap) gsap.ticker.add(this.tick);
    else {
      let last = performance.now();
      const loop = (now) => {
        if (!this.running) return;
        this.frame((now - last) / 1000);
        last = now;
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }
  }
  stop() {
    this.running = false;
    window.gsap?.ticker.remove(this.tick);
    cancelAnimationFrame(this.raf);
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.pieces = [];
    this.sparkles = [];
    this.canvas?.remove();
    this.canvas = null;
  }

  // Where a burst starts: the middle of an element, or a point.
  origin(from) {
    const r = from?.getBoundingClientRect?.();
    if (r && r.width) return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
    return null;
  }
  piece(x, y, angle, speed, gold) {
    const k = this.k;
    const shape = pickShape();
    const color = gold ? GOLD[Math.floor(Math.random() * GOLD.length)] : PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const big = shape === "paw" || shape === "leaf" || shape === "star";
    this.pieces.push({
      x, y, shape, color, back: shade(color, 0.32), gold,
      // Launch speed (decays fast) is kept apart from the slow fall, so a cannon shot climbs high
      // and then the paper drifts down at its own pace rather than dropping like a stone.
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, fall: 0,
      term: (shape === "dot" ? rand(190, 240) : rand(105, 165)) * k,
      w: (shape === "dot" ? rand(5, 7) : big ? rand(11, 14) : rand(6, 9)) * k,
      h: (shape === "strip" ? rand(11, 16) : shape === "ribbon" ? rand(26, 38) : rand(5, 7)) * k,
      rot: rand(0, Math.PI * 2), spin: rand(-6, 6),
      flip: rand(0, Math.PI * 2), flipRate: rand(7, 14),
      sway: rand(0, Math.PI * 2), swayRate: rand(2, 4), swayAmp: rand(18, 42) * k,
      curl: rand(0, Math.PI * 2), age: 0,
    });
  }
  // A cannon at a bottom corner, firing up and in towards the middle.
  cannon(side, count, gold) {
    const x = side < 0 ? -10 : this.W + 10, y = this.H + 10;
    const aim = side < 0 ? -Math.PI * 0.32 : -Math.PI * 0.68; // up and across
    // Speed from the screen height: the pieces reach between half and most of the way up.
    for (let i = 0; i < count; i++) this.piece(x, y, aim + rand(-0.3, 0.3), this.H * rand(0.62, 1.02) * LAUNCH_DRAG, Math.random() < gold);
  }
  // A round burst from a point, mostly upwards.
  burst(at, count, gold) {
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + rand(-1.6, 1.6);
      this.piece(at.x + rand(-0.3, 0.3) * (at.w || 0), at.y, a, rand(160, 330) * this.k * LAUNCH_DRAG, Math.random() < gold);
    }
  }
  // Reduced motion: still four-point sparkles round the stars, fading in and out.
  sparkle(at) {
    const k = this.k;
    const c = at || { x: this.W / 2, y: this.H * 0.4, w: 200 * k, h: 80 * k };
    for (let i = 0; i < 9; i++) {
      this.sparkles.push({
        x: c.x + rand(-0.7, 0.7) * Math.max(c.w, 160 * k), y: c.y + rand(-0.9, 0.9) * Math.max(c.h, 70 * k),
        r: rand(7, 13) * k, color: i % 3 ? "#ffd65a" : "#ffffff", delay: rand(0, 0.5), age: 0,
      });
    }
  }

  fire(count, { from, gold = false, reduced = false, sound } = {}) {
    const tier = count >= 100 ? "finale" : count > 40 ? "cheer" : "pop";
    if (reduced && tier === "pop") return;
    if (!this.ensureCanvas()) return;
    if (this.W !== window.innerWidth || this.H !== window.innerHeight) this.size();
    const at = this.origin(from);
    if (reduced) {
      this.sparkle(at);
      this.start();
      return;
    }
    const goldShare = tier === "finale" ? 0.24 : gold ? 0.3 : 0.1;
    if (tier === "pop") {
      this.burst(at || { x: this.W / 2, y: this.H * 0.92, w: this.W * 0.3 }, count, goldShare);
    } else {
      const side = Math.round(count * (tier === "finale" ? 0.3 : 0.38));
      this.cannon(-1, side, goldShare);
      this.cannon(1, side, goldShare);
      if (at) this.burst(at, Math.max(14, count - side * 2), goldShare + 0.15);
      sound?.();
      if (tier === "finale") {
        const id = setTimeout(() => {
          this.timers = this.timers.filter((t) => t !== id);
          if (!this.running) return;
          this.cannon(-1, Math.round(side * 0.7), goldShare);
          this.cannon(1, Math.round(side * 0.7), goldShare);
          sound?.();
        }, 420);
        this.timers.push(id);
      }
    }
    this.start();
  }

  frame(dt) {
    if (!this.ensureCanvas()) return this.stop();
    dt = clamp(dt || 0, 0, 1 / 20);
    const { ctx, W, H, k } = this;
    ctx.clearRect(0, 0, W, H);
    for (const p of this.pieces) {
      p.age += dt;
      p.flip += p.flipRate * dt;
      p.rot += p.spin * dt;
      p.sway += p.swayRate * dt;
      p.curl += dt * 5;
      // The launch dies away; the fall eases towards a slow drift, slower still while the paper
      // lies flat to the air (face on), which is what makes it flutter rather than drop like a card.
      const face = p.shape === "dot" ? 0 : Math.abs(Math.cos(p.flip));
      const decay = Math.exp(-LAUNCH_DRAG * dt);
      p.vx *= decay;
      p.vy *= decay;
      p.fall += (p.term * (1 - 0.45 * face) - p.fall) * Math.min(1, 2.5 * dt);
      const drift = clamp(p.fall / p.term, 0, 1);
      p.x += (p.vx + Math.cos(p.sway) * p.swayAmp * 1.6 * drift) * dt;
      p.y += (p.vy + p.fall) * dt;
      this.draw(p);
    }
    this.pieces = this.pieces.filter((p) => p.y < H + 60 && p.age < MAX_AGE && p.x > -120 && p.x < W + 120);
    for (const s of this.sparkles) {
      s.age += dt;
      const t = clamp((s.age - s.delay) / 1.6, 0, 1);
      if (t <= 0) continue;
      ctx.globalAlpha = Math.sin(t * Math.PI);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4, r = i % 2 ? s.r * 0.22 : s.r;
        ctx.lineTo(s.x + Math.cos(a) * r, s.y + Math.sin(a) * r);
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    this.sparkles = this.sparkles.filter((s) => s.age < s.delay + 1.6);
    if (!this.pieces.length && !this.sparkles.length && !this.timers.length) this.stop();
  }

  draw(p) {
    const { ctx } = this;
    const c = Math.cos(p.flip);
    const front = c >= 0;
    ctx.save();
    ctx.globalAlpha = p.age > MAX_AGE - 0.6 ? clamp((MAX_AGE - p.age) / 0.6, 0, 1) : 1;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    // Gold and silver flash bright as they turn face on.
    let fill = front ? p.color : p.back;
    if (p.gold && Math.abs(c) > 0.92) fill = "#fff6d8";
    ctx.fillStyle = fill;
    ctx.strokeStyle = fill;
    if (p.shape === "ribbon") {
      // A curly streamer: a wavy line that keeps curling, seen edge on as it turns.
      ctx.lineWidth = Math.max(1.5, p.w * 0.45 * (0.35 + 0.65 * Math.abs(c)));
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        ctx.lineTo(Math.sin(p.curl + t * 7) * p.w * 0.7, (t - 0.5) * p.h);
      }
      ctx.stroke();
      ctx.restore();
      return;
    }
    ctx.scale(1, Math.max(0.08, Math.abs(c)));
    const { w, h } = p;
    ctx.beginPath();
    if (p.shape === "strip") ctx.rect(-w / 2, -h / 2, w, h);
    else if (p.shape === "dot") ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
    else if (p.shape === "paw") {
      ctx.ellipse(0, w * 0.18, w * 0.36, w * 0.3, 0, 0, Math.PI * 2);
      for (const [tx, ty, r] of [[-0.36, -0.2, 0.14], [-0.13, -0.4, 0.15], [0.13, -0.4, 0.15], [0.36, -0.2, 0.14]]) {
        ctx.moveTo(tx * w + r * w, ty * w);
        ctx.arc(tx * w, ty * w, r * w, 0, Math.PI * 2);
      }
    } else if (p.shape === "leaf") {
      ctx.moveTo(0, -w * 0.6);
      ctx.quadraticCurveTo(w * 0.55, -w * 0.1, 0, w * 0.6);
      ctx.quadraticCurveTo(-w * 0.55, -w * 0.1, 0, -w * 0.6);
    } else {
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? w * 0.24 : w * 0.56;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
    }
    ctx.fill();
    if (p.shape === "leaf") {
      // The midrib, in the back shade.
      ctx.strokeStyle = p.back;
      ctx.lineWidth = Math.max(1, w * 0.07);
      ctx.beginPath();
      ctx.moveTo(0, -w * 0.5);
      ctx.lineTo(0, w * 0.55);
      ctx.stroke();
    }
    ctx.restore();
  }
}

const engines = new WeakMap();
// Fire confetti into a layer (the #effects element). count sets the size of the moment (see the top).
export function fireConfetti(layer, count, options = {}) {
  if (!layer) return;
  let engine = engines.get(layer);
  if (!engine) engines.set(layer, (engine = new Confetti(layer)));
  engine.fire(count, options);
}
