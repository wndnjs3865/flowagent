// Live verification via real browser (passes Vercel Bot Protection challenge)
import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
});
const page = await ctx.newPage();

const checks = [
  { name: 'home', url: 'https://taskflow.kr/' },
  { name: 'download', url: 'https://taskflow.kr/download' },
  { name: 'pricing', url: 'https://taskflow.kr/pricing' },
  { name: 'docs', url: 'https://taskflow.kr/docs' },
  { name: 'templates', url: 'https://taskflow.kr/templates' },
  { name: 'blog', url: 'https://taskflow.kr/blog' },
  { name: 'unknown-1', url: `https://taskflow.kr/random-path-${Date.now()}` },
  { name: 'unknown-2', url: `https://taskflow.kr/another-${Date.now()}-x` },
  { name: 'og.png', url: 'https://taskflow.kr/og.png' },
  { name: 'robots.txt', url: 'https://taskflow.kr/robots.txt' },
  { name: 'sitemap', url: 'https://taskflow.kr/sitemap-index.xml' },
];

for (const c of checks) {
  const res = await page.goto(c.url, { waitUntil: 'networkidle', timeout: 20000 }).catch((e) => null);
  const status = res?.status() ?? '???';
  const url = res?.url() ?? c.url;
  let title = '';
  if (c.name !== 'og.png' && c.name !== 'robots.txt' && c.name !== 'sitemap') {
    title = await page.title().catch(() => '');
  }
  console.log(`${String(status).padStart(3)}  ${c.name.padEnd(12)}  ${title.slice(0, 60)}`);
}

await browser.close();
