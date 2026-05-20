# FlowAgent Marketing Site Phase A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** taskflow.kr 마케팅 사이트를 spec(2026-05-14)의 정체성으로 재정의 — A/B/D 페르소나 카탈로그 + Local-first 한국어 차별점 메시지 + 8개 design pattern 적용 + SEO/OG uncommitted 7파일 정리·커밋.

**Architecture:** Astro 5.1 + Tailwind 4.0 정적 사이트(`sites/marketing/`). 기존 페이지(`index`, `pricing`, `download`, `docs`, `blog`, `templates`, `404`)는 유지하고 페르소나별 entry 3개(`/sumu`, `/executive`, `/solo`) 신규 추가. pricing.astro 가격/Trigger/비교표는 spec 일치하게 수정. 본체 FlowAgent(`src/`)와 B 신규 워크플로 3종은 Plan 2에서, Cloud 호스팅은 Plan 3에서.

**Tech Stack:** Astro 5.1, Tailwind 4.0, TypeScript, EmailForm.astro (Loops integration), JSON-LD schemas (BaseLayout `structuredData` prop).

**Spec reference:** `docs/superpowers/specs/2026-05-14-flowagent-redefinition-design.md`

---

## File Structure

**Modify (sites/marketing/src/):**
- `pages/index.astro` — Hero 헤드라인, 페르소나 entry 3 카드, 5종 워크플로 카드 (P1·P3·P8)
- `pages/pricing.astro` — Pro/Team 가격 spec 일치, Enterprise → Pilot 카드, P4·P6·P7
- `components/EmailForm.astro` — button label P2 적용
- `pages/download.astro` — button label P2 일괄
- `pages/docs.astro` — button label P2 일괄

**Create (sites/marketing/src/pages/):**
- `sumu.astro` — A 페르소나 (SMB 사무직) entry
- `executive.astro` — D 페르소나 (SMB 사장) entry + 사장 대시보드 placeholder
- `solo.astro` — B 페르소나 (1인 자영업) wait-list

**Commit separately (uncommitted SEO/OG 7파일):**
- `README.md` (modified)
- `scripts/build-og.mjs` (modified, 3 variant OG 생성)
- `sites/marketing/public/og.png` (modified), `og-pricing.png` (new), `og-download.png` (new)
- `sites/marketing/src/layouts/BaseLayout.astro` (modified, JSON-LD 인프라)
- `sites/marketing/src/pages/pricing.astro` (modified, Product+Offer 스키마) — *주의: 이 plan의 가격 변경 task 전에 SEO 부분만 commit*
- `sites/marketing/src/pages/download.astro` (modified, SoftwareApplication)
- `sites/marketing/src/pages/docs.astro` (modified, 7섹션 본문 + TechArticle)

---

## Task 1: Pre-flight 검증

**Files:** (검증만, 수정 없음)

- [ ] **Step 1: 의존성 설치**

Run from `C:\flowagent`:
```bash
pnpm -C sites/marketing install
```
Expected: `Done in <Xs>` 메시지, error 없음.

- [ ] **Step 2: 기존 사이트 build baseline 확인**

```bash
pnpm -C sites/marketing build
```
Expected: `Server built in <Xs>` + `dist/` 생성. 에러 없음. 5개 페이지 (`index`, `pricing`, `download`, `docs`, `404`) + 2 placeholder(`blog`, `templates`) HTML 생성 확인.

- [ ] **Step 3: dev 서버 sanity check**

```bash
pnpm -C sites/marketing dev
```
브라우저에서 `http://localhost:4321/` 열고 페이지 5개 (`/`, `/pricing`, `/download`, `/docs`, 존재 안 하는 URL → `/404`) 시각 확인. Ctrl+C로 종료.

- [ ] **Step 4: OG 생성 스크립트 동작 확인 (uncommitted 변경 포함)**

```bash
node scripts/build-og.mjs
```
Expected: `sites/marketing/public/og.png`, `og-pricing.png`, `og-download.png` 3개 파일 생성/갱신. 콘솔에 3개 경로 출력. 에러 없음.

---

## Task 2: SEO/OG uncommitted 7파일 정리·커밋

**Files (모두 modified or new, working tree에 이미 존재):**
- `README.md`
- `scripts/build-og.mjs`
- `sites/marketing/public/og.png` (modified)
- `sites/marketing/public/og-pricing.png` (new)
- `sites/marketing/public/og-download.png` (new)
- `sites/marketing/src/layouts/BaseLayout.astro`
- `sites/marketing/src/pages/pricing.astro`
- `sites/marketing/src/pages/download.astro`
- `sites/marketing/src/pages/docs.astro`

> **주의:** 이 task는 *현 working tree 그대로* commit. 이 plan의 Task 11~12에서 `pricing.astro` 가격을 수정할 예정이므로 **반드시 이 task가 먼저** 끝나야 SEO 작업과 가격 변경이 별도 커밋으로 분리됨.

- [ ] **Step 1: git status로 7파일 확인**

```bash
git status
```
Expected output 포함:
```
modified:   README.md
modified:   scripts/build-og.mjs
modified:   sites/marketing/public/og.png
modified:   sites/marketing/src/layouts/BaseLayout.astro
modified:   sites/marketing/src/pages/docs.astro
modified:   sites/marketing/src/pages/download.astro
modified:   sites/marketing/src/pages/pricing.astro
Untracked files:
  sites/marketing/public/og-download.png
  sites/marketing/public/og-pricing.png
```

- [ ] **Step 2: 빌드 검증 (변경 반영된 상태로 빌드 통과 확인)**

```bash
pnpm -C sites/marketing build
```
Expected: 에러 없이 완료. `dist/` 안에 모든 페이지 HTML 생성.

- [ ] **Step 3: 변경 파일만 명시적으로 stage**

```bash
git add README.md scripts/build-og.mjs sites/marketing/public/og.png sites/marketing/public/og-pricing.png sites/marketing/public/og-download.png sites/marketing/src/layouts/BaseLayout.astro sites/marketing/src/pages/docs.astro sites/marketing/src/pages/download.astro sites/marketing/src/pages/pricing.astro
git status
```
Expected: 위 9파일이 `Changes to be committed` 섹션. `.claude/` 같은 다른 untracked는 *unstaged* 상태.

- [ ] **Step 4: Commit**

```bash
git -c user.name="wndnjs3865" -c user.email="wndnjs3865@gmail.com" commit -m "$(cat <<'EOF'
Add SEO/OG infrastructure + /docs 7-section expansion

- BaseLayout: JSON-LD Organization + WebSite graph, page-level structuredData prop
- pricing.astro: Product + Offer[] schema, og-pricing.png linked
- download.astro: SoftwareApplication schema, og-download.png linked
- docs.astro: TechArticle schema, +489 lines (Coming Soon banner removed → 7 sections)
- scripts/build-og.mjs: 3-variant OG generator (og / og-pricing / og-download)
- README.md: taskflow.kr-centric rewrite + Korean quickstart

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```
Expected: `[main <hash>] Add SEO/OG infrastructure + /docs 7-section expansion` + `9 files changed` 정도.

- [ ] **Step 5: 커밋 후 상태 확인**

```bash
git status
git log -2 --oneline
```
Expected: 최근 2개 commit이 위 SEO commit + 이전 spec commit(`bbc3ad7 Add FlowAgent redefinition spec`). working tree에 marketing 관련 modified 없음.

---

## Task 3: Hero 헤드라인 spec 일치로 변경

**Files:**
- Modify: `sites/marketing/src/pages/index.astro:22-39`

이 task는 spec §2 차별점 메시지("회사 데이터가 노트북 밖으로 안 나가는 한국어 사무 자동화")를 Hero에 반영. 현재는 영어 "Your workflows are plain YAML files. Your data stays on your machine."

- [ ] **Step 1: 현재 Hero 코드 확인**

`C:\flowagent\sites\marketing\src\pages\index.astro:22-39` 읽고 `<h1>` + 아래 `<p>` 위치 확인.

- [ ] **Step 2: BaseLayout title/description 변경**

`index.astro:7-8` 변경:
```astro
<BaseLayout
  title="FlowAgent — 회사 데이터가 노트북 밖으로 안 나가는 한국어 사무 자동화"
  description="비개발자도 더블클릭 2번으로. 회의록·매출·결재·문의·주간보고 5종 한국어 워크플로 + start.bat 진입. 데이터는 노트북 안에서만 움직입니다."
>
```

- [ ] **Step 3: Hero h1 + p 변경**

`index.astro:22-39` 의 `<h1>` 블록과 아래 `<p>` 블록을 다음으로 교체:

```astro
<h1
  class="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-zinc-50"
>
  회사 데이터가<br />
  <span class="text-brand-600 dark:text-brand-400">
    노트북 밖으로 안 나가는
  </span><br />
  한국어 사무 자동화
</h1>

<p
  class="mt-6 max-w-2xl text-lg text-zinc-600 sm:text-xl dark:text-zinc-400"
>
  비개발자도 더블클릭 2번으로 시작.<br
    class="hidden sm:block"
  />
  5종 한국 사무 워크플로(회의록·매출·결재·문의·주간보고)를 바로 사용하세요.
</p>
```

- [ ] **Step 4: 빌드 검증**

```bash
pnpm -C sites/marketing build
```
Expected: 에러 없음.

- [ ] **Step 5: dev 서버 시각 검증**

```bash
pnpm -C sites/marketing dev
```
브라우저에서 `http://localhost:4321/` 확인 — 새 헤드라인 + 한국어 sub-claim 노출. Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add sites/marketing/src/pages/index.astro
git -c user.name="wndnjs3865" -c user.email="wndnjs3865@gmail.com" commit -m "$(cat <<'EOF'
Replace landing Hero with Local-first Korean office automation message

Aligns headline with redefinition spec §2 differentiator.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: 페르소나 entry 3 카드 (P3)

**Files:**
- Modify: `sites/marketing/src/pages/index.astro` (Hero 섹션과 DEMO PLACEHOLDER 섹션 사이에 새 섹션 삽입, 현재 line 99 근처)

P3 패턴 적용: A/B/D 3 카드, 각 카드 = 슬로건 1줄 + 그 페르소나가 처음 만질 워크플로 1개 미리보기 + CTA.

- [ ] **Step 1: 삽입 위치 확인**

`index.astro:97`에 `</section>` (Hero 섹션 종료)가 있음. 그 다음 줄 `index.astro:99`의 DEMO PLACEHOLDER 섹션 `<section>` 직전이 삽입 위치.

- [ ] **Step 2: 페르소나 entry 섹션 삽입**

`index.astro:97-99` 사이에 다음 섹션 추가 (Hero `</section>` 와 DEMO PLACEHOLDER `<section>` 사이):

```astro
  <!-- ──────────────────────────────────────────  PERSONA ENTRY (P3)  ─── -->
  <section
    class="border-b border-zinc-200 dark:border-zinc-800"
  >
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div class="max-w-2xl">
        <h2
          class="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100"
        >
          나에게 맞는 시작점을 골라보세요
        </h2>
        <p class="mt-3 text-zinc-600 dark:text-zinc-400">
          매일 어떤 사무를 처리하시나요? 가장 가까운 카드를 골라 들어가세요.
        </p>
      </div>

      <div class="mt-10 grid gap-5 md:grid-cols-3">
        <!-- A. SMB 사무직 -->
        <a
          href="/sumu"
          class="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div
            class="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300"
          >
            사무직 · 1인 다역
          </div>
          <h3
            class="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            매일 같은 보고를 다시 쓰지 않게
          </h3>
          <p class="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            회의록 정리 · 매출 요약 · 결재 분류 · 문의 답변 · 주간 보고를 5종 워크플로로.
          </p>
          <span
            class="mt-6 inline-flex items-center text-sm font-medium text-brand-600 group-hover:underline dark:text-brand-400"
          >
            5종 살펴보기 →
          </span>
        </a>

        <!-- B. 1인 자영업 (wait-list) -->
        <a
          href="/solo"
          class="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div
            class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            1인 자영업 · 준비 중
          </div>
          <h3
            class="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            견적·응대·SNS, 매일 반복되는 일감을 줄이고
          </h3>
          <p class="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            견적 메일·영업 후처리·SNS 답글 3종 신규 워크플로 출시 예정. 가장 먼저 알려드릴게요.
          </p>
          <span
            class="mt-6 inline-flex items-center text-sm font-medium text-amber-700 group-hover:underline dark:text-amber-300"
          >
            출시 알림 받기 →
          </span>
        </a>

        <!-- D. SMB 사장 -->
        <a
          href="/executive"
          class="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div
            class="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300"
          >
            사장 · 대표
          </div>
          <h3
            class="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            오늘 한 페이지로 회사 상황을 확인하세요
          </h3>
          <p class="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            매출·결재·문의·주간 진행 요약을 모바일에서 한 화면으로. Pilot 미팅으로 시작.
          </p>
          <span
            class="mt-6 inline-flex items-center text-sm font-medium text-brand-600 group-hover:underline dark:text-brand-400"
          >
            사장 모드 보기 →
          </span>
        </a>
      </div>
    </div>
  </section>
```

- [ ] **Step 3: 빌드 검증**

```bash
pnpm -C sites/marketing build
```
Expected: 에러 없음. (이 시점에 `/sumu`, `/executive`, `/solo` 페이지는 아직 없어서 빌드 자체는 통과하나, 클릭 시 404. Task 5~7에서 추가)

- [ ] **Step 4: 시각 검증**

```bash
pnpm -C sites/marketing dev
```
`http://localhost:4321/` 확인 — 3 카드가 Hero 아래에 나타남. 데스크탑 3-column, 모바일 1-column. Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add sites/marketing/src/pages/index.astro
git -c user.name="wndnjs3865" -c user.email="wndnjs3865@gmail.com" commit -m "Add persona entry 3 cards (A/B/D) on landing — pattern P3

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: /sumu 페이지 (A 페르소나 entry)

**Files:**
- Create: `sites/marketing/src/pages/sumu.astro`

A 페르소나(SMB 사무직): 5종 워크플로 카드 + start.bat 다운로드 CTA + Pilot 미팅 신청.

- [ ] **Step 1: 신규 파일 생성**

`C:\flowagent\sites\marketing\src\pages\sumu.astro` 전체 내용:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  title="SMB 사무직 1인 다역 — FlowAgent"
  description="회의록·매출·결재·문의·주간보고 5종 워크플로. 회사 데이터는 노트북 안에서만. start.bat 더블클릭으로 시작."
>
  <section class="border-b border-zinc-200 dark:border-zinc-800">
    <div class="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
      <div
        class="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300"
      >
        사무직 · 1인 다역
      </div>
      <h1
        class="mt-5 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50"
      >
        매일 같은 보고를<br />
        <span class="text-brand-600 dark:text-brand-400">다시 쓰지 않게</span>
      </h1>
      <p class="mt-5 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
        직원 5~50명 회사에서 회의록·매출·결재·문의·주간보고를 혼자 처리하는 분께. 5종 워크플로가 매일 반복을 30초로 줄여드립니다.
      </p>
      <div class="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href="/download"
          class="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          지금 받아보기
        </a>
        <a
          href="mailto:wndnjs3865@naver.com?subject=%5BA%5D%20FlowAgent%20Pilot%20%EB%AF%B8%ED%8C%85%20%EC%8B%A0%EC%B2%AD"
          class="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-6 py-3 text-base font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Pilot 미팅 신청하기
        </a>
      </div>
    </div>
  </section>

  <section class="border-b border-zinc-200 dark:border-zinc-800">
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <h2 class="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
        5종 워크플로 — 매일 쓰는 그대로
      </h2>
      <div class="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">회의록 → 액션 분류</h3>
          <ul class="mt-3 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• 한국어 회의록(.md)을 담당자별 액션으로</li>
            <li>• Slack에 바로 붙여넣는 포맷</li>
            <li>• ≈10초</li>
          </ul>
        </div>
        <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">매출 CSV → 임원 요약</h3>
          <ul class="mt-3 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• 채널별 이상치 자동 감지</li>
            <li>• 경영진 보고용 3문장 요약</li>
            <li>• ≈15초</li>
          </ul>
        </div>
        <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">결재 대기함 → 분류·브리프</h3>
          <ul class="mt-3 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• 자동승인·검토·정보부족 3분류</li>
            <li>• 오늘의 결재 brief</li>
            <li>• ≈17초</li>
          </ul>
        </div>
        <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">고객 문의 → 분류·답변</h3>
          <ul class="mt-3 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• 카테고리·긴급도 자동 분류</li>
            <li>• 카테고리별 답변 초안</li>
            <li>• ≈24초</li>
          </ul>
        </div>
        <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">주간 보고 → Slack 포맷</h3>
          <ul class="mt-3 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• 한 줄 인풋 → 3-bullet 보고</li>
            <li>• Slack 그대로 붙여넣기</li>
            <li>• ≈9초</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: 빌드 검증**

```bash
pnpm -C sites/marketing build
```
Expected: 에러 없음. `dist/sumu/index.html` 생성 확인.

- [ ] **Step 3: 시각 검증**

```bash
pnpm -C sites/marketing dev
```
`http://localhost:4321/sumu` 열기 — Hero + 5종 카드 + CTA 2개. landing의 A 카드 클릭으로도 도달.

- [ ] **Step 4: Commit**

```bash
git add sites/marketing/src/pages/sumu.astro
git -c user.name="wndnjs3865" -c user.email="wndnjs3865@gmail.com" commit -m "Add /sumu page — A persona (SMB office staff) entry with 5 workflow cards

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: /executive 페이지 (D 페르소나 entry, baseline)

**Files:**
- Create: `sites/marketing/src/pages/executive.astro`

D 페르소나(SMB 사장): "오늘의 대시보드" 컨셉 + Pilot 미팅 강조 CTA. 실제 대시보드 UI는 FlowAgent 본체 작업(Plan 2 이후)이므로 marketing 페이지는 *컨셉 설명 + Pilot 신청*만.

- [ ] **Step 1: 신규 파일 생성**

`C:\flowagent\sites\marketing\src\pages\executive.astro` 전체 내용:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  title="SMB 사장·대표 — FlowAgent"
  description="오늘 한 페이지로 회사 상황을. 매출·결재 잔량·문의 큐·주간 진행을 모바일 한 화면으로. Pilot 미팅 4주에 셋업."
>
  <section class="border-b border-zinc-200 dark:border-zinc-800">
    <div class="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
      <div
        class="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300"
      >
        사장 · 대표
      </div>
      <h1
        class="mt-5 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50"
      >
        오늘 한 페이지로<br />
        <span class="text-brand-600 dark:text-brand-400">회사 상황을 확인</span>
      </h1>
      <p class="mt-5 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
        직원 5~20명 회사 대표를 위한 한 화면 요약. 직원이 채우면 사장이 봅니다. 모바일에서 회의 직전, 출근길에 30초.
      </p>
      <div class="mt-8">
        <a
          href="mailto:wndnjs3865@naver.com?subject=%5BD%5D%20FlowAgent%20Pilot%20%EB%AF%B8%ED%8C%85%20%EC%8B%A0%EC%B2%AD"
          class="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          Pilot 미팅 신청하기
        </a>
      </div>
    </div>
  </section>

  <section class="border-b border-zinc-200 dark:border-zinc-800">
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <h2 class="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
        대시보드 한 페이지에 들어가는 것
      </h2>
      <div class="mt-10 grid gap-5 md:grid-cols-2">
        <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">오늘의 매출 (3문장 요약)</h3>
          <p class="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            채널별 이상치 자동 짚어드리는 한 줄. 어제 대비, 지난주 대비, 월 누적.
          </p>
        </div>
        <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">결재 잔량 · 오늘의 brief</h3>
          <p class="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            결재 대기 건수 + 자동승인 후보 vs 본인 검토 필요. 한눈에 시각화.
          </p>
        </div>
        <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">문의 큐 · 카테고리 분포</h3>
          <p class="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            CS팀이 어떤 카테고리에 시간 쓰는지. 우선순위 외 패턴 변화 감지.
          </p>
        </div>
        <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">주간 진행 — Slack 포맷 그대로</h3>
          <p class="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            팀장이 매주 작성한 보고를 사장이 같은 포맷으로. 일관성·비교 가능.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
      <h2 class="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
        4주 Pilot — 같이 만들어 드립니다
      </h2>
      <p class="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
        30분 미팅에서 귀사 데이터로 워크플로 1개 같이 셋업.<br />
        4주 안에 운영에 들어갑니다. ₩500만.
      </p>
      <div class="mt-8">
        <a
          href="mailto:wndnjs3865@naver.com?subject=%5BD%5D%20FlowAgent%20Pilot%20%EB%AF%B8%ED%8C%85%20%EC%8B%A0%EC%B2%AD"
          class="inline-flex items-center justify-center rounded-md bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          Pilot 미팅 신청하기
        </a>
      </div>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: 빌드 검증**

```bash
pnpm -C sites/marketing build
```
Expected: 에러 없음. `dist/executive/index.html` 생성.

- [ ] **Step 3: 시각 검증**

`http://localhost:4321/executive` — 사장 컨셉 + 4 항목 + Pilot CTA. landing D 카드 클릭으로도 도달.

- [ ] **Step 4: Commit**

```bash
git add sites/marketing/src/pages/executive.astro
git -c user.name="wndnjs3865" -c user.email="wndnjs3865@gmail.com" commit -m "Add /executive page — D persona (SMB CEO) entry with Pilot CTA

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: /solo 페이지 (B 페르소나 wait-list)

**Files:**
- Create: `sites/marketing/src/pages/solo.astro`

B 페르소나(1인 자영업): 신규 3종 워크플로(견적·영업 후처리·SNS 답글) "준비 중" 안내 + EmailForm wait-list.

- [ ] **Step 1: 신규 파일 생성**

`C:\flowagent\sites\marketing\src\pages\solo.astro` 전체 내용:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import EmailForm from '../components/EmailForm.astro';
---

<BaseLayout
  title="1인 자영업 · 프리랜서 — FlowAgent"
  description="견적 메일·영업 후처리·SNS 답글 3종 신규 워크플로 출시 예정. 가장 먼저 알려드릴게요."
>
  <section class="border-b border-zinc-200 dark:border-zinc-800">
    <div class="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
      <div
        class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
        준비 중 · 4~6주 뒤 출시
      </div>
      <h1
        class="mt-5 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50"
      >
        견적·응대·SNS,<br />
        <span class="text-brand-600 dark:text-brand-400">매일 반복되는 일감을 줄이고</span>
      </h1>
      <p class="mt-5 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
        1인 디자이너·강사·컨설턴트·소상공인에게. 영업·견적·고객 응대까지 모두 본인이 처리하는 분께. 3종 신규 워크플로가 매일 반복을 30초로.
      </p>
      <div class="mt-8 flex justify-start">
        <EmailForm
          variant="inline"
          source="solo-waitlist"
          buttonText="출시 알림 받을게요"
          placeholder="이메일을 알려주세요"
        />
      </div>
      <p class="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
        스팸 없음 · 출시 1회만 알림 · 메일 주소만 사용
      </p>
    </div>
  </section>

  <section class="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <h2 class="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
        준비 중인 3종 워크플로
      </h2>
      <div class="mt-10 grid gap-5 md:grid-cols-3">
        <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">견적 메일 작성</h3>
          <ul class="mt-3 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• 요청 사항 → 견적 + 톤 조정</li>
            <li>• 한국 비즈니스 톤 표준</li>
            <li>• 이메일 그대로 복사</li>
          </ul>
        </div>
        <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">영업 후처리</h3>
          <ul class="mt-3 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• 미팅 노트 → 다음 액션 분류</li>
            <li>• Follow-up 메일 초안</li>
            <li>• CRM 입력 형식</li>
          </ul>
        </div>
        <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">SNS 답글 작성</h3>
          <ul class="mt-3 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• 본인 톤 학습 + 답글 생성</li>
            <li>• 인스타·페북·블로그 댓글</li>
            <li>• 1초 답글 모드</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: 빌드 검증**

```bash
pnpm -C sites/marketing build
```
Expected: 에러 없음. `dist/solo/index.html` 생성.

- [ ] **Step 3: 시각 검증**

`http://localhost:4321/solo` — 준비 중 배지 + Hero + 3종 placeholder 카드 + EmailForm. landing B 카드 클릭으로도 도달.

- [ ] **Step 4: Commit**

```bash
git add sites/marketing/src/pages/solo.astro
git -c user.name="wndnjs3865" -c user.email="wndnjs3865@gmail.com" commit -m "Add /solo page — B persona (solo / freelancer) wait-list

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: P7 — Free 카드 임계 배지

**Files:**
- Modify: `sites/marketing/src/pages/pricing.astro:206-258`

현재 Free 카드 `<p class="mt-1 text-xs ...">노트북 1대, 평생 무료</p>` 라인은 작은 회색 text. P7 패턴: 우상단 emerald 배지로 시각적 강조.

- [ ] **Step 1: Free 카드 구조 확인**

`pricing.astro:207-215` 의 Free 카드 헤더 부분 (Title + sub-text) 확인.

- [ ] **Step 2: 배지 추가**

`pricing.astro:207-215`의 다음 코드:
```astro
<div
  class="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
>
  <div class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
    Free
  </div>
  <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
    노트북 1대, 평생 무료
  </p>
```

를 다음으로 교체:
```astro
<div
  class="relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
>
  <div
    class="absolute right-4 top-4 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
  >
    노트북 1대 · 평생 무료
  </div>
  <div class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
    Free
  </div>
  <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
    회사 데이터, 노트북 안에만
  </p>
```

(부제는 차별점 강조용으로 변경)

- [ ] **Step 3: 빌드 검증**

```bash
pnpm -C sites/marketing build
```
Expected: 에러 없음.

- [ ] **Step 4: 시각 검증**

`http://localhost:4321/pricing` — Free 카드 우상단에 emerald 배지 "노트북 1대 · 평생 무료". Pro·Team·Enterprise 카드와 구분됨.

- [ ] **Step 5: Commit**

```bash
git add sites/marketing/src/pages/pricing.astro
git -c user.name="wndnjs3865" -c user.email="wndnjs3865@gmail.com" commit -m "Add Free threshold badge on pricing — pattern P7

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: P6 — 비교표 첫 그룹 ("코어 (전 플랜 공통)") 시각 강조

**Files:**
- Modify: `sites/marketing/src/pages/pricing.astro:593-599`

현재 `compareGroups[0].category === '코어 (전 플랜 공통)'` 그룹은 다른 그룹과 동일한 background. P6 패턴: 이 행만 `bg-emerald-50/30`로 두드러지게 + 좌측 "필수" 배지.

- [ ] **Step 1: 비교표 group 헤더 행 코드 확인**

`pricing.astro:593-599`의 다음 코드:
```astro
{compareGroups.map((group) => (
  <>
    <tr class="border-t border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
      <td
        class="sticky left-0 z-10 bg-zinc-50/50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-500"
        colspan="5">{group.category}</td>
    </tr>
```

- [ ] **Step 2: 첫 그룹만 조건부 강조**

위 코드를 다음으로 교체:
```astro
{compareGroups.map((group, gIdx) => (
  <>
    <tr
      class:list={[
        'border-t border-zinc-200 dark:border-zinc-800',
        gIdx === 0
          ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
          : 'bg-zinc-50/50 dark:bg-zinc-900/50',
      ]}
    >
      <td
        class:list={[
          'sticky left-0 z-10 px-4 py-2 text-xs font-semibold uppercase tracking-wider',
          gIdx === 0
            ? 'bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300'
            : 'bg-zinc-50/50 text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-500',
        ]}
        colspan="5"
      >
        {gIdx === 0 && (
          <span class="mr-2 inline-flex rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100">
            필수
          </span>
        )}
        {group.category}
      </td>
    </tr>
```

- [ ] **Step 3: 빌드 검증**

```bash
pnpm -C sites/marketing build
```
Expected: 에러 없음.

- [ ] **Step 4: 시각 검증**

`http://localhost:4321/pricing` 비교표 부분 — 첫 그룹("코어") 행이 emerald 배경 + "필수" 배지. 나머지 그룹은 기존 zinc 배경.

- [ ] **Step 5: Commit**

```bash
git add sites/marketing/src/pages/pricing.astro
git -c user.name="wndnjs3865" -c user.email="wndnjs3865@gmail.com" commit -m "Emphasize 'core' group in comparison table — pattern P6

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: P4 — Trigger 카드에 임계 숫자 배지

**Files:**
- Modify: `sites/marketing/src/pages/pricing.astro:497-553`

현재 Trigger 카드 3개의 배지: "→ Pro", "→ Team", "→ Enterprise". P4 강화: 임계 숫자 명시 ("→ Pro: 노트북 2번째부터" 등). 이 변경은 Task 11에서 Enterprise → Pilot 교체 전에도 가능 (Task 11에서 다시 다듬어짐).

- [ ] **Step 1: 3 Trigger 카드 배지 코드 확인**

`pricing.astro:500-504`, `:519-523`, `:538-542` 위치의 3 배지.

- [ ] **Step 2: 첫 카드 배지 변경 (→ Pro)**

`pricing.astro:500-504`의 다음 코드:
```astro
<div
  class="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300"
>
  → Pro
</div>
```

를 다음으로 교체:
```astro
<div
  class="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300"
>
  → Pro · 노트북 2대째부터
</div>
```

- [ ] **Step 3: 둘째 카드 배지 변경 (→ Team)**

`pricing.astro:519-523`의 `→ Team` 을 `→ Team · 동료 3명부터` 로 동일 패턴 교체.

- [ ] **Step 4: 셋째 카드 배지 변경 (→ Enterprise)**

`pricing.astro:538-542`의 `→ Enterprise` 을 `→ Enterprise · 직원 25명 + 보안팀이 막을 때` 로 동일 패턴 교체.

- [ ] **Step 5: 빌드 검증**

```bash
pnpm -C sites/marketing build
```
Expected: 에러 없음.

- [ ] **Step 6: 시각 검증**

`http://localhost:4321/pricing` Trigger 섹션 — 3 카드 모두 배지에 임계 숫자 포함.

- [ ] **Step 7: Commit**

```bash
git add sites/marketing/src/pages/pricing.astro
git -c user.name="wndnjs3865" -c user.email="wndnjs3865@gmail.com" commit -m "Add threshold numbers to trigger badges on pricing — pattern P4

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Pricing 4번째 카드를 Enterprise → Pilot 으로 교체

**Files:**
- Modify: `sites/marketing/src/pages/pricing.astro:418-475` (Enterprise 카드), `:537-552` (3rd Trigger 카드), `:577-590` (비교표 헤더), `compareGroups`의 4번째 column

Spec §7: Free / Pro / Team / **Pilot** 구조. 현 Enterprise를 Pilot으로 교체.

- [ ] **Step 1: 4번째 카드 (Enterprise) 전체 코드 교체**

`pricing.astro:418-475`의 Enterprise 카드 전체 (`<!-- ─── ENTERPRISE ─── -->`부터 closing `</div>`까지)를 다음으로 교체:

```astro
        <!-- ─── PILOT ─── -->
        <div
          class="flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Pilot
          </div>
          <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
            4주에 운영 들어가는 1대1 셋업
          </p>
          <div class="mt-5">
            <div class="flex items-baseline gap-1">
              <span
                class="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
                >₩500만</span
              >
              <span class="text-sm text-zinc-500 dark:text-zinc-500">/4주</span>
            </div>
            <p class="mt-1 h-4 text-xs text-zinc-500 dark:text-zinc-500">
              귀사 데이터로 워크플로 1개 같이
            </p>
          </div>
          <a
            href="mailto:wndnjs3865@naver.com?subject=FlowAgent%20Pilot%20%EB%AF%B8%ED%8C%85%20%EC%8B%A0%EC%B2%AD"
            class="mt-5 inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            Pilot 미팅 신청하기
          </a>
          <ul class="mt-6 space-y-2.5 text-sm text-zinc-700 dark:text-zinc-300">
            <li class="flex items-start gap-2 font-medium text-zinc-900 dark:text-zinc-100">
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/></svg>
              Free의 모든 기능 +
            </li>
            <li class="flex items-start gap-2">
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/></svg>
              30분 미팅으로 귀사 데이터 캡처
            </li>
            <li class="flex items-start gap-2">
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/></svg>
              YAML 1개 1대1 설계
            </li>
            <li class="flex items-start gap-2">
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/></svg>
              4주 운영 지원 + 셋업 보장
            </li>
            <li class="flex items-start gap-2">
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/></svg>
              사업자 인보이스 / 세금계산서
            </li>
            <li class="flex items-start gap-2">
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/></svg>
              완료 후 월 retainer 옵션 (₩50~150만)
            </li>
          </ul>
        </div>
```

- [ ] **Step 2: 비교표 헤더 컬럼명 변경**

`pricing.astro:587-590`의:
```astro
<th
  class="px-4 py-3 text-center font-semibold text-zinc-900 dark:text-zinc-100"
  scope="col">Enterprise</th>
```
을:
```astro
<th
  class="px-4 py-3 text-center font-semibold text-zinc-900 dark:text-zinc-100"
  scope="col">Pilot</th>
```

- [ ] **Step 3: compareGroups 4번째 column 값 검토 및 재해석**

`pricing.astro:70-125` `compareGroups` 안의 모든 `cells: [_, _, _, X]`에서 4번째 값은 현재 Enterprise를 위한 값. Pilot 의미에 맞게 다듬기 — 다음 항목만 변경:

- "자동 업데이트" cells 끝 `'관리자 제어'` → `true` (Pilot은 개인 노트북이라 자동 업데이트)
- "Multi-device sync" cells 끝 `'무제한'` → `false` (Pilot에는 sync 없음)
- "Cloud run history backup" cells 끝 `'무제한'` → `false`
- "E2E 암호화" cells 끝 `true` → `false`
- "Team workspace" 끝 `true` → `false`
- "Shared workflows" 끝 `true` → `false`
- "권한 관리 (admin/member)" 끝 `'커스텀 역할'` → `false`
- "감사 로그 (audit)" 끝 `'무제한 + export'` → `false`
- "프리미엄 템플릿" 끝 `'커스텀 가능'` → `'1대1 맞춤'`
- "팀 전용 템플릿" 끝 `true` → `false`
- "개인 API 토큰" 끝 `true` → `true` (유지)
- "SSO / SAML" 끝 `true` → `false`
- "자체 호스팅 Sync 서버" 끝 `true` → `false`
- "Vault 연동 (사내 키 관리)" 끝 `true` → `false`
- "사업자 인보이스 / 세금계산서" 끝 `true` → `true` (유지)
- "지원 채널" 끝 `'전담 CSM'` → `'1대1 카톡 + 4주 운영'`
- "온보딩 세션" 끝 `'맞춤 진행'` → `'30분 미팅 + 셋업'`

(즉, Pilot은 sync·팀·SSO 없는 1대1 Free 플랜 + 컨설팅. 변경 항목만 명시.)

- [ ] **Step 4: Trigger 카드 3번째 배지 다시 다듬기 (Task 10에서 Enterprise → Pilot 일관성)**

`pricing.astro:538-542`의 3번째 Trigger 배지를 Task 10에서 `→ Enterprise · 직원 25명 + 보안팀이 막을 때`로 했음. 이걸 Pilot에 맞게 변경:

```astro
<div
  class="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300"
>
  → Pilot · 시간이 없거나 보안 강할 때
</div>
```

같은 카드의 `<h3>`와 `<p>` 텍스트도 Pilot에 맞춰 변경:
```astro
<h3
  class="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100"
>
  "직접 만들 시간이 없고, 데이터는 외부 못 줘"
</h3>
<p class="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
  30분 미팅으로 귀사 데이터 캡처 → YAML 1개 같이 설계 → 4주 안에 운영. 회사 데이터는
  미팅 후 노트북에만 남습니다.
</p>
```

- [ ] **Step 5: 빌드 검증**

```bash
pnpm -C sites/marketing build
```
Expected: 에러 없음. 4번째 컬럼 "Pilot"으로 표시. 비교표 cells 4번째 값들이 새 의미로 표시.

- [ ] **Step 6: 시각 검증**

`http://localhost:4321/pricing` — 4 카드: Free / Pro / Team / Pilot. 비교표 4번째 컬럼 "Pilot". Trigger 3번째 카드가 Pilot 시나리오로.

- [ ] **Step 7: Commit**

```bash
git add sites/marketing/src/pages/pricing.astro
git -c user.name="wndnjs3865" -c user.email="wndnjs3865@gmail.com" commit -m "Replace Enterprise plan with Pilot ₩5M / 4 weeks

Aligns pricing structure with spec §7 (Free / Pro / Team / Pilot).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Pro/Team 가격 spec 일치 (Pro ₩12K → ₩19,900, Team ₩20K/시트 → ₩9,900/시트)

**Files:**
- Modify: `sites/marketing/src/pages/pricing.astro:6-13` (가격 상수)

Spec §7: Pro ₩19,900 / Team ₩9,900 (인당). 현재 코드: Pro ₩12,000 / Team ₩20,000/시트.

- [ ] **Step 1: 현재 가격 상수 확인**

`pricing.astro:6-13`:
```ts
const PRO_MONTHLY = 12000;
const PRO_YEARLY = 115200; // 12000 * 12 * 0.8 (20% off)
const PRO_YEARLY_PER_MONTH = 9600; // 115200 / 12
const TEAM_MONTHLY = 20000;
const TEAM_YEARLY = 192000; // 20000 * 12 * 0.8
const TEAM_YEARLY_PER_MONTH = 16000;
const TEAM_MIN_SEATS = 3;
const ANNUAL_DISCOUNT_PCT = 20;
```

- [ ] **Step 2: 상수 변경**

다음으로 교체:
```ts
const PRO_MONTHLY = 19900;
const PRO_YEARLY = 191040; // 19900 * 12 * 0.8 (20% off)
const PRO_YEARLY_PER_MONTH = 15920; // 191040 / 12
const TEAM_MONTHLY = 9900;
const TEAM_YEARLY = 95040; // 9900 * 12 * 0.8
const TEAM_YEARLY_PER_MONTH = 7920;
const TEAM_MIN_SEATS = 3;
const ANNUAL_DISCOUNT_PCT = 20;
```

- [ ] **Step 3: JSON-LD Product price 자동 반영 확인**

`pricing.astro:34-62`의 `productSchema.offers[]`는 `String(PRO_MONTHLY)` / `String(TEAM_MONTHLY)`로 상수를 참조. 별도 수정 불필요.

- [ ] **Step 4: 빌드 검증**

```bash
pnpm -C sites/marketing build
```
Expected: 에러 없음. dist에 새 가격 반영.

- [ ] **Step 5: 시각 검증**

`http://localhost:4321/pricing`:
- Pro 카드 월간: ₩19,900/월
- Pro 카드 연간 토글: ₩15,920/월 + 연 ₩191,040 청구 · 20% 할인
- Team 카드 월간: ₩9,900/시트/월
- Team 카드 연간: ₩7,920/시트/월

- [ ] **Step 6: Commit**

```bash
git add sites/marketing/src/pages/pricing.astro
git -c user.name="wndnjs3865" -c user.email="wndnjs3865@gmail.com" commit -m "Update Pro/Team pricing to spec §7 (Pro ₩19,900, Team ₩9,900/seat)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: P2 — button label 말꼬리 일괄 적용

**Files:**
- Modify: `sites/marketing/src/pages/index.astro`, `sites/marketing/src/pages/pricing.astro`, `sites/marketing/src/pages/download.astro`, `sites/marketing/src/components/EmailForm.astro`

P2 패턴: "다운로드" → "지금 받아보기", "신청" → "받을게요" 같은 *말꼬리* 일관 적용. 명령형 (-기/-요)로 통일.

- [ ] **Step 1: 현재 button labels 검색**

```bash
grep -n -E "(다운로드|신청|시작하기|등록)" sites/marketing/src/pages/index.astro sites/marketing/src/pages/pricing.astro sites/marketing/src/pages/download.astro sites/marketing/src/components/EmailForm.astro
```
Expected: `index.astro`에 "Windows용 무료 다운로드", "무료로 시작하기"; `pricing.astro`에 "Pro 출시 알림 받기", "Team 출시 알림 받기", "지금 다운로드", "출시 알림 받기"; 등.

- [ ] **Step 2: index.astro 변경**

`index.astro:59`: `Windows용 무료 다운로드` → `지금 받아보기 (Windows)`
`index.astro:490`: `무료로 시작하기` → `지금 받아보기`
`index.astro:474`의 final CTA 텍스트 `반복 업무, 오늘부터 줄여 보세요` 는 유지 (말꼬리 이미 OK).

- [ ] **Step 3: pricing.astro 변경**

`pricing.astro:230`: `지금 다운로드` → `지금 받아보기` (Free 카드 CTA)
`pricing.astro:307`: `Pro 출시 알림 받기` → `Pro 알림 받을게요`
`pricing.astro:384`: `Team 출시 알림 받기` → `Team 알림 받을게요`
`pricing.astro:443` (구 Enterprise, Task 11에서 Pilot으로 바뀜): `Pilot 미팅 신청하기` — 그대로 유지 (말꼬리 OK)
`pricing.astro:831`의 EmailForm `buttonText="출시 알림 받기"` → `buttonText="알림 받을게요"`

- [ ] **Step 4: download.astro button label 확인 후 변경**

`download.astro` 안에 button text 있으면 동일 패턴 적용. (uncommitted 작업 결과 시 SoftwareApplication schema만 추가됐고 button text는 그대로일 수 있음 — 변경 필요 없으면 skip)

```bash
grep -n -E "(<button|<a [^>]*class=\"[^\"]*bg-brand)" sites/marketing/src/pages/download.astro
```
button 또는 brand CTA 확인 후 어색한 label만 "받아보기"/"받을게요"로.

- [ ] **Step 5: EmailForm 디폴트 buttonText 변경**

`components/EmailForm.astro:12`:
```ts
buttonText = 'Pro 베타 알림 받기',
```
을:
```ts
buttonText = '알림 받을게요',
```

- [ ] **Step 6: 빌드 검증**

```bash
pnpm -C sites/marketing build
```
Expected: 에러 없음.

- [ ] **Step 7: 시각 검증**

`http://localhost:4321/`, `/pricing`, `/download` 모두 button label에 말꼬리("받아보기"/"받을게요"/"신청하기") 일관 적용.

- [ ] **Step 8: Commit**

```bash
git add sites/marketing/src/pages/index.astro sites/marketing/src/pages/pricing.astro sites/marketing/src/pages/download.astro sites/marketing/src/components/EmailForm.astro
git -c user.name="wndnjs3865" -c user.email="wndnjs3865@gmail.com" commit -m "Apply friendly Korean UX writing to button labels — pattern P2

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 14: P8 — 모바일 터치 우선 (button padding 일괄 상향)

**Files:**
- Modify: `sites/marketing/src/pages/index.astro`, `pricing.astro`, `download.astro`, `sumu.astro`, `executive.astro`, `solo.astro`, `components/EmailForm.astro`

P8 패턴: button padding `py-2.5 px-4 text-sm` → `py-3 px-5 text-base` 일괄 상향. tap target ≥ 44px, font ≥ 16px (iOS Safari auto-zoom 방지).

- [ ] **Step 1: 영향 받는 button 검색**

```bash
grep -rn "py-2.5 px-4 text-sm" sites/marketing/src/pages/ sites/marketing/src/components/
```
Expected: 다수 매치 — pricing CTAs, EmailForm submit button 등.

- [ ] **Step 2: pricing.astro 의 primary CTA들 변경**

`pricing.astro:228`, `:303`, `:381`, `:440` (Task 11 후 :443) 부근의 `px-4 py-2.5 text-sm` 를 `px-5 py-3 text-base`로 변경.

기계적 grep replace 가능:
```bash
sed -i 's/px-4 py-2.5 text-sm/px-5 py-3 text-base/g' sites/marketing/src/pages/pricing.astro
```
(Windows에서 sed가 없으면 IDE에서 일괄 replace)

- [ ] **Step 3: EmailForm submit button 변경**

`EmailForm.astro:50-51`의:
```astro
class="inline-flex shrink-0 items-center justify-center rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
```
의 `px-4 py-2.5 text-sm` 를 `px-5 py-3 text-base`로 변경.

EmailForm input `py-2.5` 도 `py-3` 으로:
```astro
class="flex-1 rounded-md border border-zinc-300 bg-white px-3.5 py-3 text-base shadow-sm ..."
```

- [ ] **Step 4: 그 외 file에서 동일 grep로 일괄 변경**

```bash
sed -i 's/px-4 py-2.5 text-sm/px-5 py-3 text-base/g' sites/marketing/src/pages/index.astro sites/marketing/src/pages/download.astro sites/marketing/src/pages/sumu.astro sites/marketing/src/pages/executive.astro sites/marketing/src/pages/solo.astro
```
(sed 없으면 IDE 일괄 replace)

- [ ] **Step 5: 빌드 검증**

```bash
pnpm -C sites/marketing build
```
Expected: 에러 없음.

- [ ] **Step 6: 시각 검증 (모바일 viewport)**

`http://localhost:4321/` 에서 DevTools `Cmd+Shift+M` (Chrome) 모바일 뷰포트 (iPhone 12 등). 모든 button이 손가락으로 누르기 편한 크기. 텍스트 ≥16px → iOS Safari 자동 확대 안 됨.

- [ ] **Step 7: Commit**

```bash
git add sites/marketing/src/pages/ sites/marketing/src/components/
git -c user.name="wndnjs3865" -c user.email="wndnjs3865@gmail.com" commit -m "Bump button padding for mobile touch targets — pattern P8

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 15: P1 — 5종 워크플로 카드 (landing)

**Files:**
- Modify: `sites/marketing/src/pages/index.astro` (CODE PREVIEW 섹션 다음에 5종 카드 섹션 추가, 현재 line 434 부근)

P1 패턴 적용: 5 카드, 각 카드 = 슬로건 1줄 + (placeholder) 이미지 + 3 bullet. (이미지는 Phase A에서 placeholder svg, 실 이미지는 Phase B에서)

- [ ] **Step 1: 삽입 위치 확인**

`index.astro:433-435` 부근의 CODE PREVIEW 섹션 종료(`</section>`) 다음에 PRO BETA CTA 섹션이 시작됨. 그 사이에 5종 카드 섹션 삽입.

- [ ] **Step 2: 5종 카드 섹션 추가**

`index.astro:433` 의 `</section>` 다음 줄에:

```astro
  <!-- ────────────────────────────────────────  5 WORKFLOW CARDS (P1)  ─── -->
  <section
    class="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
  >
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div class="max-w-2xl">
        <h2
          class="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100"
        >
          매일 쓰는 5종 한국어 워크플로
        </h2>
        <p class="mt-3 text-zinc-600 dark:text-zinc-400">
          설치 직후 바로 실행. 회사 데이터는 노트북 안에서만.
        </p>
      </div>

      <div class="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div class="aspect-[3/2] grid place-items-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
            <span class="text-4xl" aria-hidden="true">📝</span>
          </div>
          <h3 class="mt-4 font-semibold text-zinc-900 dark:text-zinc-100">
            회의록 → 액션 분류
          </h3>
          <ul class="mt-3 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• 담당자별 액션 자동 분류</li>
            <li>• Slack 포맷으로 즉시 복사</li>
            <li>• ≈10초</li>
          </ul>
        </div>

        <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div class="aspect-[3/2] grid place-items-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
            <span class="text-4xl" aria-hidden="true">📊</span>
          </div>
          <h3 class="mt-4 font-semibold text-zinc-900 dark:text-zinc-100">
            매출 CSV → 임원 요약
          </h3>
          <ul class="mt-3 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• 채널별 이상치 자동 감지</li>
            <li>• 경영진 보고용 3문장</li>
            <li>• ≈15초</li>
          </ul>
        </div>

        <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div class="aspect-[3/2] grid place-items-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
            <span class="text-4xl" aria-hidden="true">✅</span>
          </div>
          <h3 class="mt-4 font-semibold text-zinc-900 dark:text-zinc-100">
            결재 대기함 → 분류·brief
          </h3>
          <ul class="mt-3 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• 자동승인·검토·정보부족</li>
            <li>• 오늘의 결재 brief</li>
            <li>• ≈17초</li>
          </ul>
        </div>

        <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div class="aspect-[3/2] grid place-items-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
            <span class="text-4xl" aria-hidden="true">📨</span>
          </div>
          <h3 class="mt-4 font-semibold text-zinc-900 dark:text-zinc-100">
            고객 문의 → 분류·답변
          </h3>
          <ul class="mt-3 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• 카테고리·긴급도 자동 분류</li>
            <li>• 카테고리별 답변 초안</li>
            <li>• ≈24초</li>
          </ul>
        </div>

        <div class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div class="aspect-[3/2] grid place-items-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
            <span class="text-4xl" aria-hidden="true">📰</span>
          </div>
          <h3 class="mt-4 font-semibold text-zinc-900 dark:text-zinc-100">
            주간 보고 → Slack 포맷
          </h3>
          <ul class="mt-3 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• 한 줄 인풋 → 3-bullet 보고</li>
            <li>• Slack 그대로 붙여넣기</li>
            <li>• ≈9초</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 3: 빌드 검증**

```bash
pnpm -C sites/marketing build
```
Expected: 에러 없음.

- [ ] **Step 4: 시각 검증**

`http://localhost:4321/` — CODE PREVIEW 다음에 5 카드 grid (3-col 데스크탑, 2-col 태블릿, 1-col 모바일). 각 카드 = emoji + 슬로건 + 3 bullet.

- [ ] **Step 5: Commit**

```bash
git add sites/marketing/src/pages/index.astro
git -c user.name="wndnjs3865" -c user.email="wndnjs3865@gmail.com" commit -m "Add 5 workflow cards on landing — pattern P1

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 16: Final 빌드·시각 검증 + Vercel 배포 준비

**Files:** (검증만)

- [ ] **Step 1: 최종 빌드**

```bash
pnpm -C sites/marketing build
```
Expected: 에러 없음. `dist/` 안에 다음 페이지 HTML:
- `index.html`
- `pricing/index.html`
- `download/index.html`
- `docs/index.html`
- `404.html`
- `blog/index.html`
- `templates/index.html`
- `sumu/index.html` ← 신규
- `executive/index.html` ← 신규
- `solo/index.html` ← 신규

- [ ] **Step 2: 페이지별 시각 검증 체크리스트**

```bash
pnpm -C sites/marketing dev
```

브라우저에서 다음 페이지 모두 점검:

- `/` — 새 헤드라인 + 페르소나 카드 3개 + 5 워크플로 카드 + 기존 섹션 다 정상
- `/sumu` — Hero + 5종 카드 + 2 CTA
- `/executive` — Hero + 대시보드 placeholder + Pilot CTA
- `/solo` — 준비 중 배지 + Hero + 3종 placeholder + EmailForm
- `/pricing` — 4 카드 (Free/Pro/Team/Pilot) + Free 임계 배지 + 비교표 (코어 emerald 강조) + Trigger 카드 임계 숫자 + Pro ₩19,900 / Team ₩9,900
- `/download` — 기존 SoftwareApplication schema 유지, button label 말꼬리
- `/docs` — 7섹션 본문 유지

각 페이지 모바일 뷰포트(375×667)에서도 button tap target ≥44px, font ≥16px 확인.

- [ ] **Step 3: 링크 sanity check**

`/`의 페르소나 3 카드 클릭 → `/sumu`, `/solo`, `/executive` 도착 확인.
`/pricing` 카드 Pilot CTA `mailto:` 링크 정상.
`/sumu`, `/executive`의 mailto subject prefix `[A]`, `[D]` 정상.

- [ ] **Step 4: 최종 git log + 상태**

```bash
git log -20 --oneline
git status
```
Expected: SEO commit + 본 plan Task 3~15 commit 약 13개 + spec commit. working tree clean (또는 `.claude/` 만 untracked).

- [ ] **Step 5: Vercel 배포 (사용자 수동 단계 — plan에서는 권고만)**

```bash
git push origin main
```
Expected: GitHub `wndnjs3865/flowagent` main 갱신. Vercel이 자동 배포 트리거 → taskflow.kr 갱신 (~1분 후).

---

## Self-Review 체크리스트 (실행자가 plan 완료 후 검증)

**1. Spec 커버리지:**
- §2 Hero 차별점 메시지 → Task 3 ✓
- §3 페르소나 A/B/D 카탈로그 → Task 4·5·6·7 ✓
- §4 사이트 구조 (3 페르소나 동시 출시) → Task 4·5·6·7 ✓
- §6 UX 8개 pattern → P1 Task 15, P2 Task 13, P3 Task 4, P4 Task 10, P6 Task 9, P7 Task 8, P8 Task 14 (P5 컴포넌트 일관성은 기존 디자인 토큰 유지로 자연 충족)
- §7 Free/Pro/Team/Pilot 가격 → Task 11·12 ✓
- §11 SEO/OG uncommitted 정리·커밋 → Task 2 ✓

미커버 (다른 plan 또는 후속 작업):
- 사장 대시보드 UX 실제 동작 (FlowAgent 본체 작업, Plan 2)
- B 신규 3종 워크플로 YAML + fixture (Plan 2)
- Cloud 호스팅 (Plan 3, M3 후 결정)
- §8 검증 KPI 측정 (배포 후 운영)

**2. Placeholder scan:** 없음 — 모든 step에 실제 코드/명령 포함.

**3. Type 일관성:** Astro 페이지 props (`title`, `description`, `ogImage`, `structuredData`) — BaseLayout signature와 일치. EmailForm prop `source`, `buttonText`, `placeholder` 일관 사용.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-14-flowagent-marketing-site-phase-a.md`. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, two-stage review (spec compliance + code quality), fast iteration

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
