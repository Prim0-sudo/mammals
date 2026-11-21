// Layered backgrounds with parallax (blueprint ART-AND-ANIMATION, "Layered backgrounds").
// Each plane is painted with overscan, so a nearer plane can shift further than a distant one as the
// pointer moves without opening a seam. Clouds drift from offscreen to offscreen. GSAP drives every
// move with transforms only; nothing moves under reduced motion, and everything holds while the
// game is held or the tab is hidden.
import { SCENES, painted } from "../topics/painted-art.js";

const SHIFT_X = 0.034; // furthest a depth-1 plane moves, as a share of the width (overscan is 4%)
const SHIFT_Y = 0.024; // and of the height (overscan is 3%)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const layersReady = (key, source = painted) => !!SCENES[key]?.layers.every(([id]) => source(id));

// Returns null when the scene's planes are not all painted yet; callers keep their current look.
export function mountScene(host, key, { gsap = window.gsap, reduced = false, source = painted, before = null } = {}) {
  const spec = SCENES[key];
  if (!spec || !gsap || !layersReady(key, source)) return null;
  const amount = spec.amount ?? 1;
  const root = document.createElement("div");
  root.className = `layered-scene layered-scene--${key}`;
  root.setAttribute("aria-hidden", "true");
  const movers = [];
  const plane = (cls, depth, name) => {
    const el = document.createElement("div");
    el.className = cls;
    el.dataset.depth = depth;
    if (name) el.dataset.layer = name;
    root.append(el);
    movers.push({ el, depth: depth * amount });
    return el;
  };
  const tweens = [];
  const clouds = spec.clouds.filter(([id]) => source(id));
  spec.layers.forEach(([id, depth], i) => {
    const el = plane("layered-scene__plane", depth, id.split("/").pop());
    el.style.backgroundImage = `url("${source(id)}")`;
    // Clouds sit just in front of the sky.
    if (i === 0 && clouds.length) {
      const sky = plane("layered-scene__clouds", 0.08);
      clouds.forEach(([cid, top, width], n) => {
        const img = document.createElement("img");
        img.className = "layered-scene__cloud";
        img.alt = "";
        img.draggable = false;
        img.src = source(cid);
        img.style.cssText = `top:${top}%;width:${width}%`;
        sky.append(img);
        // Offscreen left is xPercent -100; offscreen right is the host width in cloud widths.
        const end = (100 / width) * 100;
        if (reduced) gsap.set(img, { xPercent: ((n + 0.5) / clouds.length) * end - 50 });
        else {
          const t = gsap.fromTo(img, { xPercent: -100 }, { xPercent: end, duration: 150 + n * 55, ease: "none", repeat: -1 });
          t.progress((n * 0.37 + 0.18) % 1);
          tweens.push(t);
        }
      });
    }
  });
  host.insertBefore(root, before || host.firstChild);

  const events = new AbortController();
  let held = false;
  const makeQuick = () => movers.map(({ el, depth }) => ({
    x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
    y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
    depth,
  }));
  let quick = reduced ? [] : makeQuick();
  const move = (nx, ny) => {
    const box = root.getBoundingClientRect();
    for (const q of quick) {
      q.x(-nx * q.depth * SHIFT_X * box.width);
      q.y(-ny * q.depth * SHIFT_Y * box.height);
    }
  };
  if (!reduced) {
    window.addEventListener("pointermove", (e) => {
      if (held || document.hidden) return;
      const box = root.getBoundingClientRect();
      if (!box.width) return;
      move(clamp(((e.clientX - box.left) / box.width - 0.5) * 2, -1, 1), clamp(((e.clientY - box.top) / box.height - 0.5) * 2, -1, 1));
    }, { passive: true, signal: events.signal });
  }
  return {
    root,
    // Something that sits on a plane (the hiding places, the bug) moves with it.
    // Returns a function that lets go of it again (the landing fliers come and go).
    attach(el, depth = spec.attach ?? 0.5) {
      const mover = { el, depth: depth * amount };
      movers.push(mover);
      if (!reduced) quick = makeQuick();
      return () => {
        const i = movers.indexOf(mover);
        if (i < 0) return;
        movers.splice(i, 1);
        gsap.killTweensOf(el);
        if (!reduced) quick = makeQuick();
      };
    },
    // For tests and for settling back to centre.
    move,
    setHeld(value) {
      held = value;
      for (const t of tweens) value ? t.pause() : t.resume();
    },
    destroy() {
      events.abort();
      for (const t of tweens) t.kill();
      for (const { el } of movers) gsap.killTweensOf(el);
      root.remove();
    },
  };
}
