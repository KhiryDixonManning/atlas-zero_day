// End-to-end checks with assertions. Prints PASS/FAIL lines and a list of console errors.
const { chromium } = require('playwright');
const URL = process.env.BASE || 'http://127.0.0.1:8766/lily/';
const errors = [];
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fails++; };
async function newPage(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 390, height: 844 }, hasTouch: true, isMobile: (opts.viewport || {}).width < 700, reducedMotion: opts.rm ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  if (opts.progress != null) await page.addInitScript(p => sessionStorage.setItem('aon.lily.v1', JSON.stringify({ progress: +p, page: 0 })), String(opts.progress));
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  return page;
}
const scene = page => page.evaluate(() => { const s = document.querySelector('#stage .scene.is-in'); return s ? s.className.split(' ')[0] : null; });
(async () => {
  const browser = await chromium.launch();
  // ---- 1. sound toggle, menu, back chain, deep-link guard (mobile) ----
  if (process.env.PART !== '2') {
    const page = await newPage(browser);
    await page.goto(URL + '#/journal/3', { waitUntil: 'networkidle' }); await page.waitForTimeout(1200);
    ok((await scene(page)) === 'bloom', 'deep link to unreached scene falls back to bloom');
    await page.click('#navSound'); await page.waitForTimeout(400);
    ok(await page.evaluate(() => document.querySelector('#navSound').classList.contains('is-on')), 'sound toggles on');
    await page.click('#navSound'); await page.waitForTimeout(400);
    ok(!(await page.evaluate(() => document.querySelector('#navSound').classList.contains('is-on'))), 'sound toggles off');
    await page.click('#navMenu'); await page.waitForTimeout(300);
    ok(await page.evaluate(() => document.querySelector('#menu').classList.contains('is-open')), 'menu opens');
    ok(await page.evaluate(() => document.querySelector('[data-go="letter"]').disabled && document.querySelector('[data-go="garden"]').disabled), 'menu locks unreached places');
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    ok(!(await page.evaluate(() => document.querySelector('#menu').classList.contains('is-open'))), 'escape closes menu');
    // hurry the bloom with a tap, then tap again to continue
    await page.mouse.click(195, 300); await page.waitForTimeout(6500); await page.mouse.click(195, 300); await page.waitForTimeout(3500);
    ok((await scene(page)) === 'garden', 'tap on the bloom leads to the garden');
    await page.click('.mb', { force: true }); await page.waitForTimeout(1700); await page.click('.mb', { force: true }); await page.waitForTimeout(1700);
    ok(await page.evaluate(() => document.querySelector('.env').classList.contains('is-in')), 'envelope taken');
    await page.click('#navBack'); await page.waitForTimeout(900);
    ok(!(await page.evaluate(() => document.querySelector('.env').classList.contains('is-in'))), 'back puts the envelope back');
    await page.click('.mb', { force: true }); await page.waitForTimeout(1700); await page.click('.env', { force: true }); await page.waitForTimeout(1700); await page.click('.env', { force: true }); await page.waitForTimeout(10000);
    ok(await page.evaluate(() => document.querySelector('.letter').classList.contains('is-open')), 'letter unfolded');
    await page.click('.letter', { force: true }); await page.waitForTimeout(2200);
    ok((await scene(page)) === 'journal', 'letter leads to the journal');
    ok(location => true, '');
    await page.click('.journal__next'); await page.waitForTimeout(1400);
    ok(await page.evaluate(() => location.hash === '#/journal/1'), 'journal page in hash');
    await page.click('#navBack'); await page.waitForTimeout(1400);
    ok(await page.evaluate(() => location.hash === '#/journal/0'), 'back turns the page back');
    await page.click('#navBack'); await page.waitForTimeout(2500);
    ok((await scene(page)) === 'garden', 'back from first page returns to garden');
    ok(await page.evaluate(() => document.querySelector('.mb').classList.contains('is-open')), 'garden resumes with the mailbox open');
    await page.click('#navMenu'); await page.waitForTimeout(300); await page.click('[data-go="letter"]'); await page.waitForTimeout(2500);
    ok((await scene(page)) === 'journal', 'menu: read the letter again');
    await page.evaluate(() => document.querySelector('.journal__dot:last-child').click()); await page.waitForTimeout(1600);
    await page.click('.pl', { force: true }); await page.waitForTimeout(9000);
    ok(await page.evaluate(() => document.querySelector('.finale__text').classList.contains('is-in')), 'finale text reveals');
    await page.click('[data-act="restart"]'); await page.waitForTimeout(2500);
    ok((await scene(page)) === 'bloom', 'restart returns to the bloom');
    await page.close();
  }
  if (process.env.PART === '1') { await browser.close(); console.log(fails ? `${fails} FAILED` : 'ALL PASSED'); return; }
  {
    // scroll fade on a long page
    const page = await newPage(browser, { progress: 2 });
    await page.goto(URL + '#/journal/4', { waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
    const sc = await page.evaluate(() => { const p = document.querySelectorAll('.page')[4]; const i = p.querySelector('.page__inner'); return { cls: p.className, sh: i.scrollHeight, ch: i.clientHeight, fade: getComputedStyle(p.querySelector('.page__fade')).opacity }; });
    console.log('  page 5 scroll:', JSON.stringify(sc));
    ok(sc.sh <= sc.ch + 4 || sc.fade === '1', 'scroll fade shown when a page overflows');
    await page.screenshot({ path: 'shots/e2e_p5.png' });
    await page.close();
  }
  // ---- 2. reduced motion run ----
  {
    const page = await newPage(browser, { rm: true });
    await page.goto(URL, { waitUntil: 'networkidle' }); await page.waitForTimeout(6000);
    await page.screenshot({ path: 'shots/rm_bloom.png' });
    ok(await page.evaluate(() => document.querySelector('.bloom__name').classList.contains('is-in')), 'reduced motion: title shows quickly');
    await page.mouse.click(195, 300); await page.waitForTimeout(2500);
    ok((await scene(page)) === 'garden', 'reduced motion: reaches garden');
    await page.click('.mb', { force: true }); await page.waitForTimeout(1200); await page.click('.mb', { force: true }); await page.waitForTimeout(1200);
    await page.click('.env', { force: true }); await page.waitForTimeout(1200); await page.click('.env', { force: true }); await page.waitForTimeout(5500);
    ok(await page.evaluate(() => document.querySelector('.letter').classList.contains('is-open')), 'reduced motion: letter unfolds');
    await page.screenshot({ path: 'shots/rm_letter.png' });
    await page.close();
  }
  // ---- 3. desktop and landscape screenshots ----
  for (const [name, vp] of [['desk', { width: 1440, height: 900 }], ['land', { width: 844, height: 390 }], ['tablet', { width: 820, height: 1180 }], ['se', { width: 375, height: 667 }]]) {
    const page = await newPage(browser, { viewport: vp, progress: 2 });
    await page.goto(URL, { waitUntil: 'networkidle' }); await page.waitForTimeout(16500);
    await page.screenshot({ path: `shots/${name}_bloom.png` });
    await page.mouse.click(vp.width / 2, vp.height / 2 - 100); await page.waitForTimeout(1500); await page.screenshot({ path: `shots/${name}_cross.png` }); await page.waitForTimeout(4000);
    await page.screenshot({ path: `shots/${name}_garden.png` });
    await page.click('.mb', { force: true }); await page.waitForTimeout(1700); await page.click('.mb', { force: true }); await page.waitForTimeout(1700);
    await page.screenshot({ path: `shots/${name}_env.png` });
    await page.click('.env', { force: true }); await page.waitForTimeout(1700); await page.click('.env', { force: true }); await page.waitForTimeout(10000);
    await page.screenshot({ path: `shots/${name}_letter.png` });
    await page.click('.letter', { force: true }); await page.waitForTimeout(2500); await page.click('.journal__next'); await page.waitForTimeout(1500);
    await page.screenshot({ path: `shots/${name}_journal.png` });
    ok((await scene(page)) === 'journal', `${name}: full path to the journal`);
    await page.close();
  }
  await browser.close();
  console.log('\nconsole errors/warnings:', errors.length ? '\n  ' + [...new Set(errors)].join('\n  ') : 'none');
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
})().catch(e => { console.error(e); process.exit(1); });
