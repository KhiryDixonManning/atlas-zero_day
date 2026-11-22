// rapid tapping during transitions must never leave a broken state
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('aon.lily.v1', JSON.stringify({ progress: 2, page: 0 })));
  page.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await page.goto('' + (process.env.BASE || 'http://127.0.0.1:8767/lily/') + '#/garden', { waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
  for (let i = 0; i < 12; i++) { await page.click('.mb', { force: true }); await page.waitForTimeout(90); }
  await page.waitForTimeout(1800);
  for (let i = 0; i < 12; i++) { await page.click('.env', { force: true }); await page.waitForTimeout(90); }
  await page.waitForTimeout(1800);
  for (let i = 0; i < 12; i++) { await page.click('.env', { force: true }); await page.waitForTimeout(90); }
  await page.waitForTimeout(9000);
  const st = await page.evaluate(() => ({ env: document.querySelector('.env').className, letter: document.querySelector('.letter').className, cue: document.querySelector('.cue__text').textContent }));
  console.log('after spam:', JSON.stringify(st));
  await page.screenshot({ path: 'shots/spam_end.png' });
  // back during the unfold, then forward again
  await page.click('#navBack'); await page.waitForTimeout(1000); await page.click('.mb', { force: true }); await page.waitForTimeout(1800); await page.click('.env', { force: true }); await page.waitForTimeout(1800); await page.click('.env', { force: true }); await page.waitForTimeout(3000); await page.click('#navBack'); await page.waitForTimeout(1200);
  console.log('after back mid-sequence:', JSON.stringify(await page.evaluate(() => ({ env: document.querySelector('.env').className, cue: document.querySelector('.cue__text').textContent, flap: document.querySelector('.env__flap').style.transform }))));
  await page.click('.mb', { force: true }); await page.waitForTimeout(1800); await page.click('.env', { force: true }); await page.waitForTimeout(1800); await page.click('.env', { force: true }); await page.waitForTimeout(9000);
  console.log('recovered:', JSON.stringify(await page.evaluate(() => ({ letter: document.querySelector('.letter').className, cue: document.querySelector('.cue__text').textContent }))));
  await browser.close();
})();
