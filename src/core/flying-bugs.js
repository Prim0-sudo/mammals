// Adapted from the supplied Flying Bugs V1 controller; canvases stay intact.
// edge: which side of the title a bug keeps to; spread shrinks its loop so two bugs can share a side.
export function flightRoute(width, height, content, size, name, edge = name === 'butterfly' ? 'left' : 'right', spread = 1) {
  const margin = size * .70; // Includes banking and view-specific body alignment.
  const side = width > 900 && Math.min(content.left, width - content.right) > size * 1.4;
  const area = side
    ? edge === 'left' ? [0, 16, content.left - 16, height - 16] : [content.right + 16, 16, width, height - 16]
    : edge === 'left' ? [0, 0, width, content.top - 8] : [0, content.bottom + 8, width, height];
  const [left, top, right, bottom] = area;
  return {
    cx: (left + right) / 2, cy: (top + bottom) / 2,
    rx: Math.max(0, (right - left) / 2 - margin) * (name === 'ladybug' ? .72 : .9) * spread,
    ry: Math.max(0, (bottom - top) / 2 - margin) * (side ? .7 : .8) * spread,
  };
}
export function flightPoint(route, seconds, bug) {
  const cycle = (seconds / bug.period + bug.phase) * Math.PI * 2;
  // Ladybug slows gently near one part of its loop; flapping is unaffected.
  const angle = cycle + (bug.name === 'ladybug' ? .78 * Math.sin(cycle) : 0);
  const speed = bug.name === 'ladybug' ? 1 + .78 * Math.cos(cycle) : 1;
  return { x: route.cx + route.rx * Math.cos(angle), y: route.cy + route.ry * Math.sin(angle),
    dx: -route.rx * Math.sin(angle) * speed, dy: route.ry * Math.cos(angle) * speed };
}

// Flower visiting (blueprint ART-AND-ANIMATION, as in Plants): once the landing spots are measured,
// each bug flies in from its own screen edge, lands on its side's three spots in turn, flies back
// out and rests offscreen. One shared cycle, offset by each bug's phase, keeps two bugs on one side
// from landing on the same spot together.
export const VISIT = { enter: 6, leg: 5, perch: 3, exit: 5, rest: 6 };
export const VISIT_CYCLE = VISIT.enter + VISIT.leg * 2 + VISIT.perch * 3 + VISIT.exit + VISIT.rest;
const PERCH_LIFT = .2; // the mover's centre sits this many sizes above the spot, so the feet touch it
const ease = (u) => (1 - Math.cos(Math.PI * u)) / 2;

// spots: screen points ordered from the bug's own edge inwards; offscreen: the x it enters from.
export function visitRoute(spots, offscreen, height, size, name) {
  const perches = spots.map(([x, y]) => ({ x, y: y - size * PERCH_LIFT }));
  const away = (p) => ({ x: offscreen, y: Math.max(size, p.y - height * .15) });
  const stops = [away(perches[0]), ...perches, away(perches[perches.length - 1])];
  const legs = [];
  let t = 0;
  stops.slice(1).forEach((to, i) => {
    const last = i === stops.length - 2, first = i === 0;
    const duration = first ? VISIT.enter : last ? VISIT.exit : VISIT.leg;
    legs.push({ from: stops[i], to, start: t, duration, spot: last ? null : i });
    t += duration;
    if (!last) t += VISIT.perch;
  });
  // A route with fewer than three spots finishes sooner and rests longer.
  return { legs, name, height, size, butterfly: name === 'butterfly' };
}

function legPoint(route, leg, u) {
  const e = ease(u), taper = Math.sin(u * Math.PI), wobble = route.butterfly ? 1 : .4;
  const lift = Math.min(route.height * .09, 80) * taper;
  return {
    x: leg.from.x + (leg.to.x - leg.from.x) * e + Math.sin(u * Math.PI * 3 + leg.start) * route.size * .3 * wobble * taper,
    y: leg.from.y + (leg.to.y - leg.from.y) * e - lift + Math.sin(u * Math.PI * 5 + leg.start) * route.size * .22 * wobble * taper,
  };
}

const heading = (leg) => (leg.to.x > leg.from.x ? -1 : 1); // the sheet faces left; -1 flips it right

export function visitPose(route, seconds, bug) {
  const t = (((seconds / VISIT_CYCLE + bug.phase) % 1) + 1) % 1 * VISIT_CYCLE;
  const { legs } = route;
  const timing = bug.turnTimings || { first45: 80, front: 100, second45: 80 };
  const turnLength = (timing.first45 + timing.front + timing.second45) / 1000;
  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i], end = leg.start + leg.duration;
    if (t < leg.start) break;
    if (t < end) {
      const u = (t - leg.start) / leg.duration, a = legPoint(route, leg, u), b = legPoint(route, leg, Math.min(1, u + .01));
      return { ...a, dx: (b.x - a.x) * 100, dy: (b.y - a.y) * 100, facing: heading(leg), pose: null, perched: false, hidden: false, spot: null };
    }
    const next = legs[i + 1];
    if (next && t < next.start) {
      // Perched; if the next leg heads the other way the bug turns just before it lifts off.
      const facing = heading(leg), turning = heading(next) !== facing, age = t - (next.start - turnLength);
      let pose = null;
      if (turning && age >= 0) {
        const ms = age * 1000, rightward = heading(next) === -1;
        pose = ms < timing.first45 ? (rightward ? '45-left' : '45-right') : ms < timing.first45 + timing.front ? 'front' : (rightward ? '45-right' : '45-left');
      }
      // The side sprite is hidden while a turn pose shows, so it keeps the incoming facing.
      return { x: leg.to.x, y: leg.to.y, dx: 0, dy: 0, facing, pose, perched: true, hidden: false, spot: leg.spot };
    }
  }
  const out = legs[legs.length - 1];
  return { x: out.to.x, y: out.to.y, dx: 0, dy: 0, facing: heading(out), pose: null, perched: false, hidden: true, spot: null };
}

export function turnPose(seconds, bug) {
  const halfPeriod = bug.period / 2, cycle = seconds / halfPeriod + bug.phase * 2;
  const reversal = Math.round(cycle), center = (reversal - bug.phase * 2) * halfPeriod;
  const timing = bug.turnTimings || { first45: 80, front: 100, second45: 80 };
  const duration = (timing.first45 + timing.front + timing.second45) / 1000;
  const age = seconds - center + duration / 2;
  const incoming = reversal % 2 ? '45-left' : '45-right', outgoing = reversal % 2 ? '45-right' : '45-left';
  const pose = age < 0 || age >= duration ? null : age < timing.first45 / 1000 ? incoming : age < (timing.first45 + timing.front) / 1000 ? 'front' : outgoing;
  // Route phase is monotonic: each reversal owns one window, including hover.
  // Unlike testing a noisy dx sign every frame, it cannot restart near zero.
  const first = (1 - bug.phase * 2) * halfPeriod;
  function paused(t) {
    const full = Math.max(0, Math.floor((t - first - duration / 2) / halfPeriod) + 1);
    return full * duration + Math.max(0, Math.min(duration, t - (first + full * halfPeriod - duration / 2)));
  }
  const distance = seconds - center, radius = .6;
  const travelSeconds = Math.abs(distance) < radius
    ? seconds - .6 * distance * (1 - (distance / radius) ** 2) ** 2 : seconds;
  return { pose, center, travelSeconds, wingSeconds: seconds - paused(seconds) + paused(0) };
}

export function mountFlyingBugs(scene, definitions, options = {}) {
  const preference = options.motionPreference || matchMedia('(prefers-reduced-motion: reduce)');
  const isHidden = options.isHidden || (() => document.hidden);
  const layer = document.createElement('div');
  layer.className = 'flying-bugs'; layer.setAttribute('aria-hidden', 'true');
  scene.append(layer);
  let elapsed = 0, last = null, request = null, destroyed = false, loaded = false, paused = false, manualFrame = null;
  const bugs = definitions.map(definition => {
    const mover = document.createElement('div'), heading = document.createElement('div'), sprite = document.createElement('div');
    mover.className = 'flying-bug'; mover.dataset.bug = definition.name;
    heading.className = 'flying-bug__heading'; sprite.className = 'flying-bug__sprite';
    sprite.style.backgroundImage = `url("${definition.sheet}")`;
    heading.append(sprite); mover.append(heading); layer.append(mover);
    const turns = Object.entries(definition.turnPoses || {}).map(([pose, src]) => {
      const image = document.createElement('img'); image.className = 'flying-bug__turn'; image.dataset.pose = pose; image.alt = ''; image.src = src; heading.append(image); return image;
    });
    const image = new Image(); image.src = definition.sheet;
    const ready = image.decode().then(() => {
      if (image.naturalWidth !== 3072 || image.naturalHeight !== 512) throw Error('Unexpected flying bug sheet dimensions');
    });
    const turnsReady = Promise.all(turns.map(image => image.decode().then(() => {
      if (image.naturalWidth !== 512 || image.naturalHeight !== 512) throw Error('Unexpected flying bug turn dimensions');
    })));
    return { ...definition, mover, heading, sprite, turns, ready: Promise.all([ready, turnsReady]), bank: 0 };
  });
  function measure() {
    const bounds = scene.getBoundingClientRect(), content = scene.querySelector('.launch-composition').getBoundingClientRect();
    const relative = { left: content.left - bounds.left, right: content.right - bounds.left, top: content.top - bounds.top, bottom: content.bottom - bounds.top };
    for (const bug of bugs) {
      bug.size = bounds.width <= 900 ? bug.phoneSize : bug.desktopSize;
      bug.route = flightRoute(bounds.width, bounds.height, relative, bug.size, bug.name, bug.edge, bug.spread);
      bug.mover.style.width = bug.mover.style.height = `${bug.size}px`;
      bug.visits = visitsFor(bug, bounds);
    }
  }
  // Landing spots are in the painted plane's own pixels; the plane is drawn centre/cover with overscan.
  function visitsFor(bug, bounds) {
    const spots = options.spots, plane = spots?.plane;
    if (!plane?.isConnected || !plane.offsetWidth) return null;
    const root = plane.offsetParent.getBoundingClientRect();
    const pw = plane.offsetWidth, ph = plane.offsetHeight, scale = Math.max(pw / spots.width, ph / spots.height);
    const ox = root.left - bounds.left + plane.offsetLeft + (pw - spots.width * scale) / 2;
    const oy = root.top - bounds.top + plane.offsetTop + (ph - spots.height * scale) / 2;
    const edge = bug.edge || (bug.name === 'butterfly' ? 'left' : 'right'), half = bug.size / 2;
    const points = (spots[edge] || []).map(([x, y]) => [ox + x * scale, oy + y * scale])
      .filter(([x, y]) => x >= half && x <= bounds.width - half && y >= bug.size && y <= bounds.height)
      .sort((a, b) => (edge === 'left' ? a[0] - b[0] : b[0] - a[0]));
    return points.length ? visitRoute(points, edge === 'left' ? -bug.size : bounds.width + bug.size, bounds.height, bug.size, bug.name) : null;
  }
  function render(dt = 0) {
    for (const bug of bugs) {
      // Under reduced motion a visiting bug rests, still, on its first spot.
      const visit = bug.visits && visitPose(bug.visits, preference.matches ? VISIT.enter + VISIT.perch / 2 - bug.phase * VISIT_CYCLE : elapsed / 1000, bug);
      const turn = visit ? null : turnPose(elapsed / 1000, bug);
      const pose = preference.matches || !bug.turns.length ? null : visit ? visit.pose : turn.pose;
      const p = visit || flightPoint(bug.route, bug.turns.length ? turn.travelSeconds : elapsed / 1000, bug);
      const targetFlip = visit ? visit.facing : p.dx > 0 ? -1 : 1;
      bug.mover.style.visibility = visit?.hidden ? 'hidden' : '';
      bug.mover.dataset.mode = visit ? 'visiting' : 'looping';
      if (visit?.spot != null) bug.mover.dataset.spot = visit.spot; else delete bug.mover.dataset.spot;
      const targetBank = Math.max(-12, Math.min(12, Math.atan2(p.dy, Math.max(20, Math.abs(p.dx))) * 180 / Math.PI * targetFlip));
      const blend = dt ? 1 - Math.exp(-dt / 90) : 1;
      bug.bank += ((pose ? 0 : targetBank) - bug.bank) * blend;
      bug.mover.style.transform = `translate3d(${p.x - bug.size / 2}px, ${p.y - bug.size / 2}px, 0)`;
      bug.heading.style.transform = `rotate(${bug.bank}deg)`;
      // All views share one anatomical world pivot; retain their full canvases.
      const scale = bug.size / 512, geometry = bug.turnGeometry;
      const sidePivot = geometry ? targetFlip === 1 ? geometry.existingLeftPivotApprox : geometry.existingRightPivotApprox : [256, 320];
      bug.heading.style.transformOrigin = `50% 62.5%`;
      bug.sprite.style.transform = `scaleX(${targetFlip})`;
      bug.sprite.style.left = `${(256 - sidePivot[0]) * scale}px`;
      bug.sprite.style.top = `${(320 - sidePivot[1]) * scale}px`;
      bug.sprite.hidden = Boolean(pose);
      for (const image of bug.turns) {
        const pivot = geometry.poses[image.dataset.pose].pivot;
        image.style.left = `${(256 - pivot[0]) * scale}px`; image.style.top = `${(320 - pivot[1]) * scale}px`;
        image.hidden = image.dataset.pose !== pose;
      }
      bug.mover.dataset.turn = pose || 'side';
      bug.mover.dataset.pivotX = p.x; bug.mover.dataset.pivotY = p.y + 64 * scale;
      // A landed bug folds its wings at rest; a flying one keeps flapping.
      const still = preference.matches || visit?.perched || visit?.hidden;
      const frame = manualFrame ?? (still ? 0 : Math.floor((turn && bug.turns.length ? turn.wingSeconds : elapsed / 1000) * bug.fps) % 6);
      bug.sprite.style.backgroundPosition = `${frame * 20}% 0%`; bug.sprite.dataset.frame = frame;
    }
  }
  function stop() { if (request !== null) cancelAnimationFrame(request); request = null; last = null; }
  function canAnimate() { return loaded && !destroyed && !paused && manualFrame === null && !preference.matches && !isHidden(); }
  function tick(timestamp) {
    request = null;
    if (!canAnimate()) { last = null; return; }
    const dt = last === null ? 0 : Math.min(100, timestamp - last);
    elapsed += dt; last = timestamp; render(dt); request = requestAnimationFrame(tick);
  }
  function sync() { if (destroyed) return; stop(); render(); if (canAnimate()) request = requestAnimationFrame(tick); }
  const observer = new ResizeObserver(() => { measure(); render(); });
  observer.observe(scene); observer.observe(scene.querySelector('.launch-composition'));
  preference.addEventListener('change', sync); document.addEventListener('visibilitychange', sync);
  measure(); render();
  const ready = Promise.all(bugs.map(bug => bug.ready)).then(() => { if (!destroyed) { loaded = true; layer.classList.add('is-ready'); sync(); } });
  return {
    ready, layer,
    setPaused(value) { paused = Boolean(value); sync(); },
    setFrame(frame) { if (frame !== null && (!Number.isInteger(frame) || frame < 0 || frame > 5)) throw Error('Frame must be 0–5 or null'); manualFrame = frame; sync(); },
    setTime(seconds) { elapsed = seconds * 1000; sync(); },
    inspect() { return { active: request !== null, elapsed, destroyed, count: layer.children.length }; },
    destroy() { if (destroyed) return; destroyed = true; stop(); observer.disconnect(); preference.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync); layer.remove(); },
  };
}
