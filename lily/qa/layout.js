// Boundary checks for every journal page: no overflow, and every illustration / note inside the paper.
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  let fails = 0;
  for (const [w, h] of [[375, 812], [390, 844], [430, 932]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await page.addInitScript(() => sessionStorage.setItem('aon.lily.v1', JSON.stringify({ progress: 2, page: 0 })));
    await page.goto('' + (process.env.BASE || 'http://127.0.0.1:8767/lily/') + '#/journal/0', { waitUntil: 'networkidle' }); await page.waitForTimeout(900);
    const res = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('.page').forEach((pg, i) => {
        const inner = pg.querySelector('.page__inner'), front = pg.querySelector('.page__front');
        const fr = front.getBoundingClientRect();
        // temporarily make every page visible and open its margin note so we can measure
        const was = pg.className; pg.classList.remove('is-turned', 'is-hidden'); pg.classList.add('is-noted');
        const over = inner.scrollHeight - inner.clientHeight;
        const items = [...pg.querySelectorAll('.page__art svg, .page__margin, .pl, .finale__actions, .sticker__under')].map(el => {
          const r = el.getBoundingClientRect(); const out = { el: el.className.baseVal || el.className, top: Math.round(r.top - fr.top), bottom: Math.round(fr.bottom - r.bottom), left: Math.round(r.left - fr.left), right: Math.round(fr.right - r.right) };
          out.ok = out.top >= 0 && out.bottom >= 0 && out.left >= -1 && out.right >= -1; return out;
        });
        pg.className = was;
        out.push({ i: i + 1, over, items });
      });
      return out;
    });
    for (const r of res) {
      const bad = r.items.filter(it => !it.ok);
      const line = `${w}x${h} page ${r.i}: overflow ${r.over}px` + (bad.length ? ' | outside paper: ' + bad.map(b => `${String(b.el).split(' ').pop()} t${b.top} b${b.bottom} l${b.left} r${b.right}`).join('; ') : '');
      if (r.over > 2 || bad.length) { fails++; console.log('FAIL ' + line); } else console.log('ok   ' + line);
    }
    await ctx.close();
  }
  await browser.close();
  console.log(fails ? `${fails} page/size combinations fail` : 'all pages fit');
})();
