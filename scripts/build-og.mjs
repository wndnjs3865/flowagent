// Generates 1200×630 OG images into sites/marketing/public/.
// Run: node scripts/build-og.mjs
// Variants:
//   og.png         — default brand image (used on /, /docs, /templates, /blog, /404)
//   og-pricing.png — pricing-focused (used on /pricing)
//   og-download.png — download-focused (used on /download)
import { chromium } from 'playwright';

const baseStyle = `
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
  .brand { display: flex; align-items: center; gap: 14px; font-size: 28px; font-weight: 700; letter-spacing: -0.01em; }
  .brand .mark { width: 44px; height: 44px; border-radius: 10px; background: #2563eb; display: grid; place-items: center; }
  .brand svg { width: 22px; height: 22px; fill: #fff; }
  h1 { font-size: 72px; line-height: 1.08; letter-spacing: -0.025em; font-weight: 800; max-width: 1000px; }
  h1 .accent { color: #60a5fa; }
  .sub { margin-top: 28px; font-size: 24px; line-height: 1.4; color: #a1a1aa; max-width: 900px; }
  .sub strong { color: #e4e4e7; font-weight: 600; }
  .footer { display: flex; align-items: center; justify-content: space-between; }
  .url { font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', monospace; font-size: 22px; color: #71717a; }
  .tag {
    display: inline-flex; align-items: center; gap: 10px; padding: 8px 16px;
    font-size: 16px; border-radius: 999px;
    background: rgba(96, 165, 250, 0.12); border: 1px solid rgba(96, 165, 250, 0.32);
    color: #93c5fd; font-weight: 500;
  }
  .tag::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #34d399; }
  .pillrow { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 32px; }
  .pill {
    display: inline-flex; align-items: center; padding: 10px 18px;
    font-size: 18px; border-radius: 12px;
    background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.08);
    color: #e4e4e7; font-weight: 500;
  }
  .pill .price { color: #60a5fa; font-weight: 700; margin-right: 8px; }
`;

const brandMark = `
  <span class="mark">
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 3a1 1 0 011-1h8a1 1 0 011 1v14a1 1 0 01-1.6.8L10 14.5l-3.4 3.3A1 1 0 015 17V3z" />
    </svg>
  </span>
`;

const variants = [
  {
    file: 'og.png',
    body: `
      <div>
        <div class="brand">${brandMark} FlowAgent</div>
        <h1 style="margin-top: 56px;">
          회사 데이터가<br />
          <span class="accent">노트북 밖으로 안 나가는</span><br />
          한국어 사무 자동화
        </h1>
        <p class="sub">
          <strong>회의록·매출·결재·문의·주간보고</strong> · 5종 워크플로 · 로컬 실행
        </p>
      </div>
      <div class="footer">
        <span class="tag">v0.1.0 · Beta — Pilot 3사 모집 중</span>
        <span class="url">taskflow.kr</span>
      </div>
    `,
  },
  {
    file: 'og-pricing.png',
    body: `
      <div>
        <div class="brand">${brandMark} FlowAgent · 가격</div>
        <h1 style="margin-top: 48px;">
          <span class="accent">Free는 평생 무료.</span><br />
          결제는 sync · 팀 · Pilot부터.
        </h1>
        <div class="pillrow">
          <span class="pill"><span class="price">₩0</span> Free · 영구</span>
          <span class="pill"><span class="price">₩19,900</span> Pro / 월</span>
          <span class="pill"><span class="price">₩9,900</span> Team / 시트</span>
          <span class="pill"><span class="price">₩500만</span> Pilot / 4주</span>
        </div>
        <p class="sub" style="margin-top: 28px;">
          워크플로우 개수·실행 횟수 <strong>무제한</strong> · 한국 시장 사업자 인보이스
        </p>
      </div>
      <div class="footer">
        <span class="tag">약 1개월 뒤 Pro 출시</span>
        <span class="url">taskflow.kr/pricing</span>
      </div>
    `,
  },
  {
    file: 'og-download.png',
    body: `
      <div>
        <div class="brand">${brandMark} FlowAgent · 다운로드</div>
        <h1 style="margin-top: 48px;">
          압축 풀고 <span class="accent">더블클릭 한 번.</span><br />
          1분이면 첫 워크플로우 실행.
        </h1>
        <p class="sub" style="margin-top: 32px;">
          <strong>Windows 즉시 시작 · macOS·Linux 터미널</strong> · 가입 불필요 · 신용카드 불필요<br />
          회사 데이터는 노트북 안에만
        </p>
      </div>
      <div class="footer">
        <span class="tag">v0.1.0 — 무료</span>
        <span class="url">taskflow.kr/download</span>
      </div>
    `,
  },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

for (const v of variants) {
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8" /><style>${baseStyle}</style></head><body>${v.body}</body></html>`;
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const out = `sites/marketing/public/${v.file}`;
  await page.screenshot({
    path: out,
    type: 'png',
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });
  console.log(`✓ ${out}`);
}

await browser.close();
