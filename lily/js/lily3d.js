// A white lily as an illustration: the same petal surface the particle flower uses,
// projected to the page, shaded by one moon. Every head is generated, so no two match.
import { hash, lerp, smoother, clamp01 } from './util.js';
const { sin, cos, PI, sqrt, abs, max, min, pow, atan2 } = Math;
let uid = 0;
const LIGHT = norm([0.42, 0.78, 0.46]);       // from the upper right, slightly toward the viewer
function norm(v) { const l = sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
function rotator(yaw, pitch, roll) {
  const cy = cos(yaw), sy = sin(yaw), cp = cos(pitch), sp = sin(pitch), cr = cos(roll), sr = sin(roll);
  return ([x, y, z]) => {
    let x1 = cr * x - sr * y, y1 = sr * x + cr * y;                 // roll about the axis
    let y2 = cp * y1 - sp * z, z2 = sp * y1 + cp * z;               // pitch (nod)
    let x3 = cy * x1 + sy * z2, z3 = -sy * x1 + cy * z2;             // yaw (turn)
    return [x3, y2, z3];
  };
}
const mix = (a, b, t) => a.map((v, i) => Math.round(lerp(v, b[i], t)));
const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
const C = { tip: [251, 248, 240], tipShade: [176, 184, 206], base: [219, 226, 160], baseShade: [130, 142, 108], edge: 'rgba(96,96,88,.32)', rib: 'rgba(130,140,110,.35)' };

// The petal surface. s runs base→tip, w runs edge→edge. open 0 = bud, 1 = full.
function petalPoint(i, open, s, w, out, nOut) {
  const phi = i * PI / 3 + PI / 2, inner = i % 2 === 1;
  const o = clamp01(open - (inner ? 0.12 : 0)) / (inner ? 0.88 : 1);
  const r0 = [cos(phi), sin(phi), 0], t0 = [-sin(phi), cos(phi), 0];
  const L = inner ? 0.96 : 1.0, N = 24;
  let r = 0.06, h = -0.02, nx = 0, ny = 0, nz = 0, x = 0, y = 0, z = 0;
  const Wmax = lerp(0.085, inner ? 0.21 : 0.235, o) * L, cup = lerp(0.95, -0.22, o);
  for (let k = 0; k <= N; k++) {
    const ss = k / N; if (ss > s + 1e-6) break;
    const th = lerp(0.12 + 0.3 * ss - 0.1 * ss * ss, 0.2 + 1.55 * pow(smoother((ss - 0.14) / 0.86), 1.25), o);
    if (k) { r += sin(th) * L / N; h += cos(th) * L / N; }
    const ct = cos(th), st = sin(th);
    nx = -ct * r0[0]; ny = -ct * r0[1]; nz = st;                      // surface normal (outward of the cup)
    const hw = Wmax * pow(sin(PI * pow(0.03 + 0.97 * ss, 1.3)), 0.9), off = w * hw, dp = hw * cup * w * w;
    x = r * r0[0] + off * t0[0] + dp * nx; y = r * r0[1] + off * t0[1] + dp * ny; z = h + dp * nz;
  }
  out[0] = x; out[1] = y; out[2] = z; if (nOut) { nOut[0] = nx; nOut[1] = ny; nOut[2] = nz; }
}

/** One lily head. Returns { svg, w, h } where svg is a <g> centred on (0,0), petal length ≈ size px. */
export function lilyHead({ seed = 1, open = 1, yaw = 0, pitch = 0, roll = 0, size = 60, dim = 0 } = {}) {
  const R = rotator(yaw, pitch, roll), id = `lh${++uid}`;
  const P = [0, 0, 0], Nn = [0, 0, 0];
  const items = [];
  const proj = p => [p[0] * size, -p[1] * size];
  // petals
  for (let i = 0; i < 6; i++) {
    const jit = 1 + (hash(seed, i, 3) - 0.5) * 0.08;
    const left = [], right = [], mid = []; let depth = 0, nAcc = [0, 0, 0];
    const STEPS = 14;
    for (let k = 0; k <= STEPS; k++) {
      const s = k / STEPS;
      petalPoint(i, open, s, -1, P); left.push(proj(R([P[0] * jit, P[1] * jit, P[2]])));
      petalPoint(i, open, s, 1, P); right.push(proj(R([P[0] * jit, P[1] * jit, P[2]])));
      petalPoint(i, open, s, 0, P, Nn); const c = R([P[0] * jit, P[1] * jit, P[2]]); mid.push(proj(c)); depth += c[2];
      const n = R(Nn); nAcc[0] += n[0]; nAcc[1] += n[1]; nAcc[2] += n[2];
    }
    depth /= STEPS + 1;
    const n = norm(nAcc); let dot = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2];
    const facing = n[2] >= 0;                                   // we see the inside of the cup
    const b = clamp01(0.42 + 0.58 * abs(dot)) * (facing ? 1 : 0.86) * (1 - dim);
    const d = left.map((p, k) => `${k ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + ' ' + right.slice().reverse().map(p => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + ' Z';
    const base = mid[0], tip = mid[mid.length - 1];
    const g = `${id}p${i}`;
    const tipC = mix(C.tipShade, C.tip, b), baseC = mix(C.baseShade, C.base, b * (facing ? 1 : 0.8));
    const grad = `<linearGradient id="${g}" gradientUnits="userSpaceOnUse" x1="${base[0].toFixed(1)}" y1="${base[1].toFixed(1)}" x2="${tip[0].toFixed(1)}" y2="${tip[1].toFixed(1)}"><stop offset="0" stop-color="${rgb(baseC)}"/><stop offset=".38" stop-color="${rgb(mix(baseC, tipC, 0.75))}"/><stop offset="1" stop-color="${rgb(tipC)}"/></linearGradient>`;
    const rib = mid.map((p, k) => `${k ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    items.push({ depth, defs: grad, body: `<path d="${d}" fill="url(#${g})" stroke="${C.edge}" stroke-width=".55" stroke-linejoin="round"/><path d="${rib}" fill="none" stroke="${C.rib}" stroke-width=".5" opacity="${(0.4 + 0.5 * open).toFixed(2)}"/>` });
  }
  // stamens and pistil
  const o = smoother((open - 0.1) / 0.9);
  if (o > 0.05) {
    for (let j = 0; j < 7; j++) {
      const pistil = j === 6, phi = j * PI / 3 + PI / 2 + PI / 6, r0 = [cos(phi), sin(phi), 0];
      const pts = []; let depth = 0;
      for (let k = 0; k <= 6; k++) {
        const s = k / 6, rr = pistil ? 0.04 * s * s : (0.03 + 0.27 * pow(s, 1.3)) * o, hh = (0.05 + (pistil ? 0.82 : 0.7) * s) * o;
        const c = R([rr * r0[0], rr * r0[1], hh]); pts.push(proj(c)); depth += c[2] / 7;
      }
      const d = pts.map((p, k) => `${k ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
      const e = pts[6], e1 = pts[5], ang = atan2(e[1] - e1[1], e[0] - e1[0]) * 180 / PI;
      const head = pistil ? `<circle cx="${e[0].toFixed(1)}" cy="${e[1].toFixed(1)}" r="${(size * 0.03).toFixed(1)}" fill="#cfe0a2" stroke="rgba(90,110,70,.4)" stroke-width=".5"/>`
        : `<ellipse cx="${e[0].toFixed(1)}" cy="${e[1].toFixed(1)}" rx="${(size * 0.055).toFixed(1)}" ry="${(size * 0.022).toFixed(1)}" transform="rotate(${ang.toFixed(1)} ${e[0].toFixed(1)} ${e[1].toFixed(1)})" fill="#b4531e"/><ellipse cx="${e[0].toFixed(1)}" cy="${(e[1] - size * 0.008).toFixed(1)}" rx="${(size * 0.03).toFixed(1)}" ry="${(size * 0.008).toFixed(1)}" transform="rotate(${ang.toFixed(1)} ${e[0].toFixed(1)} ${e[1].toFixed(1)})" fill="rgba(240,190,120,.45)"/>`;
      items.push({ depth, body: `<path d="${d}" fill="none" stroke="${pistil ? '#ece6c6' : '#e8e1bc'}" stroke-width="${(size * (pistil ? 0.022 : 0.016)).toFixed(1)}" stroke-linecap="round" opacity="${o.toFixed(2)}"/>${head}` });
    }
  }
  // the throat: a soft green-gold glow at the centre, drawn between the back and front petals
  const centre = proj(R([0, 0, 0.05]));
  items.push({ depth: 0.02, defs: `<radialGradient id="${id}t"><stop offset="0" stop-color="rgba(214,222,140,${(0.3 * o).toFixed(2)})"/><stop offset="1" stop-color="rgba(214,222,140,0)"/></radialGradient>`, body: `<circle cx="${centre[0].toFixed(1)}" cy="${centre[1].toFixed(1)}" r="${(size * 0.2).toFixed(1)}" fill="url(#${id}t)"/>` });
  items.sort((a, b) => a.depth - b.depth);
  return { defs: items.map(it => it.defs || '').join(''), body: items.map(it => it.body).join('') };
}

/** A whole plant: tapered stem, leaves, one or two heads. Returns an <svg> string sized W×H (px units in viewBox). */
export function lilyPlant({ seed = 1, W = 220, H = 360, heads = [{ open: 1 }], lean = 0, dim = 0, leafCount = 5, tall = 0.7 } = {}) {
  const r = k => hash(seed, k, 91);
  const x0 = W * 0.5 + lean * 0.2, y0 = H, x1 = W * 0.5 + lean, y1 = H * (1 - tall);
  const c1 = [x0 + (r(1) - 0.5) * 60, H * 0.7], c2 = [x1 - (r(2) - 0.5) * 70, H * 0.45];
  const bez = t => { const u = 1 - t; return [u * u * u * x0 + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * x1, u * u * u * y0 + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * y1]; };
  const tan = t => { const a = bez(min(1, t + 0.01)), b = bez(max(0, t - 0.01)); const d = [a[0] - b[0], a[1] - b[1]], l = sqrt(d[0] * d[0] + d[1] * d[1]) || 1; return [d[0] / l, d[1] / l]; };
  let defs = '', back = '', front = '';
  // stem as a tapered ribbon, lit on the right
  const L = [], Rr = [];
  for (let k = 0; k <= 24; k++) { const t = k / 24, p = bez(t), tg = tan(t), w = lerp(4.2, 2.2, t) * (W / 220); L.push([p[0] - tg[1] * w, p[1] + tg[0] * w]); Rr.push([p[0] + tg[1] * w, p[1] - tg[0] * w]); }
  const stemD = L.map((p, k) => `${k ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + Rr.reverse().map(p => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + 'Z';
  const sid = `st${++uid}`;
  defs += `<linearGradient id="${sid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1f3a28"/><stop offset=".55" stop-color="#4f7d49"/><stop offset=".8" stop-color="#6d9a5f"/><stop offset="1" stop-color="#2d4a33"/></linearGradient>`;
  const stem = `<path d="${stemD}" fill="url(#${sid})"/>`;
  // leaves: lanceolate, alternating, foreshortened at random, some in front of the stem and some behind
  for (let i = 0; i < leafCount; i++) {
    const t = 0.1 + i * (0.68 / leafCount) + r(10 + i) * 0.08, p = bez(t), tg = tan(t);
    const side = r(5 + i) < 0.5 ? 1 : -1, up = -atan2(tg[0], -tg[1]);
    const len = (52 + r(20 + i) * 46) * (W / 220) * (1 - t * 0.4), wid = (7 + r(30 + i) * 6) * (W / 220), fore = 0.5 + r(40 + i) * 0.5;
    const ang = up * 180 / PI + side * (22 + r(50 + i) * 50);
    const lid = `lf${++uid}`;
    const lit = side > 0 ? 1 : 0.7;
    defs += `<linearGradient id="${lid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${rgb(mix([22, 44, 30], [80, 125, 72], lit * 0.6 * (1 - dim)))}"/><stop offset=".5" stop-color="${rgb(mix([40, 70, 46], [116, 160, 98], lit * (1 - dim)))}"/><stop offset="1" stop-color="${rgb(mix([24, 46, 32], [70, 112, 66], lit * 0.7 * (1 - dim)))}"/></linearGradient>`;
    const d = `M0 0 C ${wid} ${-len * 0.3 * fore}, ${wid * 0.7} ${-len * 0.78}, 0 ${-len} C ${-wid * 0.7} ${-len * 0.78}, ${-wid} ${-len * 0.3 * fore}, 0 0 Z`;
    const leaf = `<g transform="translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${fore.toFixed(2)} 1)"><path d="${d}" fill="url(#${lid})" stroke="rgba(10,24,14,.45)" stroke-width=".6"/><path d="M0 -3 L0 ${(-len * 0.92).toFixed(1)}" stroke="rgba(190,220,170,.28)" stroke-width=".8" fill="none"/></g>`;
    if (r(60 + i) < 0.5) back += leaf; else front += leaf;
  }
  // heads
  let headsSvg = '';
  heads.forEach((hd, i) => {
    const t = hd.t == null ? 1 : hd.t, p = bez(t), tg = tan(t);
    const size = (hd.size || 1) * 78 * (W / 220);
    const yaw = hd.yaw == null ? (r(70 + i) - 0.5) * 1.2 : hd.yaw, pitch = hd.pitch == null ? -0.35 - r(80 + i) * 0.5 : hd.pitch;
    const h = lilyHead({ seed: seed * 7 + i, open: hd.open == null ? 1 : hd.open, yaw, pitch, roll: (r(90 + i) - 0.5) * 0.6, size, dim });
    defs += h.defs;
    // a short pedicel from the stem to the head
    const hx = p[0] + (hd.dx || 0) * (W / 220), hy = p[1] + (hd.dy || 0) * (W / 220);
    const ped = hd.t != null && hd.t < 1 ? `<path d="M${p[0].toFixed(1)} ${p[1].toFixed(1)} Q ${((p[0] + hx) / 2 + 8).toFixed(1)} ${((p[1] + hy) / 2).toFixed(1)} ${hx.toFixed(1)} ${hy.toFixed(1)}" fill="none" stroke="#3f6a3c" stroke-width="${(2.6 * W / 220).toFixed(1)}" stroke-linecap="round"/>` : '';
    headsSvg += `${ped}<g transform="translate(${hx.toFixed(1)} ${hy.toFixed(1)})"><g class="lily__head">${h.body}</g></g>`;
  });
  return `<svg class="lily" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs>${defs}</defs>${back}${stem}${front}${headsSvg}</svg>`;
}
