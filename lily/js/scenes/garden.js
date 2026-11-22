// Scene 2 and 3 — the garden, the mailbox, the envelope, the letter.
// One module, so the envelope can leave the mailbox and the letter can leave the envelope without a cut.
import { el, wait, hash, noise2, clamp, smooth } from '../util.js';
import { lilySprig, grassStrip, hills, mailboxBody, mailboxDoorFront, mailboxDoorBack, mailboxFlag, stamp, postmark, seal } from '../art.js';
import { NOTE } from '../content.js';

const { sin, cos, min, max, PI } = Math;

export function createGarden(ctx) {
  const RM = ctx.reduced;
  const root = el('div', 'garden');
  const sprig = (cls, seed, style, opts) => `<div class="sprig ${cls}" style="${style}" role="img" aria-label="a lily" tabindex="0">${lilySprig(seed, opts)}</div>`;
  root.innerHTML = `
    <div class="garden__sky"></div><div class="garden__moonlight"></div>
    <canvas class="garden__fx" aria-hidden="true"></canvas>
    ${hills()}
    <div class="garden__mist"></div>
    <div class="garden__ground"></div>
    ${grassStrip(3, 80)}
    <div class="garden__scene">
      ${sprig('', 11, 'left:-20%;width:48%;bottom:3%;--sway:7.5s;--nod:5.2s;--delay:-2s', { scaleHead: 0.95 })}
      ${sprig('sprig--flip', 12, 'left:68%;width:46%;bottom:1%;--sway:8.5s;--nod:6s;--delay:-4s', { bud: false, scaleHead: 1.05 })}
      <div class="mb" role="button" tabindex="0" aria-label="A vintage red mailbox on a wooden post. Tap to open it.">
        <div class="mb__shadow"></div>
        ${mailboxBody()}
        <div class="mb__front">
          <div class="mb__env" aria-hidden="true"></div>
          <div class="mb__door-shade"></div>
          <div class="mb__door"><div class="face face--front">${mailboxDoorFront()}</div><div class="face face--back">${mailboxDoorBack()}</div></div>
        </div>
        <div class="mb__hint"></div>
      </div>
      <button class="mb__flag" type="button" aria-label="Lower the mailbox flag" aria-pressed="false">${mailboxFlag()}</button>
      ${sprig('', 13, 'left:-4%;width:42%;bottom:-5%;--sway:6.5s;--nod:4.6s;--delay:-1s', { scaleHead: 1 })}
      ${sprig('sprig--flip', 14, 'left:58%;width:44%;bottom:-7%;--sway:7s;--nod:5.5s;--delay:-3s', { scaleHead: 1.1 })}
      ${sprig('', 15, 'left:84%;width:34%;bottom:-3%;--sway:9s;--nod:6.5s;--delay:-5s', { bud: true, scaleHead: 0.8, open: 0.8 })}
    </div>
    ${grassStrip(9, 60).replace('class="garden__grass"', 'class="garden__grass garden__grass--front"')}
    <p class="garden__words line">There’s something for you in the mailbox.</p>
    <div class="garden__dim"></div>
    <div class="env-stage">
      <div class="env" role="button" tabindex="-1" aria-label="An envelope addressed to Lily">
        <div class="env__body">
          <div class="env__face env__face--front">
            <div class="env__postmark">${postmark()}</div>
            <div class="env__stamp">${stamp()}</div>
            <div class="env__to"><span class="env__name">Lily</span><span class="env__sub">by hand &middot; with care</span></div>
            <div class="env__line" style="top:70%;width:52%"></div><div class="env__line" style="top:79%;width:40%"></div>
          </div>
          <div class="env__face env__face--back">
            <div class="env__letter"><div class="env__letter-fold"></div></div>
            <div class="env__pocket"><svg viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden="true">
              <defs><linearGradient id="pkL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#eee3c9"/><stop offset="1" stop-color="#ddcfae"/></linearGradient>
              <linearGradient id="pkR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#eadfc4"/><stop offset="1" stop-color="#d8caa9"/></linearGradient>
              <linearGradient id="pkB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f1e7cf"/><stop offset="1" stop-color="#dfd2b3"/></linearGradient></defs>
              <path d="M0 0 L150 104 L0 200 Z" fill="url(#pkL)"/><path d="M300 0 L150 104 L300 200 Z" fill="url(#pkR)"/>
              <path d="M0 200 L150 96 L300 200 Z" fill="url(#pkB)"/>
              <path d="M0 200 L150 96 L300 200" fill="none" stroke="rgba(80,60,30,.22)" stroke-width="1"/>
              <path d="M0 0 L150 104 M300 0 L150 104" fill="none" stroke="rgba(80,60,30,.14)" stroke-width="1"/>
            </svg></div>
            <div class="env__flap-shadow"></div>
            <div class="env__flap"><div class="flap-face flap-face--front"></div><div class="flap-face flap-face--back"></div><div class="env__seal">${seal()}</div></div>
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
  const env = q('.env'), envLetter = q('.env__letter'), sealEl = q('.env__seal'), letter = q('.letter');
  let state = 'closed';           // closed → open → front → back → opened → letter
  let timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const clearLater = () => { timers.forEach(clearTimeout); timers = []; };
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
    later(() => { state = 'open'; setCue('take the envelope'); }, fast ? 600 : RM ? 1000 : 1500);
  }
  function takeEnvelope() {
    if (state !== 'open') return;
    state = 'taking'; clearLater(); setCue('');
    // FLIP: the big envelope starts where the small one is, then travels to the centre
    const a = mbEnv.getBoundingClientRect(), b = env.getBoundingClientRect();
    const s = a.width / b.width, dx = (a.left + a.width / 2) - (b.left + b.width / 2), dy = (a.top + a.height / 2) - (b.top + b.height / 2);
    env.style.transition = 'none'; env.style.transform = `translate(${dx}px, ${dy}px) scale(${s}) rotate(-7deg)`;
    void env.offsetWidth;
    env.classList.add('is-in'); env.style.transition = ''; env.style.transform = '';
    mbEnv.style.opacity = '0'; root.classList.add('is-dim');
    ctx.audio.sfx('paper');
    later(() => { state = 'front'; setCue('turn it over'); env.tabIndex = 0; env.focus({ preventScroll: true }); }, RM ? 700 : 1500);
  }
  function flipEnvelope() {
    if (state !== 'front') return;
    state = 'flipping'; clearLater(); setCue(''); env.classList.add('is-flipped'); ctx.audio.sfx('paper');
    env.setAttribute('aria-label', 'The back of the envelope, closed with a red wax seal. Tap the seal to break it.');
    later(() => { state = 'back'; setCue('break the seal'); }, RM ? 700 : 1500);
  }
  function breakSeal() {
    if (state !== 'back') return;
    state = 'breaking'; clearLater(); setCue('');
    env.classList.add('is-cracking');
    later(() => {
      env.classList.add('is-broken'); ctx.audio.sfx('seal');
      const r = sealEl.getBoundingClientRect(); spark(r.left + r.width / 2, r.top + r.height / 2, 10, { col: 'rgba(122,31,43,', spread: 120, up: 0.6, g: 220, r: 2 });
    }, RM ? 100 : 650);
    later(() => { env.classList.add('is-opened'); ctx.audio.sfx('paper'); }, RM ? 500 : 1350);
    later(() => { env.classList.add('is-rising'); }, RM ? 1000 : 2600);
    later(() => liftLetter(), RM ? 1600 : 3800);
  }
  function liftLetter() {
    // FLIP again: the letter leaves the envelope and comes forward, then unfolds
    const a = envLetter.getBoundingClientRect(), b = letter.getBoundingClientRect();
    const topPanel = letter.querySelector('.letter__p--top'); const ph = topPanel.getBoundingClientRect().height;
    const s = a.width / b.width;
    const dx = (a.left + a.width / 2) - (b.left + b.width / 2), dy = (a.top + a.height / 2) - (b.top + ph * 1.5);
    letter.style.transition = 'none'; letter.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`; letter.classList.add('is-folding');
    void letter.offsetWidth;
    letter.classList.add('is-in'); envLetter.style.opacity = '0';
    letter.style.transition = 'transform 1.3s cubic-bezier(.22,.61,.36,1)'; letter.style.transform = '';
    env.classList.add('is-away');
    env.style.transition = 'transform 1.4s cubic-bezier(.22,.61,.36,1), opacity 1.2s ease'; env.style.transform = 'translateY(22%) scale(.92)'; env.style.opacity = '0';
    later(() => { letter.classList.add('is-open1'); ctx.audio.sfx('unfold'); }, RM ? 400 : 1300);
    later(() => { letter.classList.add('is-open2'); ctx.audio.sfx('paper'); }, RM ? 900 : 2600);
    later(() => { letter.classList.remove('is-folding'); state = 'letter'; setCue('turn the page'); letter.tabIndex = 0; letter.focus({ preventScroll: true }); ctx.markLetterRead(); }, RM ? 1500 : 3900);
  }
  function putBackEnvelope() {
    // "back" from the envelope or the letter: everything returns to the mailbox
    clearLater(); setCue('');
    letter.classList.remove('is-in', 'is-open1', 'is-open2', 'is-folding'); letter.style.transform = ''; letter.style.transition = '';
    env.classList.remove('is-in', 'is-flipped', 'is-cracking', 'is-broken', 'is-opened', 'is-rising', 'is-away');
    env.style.transition = 'opacity .6s ease'; env.style.opacity = ''; env.style.transform = '';
    envLetter.style.opacity = ''; mbEnv.style.opacity = ''; root.classList.remove('is-dim');
    later(() => { env.style.transition = ''; state = 'open'; setCue('take the envelope'); }, 700);
  }

  mb.addEventListener('click', () => { if (state === 'closed') openMailbox(); else if (state === 'open') takeEnvelope(); });
  mb.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mb.click(); } });
  flag.addEventListener('click', e => {
    e.stopPropagation(); const down = flag.classList.toggle('is-down'); flag.setAttribute('aria-pressed', String(down)); ctx.audio.sfx('tick');
    const r = flag.getBoundingClientRect(); spark(r.left + r.width / 2, r.top + r.height * 0.2, 4, { spread: 30 });
  });
  root.querySelectorAll('.sprig').forEach(sp => {
    const nod = () => {
      sp.classList.remove('is-nod'); void sp.offsetWidth; sp.classList.add('is-nod'); ctx.audio.sfx('note');
      const r = sp.getBoundingClientRect(); spark(r.left + r.width / 2, r.top + r.height * 0.3, 7, { spread: 50 });
    };
    sp.addEventListener('click', nod); sp.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nod(); } });
  });
  env.addEventListener('click', () => { if (state === 'front') flipEnvelope(); else if (state === 'back') breakSeal(); });
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
        // coming back: the mailbox is already open, or she is straight back at the envelope
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
    async exit({ reveal }) { setCue(''); reveal(); await wait(200); },
    destroy() { stop(); clearLater(); window.removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', onVis); },
  };
}
