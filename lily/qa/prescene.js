// Which text-bearing elements are painted in the garden before their scene? Check computed visibility and hit-testing.
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('aon.lily.v1', JSON.stringify({ progress: 2, page: 0 })));
  await page.goto('' + (process.env.BASE || 'http://127.0.0.1:8767/lily/') + '#/garden', { waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
  console.log(await page.evaluate(() => {
    const q = s => { const e = document.querySelector(s); const cs = getComputedStyle(e); return `${s}: visibility=${cs.visibility} opacity=${cs.opacity}`; };
    return [q('.env'), q('.letter'), q('.env__to'), q('.letter__p--top .front'), q('.mb__env'), q('.mb__env .env__name')].join('\n');
  }));
  console.log('preserve-3d in computed styles:', await page.evaluate(() => [...document.querySelectorAll('*')].filter(e => getComputedStyle(e).transformStyle === 'preserve-3d').length));
  await browser.close();
})();
