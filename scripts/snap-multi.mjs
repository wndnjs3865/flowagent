import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { basename } from 'node:path';

const url = process.argv[2] ?? 'http://localhost:4321/';
const prefix = process.argv[3] ?? 'snap';

await mkdir('scripts', { recursive: true });

const browser = await chromium.launch();

const shots = [
  {
    suffix: 'dark.png',
    viewport: { width: 1280, height: 800 },
    colorScheme: 'dark',
    initLocalStorage: { theme: 'dark' },
  },
  {
    suffix: 'mobile.png',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  },
];

for (const shot of shots) {
  const ctx = await browser.newContext({
    viewport: shot.viewport,
    deviceScaleFactor: shot.deviceScaleFactor ?? 1,
    colorScheme: shot.colorScheme,
  });
  const page = await ctx.newPage();
  if (shot.initLocalStorage) {
    await page.addInitScript((store) => {
      for (const [k, v] of Object.entries(store)) localStorage.setItem(k, v);
    }, shot.initLocalStorage);
  }
  const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
  const path = `scripts/${prefix}-${shot.suffix}`;
  await page.screenshot({ path, fullPage: true });
  console.log(`HTTP ${res?.status()}  ${shot.viewport.width}x${shot.viewport.height}  ${shot.colorScheme ?? 'light'}  ->  ${path}`);
  await ctx.close();
}

await browser.close();
