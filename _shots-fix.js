const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = 'C:/Users/franc/Desktop/officina-ai/assets/screenshots/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--disable-blink-features=AutomationControlled'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 810, deviceScaleFactor: 1 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36');
  for (const s of [
    { url: 'https://artigianodellapizza.netlify.app/', file: 'artigiano-home.webp', scroll: 0 },
    { url: 'https://artigianodellapizza.netlify.app/', file: 'artigiano-mid.webp',  scroll: 950 },
  ]) {
    await page.goto(s.url, { waitUntil: 'networkidle2', timeout: 45000 });
    await page.evaluate(() => {
      const els = [...document.querySelectorAll('button, a, [role="button"]')];
      const hit = els.find(b => /ho capito|accetta|accept/i.test((b.textContent || '').trim()));
      if (hit) hit.click();
    });
    await sleep(900);
    await page.evaluate(async () => {
      await new Promise(res => { let y = 0; const t = setInterval(() => { window.scrollBy(0, 700); y += 700; if (y > 4500) { clearInterval(t); res(); } }, 80); });
    });
    await page.evaluate((y) => window.scrollTo(0, y || 0), s.scroll);
    await sleep(1600);
    await page.screenshot({ path: OUT + s.file, type: 'webp', quality: 82 });
    console.log('OK', s.file);
  }
  await browser.close();
})();
