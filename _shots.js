// Cattura screenshot reali dello store Shopify (WebP) per il case study e-commerce.
const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'https://grissinciok.myshopify.com';
const OUT = 'assets/screenshots/';

const shots = [
  { url: BASE + '/',                                 file: 'ecommerce-home.webp',      scroll: 0 },
  { url: BASE + '/',                                 file: 'ecommerce-home-mid.webp',  scroll: 950 },
  { url: BASE + '/collections/all',                  file: 'ecommerce-collection.webp', scroll: 0 },
  { url: BASE + '/products/pistacchio-con-granella', file: 'ecommerce-product.webp',    scroll: 0 },
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--disable-blink-features=AutomationControlled'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 810, deviceScaleFactor: 1 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36');

  for (const s of shots) {
    try {
      await page.goto(s.url, { waitUntil: 'networkidle2', timeout: 45000 });
      try {
        await page.evaluate(() => {
          const els = [...document.querySelectorAll('button, a, [role="button"]')];
          const hit = els.find(b => /accetta tutti|accetta|accept all|solo necessari/i.test((b.textContent || '').trim()));
          if (hit) hit.click();
        });
        await sleep(700);
      } catch (e) {}
      await page.evaluate(async () => {
        await new Promise(res => { let y = 0; const t = setInterval(() => { window.scrollBy(0, 700); y += 700; if (y > 4500) { clearInterval(t); res(); } }, 80); });
      });
      await page.evaluate((y) => window.scrollTo(0, y || 0), s.scroll);
      await sleep(1400);
      const opts = { path: OUT + s.file, type: 'webp', quality: 82 };
      if (s.full) opts.fullPage = true;
      await page.screenshot(opts);
      console.log('OK  ', s.file);
    } catch (e) {
      console.log('FAIL', s.file, '-', e.message);
    }
  }
  await browser.close();
  console.log('DONE');
})();
