// Big picture: a magnifier on the word pictures opens a centred popout showing the picture
// as large as the screen allows, but never past its own pixel size, so it stays sharp.
// The part arrow (partPointers) comes along, so "antenna" still points at the antenna.
import { iconSvg } from "./ui-icons.js";

const GAP = 10;

export function zoomButton() {
  return `<button type="button" class="zoom-button" data-zoom-open aria-label="Make the picture bigger" title="Make the picture bigger">${iconSvg("zoom")}</button>`;
}

export function installPictureZoom({ root, holds, reduced }) {
  const dialog = document.createElement("dialog");
  dialog.className = "popout zoom-popout";
  dialog.setAttribute("aria-label", "Big picture");
  dialog.innerHTML = `<div class="zoom-stage"></div><button type="button" class="button zoom-close">Got it</button>`;
  document.body.append(dialog);
  const stage = dialog.querySelector(".zoom-stage");
  const close = dialog.querySelector(".zoom-close");
  let source = null;
  let tween = null;

  function fit() {
    const img = stage.querySelector("img");
    if (!img?.naturalWidth) return;
    const wide = innerWidth > innerHeight;
    dialog.classList.toggle("is-wide", wide);
    const pad = 2 * (parseFloat(getComputedStyle(dialog).paddingLeft) || 0) + 4;
    const btn = close.getBoundingClientRect();
    let w = innerWidth - 24 - pad, h = innerHeight - 24 - pad;
    if (wide) w -= btn.width + GAP; else h -= btn.height + GAP;
    const scale = Math.min(1, w / img.naturalWidth, h / img.naturalHeight);
    stage.style.width = `${Math.floor(img.naturalWidth * scale)}px`;
    stage.style.height = `${Math.floor(img.naturalHeight * scale)}px`;
  }

  function open(box) {
    const img = box.querySelector("img");
    if (!img) return;
    source = img;
    stage.className = `zoom-stage${box.classList.contains("has-pointer") ? " has-pointer" : ""}`;
    stage.innerHTML = "";
    const big = img.cloneNode();
    big.className = "zoom-art";
    big.removeAttribute("style");
    stage.append(big);
    const arrow = box.querySelector(".part-pointer");
    if (arrow) stage.append(arrow.cloneNode(true));
    holds?.hold("zoom");
    dialog.showModal();
    close.focus({ preventScroll: true });
    const show = () => {
      fit();
      if (reduced() || !window.gsap) return;
      const from = source.getBoundingClientRect(), to = stage.getBoundingClientRect();
      if (!from.width || !to.width) return;
      tween?.kill();
      tween = window.gsap.from(dialog, {
        x: from.left + from.width / 2 - (to.left + to.width / 2),
        y: from.top + from.height / 2 - (to.top + to.height / 2),
        scale: Math.min(1, from.width / to.width),
        opacity: 0.4,
        duration: 0.32,
        ease: "power2.out",
        clearProps: "transform,opacity",
      });
    };
    if (big.complete && big.naturalWidth) show(); else big.addEventListener("load", show, { once: true });
  }

  function shut() {
    if (!dialog.open) return;
    tween?.kill();
    const done = () => {
      tween = null;
      dialog.close();
      stage.innerHTML = "";
      holds?.release("zoom");
      if (source?.isConnected) source.closest(".has-zoom")?.querySelector("[data-zoom-open]")?.focus({ preventScroll: true });
      source = null;
    };
    if (reduced() || !window.gsap) return done();
    tween = window.gsap.to(dialog, { scale: 0.92, opacity: 0, duration: 0.18, ease: "power1.in", onComplete: () => { window.gsap.set(dialog, { clearProps: "transform,opacity" }); done(); } });
  }

  root.addEventListener("click", (e) => {
    const box = e.target.closest(".has-zoom");
    if (!box || box.closest(".concealed")) return;
    if (e.target.closest("[data-zoom-open]") || e.target.closest("img")) open(box);
  });
  close.addEventListener("click", shut);
  dialog.addEventListener("click", (e) => { if (e.target === dialog) shut(); });
  dialog.addEventListener("cancel", (e) => { e.preventDefault(); shut(); });
  addEventListener("resize", () => { if (dialog.open) fit(); });
  return { shut };
}
