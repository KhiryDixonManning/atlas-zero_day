// Replay the whole experience three times in one page and watch DOM node count, canvases, and heap.
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 664 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://127.0.0.1:8767/lily/', { waitUntil: 'networkidle' });
  const stat = async l => console.log(l.padEnd(22), JSON.stringify(await page.evaluate(() => ({ nodes: document.querySelectorAll('*').length, scenes: document.querySelectorAll('#stage > .scene').length, canvases: document.querySelectorAll('canvas').length, heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null }))));
  await stat('start');
  for (let r = 1; r <= 3; r++) {
    await page.waitForTimeout(1500); await page.mouse.click(195, 300); await page.waitForTimeout(6500); await page.mouse.click(195, 300); await page.waitForTimeout(5000);
    await stat(`run ${r}: garden`);
    await page.click('.mb', { force: true }); await page.waitForTimeout(1900); await page.click('.mb', { force: true }); await page.waitForTimeout(1800); await page.click('.env', { force: true }); await page.waitForTimeout(1700); await page.click('.env', { force: true });
    await page.waitForFunction(() => document.querySelector('.cue__text').textContent === 'turn the page', null, { timeout: 15000 }).catch(() => null);
    await page.click('.letter', { force: true }); await page.waitForTimeout(3000); await stat(`run ${r}: journal`);
    for (let k = 0; k < 10; k++) { await page.click('.journal__next'); await page.waitForTimeout(1350); }
    await page.click('.pl', { force: true }); await page.waitForTimeout(7000); await stat(`run ${r}: finale`);
    await page.click('[data-act="restart"]'); await page.waitForTimeout(3000); await stat(`run ${r}: restarted`);
  }
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await browser.close();
})();
