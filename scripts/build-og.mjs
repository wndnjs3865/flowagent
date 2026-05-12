// Generates sites/marketing/public/og.png (1200 × 630)
// Run: node scripts/build-og.mjs
// Rerun whenever the brand message / logo changes.
import { chromium } from 'playwright';
import { resolve } from 'node:path';

const OUT = resolve('sites/marketing/public/og.png');

const html = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <style>
      @font-face {
        font-family: 'Pretendard';
        font-weight: 45 920;
        font-style: normal;
        src: url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/PretendardVariable.woff2') format('woff2-variations');
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { width: 1200px; height: 630px; overflow: hidden; }
      body {
        font-family: 'Pretendard', system-ui, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
        background:
          radial-gradient(circle at 100% 0%, rgba(37, 99, 235, 0.18), transparent 55%),
          radial-gradient(circle at 0% 100%, rgba(96, 165, 250, 0.08), transparent 50%),
          #09090b;
        color: #fafafa;
        padding: 76px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 14px;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.01em;
      }
      .brand .mark {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: #2563eb;
        display: grid;
        place-items: center;
      }
      .brand svg { width: 22px; height: 22px; fill: #fff; }

      h1 {
        margin-top: 0;
        font-size: 72px;
        line-height: 1.08;
        letter-spacing: -0.025em;
        font-weight: 800;
        max-width: 1000px;
      }
      h1 .accent { color: #60a5fa; }

      .sub {
        margin-top: 28px;
        font-size: 24px;
        line-height: 1.4;
        color: #a1a1aa;
        max-width: 900px;
      }
      .sub strong {
        color: #e4e4e7;
        font-weight: 600;
      }

      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .url {
        font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', monospace;
        font-size: 22px;
        color: #71717a;
        letter-spacing: 0.01em;
      }
      .tag {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 8px 16px;
        font-size: 16px;
        border-radius: 999px;
        background: rgba(96, 165, 250, 0.12);
        border: 1px solid rgba(96, 165, 250, 0.32);
        color: #93c5fd;
        font-weight: 500;
      }
      .tag::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #34d399;
      }
    </style>
  </head>
  <body>
    <div>
      <div class="brand">
        <span class="mark">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M5 3a1 1 0 011-1h8a1 1 0 011 1v14a1 1 0 01-1.6.8L10 14.5l-3.4 3.3A1 1 0 015 17V3z" />
          </svg>
        </span>
        FlowAgent
      </div>

      <h1 style="margin-top: 56px;">
        Your workflows are<br />
        <span class="accent">plain YAML files.</span><br />
        Your data stays on your machine.
      </h1>

      <p class="sub">
        <strong>반복 업무 자동화</strong> · 로컬에서 100% 동작 · 평생 무료로 시작
      </p>
    </div>

    <div class="footer">
      <span class="tag">v0.1.0 · Beta — Pilot 3사 모집 중</span>
      <span class="url">taskflow.kr</span>
    </div>
  </body>
</html>`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2, // 2× retina for sharper social previews
});
const page = await ctx.newPage();
await page.setContent(html, { waitUntil: 'networkidle' });
// brief settle for webfont
await page.waitForTimeout(300);
await page.screenshot({
  path: OUT,
  type: 'png',
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});
await browser.close();
console.log(`✓ wrote ${OUT}`);
