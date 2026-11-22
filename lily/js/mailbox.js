// The mailbox: a rural tunnel box on a cedar post, seen from the front and a little to the right,
// lit by a moon high on the right. Built from a few measured shapes rather than many gradients.
const { cos, sin, PI, atan2, sqrt } = Math;
// front cap: circle centre F, radius RF, flat base at BASE. back cap: centre B, radius RB (perspective: smaller).
const F = [150, 214], RF = 92, B = [284, 178], RB = 72, BASE_F = 312, BASE_B = 256;
export const MB_VIEW = { w: 400, h: 600 };
export const MB_FRONT = { cx: F[0], cy: F[1], r: RF, base: BASE_F };   // where the door lives, in viewBox units
const f1 = n => n.toFixed(1);
function tangents() {
  const dx = B[0] - F[0], dy = B[1] - F[1], D = sqrt(dx * dx + dy * dy), u = atan2(dy, dx), a = Math.acos((RF - RB) / D);
  const pt = (c, r, ang) => [c[0] + r * cos(ang), c[1] + r * sin(ang)];
  const top = u - a, bot = u + a;           // the tangent that runs over the top (smaller screen y) and the one underneath
  return { fTop: pt(F, RF, top), bTop: pt(B, RB, top), fBot: pt(F, RF, bot), bBot: pt(B, RB, bot), top, bot };
}
export function mailboxSVG() {
  const T = tangents();
  // body silhouette: over the top tangent, round the far cap, down its right wall, along the base, up the front wall, back over the front cap
  const body = `M${f1(T.fTop[0])} ${f1(T.fTop[1])} L${f1(T.bTop[0])} ${f1(T.bTop[1])} A${RB} ${RB} 0 0 1 ${f1(B[0] + RB)} ${f1(B[1])} L${f1(B[0] + RB)} ${BASE_B} L${f1(F[0] + RF)} ${BASE_F} L${f1(F[0] + RF)} ${f1(F[1])} A${RF} ${RF} 0 0 0 ${f1(T.fTop[0])} ${f1(T.fTop[1])} Z`;
  const frontD = `M${F[0] - RF} ${BASE_F} L${F[0] - RF} ${F[1]} A${RF} ${RF} 0 0 1 ${F[0] + RF} ${F[1]} L${F[0] + RF} ${BASE_F} Z`;
  const inner = (k) => `M${f1(F[0] - RF * k)} ${f1(BASE_F - 6)} L${f1(F[0] - RF * k)} ${F[1]} A${f1(RF * k)} ${f1(RF * k)} 0 0 1 ${f1(F[0] + RF * k)} ${F[1]} L${f1(F[0] + RF * k)} ${f1(BASE_F - 6)} Z`;
  // the right wall, as a quad, for the nameplate's skew
  const wall = [[F[0] + RF, F[1]], [B[0] + RB, B[1]], [B[0] + RB, BASE_B], [F[0] + RF, BASE_F]];
  const wallSkew = (wall[1][1] - wall[0][1]) / (wall[1][0] - wall[0][0]);
  let rivets = '';
  for (let i = 0; i <= 12; i++) { const a = PI + i * PI / 12, x = F[0] + (RF - 5) * cos(a), y = F[1] + (RF - 5) * sin(a); rivets += `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.6" fill="rgba(255,236,214,${(0.25 + 0.5 * Math.max(0, cos(a + 0.9))).toFixed(2)})"/>`; }
  let grain = '';
  for (let i = 0; i < 9; i++) { const x = 130 + i * 5.4; grain += `<path d="M${x} 318 C ${x + 2} 400, ${x - 2} 480, ${x + 1} 600" stroke="rgba(0,0,0,${(0.12 + (i % 3) * 0.08).toFixed(2)})" stroke-width="${(0.6 + (i % 2) * 0.6).toFixed(1)}" fill="none"/>`; }
  return `<svg class="mb__svg" viewBox="0 0 ${MB_VIEW.w} ${MB_VIEW.h}" aria-hidden="true">
  <defs>
    <linearGradient id="mbTube" gradientUnits="userSpaceOnUse" x1="${f1(T.fTop[0])}" y1="${f1(T.fTop[1])}" x2="${f1(T.fTop[0] + 30)}" y2="${BASE_F}">
      <stop offset="0" stop-color="#d98b73"/><stop offset=".07" stop-color="#b85d48"/><stop offset=".24" stop-color="#93402f"/><stop offset=".55" stop-color="#762d21"/><stop offset=".85" stop-color="#4a1811"/><stop offset="1" stop-color="#2a0c08"/></linearGradient>
    <linearGradient id="mbWallLit" gradientUnits="userSpaceOnUse" x1="${F[0] + RF}" y1="0" x2="${B[0] + RB}" y2="0"><stop offset="0" stop-color="rgba(255,200,170,0)"/><stop offset=".85" stop-color="rgba(255,200,170,.07)"/><stop offset="1" stop-color="rgba(255,220,200,.3)"/></linearGradient>
    <linearGradient id="mbFar" gradientUnits="userSpaceOnUse" x1="${F[0]}" y1="0" x2="${B[0] + RB}" y2="0"><stop offset="0" stop-color="rgba(0,0,0,0)"/><stop offset="1" stop-color="rgba(0,0,0,.42)"/></linearGradient>
    <linearGradient id="mbCapRim" gradientUnits="userSpaceOnUse" x1="${F[0] - RF}" y1="${BASE_F}" x2="${F[0] + RF}" y2="${F[1] - RF}"><stop offset="0" stop-color="#3a1611"/><stop offset=".45" stop-color="#8d4a3b"/><stop offset=".8" stop-color="#e2a98f"/><stop offset="1" stop-color="#f6d8c4"/></linearGradient>
    <radialGradient id="mbIn" cx="${f1(F[0] + 10)}" cy="${f1(F[1] + 20)}" r="${RF + 30}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3a2519"/><stop offset=".55" stop-color="#160c08"/><stop offset="1" stop-color="#050302"/></radialGradient>
    <linearGradient id="mbInTop" gradientUnits="userSpaceOnUse" x1="0" y1="${F[1] - RF}" x2="0" y2="${F[1] + 20}"><stop offset="0" stop-color="rgba(224,200,180,.22)"/><stop offset="1" stop-color="rgba(224,200,180,0)"/></linearGradient>
    <linearGradient id="mbPost" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#241710"/><stop offset=".18" stop-color="#4a3221"/><stop offset=".55" stop-color="#6b4b31"/><stop offset=".86" stop-color="#8a6442"/><stop offset="1" stop-color="#3b2818"/></linearGradient>
    <linearGradient id="mbBrass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0d9a6"/><stop offset=".45" stop-color="#c19a58"/><stop offset="1" stop-color="#6f5226"/></linearGradient>
    <linearGradient id="mbBracket" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a1210"/><stop offset=".6" stop-color="#3b2a22"/><stop offset="1" stop-color="#15100d"/></linearGradient>
    <filter id="mbNoise" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .18 0"/></filter>
    <clipPath id="mbBodyClip"><path d="${body}"/></clipPath>
    <clipPath id="mbCapClip"><path d="${inner(0.93)}"/></clipPath>
  </defs>
  <!-- ground shadow -->
  <ellipse cx="168" cy="586" rx="118" ry="11" fill="rgba(0,0,0,.55)"/>
  <ellipse cx="112" cy="584" rx="150" ry="9" fill="rgba(0,0,0,.28)"/>
  <!-- post -->
  <rect x="128" y="318" width="52" height="282" fill="url(#mbPost)"/>${grain}
  <rect x="128" y="318" width="52" height="30" fill="rgba(0,0,0,.45)"/>
  <rect x="174" y="318" width="6" height="282" fill="rgba(255,226,200,.08)"/>
  <!-- bracket arm under the box -->
  <path d="M116 306 L246 306 L246 322 L116 322 Z" fill="url(#mbBracket)"/>
  <path d="M180 366 L236 318 L244 322 L186 372 Z" fill="#3a271a"/><path d="M180 366 L236 318" stroke="rgba(255,226,200,.12)" stroke-width="1"/>
  <!-- the tube -->
  <path d="${body}" fill="url(#mbTube)"/>
  <path d="${body}" fill="url(#mbFar)"/>
  <path d="M${f1(F[0] + RF)} ${f1(F[1])} L${f1(B[0] + RB)} ${f1(B[1])} L${f1(B[0] + RB)} ${BASE_B} L${f1(F[0] + RF)} ${BASE_F} Z" fill="url(#mbWallLit)"/>
  <g clip-path="url(#mbBodyClip)">
    <rect x="0" y="0" width="400" height="600" filter="url(#mbNoise)" opacity=".5"/>
    <!-- seam ridges along the tube -->
    <path d="M${f1(F[0] + RF * cos(-1.1))} ${f1(F[1] + RF * sin(-1.1))} L${f1(B[0] + RB * cos(-1.1))} ${f1(B[1] + RB * sin(-1.1))}" stroke="rgba(255,220,200,.22)" stroke-width="1.2"/>
    <path d="M${f1(F[0] + RF * cos(-0.35))} ${f1(F[1] + RF * sin(-0.35))} L${f1(B[0] + RB * cos(-0.35))} ${f1(B[1] + RB * sin(-0.35))}" stroke="rgba(0,0,0,.28)" stroke-width="1.4"/>
    <path d="M${f1(B[0] + RB - 1)} ${f1(B[1])} L${f1(B[0] + RB - 1)} ${BASE_B}" stroke="rgba(255,226,206,.32)" stroke-width="2"/>
    <!-- moon highlight along the top ridge -->
    <path d="M${f1(T.fTop[0] + 6)} ${f1(T.fTop[1] + 2)} L${f1(T.bTop[0] + 2)} ${f1(T.bTop[1] + 2)}" stroke="rgba(255,240,226,.55)" stroke-width="3" stroke-linecap="round"/>
    <path d="M${f1(T.fTop[0] + 6)} ${f1(T.fTop[1] + 2)} L${f1(T.bTop[0] + 2)} ${f1(T.bTop[1] + 2)}" stroke="rgba(255,240,226,.18)" stroke-width="12" stroke-linecap="round"/>
  </g>
  <!-- nameplate on the right wall, skewed with it -->
  <g transform="translate(262 236) skewY(${f1(atan2(wallSkew, 1) * 180 / PI)})">
    <rect x="-20" y="-13" width="56" height="26" rx="2.5" fill="url(#mbBrass)" stroke="#2b1c0a" stroke-width=".8"/>
    <rect x="-17" y="-10" width="50" height="20" rx="1.5" fill="none" stroke="rgba(60,40,10,.45)" stroke-width=".6"/>
    <text x="8" y="4.5" text-anchor="middle" font-family="'Cormorant Garamond',Georgia,serif" font-weight="600" font-size="13" letter-spacing="2.4" fill="#2a1a08">LILY</text>
    <circle cx="-14" cy="0" r="1.3" fill="#3a2a10"/><circle cx="30" cy="0" r="1.3" fill="#3a2a10"/>
  </g>
  <!-- the cap: the dark inside, then the rolled rim -->
  <path d="${inner(0.93)}" fill="url(#mbIn)"/>
  <g clip-path="url(#mbCapClip)"><path d="${inner(0.93)}" fill="url(#mbInTop)"/></g>
  <path d="${frontD}" fill="none" stroke="url(#mbCapRim)" stroke-width="7" stroke-linejoin="round"/>
  <path d="${inner(0.96)}" fill="none" stroke="rgba(255,236,214,.35)" stroke-width="1.2"/>
  ${rivets}
</svg>`;
}
export function doorFrontSVG() {
  const r = 100, cx = 100, cy = 100;
  let rivets = '';
  for (let i = 0; i <= 10; i++) { const a = PI + i * PI / 10, x = cx + 86 * cos(a), y = cy + 86 * sin(a); rivets += `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.9" fill="rgba(40,14,10,.55)"/><circle cx="${f1(x - 0.5)}" cy="${f1(y - 0.6)}" r="1" fill="rgba(255,226,206,${(0.2 + 0.5 * Math.max(0, cos(a + 0.9))).toFixed(2)})"/>`; }
  return `<svg viewBox="0 0 200 200" preserveAspectRatio="none" aria-hidden="true">
  <defs>
    <linearGradient id="drFace" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6e2a20"/><stop offset=".4" stop-color="#8f3d2e"/><stop offset=".75" stop-color="#a95341"/><stop offset="1" stop-color="#5a1f17"/></linearGradient>
    <linearGradient id="drRim" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#3a1510"/><stop offset=".5" stop-color="#9c5444"/><stop offset=".85" stop-color="#e8b39b"/><stop offset="1" stop-color="#f8dccb"/></linearGradient>
    <radialGradient id="drPanel" cx=".62" cy=".3" r=".9"><stop offset="0" stop-color="#b05a46"/><stop offset=".6" stop-color="#7f3327"/><stop offset="1" stop-color="#4a1a13"/></radialGradient>
    <linearGradient id="drBrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3dfae"/><stop offset=".5" stop-color="#c39c5a"/><stop offset="1" stop-color="#6a4d22"/></linearGradient>
    <filter id="drNoise" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .16 0"/></filter>
    <clipPath id="drClip"><path d="M4 196 L4 100 A96 96 0 0 1 196 100 L196 196 Z"/></clipPath>
  </defs>
  <path d="M4 196 L4 100 A96 96 0 0 1 196 100 L196 196 Z" fill="url(#drFace)"/>
  <g clip-path="url(#drClip)"><rect width="200" height="200" filter="url(#drNoise)" opacity=".5"/></g>
  <path d="M16 190 L16 100 A84 84 0 0 1 184 100 L184 190 Z" fill="url(#drPanel)" stroke="rgba(0,0,0,.45)" stroke-width="1.2"/>
  <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="rgba(255,228,210,.28)" stroke-width="2"/>
  <path d="M4 196 L4 100 A96 96 0 0 1 196 100 L196 196" fill="none" stroke="url(#drRim)" stroke-width="5" stroke-linejoin="round"/>
  ${rivets}
  <!-- pull handle -->
  <path d="M76 28 Q100 10 124 28" fill="none" stroke="url(#drBrass)" stroke-width="7" stroke-linecap="round"/>
  <path d="M76 28 Q100 10 124 28" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1" stroke-linecap="round" transform="translate(0 3)"/>
  <rect x="70" y="26" width="12" height="8" rx="2" fill="url(#drBrass)"/><rect x="118" y="26" width="12" height="8" rx="2" fill="url(#drBrass)"/>
  <!-- latch -->
  <rect x="88" y="176" width="24" height="10" rx="3" fill="url(#drBrass)" stroke="#3a2a10" stroke-width=".6"/>
  <rect x="4" y="186" width="192" height="10" fill="rgba(0,0,0,.4)"/>
</svg>`;
}
export function doorBackSVG() {
  return `<svg viewBox="0 0 200 200" preserveAspectRatio="none" aria-hidden="true">
  <defs><linearGradient id="drBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1612"/><stop offset=".7" stop-color="#4b2c25"/><stop offset="1" stop-color="#5e3a31"/></linearGradient></defs>
  <path d="M4 196 L4 100 A96 96 0 0 1 196 100 L196 196 Z" fill="url(#drBack)" stroke="#140806" stroke-width="1.5"/>
  <path d="M14 188 L14 100 A86 86 0 0 1 186 100 L186 188" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1.5"/>
  <rect x="84" y="178" width="32" height="10" rx="3" fill="#7a6456"/>
  <rect x="4" y="186" width="192" height="10" fill="rgba(0,0,0,.3)"/>
</svg>`;
}
export function flagSVG() {
  return `<svg viewBox="0 0 60 130" aria-hidden="true">
  <defs><linearGradient id="flagG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6e1d1f"/><stop offset=".55" stop-color="#c0433a"/><stop offset="1" stop-color="#e07a6a"/></linearGradient></defs>
  <rect x="20" y="10" width="12" height="100" rx="3" fill="url(#flagG)" stroke="#2e0d0e" stroke-width="1"/>
  <path d="M20 10 L54 22 L20 36 Z" fill="url(#flagG)" stroke="#2e0d0e" stroke-width="1" stroke-linejoin="round"/>
  <path d="M22 12 L50 22" stroke="rgba(255,236,226,.4)" stroke-width="1"/>
  <circle cx="26" cy="110" r="7" fill="#1f130e" stroke="#c9a37e" stroke-width="1.6"/><circle cx="26" cy="110" r="2" fill="#e9cfa9"/>
</svg>`;
}
