/* Records a screen-capture walkthrough of the live app, following the beats in
   docs/VIDEO_SCRIPT.md. Produces silent footage to narrate over — it is a
   recording of the real product, not a generated video.

     python3 -m http.server 8123 &
     npm install playwright
     node test/record-demo.mjs

   Output: ./video/*.webm (about 1:37, 600x900). */

import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://127.0.0.1:8123/';
const OUT  = process.env.OUT_DIR || './video';

const browser = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
const ctx = await browser.newContext({
  viewport: { width: 600, height: 900 },
  deviceScaleFactor: 2,
  recordVideo: { dir: OUT, size: { width: 600, height: 900 } }
});
const page = await ctx.newPage();

/* A visible pointer, so the reference video shows exactly what to click.
   Playwright's real input has no cursor, so we draw one and move it first. */
const CURSOR = `
  (() => {
    if (document.getElementById('__cur')) return;
    const d = document.createElement('div');
    d.id = '__cur';
    d.style.cssText = 'position:fixed;z-index:99999;width:22px;height:22px;border-radius:50%;' +
      'background:rgba(26,79,214,.35);border:2px solid #1a4fd6;pointer-events:none;' +
      'transform:translate(-50%,-50%);transition:left .45s cubic-bezier(.4,0,.2,1),top .45s cubic-bezier(.4,0,.2,1);' +
      'left:300px;top:800px;box-shadow:0 2px 10px rgba(0,0,0,.25)';
    document.body.appendChild(d);
    window.__moveCur = (x, y) => { d.style.left = x + 'px'; d.style.top = y + 'px'; };
    window.__tapCur = () => {
      d.animate([{transform:'translate(-50%,-50%) scale(1)'},{transform:'translate(-50%,-50%) scale(.55)'},
                 {transform:'translate(-50%,-50%) scale(1)'}], {duration:280});
    };
  })()`;

const arm = () => page.evaluate(CURSOR).catch(() => {});
page.on('load', arm);
page.on('framenavigated', arm);

const wait = ms => page.waitForTimeout(ms);

async function tap (selector, pause = 900) {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded().catch(() => {});
  await wait(250);
  const box = await el.boundingBox();
  if (box) {
    await page.evaluate(([x, y]) => window.__moveCur && window.__moveCur(x, y),
      [box.x + box.width / 2, box.y + box.height / 2]);
    await wait(520);
    await page.evaluate(() => window.__tapCur && window.__tapCur());
    await wait(180);
  }
  await el.click();
  await arm();
  await wait(pause);
}

async function glide (px, ms = 1400) {
  await page.evaluate(([d, t]) => new Promise(res => {
    const start = window.scrollY, t0 = performance.now();
    (function step (now) {
      const k = Math.min(1, (now - t0) / t);
      window.scrollTo(0, start + d * (k < .5 ? 2*k*k : 1 - Math.pow(-2*k+2, 2)/2));
      k < 1 ? requestAnimationFrame(step) : res();
    })(t0);
  }), [px, ms]);
}

/* ---------------- MINUTE ONE ---------------- */
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await arm();
await wait(1200);

// 0:00 open the before/after comparison
await tap('[data-act="nav"][data-route="compare"]', 1600);
await glide(700, 2000); await wait(1600);
await glide(700, 2000); await wait(1800);
await glide(-1400, 1200);

// 0:14 sign in as Priya
await tap('[data-act="back"]', 900);
await tap('[data-act="demo"][data-uan="100200300400"]', 2600);
await glide(260, 1200); await wait(2600);

// 0:28 the fix list, grouped by owner
await tap('[data-act="nav"][data-route="readiness"]', 2200);
await glide(320, 1400); await wait(2800);

// 0:42 the exact name mismatch
await tap('[data-act="toggle"][data-id="AADHAAR_NAME_MISMATCH"]', 2600);
await glide(300, 1300); await wait(2400);

// 0:51 the generated letter
await glide(500, 1400);
await tap('[data-act="draft"][data-id="EXIT_DATE_MISSING"]', 2600);
await glide(360, 1500); await wait(2600);
await tap('[data-act="back"]', 1200);

// 0:58 tick the blockers, watch it clear
await tap('[data-act="fix"][data-id="AADHAAR_NAME_MISMATCH"]', 900);
await tap('[data-act="fix"][data-id="BANK_UNVERIFIED"]', 900);
await tap('[data-act="fix"][data-id="EXIT_DATE_MISSING"]', 1600);
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
await wait(2200);
await tap('[data-act="nav"][data-route="home"]', 2600);

/* ---------------- MINUTE TWO (the app beats) ---------------- */
// 1:40 Rakesh: clean record, EPFO still late
await tap('[data-act="nav"][data-route="help"]', 700);
await tap('[data-act="logout"]', 1200);
await tap('[data-act="demo"][data-uan="100200300401"]', 2400);
await glide(700, 1800); await wait(2600);
await tap('[data-act="grievance"]', 2600);
await glide(300, 1400); await wait(2400);
await tap('[data-act="back"]', 1400);

// 1:50 bilingual + larger text
await tap('[data-act="lang"]', 2400);
await tap('[data-act="bigtext"]', 2400);
await tap('[data-act="bigtext"]', 600);
await tap('[data-act="lang"]', 1800);

await wait(1500);
await ctx.close();
await browser.close();
console.log('recorded');
