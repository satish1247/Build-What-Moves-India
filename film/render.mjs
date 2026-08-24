/* Renders film.html to a 1:49 webm at 1280x720.

     cd film && python3 -m http.server 8145 &
     node render.mjs

   Edit film.html to change copy or timing; the TL array at the bottom holds
   the scene schedule in seconds. */

import { chromium } from 'playwright';
const OUT = process.env.OUT_DIR || './out';
const b = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
const ctx = await b.newContext({
  viewport:{width:1280,height:720}, deviceScaleFactor:1,
  recordVideo:{ dir: OUT, size:{width:1280,height:720} }
});
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(`${process.env.BASE || 'http://127.0.0.1:8145'}/film.html`, { waitUntil:'networkidle' });
await p.waitForTimeout(900);
await p.evaluate(() => window.__play());
await p.waitForTimeout(108000);
console.log('errors:', errs.length?errs.join('|'):'none');
await ctx.close();
await b.close();
console.log('done');
