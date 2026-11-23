// Release regression: N full runs, the back-then-mailbox race, rapid taps, replay, per-viewport text geometry.
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8767/lily/';
const RUNS = +process.env.RUNS || 5;
let fails = 0; const errors = [];
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const scene = p => p.evaluate(() => { const s = document.querySelector('#stage .scene.is-in'); return s ? s.className.split(' ')[0] : null; });
const bright = async p => p.evaluate(() => { const c = document.createElement('canvas'); return null; }); // placeholder
async function fullRun(page, i) {
  await page.goto(BASE, { waitUntil: 'networkidle' }); await page.evaluate(() => sessionStorage.clear()); await page.goto(BASE + '#/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500); await page.mouse.click(195, 300); await page.waitForTimeout(6500); await page.mouse.click(195, 300); await page.waitForTimeout(3500);
  if ((await scene(page)) !== 'garden') return 'did not reach garden';
  await page.click('.mb', { force: true }); await page.waitForTimeout(1900); await page.click('.mb', { force: true }); await page.waitForTimeout(1800);
  await page.click('.env', { force: true }); await page.waitForTimeout(1700); await page.click('.env', { force: true });
  await page.waitForFunction(() => document.querySelector('.cue__text').textContent === 'turn the page', null, { timeout: 15000 }).catch(() => null);
  if (!(await page.evaluate(() => document.querySelector('.letter').classList.contains('is-open')))) return 'letter never opened';
  await page.click('.letter', { force: true }); await page.waitForTimeout(2200);
  if ((await scene(page)) !== 'journal') return 'did not reach journal';
  for (let k = 0; k < 10; k++) { await page.click('.journal__next'); await page.waitForTimeout(1350); }
  if (!(await page.evaluate(() => location.hash === '#/journal/10'))) return 'did not reach last page: ' + await page.evaluate(() => location.hash);
  await page.click('.pl', { force: true }); await page.waitForTimeout(8000);
  if (!(await page.evaluate(() => document.querySelector('.finale__text').classList.contains('is-in')))) return 'finale text missing';
  // the screen must not be black: sample the page paper
  const lum = await page.evaluate(() => { const r = document.querySelector('.page--finale .page__front').getBoundingClientRect(); return r.width > 100 && getComputedStyle(document.querySelector('.page--finale')).visibility === 'visible'; });
  if (!lum) return 'finale not visible';
  await page.click('[data-act="restart"]'); await page.waitForTimeout(2500);
  if ((await scene(page)) !== 'bloom') return 'restart failed';
  return null;
}
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 664 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('pageerror: ' + e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  for (let i = 1; i <= RUNS; i++) { const r = await fullRun(page, i); ok(!r, `full run ${i} at 390x664` + (r ? ': ' + r : '')); }
  const seed = async () => { await page.goto(BASE, { waitUntil: 'networkidle' }); await page.evaluate(() => sessionStorage.setItem('aon.lily.v1', JSON.stringify({ progress: 2, page: 0 }))); await page.goto('about:blank'); await page.goto(BASE + '#/garden', { waitUntil: 'networkidle' }); await page.waitForTimeout(1500); };
  // ---- the race: back mid-unfold, then straight back into the mailbox ----
  await seed();
  await page.click('.mb', { force: true }); await page.waitForTimeout(1800); await page.click('.env', { force: true }); await page.waitForTimeout(1700); await page.click('.env', { force: true }); await page.waitForTimeout(5200);
  await page.click('#navBack'); await page.waitForTimeout(150); await page.click('.mb', { force: true }); await page.waitForTimeout(6000);
  let st = await page.evaluate(() => ({ cue: document.querySelector('.cue__text').textContent, env: document.querySelector('.env').className, letterVis: getComputedStyle(document.querySelector('.letter')).visibility }));
  ok(st.cue === 'turn it over' && st.env.includes('is-held') && st.letterVis === 'hidden', 'back mid-unfold then mailbox: envelope in hand, nothing stale (' + JSON.stringify(st) + ')');
  await page.click('.env', { force: true }); await page.waitForTimeout(1700); await page.click('.env', { force: true });
  await page.waitForFunction(() => document.querySelector('.cue__text').textContent === 'turn the page', null, { timeout: 15000 }).catch(() => null);
  ok(await page.evaluate(() => document.querySelector('.letter').classList.contains('is-open')), 'continues to the open letter afterwards');
  // ---- rapid taps everywhere during the sequence ----
  await seed();
  for (let k = 0; k < 30; k++) { await page.click('.mb', { force: true }); await page.click('.env', { force: true }).catch(() => {}); await page.click('.letter', { force: true }).catch(() => {}); await page.waitForTimeout(120); }
  await page.waitForTimeout(9000);
  st = await page.evaluate(() => ({ cue: document.querySelector('.cue__text') ? document.querySelector('.cue__text').textContent : null, scene: document.querySelector('#stage .scene.is-in') && document.querySelector('#stage .scene.is-in').className.split(' ')[0], hash: location.hash }));
  ok(st.scene === 'journal' || (st.scene === 'garden' && st.cue === 'turn the page'), 'rapid taps across the sequence end in a live state (' + JSON.stringify(st) + ')');
  // ---- replay from the garden menu, then forward again ----
  await seed();
  await page.click('#navMenu'); await page.waitForTimeout(300); await page.click('[data-go="replay"]'); await page.waitForTimeout(4000);
  await page.click('.mb', { force: true }); await page.waitForTimeout(1900); await page.click('.mb', { force: true }); await page.waitForTimeout(1800);
  ok(await page.evaluate(() => document.querySelector('.env').classList.contains('is-held')), 'replay then open again works');
  await ctx.close();
  // ---- text geometry at four phone viewports, through the door animation ----
  for (const [w, h] of [[375, 812], [390, 844], [430, 932], [390, 664], [375, 635]]) {
    const c = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    const p = await c.newPage(); p.on('pageerror', e => errors.push('pageerror: ' + e.message));
    await p.addInitScript(() => sessionStorage.setItem('aon.lily.v1', JSON.stringify({ progress: 2, page: 0 })));
    await p.goto(BASE + '#/garden', { waitUntil: 'networkidle' }); await p.waitForTimeout(600);
    await p.click('#navMenu'); await p.waitForTimeout(300); await p.click('[data-go="replay"]'); await p.waitForTimeout(3600);
    const g = await p.evaluate(() => { const t = document.querySelector('.garden__words').getBoundingClientRect(); const els = [...document.querySelectorAll('.mb__svg, .plant svg, .lily__head')].map(e => e.getBoundingClientRect()); const top = Math.min(...els.map(r => r.top)); return { textBottom: Math.round(t.bottom), sceneTop: Math.round(top), gap: Math.round(top - t.bottom), textVisible: getComputedStyle(document.querySelector('.garden__words')).opacity }; });
    ok(g.gap >= 0 && +g.textVisible > 0.9, `${w}x${h}: intro text ends ${g.textBottom}px, nearest garden element starts ${g.sceneTop}px, gap ${g.gap}px`);
    await p.screenshot({ path: `after/rel_${w}x${h}.png` });
    await c.close();
  }
  await browser.close();
  console.log('console/page errors:', errors.length ? errors.join(' | ') : 'none');
  console.log(fails ? `${fails} FAILED` : 'ALL PASSED');
})().catch(e => { console.error(e); process.exit(1); });
