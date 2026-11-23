// Burrow Bank peeks (23 November 2026): one animal at a time rises out of its burrow (or from behind
// the hedgehog's leaf pile), looks around through its painted poses and sinks back. Each animal sits
// on its own plane inside the layered backdrop, just in front of the bank (or just behind the
// foreground), and rides that plane's parallax so it stays in its hole. A window clips the animal at
// the hole's lower edge, so it appears to come up from inside. Landing only; nothing runs under
// reduced motion, and the animal holds while the tab is hidden.
import { LANDING_PEEKS } from "../topics/painted-art.js";

// Pose order while it is up: [pose index, seconds]. 0 ahead, 1 left, 2 right, 3 blink, 4 special.
const LOOK = [[0, 1.0], [1, 0.9], [0, 0.5], [4, 0.9], [3, 0.15], [0, 0.6], [2, 0.9], [0, 0.7]];
const SHOW = 0.2; // share of the canvas left below the edge at full height (the faded chest)

export function mountLandingPeeks(scene, { gsap = window.gsap, spec = LANDING_PEEKS } = {}) {
  if (!scene || !gsap) return null;
  const root = scene.root;
  const front = root.querySelector('[data-layer="foreground"]');
  const lets = [];
  const planes = new Map();
  const planeFor = (depth) => {
    if (planes.has(depth)) return planes.get(depth);
    const el = document.createElement("div");
    el.className = "landing-peeks";
    root.insertBefore(el, front);
    lets.push(scene.attach(el, depth));
    planes.set(depth, el);
    return el;
  };
  const animals = spec.animals.map((a) => {
    const win = document.createElement("div");
    win.className = `landing-peek landing-peek--${a.name}`;
    const body = document.createElement("div");
    body.className = "landing-peek__body";
    const imgs = a.poses.map((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.draggable = false;
      img.hidden = i !== 0;
      body.append(img);
      return img;
    });
    win.append(body);
    planeFor(a.depth).append(win);
    gsap.set(body, { yPercent: 100 });
    return { ...a, win, body, imgs, visible: false };
  });

  // Fit each window to the plane the way background-size: cover fits the layer picture.
  const layout = () => {
    const box = root.getBoundingClientRect();
    // Follow the planes' background-position (left of centre on landscape screens, see main.css).
    const ref = front || root.querySelector(".layered-scene__plane");
    const pos = ref ? getComputedStyle(ref).backgroundPosition.split(" ").map((v) => (v.endsWith("%") ? parseFloat(v) / 100 : 0.5)) : [0.5, 0.5];
    for (const a of animals) {
      const plane = a.win.parentElement;
      const pw = plane.offsetWidth, ph = plane.offsetHeight;
      if (!pw || !ph) continue;
      const s = Math.max(pw / spec.width, ph / spec.height);
      const ox = (pw - spec.width * s) * pos[0], oy = (ph - spec.height * s) * (pos[1] ?? 0.5);
      const w = a.width * s;
      const left = ox + (a.x - a.width / 2) * s;
      const bottom = oy + a.edge * s;
      a.win.style.cssText = `left:${left}px;top:${bottom - w * 1.15}px;width:${w}px;height:${w * 1.15}px`;
      a.body.style.height = `${w}px`;
      // Only peek where the hole is comfortably on screen (phones show the mouse and hedgehog).
      const cx = plane.offsetLeft + ox + a.x * s;
      a.visible = cx > box.width * 0.03 && cx < box.width * 0.97 && plane.offsetTop + bottom < box.height;
      // Nor where the risen animal would crowd the title, pill or Explore button (tall phones).
      if (a.visible) {
        const top = box.top + plane.offsetTop + bottom - w * (1 - SHOW) + w * 0.1;
        const l = box.left + plane.offsetLeft + left + w * 0.2, r = l + w * 0.6;
        const low = top + w * 0.5;
        a.visible = ![...document.querySelectorAll(".launch-composition > *")].some((el) => {
          const k = el.getBoundingClientRect();
          if (!k.width) return false;
          if (!el.classList.contains("launch-explore")) return r > k.left - 8 && l < k.right + 8 && top < k.bottom + 12;
          // The Explore button is round: keep the animal's head clear of the circle.
          const cx = (k.left + k.right) / 2, cy = (k.top + k.bottom) / 2, rad = k.width / 2 + 8;
          const nx = Math.max(l, Math.min(cx, r)) - cx, ny = Math.max(top, Math.min(cy, low)) - cy;
          return nx * nx + ny * ny < rad * rad;
        });
      }
    }
  };
  layout();
  const resize = new ResizeObserver(layout);
  resize.observe(root);

  let current = null;
  let last = null;
  let dead = false;
  const show = (a, i) => a.imgs.forEach((img, n) => (img.hidden = n !== i));
  const next = () => {
    if (dead) return;
    layout(); // fonts and the title's wrap settle after mounting
    const pool = animals.filter((a) => a.visible && a !== last);
    const a = pool.length ? pool[Math.floor(Math.random() * pool.length)] : last?.visible ? last : null;
    if (!a) {
      current = gsap.delayedCall(3, next);
      return;
    }
    last = a;
    const tl = gsap.timeline({ onComplete: next });
    tl.call(() => show(a, 0));
    tl.to(a.body, { yPercent: SHOW * 100, duration: 0.8, ease: "power2.out" });
    for (const [pose, hold] of LOOK) tl.call(() => show(a, pose)).to({}, { duration: hold });
    tl.to(a.body, { yPercent: 100, duration: 0.6, ease: "power2.in" });
    tl.to({}, { duration: 2.5 + Math.random() * 2.5 });
    current = tl;
  };
  const onVisible = () => (document.hidden ? current?.pause() : current?.resume());
  document.addEventListener("visibilitychange", onVisible);

  // Start once every pose is decoded, so no animal pops in half loaded.
  const ready = Promise.all(animals.flatMap((a) => a.imgs.map((img) => img.decode().catch(() => {}))))
    .then(() => { if (!dead) current = gsap.delayedCall(1.5, next); });

  return {
    ready,
    animals,
    setHeld(value) { value ? current?.pause() : current?.resume(); },
    destroy() {
      dead = true;
      current?.kill();
      resize.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
      for (const a of animals) gsap.killTweensOf(a.body);
      lets.forEach((f) => f());
      planes.forEach((el) => el.remove());
    },
  };
}
