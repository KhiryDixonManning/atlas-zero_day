// WebKit-style compositing estimate: an element gets its own backing store when it has a 3D transform,
// preserve-3d / perspective, backface-visibility:hidden, will-change, a filter, a running transform/opacity
// animation or transition, or (on iOS) overflow scrolling. Memory ≈ visible box × dpr² × 4 bytes.
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:8767/lily/';
const DPR = 3;
const audit = async (page, label) => {
  await page.waitForTimeout(400);
  const r = await page.evaluate(() => {
    const out = []; const vw = innerWidth, vh = innerHeight;
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const why = [];
      if (cs.transform !== 'none' && /matrix3d|perspective/.test(cs.transform)) why.push('3d');
      if (cs.transformStyle === 'preserve-3d') why.push('p3d');
      if (cs.perspective !== 'none') why.push('persp');
      if (cs.backfaceVisibility === 'hidden') why.push('bf');
      if (cs.willChange !== 'auto') why.push('wc');
      if (cs.filter !== 'none') why.push('filter');
      if (cs.animationName !== 'none' && cs.animationPlayState !== 'paused') why.push('anim');
      if (el.tagName === 'CANVAS') why.push('canvas');
      if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight) why.push('scroll');
      if (!why.length) continue;
      const b = el.getBoundingClientRect(); const w = Math.min(b.width, vw * 1.5), h = Math.min(b.height, vh * 1.5);
      if (w < 1 || h < 1) continue;
      // layers inside the scrolled-out / offscreen region still allocate, so count the full box
      out.push({ sel: el.tagName.toLowerCase() + (el.className && el.className.baseVal === undefined ? '.' + String(el.className).split(' ')[0] : el.className && el.className.baseVal ? '.' + el.className.baseVal.split(' ')[0] : ''), w: Math.round(b.width), h: Math.round(b.height), why: why.join('+') });
    }
    return out;
  });
  const bytes = r.reduce((a, l) => a + l.w * l.h * DPR * DPR * 4, 0);
  const top = [...r].sort((a, b) => b.w * b.h - a.w * a.h).slice(0, 5).map(l => `${l.sel}(${l.why})${l.w}x${l.h}`).join('  ');
  console.log(`${label.padEnd(30)} layers ${String(r.length).padStart(3)}  est. backing ${(bytes / 1048576).toFixed(0).padStart(4)} MB   top: ${top}`);
  return { n: r.length, mb: bytes / 1048576 };
};
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 664 }, deviceScaleFactor: DPR, hasTouch: true, isMobile: true });
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE, { waitUntil: 'networkidle' }); await page.evaluate(() => sessionStorage.clear()); await page.goto('about:blank'); await page.goto(BASE + '#/', { waitUntil: 'networkidle' });
  const peaks = [];
  await page.waitForTimeout(3000); peaks.push(await audit(page, 'bloom, gathering'));
  await page.mouse.click(195, 300); await page.waitForTimeout(6500);
  await page.mouse.click(195, 300); await page.waitForTimeout(900); peaks.push(await audit(page, 'bloom -> garden crossfade'));
  await page.waitForTimeout(3500); peaks.push(await audit(page, 'garden, closed'));
  await page.click('.mb', { force: true }); await page.waitForTimeout(1900); await page.click('.mb', { force: true }); await page.waitForTimeout(1800); peaks.push(await audit(page, 'envelope in hand'));
  await page.click('.env', { force: true }); await page.waitForTimeout(700); peaks.push(await audit(page, 'envelope mid-flip'));
  await page.waitForTimeout(1200); await page.click('.env', { force: true }); await page.waitForTimeout(2300); peaks.push(await audit(page, 'flap opening'));
  await page.waitForTimeout(3500); peaks.push(await audit(page, 'letter unfolding'));
  await page.waitForFunction(() => document.querySelector('.cue__text').textContent === 'turn the page', null, { timeout: 15000 }).catch(() => null);
  await page.click('.letter', { force: true }); await page.waitForTimeout(700); peaks.push(await audit(page, 'letter -> journal hand-off'));
  await page.waitForTimeout(2500); peaks.push(await audit(page, 'journal page 1'));
  await page.click('.journal__next'); await page.waitForTimeout(500); peaks.push(await audit(page, 'journal, turning'));
  for (let k = 0; k < 10; k++) { await page.click('.journal__next'); await page.waitForTimeout(1350); } peaks.push(await audit(page, 'journal page 11'));
  await page.click('.pl', { force: true }); await page.waitForTimeout(5500); peaks.push(await audit(page, 'finale, words writing'));
  await page.click('[data-act="restart"]'); await page.waitForTimeout(800); peaks.push(await audit(page, 'restart crossfade'));
  const max = peaks.reduce((a, p) => p.mb > a.mb ? p : a);
  console.log(`PEAK est. backing store: ${max.mb.toFixed(0)} MB over ${max.n} layers; page errors: ${errors.length ? errors.join(' | ') : 'none'}`);
  await browser.close();
})();
