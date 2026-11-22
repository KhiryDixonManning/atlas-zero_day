// Hand-built SVG for the garden, the mailbox, the envelope and the journal.
// Everything here is a string; the scenes drop it into the DOM.
import { hash } from './util.js';
const { sin, cos, PI } = Math;
let uid = 0; const id = p => `${p}${++uid}`;

function petalPath(L, w) {
  return `M0 0 C ${w} ${-L * 0.25}, ${w * 1.05} ${-L * 0.7}, 0 ${-L} C ${-w * 1.05} ${-L * 0.7}, ${-w} ${-L * 0.25}, 0 0 Z`;
}
// ---------- grass: a strip of dark tufts, sized to the bottom of the screen ----------
export function grassStrip(seed = 3, n = 90) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = hash(seed, i, 1) * 1240 - 20, h = 26 + hash(seed, i, 2) * 48, s = 0.7 + hash(seed, i, 3) * 0.6;
    const col = hash(seed, i, 4) < 0.6 ? '#10201a' : '#1a3324';
    for (let b = 0; b < 4; b++) {
      const dx = (b - 1.5) * 5 * s, bend = (hash(seed, i, 10 + b) - 0.5) * 30 * s, hh = h * (0.7 + hash(seed, i, 20 + b) * 0.5);
      out += `<path d="M${(x + dx).toFixed(1)} 230 Q ${(x + dx + bend * 0.4).toFixed(1)} ${(230 - hh * 0.6).toFixed(1)} ${(x + dx + bend).toFixed(1)} ${(230 - hh).toFixed(1)}" stroke="${col}" stroke-width="${(2.2 * s).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
    }
  }
  return `<svg class="garden__grass" viewBox="0 0 1200 230" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${out}</svg>`;
}

// ---------- far hills with a line of mist ----------
export function hills() {
  let d = 'M0 120 ';
  for (let i = 0; i <= 24; i++) { const x = i * 50, y = 110 - 36 * sin(i * 0.55) * sin(i * 0.21 + 1) - 14 * sin(i * 1.3); d += `L${x} ${y.toFixed(1)} `; }
  d += 'L1200 200 L0 200 Z';
  let d2 = 'M0 150 ';
  for (let i = 0; i <= 24; i++) { const x = i * 50, y = 140 - 22 * sin(i * 0.4 + 2) * sin(i * 0.17) - 10 * sin(i * 0.9 + 1); d2 += `L${x} ${y.toFixed(1)} `; }
  d2 += 'L1200 200 L0 200 Z';
  return `<svg class="garden__hills" viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="hillA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141e2c"/><stop offset="1" stop-color="#0b111a"/></linearGradient>
    <linearGradient id="hillB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f1a1c"/><stop offset="1" stop-color="#0a120f"/></linearGradient></defs>
    <path d="${d}" fill="url(#hillA)"/><path d="${d2}" fill="url(#hillB)"/></svg>`;
}

// ---------- envelope details ----------
export function stamp() {
  return `<svg viewBox="0 0 70 86" aria-hidden="true">
    <defs><linearGradient id="stP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8ead6"/><stop offset="1" stop-color="#cfd3b8"/></linearGradient></defs>
    <rect x="3" y="3" width="64" height="80" fill="url(#stP)" stroke="#f6f1e4" stroke-width="5" stroke-dasharray="3 3" stroke-linejoin="round"/>
    <rect x="7" y="7" width="56" height="72" fill="none" stroke="#9aa088" stroke-width=".8"/>
    <g transform="translate(35 44)">
      <path d="M0 -4 L0 24" stroke="#5b7b4c" stroke-width="1.6"/>
      ${[-90, -30, 30, 90, 150, 210].map(a => `<path d="${petalPath(22, 6.5)}" transform="rotate(${a}) scale(1 .85)" fill="#fbfaf2" stroke="#9aa088" stroke-width=".6"/>`).join('')}
      <circle cx="0" cy="0" r="2.2" fill="#c9d48a"/>
    </g>
    <text x="35" y="76" text-anchor="middle" font-family="'IBM Plex Mono',monospace" font-size="6.5" letter-spacing="1" fill="#5f6650">NOTICED · 2026</text>
  </svg>`;
}
export function postmark() {
  return `<svg viewBox="0 0 120 120" aria-hidden="true">
    <defs><path id="pmArc" d="M60 60 m -42 0 a 42 42 0 1 1 84 0 a 42 42 0 1 1 -84 0"/></defs>
    <g fill="none" stroke="#3a3f5a" stroke-width="1.6" opacity=".55">
      <circle cx="60" cy="60" r="48"/><circle cx="60" cy="60" r="34"/>
      <path d="M118 36 L160 36 M118 48 L160 48 M118 60 L160 60 M118 72 L160 72 M118 84 L160 84"/>
    </g>
    <text font-family="'IBM Plex Mono',monospace" font-size="9.5" letter-spacing="2" fill="#3a3f5a" opacity=".6"><textPath href="#pmArc" startOffset="4%">THE ART OF NOTICING · BY HAND · WITH CARE ·</textPath></text>
    <text x="60" y="64" text-anchor="middle" font-family="'IBM Plex Mono',monospace" font-size="10" fill="#3a3f5a" opacity=".6">FOR LILY</text>
  </svg>`;
}
// The wax seal: two halves, so it can break along a jagged line.
export function seal() {
  const crack = 'M52 2 L46 20 L56 34 L47 50 L55 66 L48 84 L53 98';
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <radialGradient id="waxG" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#b43a46"/><stop offset=".55" stop-color="#7a1f2b"/><stop offset="1" stop-color="#3e0d14"/></radialGradient>
      <clipPath id="waxL"><path d="M0 0 H52 L46 20 L56 34 L47 50 L55 66 L48 84 L53 100 H0 Z"/></clipPath>
      <clipPath id="waxR"><path d="M100 0 H52 L46 20 L56 34 L47 50 L55 66 L48 84 L53 100 H100 Z"/></clipPath>
    </defs>
    ${['waxL', 'waxR'].map((c, i) => `<g class="seal__half seal__half--${i ? 'r' : 'l'}" clip-path="url(#${c})">
      <path d="M50 3 C 64 1, 80 6, 88 16 C 97 27, 99 42, 96 56 C 93 72, 84 88, 68 95 C 52 102, 32 98, 18 88 C 6 78, 1 60, 4 44 C 7 28, 18 12, 34 5 C 39 3, 45 3, 50 3 Z" fill="url(#waxG)"/>
      <path d="M50 3 C 64 1, 80 6, 88 16 C 97 27, 99 42, 96 56 C 93 72, 84 88, 68 95 C 52 102, 32 98, 18 88 C 6 78, 1 60, 4 44 C 7 28, 18 12, 34 5 C 39 3, 45 3, 50 3 Z" fill="none" stroke="rgba(255,190,190,.25)" stroke-width="2"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="27" fill="none" stroke="rgba(255,200,200,.18)" stroke-width="1"/>
      <text x="50" y="64" text-anchor="middle" font-family="'Cormorant Garamond',Georgia,serif" font-style="italic" font-weight="600" font-size="40" fill="rgba(40,6,10,.85)">L</text>
      <text x="49" y="63" text-anchor="middle" font-family="'Cormorant Garamond',Georgia,serif" font-style="italic" font-weight="600" font-size="40" fill="rgba(255,150,150,.22)">L</text>
    </g>`).join('')}
    <path class="seal__crack" d="${crack}" fill="none" stroke="#1a0508" stroke-width="1.4" stroke-linejoin="round" pathLength="1"/>
  </svg>`;
}

// ======================= journal illustrations =======================
// Ink on cream. Each returns an SVG string; the journal wires up the interactions.
const INK = '#2b2a36';
export const JOURNAL_ART = {
  inklily: () => `<svg viewBox="0 0 200 300" aria-hidden="true" class="ink">
    <g fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <!-- stem -->
      <path class="ink__s" d="M104 292 C 103 250, 101 210, 99 168 C 98 150, 100 136, 104 126"/>
      <path class="ink__s" d="M100 172 C 112 150, 126 118, 138 70"/>
      <!-- bud -->
      <path class="ink__s" d="M138 72 C 128 58, 128 30, 140 14 C 152 30, 152 58, 142 72 Z"/>
      <path class="ink__s" d="M140 20 L 139 68 M134 30 L 136 66 M146 30 L 144 66"/>
      <!-- leaves -->
      <path class="ink__s" d="M100 212 C 70 204, 48 212, 34 234 C 60 236, 86 230, 100 212 Z"/>
      <path class="ink__s" d="M100 212 L 44 232"/>
      <path class="ink__s" d="M102 246 C 134 238, 160 242, 180 262 C 150 266, 122 262, 102 246 Z"/>
      <path class="ink__s" d="M104 248 L 170 260"/>
      <path class="ink__s" d="M118 130 C 134 118, 150 114, 166 118 C 152 130, 134 136, 118 130 Z"/>
      <!-- the open flower: six tepals around a centre at 100,120 -->
      <path class="ink__s" d="M100 120 C 92 100, 86 72, 96 48 C 112 70, 112 98, 100 120 Z"/>
      <path class="ink__s" d="M100 120 C 112 106, 140 90, 170 92 C 150 112, 122 122, 100 120 Z"/>
      <path class="ink__s" d="M100 120 C 118 130, 142 148, 150 176 C 124 166, 106 146, 100 120 Z"/>
      <path class="ink__s" d="M100 120 C 92 142, 78 164, 56 176 C 60 150, 78 132, 100 120 Z"/>
      <path class="ink__s" d="M100 120 C 82 118, 54 110, 34 92 C 60 88, 86 102, 100 120 Z"/>
      <path class="ink__s" d="M100 120 C 84 108, 68 86, 66 60 C 86 72, 98 96, 100 120 Z"/>
      <path class="ink__s" d="M98 58 L 100 112 M160 96 L 108 118 M140 166 L 104 126 M62 168 L 96 126 M44 94 L 92 118 M72 66 L 96 112"/>
      <!-- stamens -->
      <path class="ink__s" d="M100 120 L 112 100 M100 120 L 118 110 M100 120 L 116 126 M100 120 L 90 104 M100 120 L 84 114 M100 120 L 92 132"/>
      <path class="ink__s" d="M112 100 l 3 -4 M118 110 l 4 -2 M116 126 l 4 1 M90 104 l -3 -4 M84 114 l -4 -2 M92 132 l -3 3"/>
    </g>
  </svg>`,
  sticker: () => `<svg viewBox="0 0 120 120" aria-hidden="true">
    <defs><radialGradient id="stkG" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff6ec"/><stop offset="1" stop-color="#f1dfc8"/></radialGradient></defs>
    <g class="sticker__body">
      <circle cx="60" cy="60" r="50" fill="url(#stkG)" stroke="#d9c3a5" stroke-width="2"/>
      <circle cx="60" cy="60" r="44" fill="none" stroke="${INK}" stroke-width="1.2" stroke-dasharray="2 4" opacity=".5"/>
      <!-- a grumpy little cat -->
      <path d="M38 44 L42 26 L54 38 Z M82 44 L78 26 L66 38 Z" fill="#b9a68a" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
      <ellipse cx="60" cy="58" rx="26" ry="22" fill="#cdbb9c" stroke="${INK}" stroke-width="1.4"/>
      <path d="M46 52 Q52 48 58 53 M62 53 Q68 48 74 52" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <path d="M48 70 Q60 64 72 70" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M57 62 L60 65 L63 62 Z" fill="${INK}"/>
      <path d="M30 60 L46 62 M30 68 L46 66 M90 60 L74 62 M90 68 L74 66" stroke="${INK}" stroke-width="1" opacity=".7"/>
      <text x="60" y="98" text-anchor="middle" font-family="Caveat,cursive" font-size="15" font-weight="600" fill="${INK}">hmph.</text>
    </g>
  </svg>`,
  bubbles: () => `<svg viewBox="0 0 220 130" aria-hidden="true">
    <g class="bubble bubble--1"><rect x="6" y="6" width="120" height="34" rx="16" fill="#e7dcc3" stroke="${INK}" stroke-width="1.2"/><path d="M22 24 q10 -8 20 0 t20 0 t20 0 t20 0" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round" opacity=".7"/></g>
    <g class="bubble bubble--2"><rect x="80" y="46" width="134" height="34" rx="16" fill="#dfe5d8" stroke="${INK}" stroke-width="1.2"/><path d="M96 64 q8 -9 16 0 t16 0 t16 0 t16 0 t16 0" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round" opacity=".7"/></g>
    <g class="bubble bubble--3"><rect x="6" y="86" width="150" height="36" rx="16" fill="#e7dcc3" stroke="${INK}" stroke-width="1.2"/>
      <path class="bubble__anyway" d="M24 106 q6 -14 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
      <path class="bubble__real" d="M26 106 L136 106" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" pathLength="1"/></g>
  </svg>`,
  leaf: () => `<svg viewBox="0 0 160 120" aria-hidden="true">
    <defs><linearGradient id="prLeaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b7a77f"/><stop offset="1" stop-color="#8d7d57"/></linearGradient></defs>
    <g transform="translate(80 100) rotate(-38)">
      <path d="M0 0 C 26 -18, 30 -60, 0 -96 C -30 -60, -26 -18, 0 0 Z" fill="url(#prLeaf)" stroke="#6e5f3c" stroke-width="1" opacity=".9"/>
      <path d="M0 -4 L0 -90" stroke="#6e5f3c" stroke-width="1"/>
      ${[-70, -56, -42, -30, -18].map(y => `<path d="M0 ${y} L-12 ${y + 12} M0 ${y} L12 ${y + 12}" stroke="#6e5f3c" stroke-width=".7" fill="none" opacity=".8"/>`).join('')}
    </g>
    <path d="M14 108 Q 60 104 140 110" stroke="${INK}" stroke-width=".8" fill="none" opacity=".35" stroke-dasharray="3 3"/>
  </svg>`,
  notes: () => `<svg viewBox="0 0 224 130" aria-hidden="true">
    <g transform="rotate(-3 112 65)">
      <rect x="8" y="10" width="208" height="110" rx="3" fill="#f5efe0" stroke="${INK}" stroke-width="1.2"/>
      <path d="M8 36 H216" stroke="#c76d6d" stroke-width="1" opacity=".7"/>
      ${[54, 72, 90, 108].map(y => `<path d="M22 ${y} H202" stroke="#9fb0c8" stroke-width=".8" opacity=".6"/>`).join('')}
      <text x="20" y="29" font-family="'IBM Plex Mono',monospace" font-size="9" letter-spacing="2" fill="${INK}" opacity=".7">FIELD NOTES</text>
      <text x="22" y="51" font-family="Caveat,cursive" font-size="14.5" fill="${INK}">tone, hints, the thing under the thing</text>
      <text x="22" y="69" font-family="Caveat,cursive" font-size="14.5" fill="${INK}">why do people do what they do?</text>
      <text x="22" y="87" font-family="Caveat,cursive" font-size="14.5" fill="${INK}">(took the class. still asking.)</text>
      <path class="notes__hl" d="M20 104 H168" stroke="#e9d66b" stroke-width="12" stroke-linecap="round" opacity=".55" pathLength="1"/>
      <text x="22" y="106" font-family="Caveat,cursive" font-size="14.5" font-weight="600" fill="${INK}">she reads people fine, actually.</text>
    </g>
  </svg>`,
  outfits: () => `<svg viewBox="0 0 160 170" aria-hidden="true">
    <g class="outfit outfit--0"><!-- a dress -->
      <path d="M62 36 L98 36 L104 70 L96 72 L112 150 L48 150 L64 72 L56 70 Z" fill="#c9b7d6" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M64 72 L96 72" stroke="${INK}" stroke-width="1" opacity=".5"/><path d="M72 36 Q80 48 88 36" fill="none" stroke="${INK}" stroke-width="1.2"/>
      <path d="M70 150 L68 100 M90 150 L92 100" stroke="${INK}" stroke-width=".8" opacity=".4"/></g>
    <g class="outfit outfit--1"><!-- a jacket and wide trousers -->
      <path d="M54 40 L80 30 L106 40 L116 92 L104 94 L100 76 L100 110 L60 110 L60 76 L56 94 L44 92 Z" fill="#9fb3a4" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M80 30 L72 60 L80 68 L88 60 Z" fill="#f2ecdd" stroke="${INK}" stroke-width="1"/>
      <path d="M62 110 L58 158 L78 158 L80 124 L82 158 L102 158 L98 110 Z" fill="#3f3d4a" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/></g>
    <g class="outfit outfit--2"><!-- a cape, and ears, for a day -->
      <path d="M58 22 L66 4 L74 20 M86 20 L94 4 L102 22" fill="#e3c8b4" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M46 48 L80 32 L114 48 L128 156 L32 156 Z" fill="#b24b4b" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M66 50 L80 42 L94 50 L98 150 L62 150 Z" fill="#f2ecdd" stroke="${INK}" stroke-width="1"/>
      <path d="M72 70 Q80 78 88 70" fill="none" stroke="${INK}" stroke-width="1" opacity=".6"/></g>
    <path d="M30 164 H130" stroke="${INK}" stroke-width=".8" opacity=".35" stroke-dasharray="3 3"/>
  </svg>`,
  tag: () => `<svg viewBox="0 0 170 200" aria-hidden="true">
    <defs><linearGradient id="tgP" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d8e39a"/><stop offset=".4" stop-color="#faf7ef"/><stop offset="1" stop-color="#eae7dc"/></linearGradient></defs>
    <path d="M86 196 C 84 150, 90 120, 92 74" fill="none" stroke="#3f6a3c" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M88 150 C 60 142, 48 120, 50 96 C 70 108, 82 126, 88 150 Z" fill="#6f9a60" stroke="#2f4b36" stroke-width="1"/>
    <path d="M90 128 C 118 122, 132 100, 130 76 C 110 88, 96 106, 90 128 Z" fill="#5f8a55" stroke="#2f4b36" stroke-width="1"/>
    <g transform="translate(126 70)"><g class="tag__bloom2">${[-90, -30, 30, 90, 150, 210].map(a => `<path d="${petalPath(26, 8)}" transform="rotate(${a}) scale(1 .82)" fill="url(#tgP)" stroke="#9a9b88" stroke-width=".6"/>`).join('')}<circle r="3" fill="#c9d48a"/></g></g>
    <g transform="translate(92 70) rotate(-8)">${[-90, -30, 30, 90, 150, 210].map(a => `<path d="${petalPath(34, 10)}" transform="rotate(${a}) scale(1 .82)" fill="url(#tgP)" stroke="#9a9b88" stroke-width=".6"/>`).join('')}
      ${[-60, -30, 0, 30, 60].map(a => `<line x1="0" y1="0" x2="${(Math.sin(a * Math.PI / 180) * 16).toFixed(1)}" y2="${(14 + Math.cos(a * Math.PI / 180) * 6).toFixed(1)}" stroke="#e6dfb8" stroke-width="1"/><ellipse cx="${(Math.sin(a * Math.PI / 180) * 16).toFixed(1)}" cy="${(14 + Math.cos(a * Math.PI / 180) * 6).toFixed(1)}" rx="3" ry="1.4" fill="#b85a2a"/>`).join('')}</g>
    <g class="tag__tag">
      <path d="M94 96 Q 112 112 122 130" fill="none" stroke="${INK}" stroke-width=".9"/>
      <g transform="translate(122 130) rotate(18)"><path d="M0 0 L10 -8 L46 -8 L46 24 L10 24 Z" fill="#f1e7d2" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/><circle cx="12" cy="8" r="2" fill="none" stroke="${INK}" stroke-width="1"/>
        <text x="30" y="13" text-anchor="middle" font-family="Caveat,cursive" font-size="16" font-weight="600" fill="${INK}">$ ?</text></g>
    </g>
  </svg>`,
  comforts: () => `<svg viewBox="0 0 260 150" aria-hidden="true">
    <g class="cat"><!-- a cat, sitting, unimpressed -->
      <path d="M40 132 C 22 132, 16 110, 22 92 C 26 78, 36 70, 48 68 L 48 56 L 58 66 L 72 66 L 82 56 L 82 70 C 94 76, 98 96, 92 112 C 88 124, 76 132, 60 132 Z" fill="#8f8a90" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
      <path class="cat__tail" d="M92 118 C 112 122, 122 108, 112 92" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <path class="cat__tail" d="M92 118 C 112 122, 122 108, 112 92" fill="none" stroke="#8f8a90" stroke-width="3" stroke-linecap="round"/>
      <g class="cat__eyes"><ellipse cx="56" cy="80" rx="3" ry="4" fill="${INK}"/><ellipse cx="74" cy="80" rx="3" ry="4" fill="${INK}"/></g>
      <g class="cat__wide"><circle cx="56" cy="80" r="4.6" fill="${INK}"/><circle cx="74" cy="80" r="4.6" fill="${INK}"/><circle cx="57.5" cy="78.5" r="1.3" fill="#f5efe0"/><circle cx="75.5" cy="78.5" r="1.3" fill="#f5efe0"/></g>
      <g class="cat__lids"><path d="M52 80 Q56 83 60 80 M70 80 Q74 83 78 80" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/></g>
      <path d="M63 88 L65 91 L67 88 Z" fill="${INK}"/><path d="M60 94 Q65 97 70 94" fill="none" stroke="${INK}" stroke-width="1" stroke-linecap="round"/>
      <path d="M40 90 L54 92 M40 96 L54 95 M90 90 L76 92 M90 96 L76 95" stroke="${INK}" stroke-width=".8" opacity=".7"/>
      <text class="cat__purr" x="100" y="70" font-family="Caveat,cursive" font-size="15" fill="${INK}" opacity="0">prrr</text>
      <text class="cat__mrrp" x="100" y="70" font-family="Caveat,cursive" font-size="15" fill="${INK}" opacity="0">mrrp?</text>
    </g>
    <g class="bowl"><!-- a bowl of cereal -->
      <ellipse cx="190" cy="98" rx="46" ry="12" fill="#f5efe0" stroke="${INK}" stroke-width="1.2"/>
      <path d="M146 100 C 150 128, 230 128, 234 100" fill="#dfe5d8" stroke="${INK}" stroke-width="1.3"/>
      ${[[160, 93], [174, 90], [190, 92], [206, 90], [220, 94], [182, 96], [198, 97]].map(([x, y], i) => `<rect class="bowl__sq" x="${x - 6}" y="${y - 6}" width="12" height="12" rx="2" transform="rotate(${(i * 37) % 40 - 20} ${x} ${y})" fill="#d9a35e" stroke="#8a5a2a" stroke-width="1"/>`).join('')}
      <path class="bowl__steam" d="M176 76 q -4 -8 0 -16 M190 72 q 4 -8 0 -16 M204 76 q -4 -8 0 -16" fill="none" stroke="${INK}" stroke-width="1.2" stroke-linecap="round" opacity="0"/>
    </g>
    <g class="dumpling" transform="translate(150 26)"><!-- three dumplings on a plate -->
      <ellipse cx="40" cy="30" rx="44" ry="9" fill="none" stroke="${INK}" stroke-width="1" opacity=".5"/>
      ${[8, 40, 72].map((x, i) => `<g transform="translate(${x} 22) scale(${i === 1 ? 1.05 : 0.95})"><path d="M-16 6 C -16 -8, 16 -8, 16 6 Z" fill="#f3e9d6" stroke="${INK}" stroke-width="1.1"/><path d="M-10 -1 Q-6 -8 -2 -1 M-2 -1 Q2 -8 6 -1 M6 -1 Q10 -8 14 -1" fill="none" stroke="${INK}" stroke-width=".9"/></g>`).join('')}
      <path class="dumpling__steam" d="M14 2 q -3 -7 0 -14 M44 0 q 3 -7 0 -14 M76 2 q -3 -7 0 -14" fill="none" stroke="${INK}" stroke-width="1.1" stroke-linecap="round" opacity="0"/>
    </g>
  </svg>`,
  headphones: () => `<svg viewBox="0 0 180 140" aria-hidden="true">
    <path d="M40 92 C 40 48, 58 30, 90 30 C 122 30, 140 48, 140 92" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <rect x="28" y="84" width="24" height="40" rx="9" fill="#c9b7d6" stroke="${INK}" stroke-width="1.4"/>
    <rect x="128" y="84" width="24" height="40" rx="9" fill="#c9b7d6" stroke="${INK}" stroke-width="1.4"/>
    <rect x="36" y="92" width="8" height="24" rx="4" fill="${INK}" opacity=".35"/><rect x="136" y="92" width="8" height="24" rx="4" fill="${INK}" opacity=".35"/>
    <g class="hp__notes" transform="translate(90 72)"></g>
  </svg>`,
  bench: () => `<svg viewBox="0 0 220 120" aria-hidden="true">
    <circle cx="34" cy="20" r="10" fill="#f3ead9" stroke="${INK}" stroke-width="1" opacity=".9"/>
    <path d="M26 58 H194 M30 72 H190 M34 86 H186" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <path d="M40 58 L40 110 M180 58 L180 110 M34 110 H48 M172 110 H188" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <path d="M26 58 C 20 44, 30 34, 44 36 M194 58 C 200 44, 190 34, 176 36" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <g transform="translate(78 44)"><path d="M0 10 C 0 2, 22 2, 22 10 L 20 20 L 2 20 Z" fill="#f5efe0" stroke="${INK}" stroke-width="1.2"/><path d="M22 10 q 8 0 6 8 q -1 3 -6 2" fill="none" stroke="${INK}" stroke-width="1.2"/></g>
    <g transform="translate(118 44)"><path d="M0 10 C 0 2, 22 2, 22 10 L 20 20 L 2 20 Z" fill="#f5efe0" stroke="${INK}" stroke-width="1.2"/><path d="M22 10 q 8 0 6 8 q -1 3 -6 2" fill="none" stroke="${INK}" stroke-width="1.2"/></g>
    <g class="bench__fly"><circle cx="150" cy="34" r="2.2" fill="#d9e38f"/></g>
    ${[20, 60, 100, 140, 190].map((x, i) => `<path d="M${x} 114 q 4 -10 8 0" fill="none" stroke="${INK}" stroke-width="1" opacity=".5"/>`).join('')}
  </svg>`,
};

// ---------- the pressed lily that comes back to life ----------
export function pressedLily() {
  const angles = [-90, -30, 30, 90, 150, 210];
  return `<svg class="pl__svg" viewBox="0 0 260 300" aria-hidden="true">
    <defs>
      <linearGradient id="plLive" x1="0" y1="0" x2="0" y2="-1" gradientUnits="objectBoundingBox" gradientTransform="translate(0 1)"><stop offset="0" stop-color="#d4e08f"/><stop offset=".35" stop-color="#fbf8f0"/><stop offset="1" stop-color="#f1efe6"/></linearGradient>
      <linearGradient id="plDry" x1="0" y1="0" x2="0" y2="-1" gradientUnits="objectBoundingBox" gradientTransform="translate(0 1)"><stop offset="0" stop-color="#b8a87e"/><stop offset=".5" stop-color="#d9cdae"/><stop offset="1" stop-color="#cfc2a0"/></linearGradient>
      <filter id="plGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9"/></filter>
    </defs>
    <!-- stem and a leaf, dried then green -->
    <path class="pl__stem" d="M130 150 C 126 190, 134 230, 128 292" fill="none" stroke-width="4" stroke-linecap="round"/>
    <path class="pl__leaf" d="M129 224 C 100 214, 86 190, 90 164 C 112 176, 126 198, 129 224 Z" stroke-width="1"/>
    <path class="pl__leaf pl__leaf--2" d="M131 252 C 160 244, 176 222, 172 196 C 150 208, 136 230, 131 252 Z" stroke-width="1"/>
    <!-- a glow behind the open flower -->
    <g class="pl__glow" transform="translate(130 126)" filter="url(#plGlow)" opacity="0">${angles.map(a => `<path d="${petalPath(86, 30)}" transform="rotate(${a}) scale(1 .86)" fill="#fbf8f0"/>`).join('')}</g>
    <g transform="translate(130 126)"><g class="pl__head">
      ${angles.map((a, i) => `<g transform="rotate(${a})"><g class="pl__petal" style="--i:${i};--j:${[-7, 5, -4, 6, -5, 4][i]}deg"><path class="pl__petalpath" d="${petalPath(82, 27)}" stroke-width="1"/>
        <path class="pl__vein" d="M0 -6 L0 -64" stroke-width=".8" fill="none" opacity=".45"/></g></g>`).join('')}
      <g class="pl__stamens">${[-55, -33, -11, 11, 33, 55].map((a, i) => { const x = Math.sin(a * Math.PI / 180) * 30, y = 18 + Math.cos(a * Math.PI / 180) * 10; return `<g class="pl__stamen" style="--i:${i}"><line x1="0" y1="0" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e8e1bc" stroke-width="1.4"/><ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="5" ry="2.2" transform="rotate(${(a * 0.6).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#b85a2a"/></g>`; }).join('')}
        <g class="pl__stamen" style="--i:6"><line x1="0" y1="0" x2="2" y2="40" stroke="#ece6c6" stroke-width="1.6"/><circle cx="2" cy="40" r="3.4" fill="#cfe0a2"/></g></g>
      <circle class="pl__centre" r="4"/>
    </g></g>
    <!-- the paper it was pressed in: a faint outline and tape -->
    <g class="pl__tape"><rect x="96" y="268" width="68" height="16" rx="2" fill="#efe6cf" stroke="#c9b995" stroke-width=".8" opacity=".9" transform="rotate(-4 130 276)"/></g>
  </svg>`;
}
