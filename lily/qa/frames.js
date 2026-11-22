// usage: node frames.js <url> <w> <h> <out.png> <progress> "<ms>:click sel|<ms>:tap x,y" ... --grab start,end,step [--crop x,y,w,h] [--rm]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const args = process.argv.slice(2);
const [url, w, h, out, progress] = args; const rest = args.slice(5);
const grabIdx = rest.indexOf('--grab'); const [g0, g1, gs] = rest[grabIdx + 1].split(',').map(Number);
const cropIdx = rest.indexOf('--crop'); const crop = cropIdx > -1 ? rest[cropIdx + 1].split(',').map(Number) : null;
const rm = rest.includes('--rm');
const steps = rest.filter((s, i) => /^\d+:/.test(s)).map(s => { const i = s.indexOf(':'); return { at: +s.slice(0, i), cmd: s.slice(i + 1) }; });
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, hasTouch: true, isMobile: +w < 700, reducedMotion: rm ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  if (progress !== '-') await page.addInitScript(p => sessionStorage.setItem('aon.lily.v1', JSON.stringify({ progress: +p, page: 0 })), progress);
  page.on('pageerror', e => console.log('PAGEERROR:', e.message));
  const t0 = Date.now(); await page.goto(url, { waitUntil: 'networkidle' });
  const plan = [...steps]; for (let t = g0; t <= g1; t += gs) plan.push({ at: t, shot: true });
  plan.sort((a, b) => a.at - b.at);
  const files = [];
  for (const p of plan) {
    const now = Date.now() - t0; if (p.at > now) await page.waitForTimeout(p.at - now);
    if (p.shot) { const f = `/tmp/fr_${process.pid}_${files.length}.png`; await page.screenshot({ path: f, clip: crop ? { x: crop[0], y: crop[1], width: crop[2], height: crop[3] } : undefined }); files.push(f); }
    else { const [verb, ...r] = p.cmd.split(' '); const a = r.join(' '); if (verb === 'click') { try { await page.click(a, { timeout: 1500, force: true }); } catch (e) { console.log('click failed', a); } } else if (verb === 'tap') { const [x, y] = a.split(',').map(Number); await page.mouse.click(x, y); } }
  }
  await browser.close();
  const fs = require('fs'); fs.writeFileSync(`/tmp/fr_list_${process.pid}.json`, JSON.stringify(files)); fs.writeFileSync(`/tmp/fr_sheet_${process.pid}.py`, `
import json; from PIL import Image
fs=json.load(open('/tmp/fr_list_' + str(${process.pid}) + '.json'))
ims=[Image.open(f) for f in fs]; W,H=ims[0].size; sc=min(1,300/W); tw,th=int(W*sc),int(H*sc)
cols=min(8,len(ims)); rows=(len(ims)+cols-1)//cols
sheet=Image.new('RGB',(cols*(tw+4)+4,rows*(th+4)+4),(40,40,40))
for i,im in enumerate(ims): sheet.paste(im.resize((tw,th)),(4+(i%cols)*(tw+4),4+(i//cols)*(th+4)))
sheet.save(${JSON.stringify(out)})
`); execSync(`python3 /tmp/fr_sheet_${process.pid}.py`);
  console.log('wrote', out, files.length, 'frames');
})().catch(e => { console.error(e); process.exit(1); });
