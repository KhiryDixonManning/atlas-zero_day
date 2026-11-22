// Scene 1 — the first bloom.
// Handwritten characters drift in the dark, gather into a bud, and the bud opens into a white lily.
// The flower is a real surface in three dimensions; every glyph is a sample on it, shaded by moonlight.
import { PI, TAU, clamp, clamp01, lerp, smooth, smoother, span, hash, noise2, el, wait } from '../util.js';
import { GlyphAtlas } from '../glyphs.js';

const { sin, cos, sqrt, exp, pow, abs, max, min, floor } = Math;
const CHARS = ['t','h','e','a','r','o','f','n','i','c','g','l','y','L','s','m','w','v','k','u','\'','.',',','~'];
const COLORS = [
  [252, 247, 236],  // 0 ivory
  [186, 196, 228],  // 1 cool shadow
  [214, 226, 140],  // 2 throat
  [198, 104, 46],   // 3 anther
  [240, 200, 112],  // 4 pollen
  [134, 178, 120],  // 5 stem
  [72, 112, 80],    // 6 leaf shadow
  [216, 228, 186],  // 7 filament
];
const TILT = 0.95, CT = cos(TILT), ST = sin(TILT);
const AX = 0, AY = CT, AZ = ST;                       // flower axis: toward the viewer, a little up
const D = 6;                                          // camera distance (world units)
let LX = -0.45, LY = 0.8, LZ = 0.6; { const l = sqrt(LX * LX + LY * LY + LZ * LZ); LX /= l; LY /= l; LZ /= l; }

export function createBloom(ctx) {
  const root = el('div', 'bloom');
  root.innerHTML = `
    <canvas class="bloom__glow" aria-hidden="true"></canvas>
    <canvas class="bloom__main" aria-hidden="true"></canvas>
    <div class="bloom__title">
      <p class="bloom__eyebrow">The Art of Noticing</p>
      <p class="bloom__name">Lily.</p>
    </div>
    <p class="scene__cue cue"><span class="bracket">[</span> touch the lily <span class="bracket">]</span></p>
    <p class="sr-only">Handwritten letters gather into a white lily. The Art of Noticing. Lily.</p>`;
  const mainC = root.querySelector('.bloom__main'), glowC = root.querySelector('.bloom__glow');
  const eyebrow = root.querySelector('.bloom__eyebrow'), name = root.querySelector('.bloom__name'), cue = root.querySelector('.scene__cue');
  const mctx = mainC.getContext('2d'), gctx = glowC.getContext('2d');
  const RM = ctx.reduced;

  // ---------- timeline (seconds) ----------
  const T = RM
    ? { wake: 2.0, gather0: 0, gatherSpan: 0, bloom: [0, 0.01], title1: 2.2, title2: 3.4, cue: 5.2 }
    : { wake: 2.0, gather0: 1.6, gatherSpan: 4.8, bloom: [6.4, 12.6], title1: 10.8, title2: 12.4, cue: 14.6 };

  // ---------- sizing ----------
  let W = 0, H = 0, dpr = 1, dprCap = 2, slowFrames = 0, S = 100, cx = 0, cy = 0, gs = 12, atlas = null, portrait = true, STEM_LEN = 1.75;
  let nS = 20, nW = 7, NFREE = 140;
  function measure() {
    const r = root.getBoundingClientRect(); W = max(1, r.width | 0); H = max(1, r.height | 0);
    dpr = min(window.devicePixelRatio || 1, dprCap); portrait = H >= W * 0.9;
    const big = W * H > 560000;
    nS = big ? 24 : 20; nW = big ? 9 : 7; NFREE = big ? 220 : 140; STEM_LEN = portrait ? 1.75 : 1.5;
    S = portrait ? min(W / 2.25, H / 4.6) : min(W / 3.2, H / 3.9);
    cx = portrait ? W / 2 : W * 0.36; cy = portrait ? H * 0.37 : H * 0.44;
    const spacing = (1.0 * S) / (nS - 1);
    const want = clamp(spacing * 1.42, 9, 21);
    mainC.width = W * dpr; mainC.height = H * dpr; mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    glowC.width = max(1, (W * dpr / 3) | 0); glowC.height = max(1, (H * dpr / 3) | 0);
    if (!atlas || abs(atlas.size - want) > 1.2 || atlas.dpr !== dpr) { gs = want; atlas = new GlyphAtlas({ chars: CHARS, colors: COLORS, size: gs, dpr }); }
  }

  // ---------- particles ----------
  let N = 0, NF = 0;                                  // total, flower-bound
  let tx, ty, tz, px, py, sx, sy, amp, t0, dur, gi, ci, al, dal, rk, kind, rx, ry, rvx, rvy, swapT, wakeT, dep, arr;
  let order, zbucket;
  const P = new Float32Array(26 * 10 * 3);           // scratch grid for a petal / leaf
  let tLayout = 0, uBloom = 0, holdK = 0, swC = 1, swS = 0, lean = 0;

  function alloc() {
    NF = 6 * nS * nW + 6 * 14 + 12 + 44 * 3 + 2 * 14 * 7;
    N = NF + NFREE;
    const F = n => new Float32Array(n), U = n => new Uint8Array(n);
    tx = F(N); ty = F(N); tz = F(N); px = F(N); py = F(N); sx = F(N); sy = F(N); amp = F(N); t0 = F(N); dur = F(N);
    gi = U(N); ci = U(N); al = F(N); dal = F(N); rk = F(N); kind = U(N); rx = F(N); ry = F(N); rvx = F(N); rvy = F(N);
    swapT = F(N); wakeT = F(N); dep = U(N); arr = F(N); order = new Uint16Array(N); zbucket = new Uint16Array(N);
    for (let i = 0; i < N; i++) {
      gi[i] = (hash(i, 7) * CHARS.length) | 0; ci[i] = 0;
      px[i] = sx[i] = hash(i, 1) * W; py[i] = sy[i] = hash(i, 2) * H;
      amp[i] = (hash(i, 3) - 0.5) * 2 * (40 + 90 * hash(i, 4));
      dur[i] = 2.1 + hash(i, 5) * 1.3; dal[i] = 0.3 + 0.5 * hash(i, 6);
      swapT[i] = hash(i, 8) * 3; wakeT[i] = hash(i, 9) * T.wake; kind[i] = i < NF ? 0 : 5;
    }
    // ranking: build the open flower once, order the points centre-out, then down the stem, then along the leaves
    layout(0, 1, true);
    let maxR = 0; for (let i = 0; i < NF; i++) maxR = max(maxR, rk[i]);
    for (let i = 0; i < NF; i++) { const r = rk[i] / maxR; t0[i] = T.gather0 + T.gatherSpan * pow(r, 0.9) + hash(i, 10) * 0.35; }
    for (let i = NF; i < N; i++) t0[i] = 1e9;
  }

  // ---------- geometry ----------
  const R_ = [0, 0, 0], T_ = [0, 0, 0];
  const rdir = (phi, o) => { o[0] = cos(phi); o[1] = -sin(phi) * ST; o[2] = sin(phi) * CT; };
  const tdir = (phi, o) => { o[0] = -sin(phi); o[1] = -cos(phi) * ST; o[2] = cos(phi) * CT; };
  let idx = 0, ranking = false;
  function put(x, y, z, c, a, rank) {
    const i = idx++;
    // sway: a slow turn about the stem, a slight lean from the base
    const xs = swC * x + swS * z, zs = -swS * x + swC * z;
    x = xs + (y + STEM_LEN * 0.4) * lean; z = zs;
    const f = D / (D - z);
    tx[i] = cx + x * S * f; ty[i] = cy - y * S * f; tz[i] = z; ci[i] = c; al[i] = a;
    if (ranking) rk[i] = rank;
  }

  function petal(i, u, t) {
    const d = (i % 2 ? 0.16 : 0) + 0.04 * (i % 3);
    const o = smoother((u - d) / (1 - d)) + (RM ? 0 : 0.018 * sin(t * 0.9 + i) * holdK);
    const phi = i * PI / 3 + PI / 2; rdir(phi, R_); tdir(phi, T_);
    const L = 1.0, ds = L / (nS - 1);
    let r = 0.07, h = -0.02;
    const Wmax = lerp(0.085, 0.235, o) * L, cup = lerp(0.95, -0.22, o);
    for (let k = 0; k < nS; k++) {
      const s = k / (nS - 1);
      const th = lerp(0.12 + 0.3 * s - 0.1 * s * s, 0.2 + 1.55 * pow(smooth((s - 0.14) / 0.86), 1.25), o);
      if (k) { r += sin(th) * ds; h += cos(th) * ds; }
      const hw = Wmax * pow(sin(PI * pow(0.03 + 0.97 * s, 1.3)), 0.9);
      const ripple = o * 0.035 * sin(6.5 * s + i * 1.7 + t * 0.5);
      const ct = cos(th), st = sin(th);
      const nx = -ct * R_[0] + st * AX, ny = -ct * R_[1] + st * AY, nz = -ct * R_[2] + st * AZ;
      const cxp = r * R_[0] + h * AX, cyp = r * R_[1] + h * AY, czp = r * R_[2] + h * AZ;
      for (let j = 0; j < nW; j++) {
        const w = -1 + 2 * j / (nW - 1), off = w * hw, dp = hw * (cup * w * w + ripple * w);
        const q = (k * nW + j) * 3;
        P[q] = cxp + off * T_[0] + dp * nx; P[q + 1] = cyp + off * T_[1] + dp * ny; P[q + 2] = czp + off * T_[2] + dp * nz;
      }
    }
    shadeGrid(nS, nW, (k, j, dl, rim, nzv) => {
      const s = k / (nS - 1), w = abs(-1 + 2 * j / (nW - 1));
      const throat = exp(-s * 5.5) * (0.35 + 0.65 * o);
      let v = 0.2 + 0.55 * dl + 0.3 * rim + 0.12 * w * w + 0.14 * exp(-(w / 0.16) * (w / 0.16)) + 0.1 * s * s;
      v = v * (1 - 0.25 * throat) + throat * 0.55;
      const hh = hash(i * 131 + k, j, 3);
      let c = 0;
      if (throat * (0.6 + 0.8 * hh) > 0.42) c = 2; else if (dl < 0.28 && hh < 0.55) c = 1;
      return [c, clamp(v, 0.1, 1)];
    }, i);
  }

  function shadeGrid(ns, nw, mat, tag) {
    for (let k = 0; k < ns; k++) {
      const k0 = k > 0 ? k - 1 : k, k1 = k < ns - 1 ? k + 1 : k;
      for (let j = 0; j < nw; j++) {
        const j0 = j > 0 ? j - 1 : j, j1 = j < nw - 1 ? j + 1 : j;
        const a = (k1 * nw + j) * 3, b = (k0 * nw + j) * 3, c = (k * nw + j1) * 3, d = (k * nw + j0) * 3;
        const ux = P[a] - P[b], uy = P[a + 1] - P[b + 1], uz = P[a + 2] - P[b + 2];
        const vx = P[c] - P[d], vy = P[c + 1] - P[d + 1], vz = P[c + 2] - P[d + 2];
        let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        const len = sqrt(nx * nx + ny * ny + nz * nz) + 1e-9; nx /= len; ny /= len; nz /= len;
        if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
        const dl = max(0, nx * LX + ny * LY + nz * LZ), rim = (1 - nz) * (1 - nz);
        const [cc, aa] = mat(k, j, dl, rim, nz);
        const q = (k * nw + j) * 3, x = P[q], y = P[q + 1], z = P[q + 2];
        put(x, y, z, cc, aa, sqrt(x * x + y * y + z * z));
      }
    }
  }

  function stamens(u, t) {
    const o = smoother((u - 0.1) / 0.9);
    const vis = 0.25 + 0.75 * o;
    for (let i = 0; i < 6; i++) {
      const phi = i * PI / 3 + PI / 2 + PI / 6; rdir(phi, R_); tdir(phi, T_);
      let lx = 0, ly = 0, lz = 0;
      for (let k = 0; k < 9; k++) {
        const s = k / 8, sa = pow(s, 1.3), r = 0.03 + 0.26 * sa * o, h = 0.04 + 0.7 * s * o;
        const x = r * R_[0] + h * AX, y = r * R_[1] + h * AY, z = r * R_[2] + h * AZ;
        put(x, y, z, 7, (0.45 + 0.4 * s) * vis, sqrt(x * x + y * y + z * z));
        if (k === 8) {
          let dx = x - lx, dy = y - ly, dz = z - lz; const dl = sqrt(dx * dx + dy * dy + dz * dz) + 1e-9; dx /= dl; dy /= dl; dz /= dl;
          for (let q = 0; q < 5; q++) {
            const a = (q - 2) * 0.028, side = (q % 2 ? 1 : -1) * 0.012;
            const ax = x + dx * a + T_[0] * side, ay = y + dy * a + T_[1] * side, az = z + dz * a + T_[2] * side;
            put(ax, ay, az, hash(i, q, 5) < 0.3 ? 4 : 3, (0.75 + 0.25 * hash(i, q, 6)) * vis, sqrt(ax * ax + ay * ay + az * az));
          }
        }
        lx = x; ly = y; lz = z;
      }
    }
    // pistil
    rdir(PI / 2, R_);
    for (let k = 0; k < 9; k++) {
      const s = k / 8, h = 0.04 + 0.84 * s * o, r = 0.05 * s * s;
      const x = r * R_[0] + h * AX, y = r * R_[1] + h * AY, z = r * R_[2] + h * AZ;
      put(x, y, z, 7, (0.5 + 0.35 * s) * vis, sqrt(x * x + y * y + z * z));
      if (k === 8) for (let q = 0; q < 3; q++) { rdir(q * TAU / 3, T_); const ax = x + T_[0] * 0.035, ay = y + T_[1] * 0.035, az = z + T_[2] * 0.035; put(ax, ay, az, 2, 0.9 * vis, sqrt(ax * ax + ay * ay + az * az)); }
    }
  }

  function stemAndLeaves(t) {
    const P0x = -0.14 * AX, P0y = -0.14 * AY, P0z = -0.14 * AZ;
    const NSK = 44;
    const sx_ = tt => P0x - 0.06 * tt + 0.1 * sin(tt * 2.6), sy_ = tt => P0y - STEM_LEN * tt, sz_ = tt => P0z - 0.25 * tt;
    for (let k = 0; k < NSK; k++) {
      const tt = k / (NSK - 1), x = sx_(tt), y = sy_(tt), z = sz_(tt);
      for (let j = 0; j < 3; j++) {
        const hh = hash(k, j, 11);
        const a = j === 1 ? 0.8 + 0.2 * hh : j === 0 ? 0.5 + 0.2 * hh : 0.32 + 0.2 * hh;
        put(x + (j - 1) * 0.042, y, z + (j === 1 ? 0.02 : 0), j === 2 ? 6 : 5, a, 1.25 + tt * STEM_LEN);
      }
    }
    const leaves = [[0.4, -1], [0.66, 1]];
    for (const [tt, side] of leaves) {
      let x = sx_(tt) + side * 0.03, y = sy_(tt), z = sz_(tt) + 0.02;
      const NL = 14, NWL = 7, L = 0.98 * (portrait ? 1 : 0.9), ds = L / (NL - 1);
      const wave = RM ? 0 : 0.06 * sin(t * 0.7 + tt * 9) * holdK;
      for (let k = 0; k < NL; k++) {
        const s = k / (NL - 1), e = 1.05 - 1.35 * s * s - 0.2 * s + wave * s;
        const txv = side * cos(e), tyv = sin(e), tzv = 0.12;
        if (k) { x += txv * ds; y += tyv * ds; z += tzv * ds; }
        let ax = -side * sin(e) * 0.3, ay = cos(e) * 0.3, az = 1; const al_ = sqrt(ax * ax + ay * ay + az * az); ax /= al_; ay /= al_; az /= al_;
        const hw = 0.115 * pow(sin(PI * pow(0.04 + 0.96 * s, 1.2)), 0.85);
        for (let j = 0; j < NWL; j++) {
          const w = -1 + 2 * j / (NWL - 1), off = w * hw, q = (k * NWL + j) * 3;
          const curl = -0.3 * hw * (1 - w * w); P[q] = x + off * ax; P[q + 1] = y + off * ay; P[q + 2] = z + off * az + curl;
        }
      }
      shadeGrid(NL, NWL, (k, j, dl, rim) => {
        const s = k / (NL - 1), w = abs(-1 + 2 * j / (NWL - 1)), hh = hash(k, j, 13 + side);
        const v = 0.22 + 0.45 * dl + 0.2 * rim + 0.18 * (1 - w) + 0.1 * s;
        return [w < 0.4 || hh < 0.35 ? 5 : 6, clamp(v, 0.15, 0.95)];
      });
      // leaves rank after the stem section they grow from
      for (let i = idx - NL * NWL; i < idx; i++) if (ranking) rk[i] = 1.25 + tt * STEM_LEN + 0.3;
    }
  }

  function layout(t, u, rankPass = false) {
    idx = 0; ranking = rankPass;
    const sw = RM ? 0 : 0.07 * sin(t * 0.37) * holdK; swC = cos(sw); swS = sin(sw);
    lean = RM ? 0 : 0.02 * sin(t * 0.61) * holdK;
    stemAndLeaves(t);
    for (let i = 0; i < 6; i++) petal(i, u, t);
    stamens(u, t);
    ranking = false;
  }

  // ---------- life ----------
  let t = 0, last = 0, raf = 0, running = false, phase = 'form', scatterT = 0, hurry = 1, cueShown = false, titleShown = 0;
  let pointer = { x: -1e4, y: -1e4, down: false, px: 0, py: 0, moved: 0, lx: -1e4, ly: -1e4 };

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = min(0.05, (now - last) / 1000) || 0.016; last = now;
    if (dprCap > 1.25) { if (dt > 0.028) slowFrames++; else slowFrames = max(0, slowFrames - 1); if (slowFrames > 70) { dprCap = 1.25; slowFrames = 0; measure(); } }
    t += dt * hurry;
    if (hurry > 1 && phase === 'form' && t > T.cue) hurry = 1;

    // bloom amount and the "alive" factor once the flower has formed
    uBloom = smoother(span(t, T.bloom[0], T.bloom[1]));
    holdK = RM ? 1 : smooth((t - T.bloom[0] - 2) / 4);
    layout(t, uBloom);

    // title and cue
    if (t > T.title1 && titleShown < 1) { titleShown = 1; eyebrow.classList.add('is-in'); }
    if (t > T.title2 && titleShown < 2) { titleShown = 2; name.classList.add('is-in'); if (!RM) ctx.audio.sfx('bloom'); }
    if (t > T.cue && !cueShown) { cueShown = true; cue.classList.add('is-in'); phase = phase === 'form' ? 'hold' : phase; }

    // ripple spring (touch stirs the glyphs; they settle back)
    const touching = pointer.down && phase !== 'scatter';
    const R = 110, R2 = R * R;
    const pdx = pointer.x - pointer.lx, pdy = pointer.y - pointer.ly; pointer.lx = pointer.x; pointer.ly = pointer.y;

    const sc = phase === 'scatter' ? t - scatterT : 0;
    mctx.clearRect(0, 0, W, H);

    // z-order: a counting sort into 32 depth buckets (far first)
    const NB = 32; const counts = new Int32Array(NB + 1);
    for (let i = 0; i < N; i++) { const b = i < NF ? clamp(((tz[i] + 0.9) / 2.1 * NB) | 0, 0, NB - 1) : 0; zbucket[i] = b; counts[b + 1]++; }
    for (let b = 0; b < NB; b++) counts[b + 1] += counts[b];
    for (let i = 0; i < N; i++) order[counts[zbucket[i]]++] = i;

    for (let oi = 0; oi < N; oi++) {
      const i = order[oi];
      let x, y, a, scale = 1;
      const wake = smooth((t - wakeT[i]) / 1.4);
      if (i >= NF) {
        // free dust: drifts, never joins, fades back once the flower has formed
        const n1 = noise2(i * 0.173, t * 0.09), n2 = noise2(i * 0.173 + 40, t * 0.08);
        x = sx[i] + n1 * 60 + sin(t * 0.3 + i) * 6; y = sy[i] + n2 * 50 - t * 5 * (0.5 + hash(i, 20));
        y = ((y % (H + 40)) + H + 40) % (H + 40) - 20;
        a = (0.08 + 0.22 * hash(i, 21)) * wake * (1 - 0.55 * smooth((t - 7) / 4)) * (0.6 + 0.4 * sin(t * (0.8 + hash(i, 22)) + i));
      } else if (t < t0[i] && !RM) {
        // drifting, before it has been called
        const n1 = noise2(i * 0.11, t * 0.12), n2 = noise2(i * 0.11 + 70, t * 0.11);
        x = sx[i] + n1 * 26; y = sy[i] + n2 * 22 - t * 7;
        px[i] = x; py[i] = y;
        a = dal[i] * wake * (0.7 + 0.3 * sin(t * 1.3 + i)); scale = 1.12;
      } else {
        if (!dep[i]) { dep[i] = 1; if (!RM) { sx[i] = px[i]; sy[i] = py[i]; } arr[i] = t0[i] + dur[i]; }
        const e = RM ? 1 : smoother((t - t0[i]) / dur[i]);
        const ddx = tx[i] - sx[i], ddy = ty[i] - sy[i], len = sqrt(ddx * ddx + ddy * ddy) + 1e-6;
        const b = sin(PI * e) * amp[i] * min(1, len / 160);
        x = sx[i] + ddx * e - ddy / len * b; y = sy[i] + ddy * e + ddx / len * b;
        const settle = RM ? 1 : smooth((t - arr[i]) / 1.8);
        if (settle < 1) { const n1 = noise2(i * 0.11, t * 0.6), n2 = noise2(i * 0.11 + 70, t * 0.55); x += n1 * 4 * (1 - settle); y += n2 * 4 * (1 - settle); }
        px[i] = x; py[i] = y;
        const flash = RM ? 0 : 0.55 * exp(-max(0, t - arr[i]) * 2.2) * (e >= 1 ? 1 : 0);
        a = lerp(dal[i], al[i], e) * (1 + flash) * (RM ? wake : 1);
        const f = D / (D - tz[i]); scale = pow(f, 1.6) * lerp(1.1, 1, e);
        // the stirring
        if (touching) {
          const dx = x + rx[i] - pointer.x, dy = y + ry[i] - pointer.y, d2 = dx * dx + dy * dy;
          if (d2 < R2) { const d = sqrt(d2) + 1e-3, k = (1 - d / R); rvx[i] += (dx / d * 90 + pdx * 2.5) * k * dt * 14; rvy[i] += (dy / d * 90 + pdy * 2.5) * k * dt * 14; }
        }
      }
      // spring back
      if (rx[i] || ry[i] || rvx[i] || rvy[i]) {
        rvx[i] += (-rx[i] * 22 - rvx[i] * 4.5) * dt; rvy[i] += (-ry[i] * 22 - rvy[i] * 4.5) * dt;
        rx[i] += rvx[i] * dt; ry[i] += rvy[i] * dt;
        if (abs(rx[i]) < 0.02 && abs(rvx[i]) < 0.02) { rx[i] = rvx[i] = 0; } if (abs(ry[i]) < 0.02 && abs(rvy[i]) < 0.02) { ry[i] = rvy[i] = 0; }
        x += rx[i]; y += ry[i];
      }
      // the wind, when she moves on
      if (sc > 0) {
        const stag = (x / W) * 0.5 + hash(i, 30) * 0.4, k = max(0, sc - stag);
        const n = noise2(i * 0.07, sc * 0.5);
        x += k * k * (70 + 60 * n) + k * 30 * noise2(i * 0.05 + 9, sc * 0.9); y += k * k * (-30 + 70 * noise2(i * 0.09 + 3, sc * 0.4)) - k * 10;
        a *= 1 - smooth(k / 1.5);
      }
      // the shimmer: glyphs quietly become other glyphs
      if (t > swapT[i]) { gi[i] = (gi[i] + 1 + ((hash(i, (t * 10) | 0) * (CHARS.length - 1)) | 0)) % CHARS.length; swapT[i] = t + 0.8 + hash(i, (t * 7) | 0, 3) * 3.4; }
      if (a > 0.015 && x > -20 && x < W + 20 && y > -20 && y < H + 20) atlas.stamp(mctx, gi[i], ci[i], x, y, min(1, a), scale);
    }
    mctx.globalAlpha = 1;
    // the glow: the same picture, small and blurred by CSS
    gctx.setTransform(1, 0, 0, 1, 0, 0); gctx.clearRect(0, 0, glowC.width, glowC.height);
    gctx.drawImage(mainC, 0, 0, glowC.width, glowC.height);
  }

  // ---------- input ----------
  function onDown(e) { pointer.down = true; pointer.x = pointer.lx = e.clientX; pointer.y = pointer.ly = e.clientY; pointer.px = e.clientX; pointer.py = e.clientY; pointer.moved = 0; root.setPointerCapture && root.setPointerCapture(e.pointerId); }
  function onMove(e) { if (!pointer.down) return; pointer.x = e.clientX; pointer.y = e.clientY; pointer.moved += abs(e.clientX - pointer.px) + abs(e.clientY - pointer.py); pointer.px = e.clientX; pointer.py = e.clientY; }
  function onUp() {
    if (!pointer.down) return; pointer.down = false; pointer.x = pointer.y = -1e4;
    if (pointer.moved > 14) return;                 // a stir, not a tap
    if (phase === 'form' && t < T.title2) { hurry = 2.8; ctx.audio.sfx('tick'); return; }   // tapping early hurries the bloom along
    if (phase === 'form' || phase === 'hold') { phase = 'hold'; ctx.audio.sfx('chime'); ctx.go('garden'); }
  }
  root.addEventListener('pointerdown', onDown); root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerup', onUp); root.addEventListener('pointercancel', onUp);
  root.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pointer.down = true; pointer.moved = 0; onUp(); } });
  root.tabIndex = 0; root.setAttribute('role', 'button'); root.setAttribute('aria-label', 'The first bloom. Press to continue to the garden.');

  function onResize() { measure(); }
  function onVis() { if (document.hidden) { stop(); } else { start(); } }
  function start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  return {
    el: root,
    async enter() {
      measure(); alloc();
      window.addEventListener('resize', onResize); document.addEventListener('visibilitychange', onVis);
      start();
    },
    replay() {
      t = 0; phase = 'form'; hurry = 1; cueShown = false; titleShown = 0; scatterT = 0; holdK = 0;
      eyebrow.classList.remove('is-in'); name.classList.remove('is-in'); cue.classList.remove('is-in');
      for (let i = 0; i < N; i++) { dep[i] = 0; rx[i] = ry[i] = rvx[i] = rvy[i] = 0; px[i] = sx[i] = hash(i, 1 + (Math.random() * 1000 | 0)) * W; py[i] = sy[i] = hash(i, 2, (Math.random() * 1000 | 0)) * H; }
    },
    async exit({ reveal }) {
      phase = 'scatter'; scatterT = t; hurry = 1;
      root.classList.add('is-leaving');
      if (RM) { reveal(); await wait(400); return; }
      setTimeout(reveal, 900);
      await wait(2500);
    },
    destroy() { stop(); window.removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', onVis); },
  };
}
