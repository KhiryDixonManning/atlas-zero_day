// Scene 2 and 3 — the garden, the mailbox, the envelope, the letter.
// One module, so the envelope can leave the mailbox and the letter can leave the envelope without a cut.
import { el, wait, hash, noise2, tween, EASE } from '../util.js';
import { grassStrip, hills, stamp, postmark, seal } from '../art.js';
import { mailboxSVG, doorFrontSVG, doorBackSVG, flagSVG, MB_FRONT, MB_VIEW } from '../mailbox.js';
import { lilyPlant } from '../lily3d.js';
import { NOTE } from '../content.js';

const { sin, cos, min, max, PI } = Math;

// where the door sits inside the mailbox drawing, as percentages of the drawing box
const DOOR = { left: (MB_FRONT.cx - MB_FRONT.r) / MB_VIEW.w * 100, top: (MB_FRONT.cy - MB_FRONT.r) / MB_VIEW.h * 100, width: 2 * MB_FRONT.r / MB_VIEW.w * 100, height: (MB_FRONT.base - (MB_FRONT.cy - MB_FRONT.r)) / MB_VIEW.h * 100 };

// the plants around the post: back row first, then the mailbox, then the front row
const PLANTS = [
  // behind the box: tall, dimmer, heads beside the cap
  { cls: 'plant--back', seed: 21, style: 'left:-6%;width:38%;bottom:17%;--sway:8.5s;--d:-3s', dim: 0.45, tall: 0.86, heads: [{ open: 1, yaw: 0.6, pitch: -0.5, size: 0.8 }, { t: 0.84, open: 0.12, dx: 26, dy: -26, size: 0.7 }] },
  { cls: 'plant--back', seed: 22, style: 'left:72%;width:36%;bottom:20%;--sway:9.5s;--d:-6s', dim: 0.42, tall: 0.86, heads: [{ open: 0.9, yaw: -0.9, pitch: -0.35, size: 0.8 }] },
  // beside the post, between the box and the foreground
  { cls: 'plant--mid', seed: 25, style: 'left:55%;width:34%;bottom:12%;--sway:6.6s;--d:-2.2s', dim: 0.12, heads: [{ open: 0.55, yaw: 1.3, pitch: -0.7, size: 0.85 }], leafCount: 4 },
  // the foreground: heads below the open door, clear of the screen edges
  { cls: 'plant--front', seed: 23, style: 'left:-3%;width:46%;bottom:-13%;--sway:7s;--d:-1s', dim: 0, heads: [{ open: 1, yaw: 0.45, pitch: -0.5, size: 0.95 }, { t: 0.78, open: 0.2, dx: 30, dy: -34, size: 0.78 }] },
  { cls: 'plant--front', seed: 24, style: 'left:58%;width:44%;bottom:-12%;--sway:7.8s;--d:-4.5s', dim: 0, heads: [{ open: 1, yaw: -1.2, pitch: -0.3, size: 0.95 }] },
  { cls: 'plant--front', seed: 26, style: 'left:33%;width:26%;bottom:-10%;--sway:6s;--d:-5.5s', dim: 0.05, heads: [{ open: 0.3, yaw: 0.2, pitch: -1.1, size: 0.8 }], leafCount: 3 },
];

function envelopeFront() {
  return `<div class="env__postmark">${postmark()}</div><div class="env__stamp">${stamp()}</div>
    <div class="env__to"><span class="env__name">Lily</span><span class="env__sub">by hand &middot; with care</span></div>
    <div class="env__line" style="top:70%;width:52%"></div><div class="env__line" style="top:79%;width:40%"></div>`;
}
const FLAP_FRONT = `<svg viewBox="0 0 300 112" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="ffG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecdfc4"/><stop offset=".7" stop-color="#dfd0b1"/><stop offset="1" stop-color="#d2c3a3"/></linearGradient></defs><path d="M0 0 L300 0 L150 112 Z" fill="url(#ffG)"/><path d="M0 0 L300 0" stroke="rgba(255,250,236,.7)" stroke-width="2"/><path d="M0 0 L150 112 L300 0" fill="none" stroke="rgba(70,52,26,.18)" stroke-width="1"/></svg>`;
const FLAP_BACK = `<svg viewBox="0 0 300 112" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="fbG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#efe6d0"/><stop offset="1" stop-color="#dccfb2"/></linearGradient></defs><path d="M0 0 L300 0 L150 112 Z" fill="url(#fbG)"/><path d="M0 1 L300 1" stroke="rgba(80,60,30,.25)" stroke-width="1.5"/></svg>`;
const FLAP_SHADOW = `<svg viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="fsG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(0,0,0,.02)"/><stop offset="1" stop-color="rgba(0,0,0,.32)"/></linearGradient><filter id="fsB"><feGaussianBlur stdDeviation="3"/></filter></defs><path d="M0 0 L300 0 L150 120 Z" fill="url(#fsG)" filter="url(#fsB)"/></svg>`;
const POCKET = `<svg class="env__pocket-svg" viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden="true">
  <defs>
    <linearGradient id="pkL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#efe5cc"/><stop offset="1" stop-color="#dccdab"/></linearGradient>
    <linearGradient id="pkR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#ece1c7"/><stop offset="1" stop-color="#d7c7a5"/></linearGradient>
    <linearGradient id="pkB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f1e8d1"/><stop offset=".7" stop-color="#e4d7b9"/><stop offset="1" stop-color="#d9caa8"/></linearGradient>
  </defs>
  <path d="M0 0 L150 104 L0 200 Z" fill="url(#pkL)"/><path d="M300 0 L150 104 L300 200 Z" fill="url(#pkR)"/>
  <path d="M0 200 L150 92 L300 200 Z" fill="url(#pkB)"/>
  <path d="M0 200 L150 92 L300 200" fill="none" stroke="rgba(70,52,26,.28)" stroke-width="1"/>
  <path d="M0 0 L150 104 M300 0 L150 104" fill="none" stroke="rgba(70,52,26,.16)" stroke-width="1"/>
  <path d="M2 2 L150 104 M298 2 L150 104" fill="none" stroke="rgba(255,250,236,.5)" stroke-width=".8"/>
</svg>`;

export function createGarden(ctx) {
  const RM = ctx.reduced;
  const root = el('div', 'garden');
  root.innerHTML = `
    <div class="garden__sky"></div><div class="garden__moonlight"></div>
    <canvas class="garden__fx" aria-hidden="true"></canvas>
    ${hills()}
    <div class="garden__mist"></div>
    <div class="garden__ground"></div>
    ${grassStrip(3, 80)}
    <div class="garden__scene">
      ${PLANTS.map((p, i) => `<div class="plant ${p.cls}" style="${p.style}" role="img" aria-label="a white lily" tabindex="0" data-i="${i}">${lilyPlant({ seed: p.seed, heads: p.heads, dim: p.dim, leafCount: p.leafCount || 5, tall: p.tall })}</div>`).join('')}
      <div class="mb" role="button" tabindex="0" aria-label="A red mailbox on a cedar post. Tap to open it.">
        ${mailboxSVG()}
        <div class="mb__front" style="left:${DOOR.left}%;top:${DOOR.top}%;width:${DOOR.width}%;height:${DOOR.height}%">
          <div class="mb__env" aria-hidden="true"><div class="env__face env__face--mini">${envelopeFront()}</div></div>
          <div class="mb__door-shade"></div>
          <div class="mb__door"><div class="face face--front">${doorFrontSVG()}</div><div class="face face--back">${doorBackSVG()}</div></div>
          <div class="mb__hint"></div>
        </div>
      </div>
      <button class="mb__flag" type="button" aria-label="Lower the mailbox flag" aria-pressed="false">${flagSVG()}</button>
    </div>
    ${grassStrip(9, 60).replace('class="garden__grass"', 'class="garden__grass garden__grass--front"')}
    <p class="garden__words line">There’s something for you in the mailbox.</p>
    <div class="garden__dim"></div>
    <div class="env-stage">
      <div class="env" role="button" tabindex="-1" aria-label="An envelope addressed to Lily">
        <div class="env__shadow"></div>
        <div class="env__body">
          <div class="env__face env__face--front">${envelopeFront()}<div class="env__dimmer"></div></div>
          <div class="env__face env__face--back">
            <div class="env__backpanel"></div>
            <div class="env__letter"><div class="env__letter-paper"></div></div>
            <div class="env__pocket">${POCKET}</div>
            <div class="env__flap-shadow">${FLAP_SHADOW}</div>
            <div class="env__flap">
              <div class="flap-face flap-face--front">${FLAP_FRONT}<div class="env__seal">${seal()}</div></div>
              <div class="flap-face flap-face--back">${FLAP_BACK}</div>
            </div>
            <div class="env__dimmer"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="letter-stage">
      <div class="letter" role="button" tabindex="-1" aria-label="The letter. Tap to turn the page.">
        <div class="letter__sheet">
          <div class="letter__p letter__p--top"><div class="front">${NOTE.top.map(l => `<p>${l}</p>`).join('')}<div class="shade"></div></div><div class="back"></div></div>
          <div class="letter__p letter__p--mid"><div class="front">${NOTE.mid.map(l => `<p>${l}</p>`).join('')}</div></div>
          <div class="letter__p letter__p--bot"><div class="front">${NOTE.bot.map(l => `<p>${l}</p>`).join('')}<div class="shade"></div></div><div class="back"></div></div>
        </div>
      </div>
    </div>
    <p class="scene__cue cue env-cue"><span class="bracket">[</span> <span class="cue__text">tap the mailbox</span> <span class="bracket">]</span></p>`;

  const q = s => root.querySelector(s);
  const fx = q('.garden__fx'), fctx = fx.getContext('2d');
  const mb = q('.mb'), mbEnv = q('.mb__env'), flag = q('.mb__flag'), words = q('.garden__words'), cue = q('.env-cue'), cueText = q('.cue__text');
  const env = q('.env'), envBody = q('.env__body'), envFlap = q('.env__flap'), envLetter = q('.env__letter'), sealEl = q('.env__seal'), letter = q('.letter');
  const pTop = q('.letter__p--top'), pBot = q('.letter__p--bot');
  let state = 'closed';           // closed → opening → open → taking → front → flipping → back → breaking → letter
  let timers = [], tweens = [], gen = 0;   // gen: every reset bumps it, so stale continuations know to stop
  const later = (fn, ms) => { const g = gen; const t = setTimeout(() => { if (g === gen) fn(); }, ms); timers.push(t); return t; };
  // a tween that always completes: if frames stop coming (hidden tab, a stalled compositor) it is finished by a timer
  const run = (ms, ease, fn) => { const t = tween(ms, ease, fn); tweens.push(t); const guard = setTimeout(() => t.finish(), ms + 900); timers.push(guard); t.then(() => clearTimeout(guard)); return t; };
  const live = () => { const g = gen; return () => g === gen; };
  const clearLater = () => { gen++; timers.forEach(clearTimeout); timers = []; tweens.forEach(t => t.cancel()); tweens = []; };
  const setCue = (text) => { if (!text) { cue.classList.remove('is-in'); return; } cueText.textContent = text; cue.classList.add('is-in'); };

  // ---------- sizing ----------
  let W = 0, H = 0, dpr = 1;
  function measure() {
    const r = root.getBoundingClientRect(); W = max(1, r.width | 0); H = max(1, r.height | 0);
    dpr = min(window.devicePixelRatio || 1, 1.5);
    fx.width = W * dpr; fx.height = H * dpr; fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pad = H < 520 ? 100 : 170;
    const ew = min(W * 0.86, 420, (H - pad) * 1.5); env.style.width = ew + 'px'; env.style.setProperty('--ew', ew + 'px');
    const lw = min(W * 0.86, 400, (H - pad) / 1.38); letter.style.setProperty('--lw', lw + 'px');
    mbEnv.style.setProperty('--ew', mbEnv.offsetWidth + 'px');
    if (!stars.length) seedSky();
  }

  // ---------- sky: stars, fireflies, sparkles ----------
  let stars = [], flies = [], sparks = [], glow = null, t = 0, last = 0, raf = 0, running = false;
  function seedSky() {
    stars = []; for (let i = 0; i < 120; i++) stars.push({ x: hash(i, 1, 5) * W, y: hash(i, 2, 5) * H * 0.62, a: 0.15 + hash(i, 3, 5) * 0.6, sp: 0.4 + hash(i, 4, 5) * 1.4, ph: hash(i, 5, 5) * 6.28, big: hash(i, 6, 5) < 0.08 });
    flies = []; for (let i = 0; i < 16; i++) flies.push({ x: 0.05 * W + hash(i, 7, 5) * W * 0.9, y: H * (0.42 + hash(i, 8, 5) * 0.45), sp: 0.35 + hash(i, 9, 5) * 0.5, ph: hash(i, 10, 5) * 6.28, s: 0.7 + hash(i, 11, 5) * 0.8 });
    const g = document.createElement('canvas'); g.width = g.height = 48; const gc = g.getContext('2d');
    const gr = gc.createRadialGradient(24, 24, 0, 24, 24, 24); gr.addColorStop(0, 'rgba(232,242,170,1)'); gr.addColorStop(0.25, 'rgba(226,238,150,.55)'); gr.addColorStop(1, 'rgba(220,235,140,0)');
    gc.fillStyle = gr; gc.fillRect(0, 0, 48, 48); glow = g;
  }
  function spark(x, y, n = 8, opts = {}) {
    for (let i = 0; i < n; i++) sparks.push({ x, y, vx: (Math.random() - 0.5) * (opts.spread || 60), vy: -(20 + Math.random() * 50) * (opts.up || 1), g: opts.g || -10, life: 1.2 + Math.random() * 0.8, born: t, col: opts.col || 'rgba(243,234,217,', r: opts.r || 1.6 });
  }
  function frame(now) {
    if (!running) return; raf = requestAnimationFrame(frame);
    const dt = min(0.05, (now - last) / 1000) || 0.016; last = now; t += dt;
    fctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const a = s.a * (RM ? 0.8 : 0.6 + 0.4 * sin(t * s.sp + s.ph));
      fctx.fillStyle = `rgba(230,232,240,${a})`; fctx.fillRect(s.x, s.y, s.big ? 2 : 1.2, s.big ? 2 : 1.2);
    }
    for (const f of flies) {
      const x = RM ? f.x : f.x + 46 * noise2(f.ph * 10, t * 0.12 + f.ph), y = RM ? f.y : f.y + 34 * noise2(f.ph * 10 + 50, t * 0.1 + f.ph);
      const p = max(0, sin(t * f.sp + f.ph)); const a = p * p * p * 0.95;
      if (a > 0.02) { fctx.globalAlpha = a; const d = 22 * f.s; fctx.drawImage(glow, x - d / 2, y - d / 2, d, d); }
    }
    fctx.globalAlpha = 1;
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i], age = t - s.born; if (age > s.life) { sparks.splice(i, 1); continue; }
      s.vy -= s.g * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= 0.985;
      const a = (1 - age / s.life) * 0.9; fctx.fillStyle = s.col + a + ')';
      fctx.beginPath(); fctx.arc(s.x, s.y, s.r, 0, 6.283); fctx.fill();
    }
  }
  function start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  // ---------- the mailbox ----------
  function openMailbox({ fast = false } = {}) {
    if (state !== 'closed') return;
    state = 'opening'; clearLater();
    mb.classList.remove('is-hinting'); mb.classList.add('is-open'); words.classList.add('is-out'); setCue('');
    mb.setAttribute('aria-label', 'The mailbox is open. An envelope is inside. Tap to take it.');
    ctx.audio.sfx('creak');
    later(() => { state = 'open'; setCue('take the envelope'); }, fast ? 600 : RM ? 1000 : 1700);
  }
  // ---------- the envelope ----------
  function takeEnvelope() {
    if (state !== 'open') return;
    state = 'taking'; clearLater(); setCue('');
    // the big envelope starts exactly where the small one is, then comes to the hand
    const a = mbEnv.getBoundingClientRect(), b = env.getBoundingClientRect();
    const s = a.width / b.width, dx = (a.left + a.width / 2) - (b.left + b.width / 2), dy = (a.top + a.height / 2) - (b.top + b.height / 2);
    env.classList.add('is-in'); mbEnv.style.opacity = '0'; root.classList.add('is-dim');
    ctx.audio.sfx('paper');
    const dur = RM ? 600 : 1500, ok = live();
    run(dur, EASE.inOut, k => {
      const sc = s + (1 - s) * k, x = dx * (1 - k), y = dy * (1 - k) - 40 * sin(PI * k), rot = -8 * (1 - k);
      env.style.transform = `translate(${x}px, ${y}px) scale(${sc}) rotate(${rot}deg) rotateY(${-8 * (1 - k)}deg) rotateX(${6 * k}deg)`;
      env.style.setProperty('--near', k.toFixed(3));
    }).then(() => { if (!ok() || state !== 'taking') return; env.style.transform = ''; env.classList.add('is-held'); state = 'front'; setCue('turn it over'); env.tabIndex = 0; });
  }
  function flipEnvelope() {
    if (state !== 'front') return;
    state = 'flipping'; clearLater(); setCue(''); ctx.audio.sfx('paper');
    env.setAttribute('aria-label', 'The back of the envelope, closed with a red wax seal. Tap the seal to break it.');
    const dur = RM ? 600 : 1400, ok = live();
    run(dur, EASE.inOut, k => { envBody.style.transform = `rotateY(${180 * k}deg) translateZ(${26 * sin(PI * k)}px)`; })
      .then(() => { if (!ok() || state !== 'flipping') return; envBody.style.transform = 'rotateY(180deg)'; env.classList.add('is-flipped'); state = 'back'; setCue('break the seal'); });
  }
  function breakSeal() {
    if (state !== 'back') return;
    state = 'breaking'; clearLater(); setCue('');
    env.classList.add('is-cracking');
    const T = RM ? [100, 500, 1300, 2300, 3400] : [650, 1350, 3100, 4500, 6200];
    later(() => {
      env.classList.add('is-broken'); ctx.audio.sfx('seal');
      const r = sealEl.getBoundingClientRect(); spark(r.left + r.width / 2, r.top + r.height / 2, 10, { col: 'rgba(122,31,43,', spread: 120, up: 0.6, g: 220, r: 2 });
    }, T[0]);
    // the flap peels up from the seal, then falls open over the top edge
    later(() => { ctx.audio.sfx('paper'); run(RM ? 500 : 1500, EASE.hinge, k => { envFlap.style.transform = `translateZ(3px) rotateX(${-172 * k}deg)`; env.style.setProperty('--flap', k.toFixed(3)); }) }, T[1]);
    // the letter slides up out of the pocket
    later(() => { ctx.audio.sfx('paper'); run(RM ? 500 : 1300, EASE.inOut, k => { envLetter.style.transform = `translateZ(1px) translateY(${-62 * k}%)`; }); }, T[2]);
    later(() => liftLetter(), T[3]);
    // a deadline: if the animations above did not get her to the open letter, open it anyway
    later(() => { if (state === 'breaking') { tweens.forEach(t => t.finish()); letter.classList.add('is-in'); letter.style.transform = ''; envLetter.style.opacity = '0'; env.classList.add('is-away'); env.style.setProperty('--sink', '1'); letterOpen(); } }, T[4] + 4500);
  }
  function liftLetter() {
    // the folded letter takes over from the sheet in the pocket at the same place and size, then comes forward
    const a = envLetter.getBoundingClientRect(), b = letter.getBoundingClientRect();
    const ph = pTop.getBoundingClientRect().height, s = a.width / b.width;
    const dx = (a.left + a.width / 2) - (b.left + b.width / 2), dy = (a.top + a.height / 2) - (b.top + ph * 1.5);
    pTop.style.transform = 'translateZ(2px) rotateX(-180deg)'; pBot.style.transform = 'translateZ(-1px) rotateX(-180deg)';
    pTop.querySelector('.front').style.visibility = 'hidden'; pBot.querySelector('.front').style.visibility = 'hidden';
    letter.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;
    letter.classList.add('is-in', 'is-folding'); envLetter.style.opacity = '0';
    env.classList.add('is-away');
    const dur = RM ? 500 : 1300, ok = live();
    run(dur, EASE.inOut, k => {
      letter.style.transform = `translate(${dx * (1 - k)}px, ${dy * (1 - k)}px) scale(${s + (1 - s) * k})`;
      env.style.transform = `translateY(${18 * k}%) scale(${1 - 0.06 * k})`; env.style.setProperty('--sink', k.toFixed(3));
    }).then(() => { if (!ok() || state !== 'breaking') return; letter.style.transform = ''; return unfold(ok); });
  }
  async function unfold(ok) {
    const topFront = pTop.querySelector('.front'), botFront = pBot.querySelector('.front');
    const topShade = pTop.querySelector('.shade'), botShade = pBot.querySelector('.shade');
    ctx.audio.sfx('unfold');
    // the top panel lifts off the front of the sheet and lays flat above it
    await run(RM ? 600 : 1500, EASE.inOut, k => { const a = -180 * (1 - k); pTop.style.transform = `translateZ(2px) rotateX(${a}deg)`; topFront.style.visibility = a > -90 ? 'visible' : 'hidden'; topShade.style.opacity = String(sin(PI * k) * 0.9); });
    if (!ok() || state !== 'breaking') return;
    ctx.audio.sfx('paper');
    // the bottom panel drops down from behind
    await run(RM ? 600 : 1400, EASE.inOut, k => { const a = -180 * (1 - k); pBot.style.transform = `translateZ(-1px) rotateX(${a}deg)`; botFront.style.visibility = a > -90 ? 'visible' : 'hidden'; botShade.style.opacity = String(sin(PI * k) * 0.9); });
    if (!ok() || state !== 'breaking') return;
    letterOpen();
  }
  function letterOpen() {
    letter.classList.remove('is-folding'); letter.classList.add('is-open');
    pTop.style.transform = 'translateZ(2px) rotateX(0deg)'; pBot.style.transform = 'translateZ(-1px) rotateX(0deg)';
    pTop.querySelector('.front').style.visibility = 'visible'; pBot.querySelector('.front').style.visibility = 'visible';
    state = 'letter'; setCue('turn the page'); letter.tabIndex = 0; ctx.markLetterRead();
  }
  function putBackEnvelope() {
    // "back" from the envelope or the letter: everything returns to the mailbox
    clearLater(); setCue('');
    letter.classList.remove('is-in', 'is-folding', 'is-open', 'is-leaving'); letter.style.transform = '';
    pTop.style.transform = ''; pBot.style.transform = ''; pTop.querySelector('.front').style.visibility = ''; pBot.querySelector('.front').style.visibility = ''; pTop.querySelector('.shade').style.opacity = ''; pBot.querySelector('.shade').style.opacity = '';
    env.classList.remove('is-in', 'is-held', 'is-flipped', 'is-cracking', 'is-broken', 'is-away');
    env.style.transform = ''; env.style.opacity = ''; env.style.removeProperty('--near'); env.style.removeProperty('--flap'); env.style.removeProperty('--sink');
    envBody.style.transform = ''; envFlap.style.transform = ''; envLetter.style.transform = ''; envLetter.style.opacity = '';
    mbEnv.style.opacity = ''; root.classList.remove('is-dim');
    state = 'open';
    later(() => setCue('take the envelope'), 700);
  }

  mb.addEventListener('click', () => { if (state === 'closed') openMailbox(); else if (state === 'open') takeEnvelope(); });
  mb.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mb.click(); } });
  flag.addEventListener('click', e => {
    e.stopPropagation(); const down = flag.classList.toggle('is-down'); flag.setAttribute('aria-pressed', String(down)); ctx.audio.sfx('tick');
    const r = flag.getBoundingClientRect(); spark(r.left + r.width / 2, r.top + r.height * 0.2, 4, { spread: 30 });
  });
  root.querySelectorAll('.plant').forEach(sp => {
    const nod = () => {
      sp.classList.remove('is-nod'); void sp.offsetWidth; sp.classList.add('is-nod'); ctx.audio.sfx('note');
      const r = sp.getBoundingClientRect(); spark(r.left + r.width / 2, r.top + r.height * 0.25, 7, { spread: 50 });
    };
    sp.addEventListener('click', nod); sp.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nod(); } });
  });
  env.addEventListener('click', () => { if (state === 'front') flipEnvelope(); else if (state === 'back') breakSeal(); else if (state === 'letter') letter.click(); });
  env.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); env.click(); } });
  letter.addEventListener('click', () => { if (state === 'letter') { ctx.audio.sfx('page'); ctx.go('journal', { page: 0 }); } });
  letter.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); letter.click(); } });

  function onResize() { measure(); }
  function onVis() { document.hidden ? stop() : start(); }

  return {
    el: root,
    async enter({ resume, sub } = {}) {
      measure(); start();
      window.addEventListener('resize', onResize); document.addEventListener('visibilitychange', onVis);
      if (resume) {
        later(() => openMailbox({ fast: true }), 500);
        if (sub === 'envelope') later(() => takeEnvelope(), 1400);
        return;
      }
      later(() => words.classList.add('is-in'), RM ? 600 : 2200);
      later(() => { if (state === 'closed') { mb.classList.add('is-hinting'); setCue('tap the mailbox'); } }, RM ? 2200 : 5200);
    },
    back() {
      if (['front', 'back', 'letter', 'flipping', 'breaking', 'taking'].includes(state)) { putBackEnvelope(); return true; }
      return false;
    },
    replay() {
      clearLater(); putBackEnvelope(); clearLater();
      mb.classList.remove('is-open', 'is-hinting'); mb.classList.add('is-closing'); words.classList.remove('is-out', 'is-in');
      later(() => { mb.classList.remove('is-closing'); state = 'closed'; words.classList.add('is-in'); }, 1200);
      later(() => { if (state === 'closed') { mb.classList.add('is-hinting'); setCue('tap the mailbox'); } }, 3200);
    },
    async exit({ reveal }) {
      setCue('');
      reveal();                                   // the journal is already drawn beneath before anything here fades
      root.classList.add('is-leaving');
      if (state === 'letter') { letter.classList.add('is-leaving'); await wait(RM ? 200 : 420); }
      await wait(120);
    },
    destroy() { stop(); clearLater(); window.removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', onVis); },
  };
}
