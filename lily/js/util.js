// Small shared helpers.
export const PI = Math.PI, TAU = Math.PI * 2;
export const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
export const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
export const smoother = x => { x = clamp01(x); return x * x * x * (x * (x * 6 - 15) + 10); };
export const span = (t, a, b) => clamp01((t - a) / (b - a));
export const easeOutBack = x => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
export const pick = arr => arr[(Math.random() * arr.length) | 0];
export function hash(a, b, c = 0) {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 2246822519)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
export const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
export const wait = ms => new Promise(r => setTimeout(r, ms));
export const nextFrame = () => new Promise(r => requestAnimationFrame(() => r()));
export const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
export const isTouch = () => matchMedia('(pointer: coarse)').matches;

// A simple 2D value noise, smooth enough for drifting.
const PERM = new Uint8Array(512);
{ const p = []; for (let i = 0; i < 256; i++) p[i] = i; for (let i = 255; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [p[i], p[j]] = [p[j], p[i]]; } for (let i = 0; i < 512; i++) PERM[i] = p[i & 255]; }
const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
const grad = (h, x, y) => { switch (h & 3) { case 0: return x + y; case 1: return -x + y; case 2: return x - y; default: return -x - y; } };
export function noise2(x, y) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255; x -= Math.floor(x); y -= Math.floor(y);
  const u = fade(x), v = fade(y);
  const A = PERM[X] + Y, B = PERM[X + 1] + Y;
  return lerp(lerp(grad(PERM[A], x, y), grad(PERM[B], x - 1, y), u), lerp(grad(PERM[A + 1], x, y - 1), grad(PERM[B + 1], x - 1, y - 1), u), v);
}

// A frame-driven tween. fn receives eased progress 0..1. Returns a promise; call .cancel() to stop it.
export const EASE = {
  out: x => 1 - Math.pow(1 - x, 3),
  inOut: x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  in: x => x * x * x,
  soft: x => x * x * (3 - 2 * x),
  hinge: x => x < 0.3 ? 0.18 * (x / 0.3) * (x / 0.3) : 0.18 + 0.82 * (1 - Math.pow(1 - (x - 0.3) / 0.7, 2.6)),   // paper lifts slowly, then falls over
};
export function tween(ms, ease, fn) {
  let raf = 0, done = false, resolve;
  const p = new Promise(r => { resolve = r; });
  const t0 = performance.now();
  const step = now => {
    if (done) return;
    const k = Math.min(1, (now - t0) / ms); fn(ease(k), k);
    if (k < 1) raf = requestAnimationFrame(step); else { done = true; resolve(); }
  };
  raf = requestAnimationFrame(step);
  p.cancel = () => { if (!done) { done = true; cancelAnimationFrame(raf); resolve(); } };
  return p;
}
