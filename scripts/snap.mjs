import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const url = process.argv[2] ?? 'http://localhost:3000/';
const out = resolve(process.argv[3] ?? 'scripts/snap.png');
const [w, h] = (process.argv[4] ?? '1280x800').split('x').map(Number);

await mkdir(dirname(out), { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: w, height: h } });
const page = await ctx.newPage();
const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
await page.screenshot({ path: out, fullPage: true });
await browser.close();

console.log(`HTTP ${res?.status() ?? '???'}  ${url}  ->  ${out}`);
