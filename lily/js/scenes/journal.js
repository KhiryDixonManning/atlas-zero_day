// Scene 4 and 5 — the journal, one page at a time, and the pressed lily on the last page.
import { el, wait, hash } from '../util.js';
import { PAGES } from '../content.js';
import { NOTE } from '../content.js';
import { JOURNAL_ART, pressedLily } from '../art.js';

const GLYPHS = 'theartofnoticinglily';
const ART_LAYOUT = { inklily: 'wide', sticker: 'float', leaf: 'float', notes: 'wide', bubbles: 'wide', outfits: 'tall', tag: 'tall', comforts: 'wide', headphones: 'float', bench: 'wide' };
const words = t => t.split(' ').map(w => `<span class="w">${w}</span>`).join(' ');

export function createJournal(ctx) {
  const RM = ctx.reduced;
  const root = el('div', 'journal');
  const N = PAGES.length;
  root.innerHTML = `
    <div class="journal__light"></div>
    <div class="book" aria-roledescription="book" aria-label="The journal"></div>
    <p class="journal__count" aria-hidden="true"></p>
    <div class="journal__ctl">
      <button class="journal__btn journal__prev" type="button" aria-label="Previous page"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
      <div class="journal__dots" role="tablist" aria-label="Pages"></div>
      <button class="journal__btn journal__next" type="button" aria-label="Next page"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
    </div>`;
  const book = root.querySelector('.book'), dots = root.querySelector('.journal__dots'), count = root.querySelector('.journal__count');
  const prevB = root.querySelector('.journal__prev'), nextB = root.querySelector('.journal__next');

  // ---------- build the pages ----------
  const pageEls = PAGES.map((p, i) => {
    const page = el('div', 'page' + (p.kind === 'finale' ? ' page--finale' : ''));
    page.style.zIndex = String(N - i);
    page.setAttribute('role', 'tabpanel'); page.setAttribute('aria-label', `Page ${i + 1} of ${N}: ${p.title}`);
    let inner = `<p class="page__num">${i + 1} / ${N}</p><h2 class="page__title">${p.title}</h2>`;
    if (p.kind === 'note') {
      inner += `<div class="page__body">${[...NOTE.top, ...NOTE.mid, ...NOTE.bot].map((l, k) => `<p${k === 0 ? ' style="margin-bottom:.9em"' : ''}>${l}</p>`).join('')}</div>`;
    } else if (p.kind === 'finale') {
      inner += `<div class="pl" role="button" tabindex="0" aria-label="A pressed lily. Touch it.">${pressedLily()}</div>
        <p class="page__hint">touch the lily</p>
        <p class="finale__caption">${p.caption || ''}</p>
        <div class="finale__text page__body">${p.closing.map(t => `<p>${words(t)}</p>`).join('')}<p class="finale__sign">${words(p.sign)}</p></div>
        <div class="finale__actions">
          <button class="finale__btn" type="button" data-act="letter">read the letter again</button>
          <button class="finale__btn" type="button" data-act="garden">back to the garden</button>
          <button class="finale__btn" type="button" data-act="restart">start from the beginning</button>
        </div>`;
    } else {
      const layout = ART_LAYOUT[p.art] || 'wide';
      const art = `<figure class="page__art page__art--${layout} page__art--${p.art}" tabindex="0" role="button" aria-label="${p.hint || 'an illustration'}">${JOURNAL_ART[p.art]()}</figure>`;
      const body = `<div class="page__body">${p.body.map(t => `<p>${t}</p>`).join('')}</div>`;
      inner += layout === 'float' ? art + body : body + art;
      if (p.hint) inner += `<p class="page__hint">${p.hint}</p>`;
    }
    if (p.margin) { inner += `<div class="page__margin" aria-live="polite">${p.margin}</div>`; page.classList.add('has-note'); }
    page.innerHTML = `<div class="page__front"><div class="page__inner">${inner}</div>${p.margin ? '<button class="page__corner" type="button" aria-label="A note in the margin"></button>' : ''}<div class="page__fade"></div><div class="page__shade"></div></div><div class="page__back"></div>`;
    const innerEl = page.querySelector('.page__inner'); innerEl.addEventListener('scroll', () => trackScroll(page), { passive: true });
    const marginEl = page.querySelector('.page__margin'); if (marginEl) page.querySelector('.page__front').appendChild(marginEl);
    book.appendChild(page);
    const d = el('button', 'journal__dot'); d.type = 'button'; d.setAttribute('role', 'tab'); d.setAttribute('aria-label', `Page ${i + 1}`); d.addEventListener('click', () => jump(i)); dots.appendChild(d);
    return page;
  });

  function trackScroll(page) {
    const inner = page.querySelector('.page__inner');
    page.classList.toggle('is-scrollable', inner.scrollHeight > inner.clientHeight + 4);
    page.classList.toggle('is-at-end', inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 6);
  }
  const onResize = () => pageEls.forEach(trackScroll);
  // ---------- turning ----------
  let cur = 0, busy = false;
  function show(n, { animate = true, dir = 1 } = {}) {
    n = Math.max(0, Math.min(N - 1, n));
    for (let i = 0; i < N; i++) { const pg = pageEls[i]; const turned = i < n; pg.classList.toggle('is-turned', turned); pg.classList.toggle('is-hidden', turned); pg.classList.remove('is-turning'); }
    cur = n; sync();
  }
  function arrive() {
    pageEls.forEach((pg, i) => { if (i !== cur) pg.classList.remove('is-noted'); });
    if (ink && cur === 0) requestAnimationFrame(() => ink.classList.add('is-drawn'));
  }
  function sync() {
    dots.querySelectorAll('.journal__dot').forEach((d, i) => { d.classList.toggle('is-on', i === cur); d.setAttribute('aria-selected', String(i === cur)); });
    count.textContent = `${cur + 1} / ${N}`;
    prevB.disabled = cur === 0; nextB.disabled = cur === N - 1;
    ctx.setPage(cur);
    pageEls[cur].querySelector('.page__inner').scrollTop = 0;
    arrive();
    requestAnimationFrame(() => trackScroll(pageEls[cur]));
  }
  async function next() {
    if (busy || cur >= N - 1) return; busy = true;
    const pg = pageEls[cur]; pg.classList.add('is-turning', 'is-turned'); ctx.audio.sfx('page');
    cur++; sync();
    await wait(RM ? 700 : 1150);
    pg.classList.remove('is-turning'); pg.classList.add('is-hidden'); busy = false;
  }
  async function prev() {
    if (busy || cur <= 0) return; busy = true;
    const pg = pageEls[cur - 1]; pg.classList.remove('is-hidden'); pg.classList.add('is-turning');
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    pg.classList.remove('is-turned'); ctx.audio.sfx('page');
    cur--; sync();
    await wait(RM ? 700 : 1150);
    pg.classList.remove('is-turning'); busy = false;
  }
  async function jump(n) {
    if (busy || n === cur) return;
    if (Math.abs(n - cur) === 1) return n > cur ? next() : prev();
    busy = true; book.classList.add('is-jumping'); ctx.audio.sfx('page');
    await wait(480); show(n); await new Promise(r => requestAnimationFrame(r));
    book.classList.remove('is-jumping'); await wait(480); busy = false;
  }
  prevB.addEventListener('click', prev); nextB.addEventListener('click', next);
  // drag to turn: the page follows her finger, then completes or settles back
  let drag = null;
  book.addEventListener('pointerdown', e => {
    if (busy || e.button > 0) return;
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, mode: null, pg: null };
  });
  book.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.mode) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      if (Math.abs(dy) > Math.abs(dx)) { drag = null; return; }               // she is scrolling the page
      if (dx < 0 && cur < N - 1) { drag.mode = 'next'; drag.pg = pageEls[cur]; }
      else if (dx > 0 && cur > 0) { drag.mode = 'prev'; drag.pg = pageEls[cur - 1]; drag.pg.classList.remove('is-hidden'); }
      else { drag = null; return; }
      drag.pg.classList.add('is-dragging', 'is-turning'); try { book.setPointerCapture(e.pointerId); } catch {}
    }
    drag.dx = dx;
    const w = book.clientWidth, k = Math.max(0, Math.min(1, Math.abs(dx) / (w * 0.9)));
    const ang = drag.mode === 'next' ? -180 * k * 0.92 : -180 + 180 * k * 0.92;
    drag.pg.style.transform = RM ? '' : `rotateY(${ang}deg)`;
    if (RM) drag.pg.style.opacity = drag.mode === 'next' ? String(1 - k) : String(k);
  });
  const endDrag = async e => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    if (!d.mode) return;
    const w = book.clientWidth, commit = Math.abs(d.dx) > w * 0.22;
    d.pg.classList.remove('is-dragging'); d.pg.classList.add('is-settling'); d.pg.style.transform = ''; d.pg.style.opacity = '';
    busy = true;
    if (commit) {
      ctx.audio.sfx('page');
      if (d.mode === 'next') { d.pg.classList.add('is-turned'); cur++; } else { d.pg.classList.remove('is-turned'); cur--; }
      sync();
    } else if (d.mode === 'prev') { d.pg.classList.add('is-turned'); }
    await wait(650);
    d.pg.classList.remove('is-settling', 'is-turning');
    if (d.pg.classList.contains('is-turned')) d.pg.classList.add('is-hidden');
    busy = false;
  };
  book.addEventListener('pointerup', endDrag); book.addEventListener('pointercancel', endDrag);
  const onKey = e => { if (e.target.closest('#menu')) return; if (e.key === 'ArrowRight' || e.key === 'PageDown') next(); else if (e.key === 'ArrowLeft' || e.key === 'PageUp') prev(); };

  // ---------- discoveries ----------
  const on = (sel, fn) => { const n = root.querySelector(sel); if (!n) return; const h = e => { e.stopPropagation(); fn(n, e); }; n.addEventListener('click', h); n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); h(e); } }); };
  // the sticker peels, then multiplies
  const stickerFig = root.querySelector('.page__art--sticker');
  if (stickerFig) {
    const svg = stickerFig.querySelector('svg'); const wrap = el('div', 'sticker'); svg.replaceWith(wrap); wrap.appendChild(svg); stickerFig.style.position = 'relative';
    const under = PAGES.find(p => p.art === 'sticker').under; if (under) stickerFig.appendChild(el('div', 'sticker__under', under));
    let taps = 0;
    on('.page__art--sticker', () => {
      taps++; wrap.classList.toggle('is-peeled'); ctx.audio.sfx('sticker');
      if (taps >= 2 && taps <= 4) { const m = el('div', 'sticker__mini'); m.innerHTML = JOURNAL_ART.sticker(); const r = Math.random() * 60 - 30; m.style.setProperty('--r', r + 'deg'); m.style.left = (Math.random() * 70) + '%'; m.style.top = (Math.random() * 60 + 20) + '%'; stickerFig.appendChild(m); }
    });
  }
  on('.page__art--bubbles', n => { n.classList.toggle('is-real'); ctx.audio.sfx('tick'); });
  on('.page__art--leaf', n => { n.classList.add('is-lifted'); ctx.audio.sfx('flutter'); setTimeout(() => n.classList.remove('is-lifted'), 1500); });
  // margin notes
  root.querySelectorAll('.page__corner').forEach(c => c.addEventListener('click', e => { e.stopPropagation(); const pg = c.closest('.page'); const open = pg.classList.toggle('is-noted'); c.setAttribute('aria-expanded', String(open)); ctx.audio.sfx(open ? 'paper' : 'tick'); }));
  // the ink lily draws itself when its page is in view
  const ink = root.querySelector('.page__art--inklily');
  if (ink) {
    const paths = [...ink.querySelectorAll('.ink__s')]; let acc = 0;
    paths.forEach(pth => { const L = pth.getTotalLength ? pth.getTotalLength() : 600; pth.style.setProperty('--len', L); const dur = Math.min(1.6, 0.25 + L / 420); pth.style.setProperty('--dur', dur + 's'); pth.style.setProperty('--delay', acc + 's'); acc += dur * 0.55; });
    ink.dataset.total = acc;
  }
  on('.page__art--notes', n => {
    n.classList.add('is-on'); ctx.audio.sfx('tick');
    const body = n.closest('.page__inner').querySelector('.page__body'); const last = body.querySelector('p:last-child');
    if (last && !last.querySelector('.hl')) last.innerHTML = last.innerHTML.replace('you read me just fine', '<span class="hl">you read me just fine</span>');
    requestAnimationFrame(() => { const hl = last && last.querySelector('.hl'); if (hl) setTimeout(() => hl.classList.add('is-on'), 500); });
  });
  const outfits = root.querySelector('.page__art--outfits'); if (outfits) { outfits.dataset.outfit = '0'; on('.page__art--outfits', n => { n.dataset.outfit = String((+n.dataset.outfit + 1) % 3); ctx.audio.sfx('paper'); }); }
  on('.page__art--tag', n => { if (n.classList.contains('is-untagged')) return; n.classList.add('is-untagged'); ctx.audio.sfx('flutter'); setTimeout(() => ctx.audio.sfx('chime'), 1000); });
  let catTaps = 0;
  on('.cat', n => {
    n.classList.remove('is-purring', 'is-curious'); void n.getBoundingClientRect();
    if (catTaps++ % 3 === 2) { n.classList.add('is-curious'); ctx.audio.sfx('tick'); setTimeout(() => n.classList.remove('is-curious'), 1100); }
    else { n.classList.add('is-purring'); ctx.audio.sfx('purr'); setTimeout(() => n.classList.remove('is-purring'), 1700); }
  });
  on('.bowl', n => { n.classList.remove('is-crunch'); void n.getBoundingClientRect(); n.classList.add('is-crunch'); ctx.audio.sfx('crunch'); setTimeout(() => n.classList.remove('is-crunch'), 700); });
  on('.dumpling', n => { n.classList.remove('is-steam'); void n.getBoundingClientRect(); n.classList.add('is-steam'); ctx.audio.sfx('tick'); setTimeout(() => n.classList.remove('is-steam'), 1900); });
  on('.page__art--headphones', n => {
    const g = n.querySelector('.hp__notes');
    for (let i = 0; i < 4; i++) {
      const tx = document.createElementNS('http://www.w3.org/2000/svg', 'text'); tx.setAttribute('class', 'hp__note'); tx.textContent = i % 2 ? '♫' : '♪';
      tx.setAttribute('x', String(-20 + Math.random() * 40)); tx.setAttribute('y', '0'); tx.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px'); tx.style.animationDelay = (i * 0.22) + 's';
      g.appendChild(tx); setTimeout(() => tx.remove(), 2600 + i * 220);
      setTimeout(() => ctx.audio.sfx('note'), i * 260);
    }
  });
  // the pressed lily
  const pl = root.querySelector('.pl'), finaleText = root.querySelector('.finale__text');
  let bloomed = false;
  function bloomLily() {
    if (bloomed) return; bloomed = true;
    pl.classList.add('is-blooming'); pl.setAttribute('aria-label', 'The lily is blooming.'); ctx.audio.sfx('bloom');
    if (!RM) for (let i = 0; i < 26; i++) {
      const s = el('span', 'pl__glyph'); s.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      s.style.setProperty('--x0', (Math.random() * 80 - 40) + 'px'); s.style.setProperty('--x1', (Math.random() * 160 - 80) + 'px'); s.style.setProperty('--y1', -(60 + Math.random() * 120) + 'px');
      s.style.setProperty('--d', (0.3 + Math.random() * 2.2) + 's'); s.style.fontSize = (12 + Math.random() * 12) + 'px'; pl.appendChild(s); setTimeout(() => s.remove(), 6000);
    }
    const W = [...finaleText.querySelectorAll('.w')]; W.forEach((w, i) => w.style.setProperty('--d', (i * 0.085) + 's'));
    const settle = RM ? 1200 : 4600;                       // the petals finish opening around 4.4s
    setTimeout(() => { pl.classList.add('is-alive'); }, settle);
    setTimeout(() => { finaleText.classList.add('is-in'); if (!RM) ctx.audio.sfx('paper'); }, settle + (RM ? 300 : 900));
    setTimeout(() => { const inner = pl.closest('.page__inner'); inner.scrollTo({ top: Math.max(0, finaleText.offsetTop - 24), behavior: RM ? 'auto' : 'smooth' }); }, settle + (RM ? 600 : 1600));
  }
  if (pl) { pl.addEventListener('click', bloomLily); pl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bloomLily(); } }); }
  root.querySelectorAll('.finale__btn').forEach(b => b.addEventListener('click', () => {
    ctx.audio.sfx('tick'); const a = b.dataset.act;
    if (a === 'letter') jump(0); else if (a === 'garden') ctx.go('garden', { quick: true, resume: true }); else if (a === 'restart') ctx.restart();
  }));

  return {
    el: root,
    async enter({ page = 0 } = {}) {
      show(page < 0 ? N - 1 : page, { animate: false });
      document.addEventListener('keydown', onKey); window.addEventListener('resize', onResize);
      requestAnimationFrame(onResize);
      // a tiny settle: the page beneath the letter is the same note, so nothing jumps
    },
    back() { if (cur > 0) { prev(); return true; } return false; },
    replay() { if (cur === N - 1 && bloomed) { bloomed = false; pl.classList.remove('is-blooming', 'is-alive'); finaleText.classList.remove('is-in'); pl.closest('.page__inner').scrollTo({ top: 0 }); } else jump(0); },
    async exit({ reveal }) { reveal(); await wait(100); },
    destroy() { document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); },
  };
}
