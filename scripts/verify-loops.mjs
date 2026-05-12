// Verify EmailForm Loops integration end-to-end on live site.
// 1. Inspects the form's data-endpoint to confirm the env var baked in.
// 2. Submits a uniquely-tagged test email; intercepts the actual network
//    request to app.loops.so to verify URL + response.
// 3. Confirms client-side success message appears.
// Run: node scripts/verify-loops.mjs
import { chromium } from 'playwright';

const TEST_EMAIL = `verify+taskflow-claude-${Date.now()}@example.com`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
});

const pages = [
  { name: 'pricing', url: 'https://taskflow.kr/pricing#waitlist' },
  { name: 'download', url: 'https://taskflow.kr/download' },
];

for (const { name, url } of pages) {
  console.log(`\n━━━━━━━━━━ ${name.toUpperCase()}  (${url}) ━━━━━━━━━━`);
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  // 1. Inspect endpoint attribute baked at build time
  const endpoint = await page
    .locator('[data-email-form]')
    .first()
    .getAttribute('data-endpoint');
  console.log(`  data-endpoint: ${endpoint || '(empty — simulated)'}`);

  if (!endpoint || !endpoint.includes('app.loops.so')) {
    console.log('  ✗ Loops endpoint not baked in. Skipping submit test.');
    await page.close();
    continue;
  }

  // 2. Intercept the actual outgoing request + capture response
  const loopsRequestPromise = page.waitForRequest(
    (req) => req.url().includes('app.loops.so/api/newsletter-form/'),
    { timeout: 15000 }
  );
  const loopsResponsePromise = page.waitForResponse(
    (res) => res.url().includes('app.loops.so/api/newsletter-form/'),
    { timeout: 15000 }
  );

  // 3. Fill + submit
  const input = page.locator('[data-email-form] input[name="email"]').first();
  const button = page.locator('[data-email-form] button[type="submit"]').first();
  await input.fill(TEST_EMAIL);
  await button.click();

  let req, res;
  try {
    req = await loopsRequestPromise;
    res = await loopsResponsePromise;
  } catch (e) {
    console.log(`  ✗ Network request to Loops never happened: ${e.message}`);
    await page.close();
    continue;
  }

  console.log(`  → POST  ${req.url()}`);
  console.log(`  ← HTTP  ${res.status()}  ${res.statusText() || ''}`);
  const body = await res.text().catch(() => '');
  if (body) console.log(`  body:   ${body.slice(0, 200)}`);

  // 4. Wait for client-side success message
  const resultEl = page.locator('[data-email-result]').first();
  await resultEl.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  const resultText = await resultEl.textContent().catch(() => '');
  console.log(`  UI:     "${resultText?.trim()}"`);

  // Screenshot the success state
  const shot = `scripts/loops-${name}-success.png`;
  await page.screenshot({ path: shot, fullPage: false });
  console.log(`  shot:   ${shot}`);

  await page.close();
}

await browser.close();
console.log(`\n✓ Test email: ${TEST_EMAIL}\n  (Delete from Loops dashboard if you want a clean list.)`);
