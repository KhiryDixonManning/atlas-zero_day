// The Art of Noticing — Lily. Scene router, navigation, persistence.
import { el, wait, reduced } from './util.js';
import { audio } from './audio.js';
import { createBloom } from './scenes/bloom.js';
import { createGarden } from './scenes/garden.js';
import { createJournal } from './scenes/journal.js';

const ORDER = ['bloom', 'garden', 'journal'];
const FACTORIES = { bloom: createBloom, garden: createGarden, journal: createJournal };
const STORE_KEY = 'aon.lily.v1';

const stage = document.getElementById('stage');
const nav = document.getElementById('nav');
const navBack = document.getElementById('navBack');
const navSound = document.getElementById('navSound');
const navMenu = document.getElementById('navMenu');
const menu = document.getElementById('menu');
const boot = document.getElementById('boot');

const state = {
  current: null,          // { name, api, el }
  busy: false,
  progress: 0,            // highest scene index reached (unlocks "read the letter again")
  letterRead: false,
  page: 0,
};

// ---------- persistence (session only: refreshing keeps her place, a new visit starts fresh) ----------
function load() {
  try { const s = JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}'); Object.assign(state, { progress: s.progress | 0, letterRead: !!s.letterRead, page: s.page | 0 }); } catch { /* ignore */ }
}
function save() {
  try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ progress: state.progress, letterRead: state.letterRead, page: state.page })); } catch { /* ignore */ }
}

// ---------- scene context handed to every scene ----------
const ctx = {
  audio,
  reduced: reduced(),
  go: (name, opts) => go(name, opts),
  setPage: p => { state.page = p; save(); history.replaceState(null, '', `#/journal/${p}`); },
  markLetterRead: () => { state.letterRead = true; save(); refreshMenu(); },
  restart: () => { state.progress = 0; state.page = 0; save(); go('bloom', { quick: true }); },
};

async function go(name, opts = {}) {
  if (state.busy) return;
  if (!FACTORIES[name]) name = 'bloom';
  state.busy = true;
  closeMenu();
  const prev = state.current;
  const api = FACTORIES[name](ctx);
  const node = api.el;
  node.classList.add('scene');
  if (opts.quick) node.classList.add('is-quick');
  stage.appendChild(node);
  // the leaving scene stays on top while it dissolves over the arriving one
  if (prev) { prev.el.style.zIndex = '2'; prev.el.style.pointerEvents = 'none'; }
  node.style.zIndex = '1';

  const idx = ORDER.indexOf(name);
  if (idx > state.progress) state.progress = idx;
  if (name === 'journal' && opts.page != null) state.page = opts.page;
  save();
  history.replaceState(null, '', name === 'journal' ? `#/journal/${state.page}` : `#/${opts.sub || name}`);

  state.current = { name, api, el: node };
  updateNav(name);

  // enter the new scene (it decides when it is ready to be shown)
  let leaving = Promise.resolve();
  const reveal = () => { node.classList.add('is-in'); };
  if (prev) {
    leaving = Promise.resolve(prev.api.exit ? prev.api.exit({ reveal }) : null).then(() => {
      reveal();
      prev.el.classList.remove('is-in');
      const t = opts.quick || ctx.reduced ? 700 : 1700;
      return wait(t).then(() => { prev.api.destroy && prev.api.destroy(); prev.el.remove(); });
    });
  }
  await api.enter({ ...opts, page: state.page, reveal });
  if (!prev) reveal();
  await leaving;
  state.busy = false;
}

// ---------- navigation ----------
function updateNav(name) {
  nav.classList.add('is-in');
  navBack.hidden = name === 'bloom';
}
function prevOf(name) { const i = ORDER.indexOf(name); return i > 0 ? ORDER[i - 1] : null; }

navBack.addEventListener('click', () => {
  const cur = state.current; if (!cur || state.busy) return;
  audio.sfx('tick');
  // a scene may handle "back" internally (e.g. closing the envelope, turning back a page)
  if (cur.api.back && cur.api.back()) return;
  const p = prevOf(cur.name);
  if (p) go(p, { quick: true, resume: true });
});

navSound.addEventListener('click', async () => {
  const on = await audio.toggle();
  navSound.classList.toggle('is-on', on);
  navSound.setAttribute('aria-pressed', String(on));
  navSound.setAttribute('aria-label', on ? 'Sound on. Turn sound off' : 'Sound off. Turn sound on');
  navSound.querySelector('.sound__label').textContent = on ? 'sound on' : 'sound off';
});

function openMenu() {
  refreshMenu();
  menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false'); navMenu.setAttribute('aria-expanded', 'true');
  menu.querySelector('.menu__item:not([disabled])').focus();
}
function closeMenu() {
  if (!menu.classList.contains('is-open')) return;
  menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true'); navMenu.setAttribute('aria-expanded', 'false');
}
function refreshMenu() {
  const cur = state.current ? state.current.name : 'bloom';
  menu.querySelector('[data-go="garden"]').disabled = state.progress < 1 || cur === 'garden';
  menu.querySelector('[data-go="letter"]').disabled = state.progress < 2;
}
navMenu.addEventListener('click', () => { audio.sfx('tick'); menu.classList.contains('is-open') ? closeMenu() : openMenu(); });
menu.addEventListener('click', e => {
  if (e.target === menu) { closeMenu(); return; }
  const b = e.target.closest('[data-go]'); if (!b) return;
  const what = b.dataset.go; audio.sfx('tick');
  if (what === 'close') { closeMenu(); return; }
  const cur = state.current;
  if (what === 'replay') { closeMenu(); if (cur && cur.api.replay) cur.api.replay(); return; }
  if (what === 'garden') { go('garden', { quick: true, resume: true }); return; }
  if (what === 'letter') { go('journal', { quick: true, page: 0 }); return; }
  if (what === 'restart') { ctx.restart(); return; }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

// ---------- boot ----------
load();
(async () => {
  try { await Promise.all([document.fonts.load('500 24px Caveat'), document.fonts.load('italic 400 24px "Cormorant Garamond"'), document.fonts.load('400 12px "IBM Plex Mono"')]); } catch { /* fonts are a nicety */ }
  // deep links: only to places she has already reached in this session
  const m = location.hash.match(/^#\/(bloom|garden|envelope|journal|finale)(?:\/(\d+))?/);
  let start = 'bloom', opts = {};
  if (m) {
    const want = m[1] === 'envelope' ? 'garden' : m[1] === 'finale' ? 'journal' : m[1];
    const idx = ORDER.indexOf(want);
    if (idx <= state.progress) { start = want; opts = { resume: true, sub: m[1] === 'envelope' ? 'envelope' : undefined }; if (want === 'journal') opts.page = m[1] === 'finale' ? -1 : (m[2] | 0); }
  }
  boot.classList.add('is-gone');
  await go(start, opts);
})();

// keep the audio quiet when she switches apps
document.addEventListener('visibilitychange', () => audio.setHidden(document.hidden));
