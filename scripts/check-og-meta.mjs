import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
});
const page = await ctx.newPage();

const urls = [
  'https://taskflow.kr/',
  'https://taskflow.kr/download',
  'https://taskflow.kr/pricing',
];

for (const u of urls) {
  await page.goto(u, { waitUntil: 'domcontentloaded' });
  const og = await page.locator('meta[property="og:image"]').first().getAttribute('content');
  console.log(`${u.padEnd(34)}  og:image = ${og}`);
}

// Snap the live home (light desktop) to confirm OG meta + page works in real browser
await page.setViewportSize({ width: 1280, height: 800 });
await page.goto('https://taskflow.kr/', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'scripts/live-home-post-deploy.png', fullPage: true });
console.log('✓ snap: scripts/live-home-post-deploy.png');

await browser.close();
