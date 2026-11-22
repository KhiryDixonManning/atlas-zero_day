// measure overflow of the letter text and whether any plant head crosses the viewport edge
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  for (const [w, h] of [[375, 812], [390, 844], [430, 932]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await page.addInitScript(() => sessionStorage.setItem('aon.lily.v1', JSON.stringify({ progress: 2, page: 0 })));
    page.on('pageerror', e => console.log('PAGEERROR:', e.message));
    await page.goto('' + (process.env.BASE || 'http://127.0.0.1:8767/lily/') + '#/garden', { waitUntil: 'networkidle' }); await page.waitForTimeout(1200);
    const plants = await page.evaluate(() => [...document.querySelectorAll('.plant')].map(p => { const r = p.querySelector('svg').getBBox ? null : null; const b = p.getBoundingClientRect(); const heads = [...p.querySelectorAll('.lily__head')].map(g => { const hb = g.getBoundingClientRect(); return [Math.round(hb.left), Math.round(hb.right), Math.round(hb.top), Math.round(hb.bottom)]; }); return { cls: p.className.split(' ')[1], heads }; }));
    const edge = plants.flatMap(p => p.heads.map(hh => ({ cls: p.cls, hh, clipped: hh[0] < 0 || hh[1] > w }))).filter(x => x.clipped);
    const letter = await page.evaluate(() => { const l = document.querySelector('.letter'); l.classList.add('is-in'); const fr = [...document.querySelectorAll('.letter__p .front')]; const r = fr.map(f => ({ sw: f.scrollWidth, cw: f.clientWidth, sh: f.scrollHeight, ch: f.clientHeight })); l.classList.remove('is-in'); return r; });
    console.log(`${w}x${h} heads clipped by viewport: ${edge.length}`, edge.map(e => `${e.cls} ${e.hh}`).join(' | '));
    console.log(`  letter panels (scroll vs client): ${letter.map(r => `${r.sw}/${r.cw} ${r.sh}/${r.ch}`).join(', ')}`);
    await ctx.close();
  }
  await browser.close();
})();
