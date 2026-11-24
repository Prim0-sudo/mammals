// Spoken lines come only from the recorded af_heart bank (src/audio/heart-manifest.json, built by
// tools/voice/build.mjs from src/topics/narration-lines.js). There is no browser-voice fallback:
// a line with no clip stays silent and is logged once so the next build can add it.
let manifestPromise;
const loadManifest = () =>
  (manifestPromise ??= fetch(new URL("../audio/heart-manifest.json", import.meta.url))
    .then((r) => (r.ok ? r.json() : { clips: {} }))
    .catch(() => { manifestPromise = null; return { clips: {} }; }));
const missing = new Set();

export class AudioManager {
  constructor(locale) {
    this.locale = locale;
    this.muted = false;
    this.nodes = new Set();
    this.clip = null;
    this.token = 0;
    loadManifest();
  }
  // True when the line has a recording (the Plants section views ask before speaking).
  async hasRecording(text) {
    return !!(await loadManifest()).clips?.[text];
  }
  stop() {
    this.token++;
    if (this.clip) { this.clip.onended = null; this.clip.pause(); this.clip = null; }
    for (const node of this.nodes) {
      try {
        node.stop();
      } catch {}
    }
    this.nodes.clear();
  }
  toggle() {
    this.muted = !this.muted;
    if (this.muted) this.stop();
    return this.muted;
  }
  // One recorded line, or a list played one after another (the word, then its meaning).
  async speak(text) {
    const queue = (Array.isArray(text) ? text : [text]).filter(Boolean);
    if (this.muted || !queue.length) return;
    this.stop();
    const token = this.token;
    const clips = (await loadManifest()).clips || {};
    if (token !== this.token || this.muted) return;
    const files = queue.filter((line) => {
      if (clips[line]) return true;
      if (!missing.has(line)) { missing.add(line); console.warn("[voice] no recording for:", line); }
      return false;
    }).map((line) => clips[line]);
    const play = (i) => {
      if (i >= files.length || token !== this.token) return;
      const clip = new Audio(new URL("../../" + files[i], import.meta.url).href);
      this.clip = clip;
      const done = () => { if (this.clip !== clip) return; this.clip = null; play(i + 1); };
      clip.onended = done;
      clip.play().catch(done);
    };
    play(0);
  }
  tone(frequency = 640, duration = 0.12) {
    if (this.muted) return;
    try {
      const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!Audio) return;
      this.context ||= new Audio();
      this.context.resume().catch(() => {});
      const node = this.context.createOscillator(),
        gain = this.context.createGain(),
        now = this.context.currentTime;
      node.frequency.value = frequency;
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      node.connect(gain).connect(this.context.destination);
      node.onended = () => {
        this.nodes.delete(node);
        node.disconnect();
        gain.disconnect();
      };
      this.nodes.add(node);
      node.start();
      node.stop(now + duration);
    } catch {
      /* Audio is an optional enhancement. */
    }
  }
  // A soft party-popper "pop" for the confetti cannons: a short burst of filtered noise.
  pop() {
    if (this.muted) return;
    try {
      const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!Audio) return;
      this.context ||= new Audio();
      this.context.resume().catch(() => {});
      const ctx = this.context, now = ctx.currentTime, length = Math.round(ctx.sampleRate * 0.14);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate), data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
      const node = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
      node.buffer = buffer;
      filter.type = "bandpass";
      filter.frequency.value = 1400;
      filter.Q.value = 0.8;
      gain.gain.value = 0.12;
      node.connect(filter).connect(gain).connect(ctx.destination);
      node.onended = () => {
        this.nodes.delete(node);
        node.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
      this.nodes.add(node);
      node.start(now);
    } catch {
      /* Audio is an optional enhancement. */
    }
  }
}
