# Design Refresh PR 1 — 스크린샷 무관 fix 묶음

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chrome Claude rubric 평가(61.4%) 결과 중 **스크린샷 의존 없이 즉시 가능한 8 fix**를 한 PR로 묶어 머지·배포. 목표 점수 75%+.

**Architecture:** 마케팅 사이트(`sites/marketing/`) 정적 Astro 5 + Tailwind 4. 테스트 인프라 없음 → 검증은 `pnpm build` + manual smoke test (인코그니토 브라우저). PR 2(스크린샷 의존 hero/페르소나 재설계)는 본 PR 머지 후 별도 진행.

**Tech Stack:** Astro 5, Tailwind 4, TypeScript, Pretendard Variable (jsdelivr CDN).

**관련 메모리:**
- `[[project-launch-readiness-2026-05-20]]` — 디스콰이엇 게시 완료, 디자인 개편 진행 컨텍스트
- `[[feedback-src-changes-workflow]]` — src/ 변경 시 writing-plans + review 필수
- `[[user-kang-juwon]]` — 본명·사업자등록번호 공개 OK

---

## Scope 결정 사항 (PR 진입 전 확정)

- **Testimonial 처리**: 옵션 a — testimonial 영역을 "Pilot 1호 자리 모집 중" framing으로 전환 (가짜 데이터 회피 + Pilot lead 동선 강화)
- **mailto vs form**: mailto 유지 (현재 4개 페이지에 박혀있음). 별도 form은 본 PR 범위 밖
- **빈 데모 placeholder**: 제거 (PR 2에서 사장 대시보드 스크린샷으로 대체 예정)
- **다크모드**: 모든 변경 다크 variant 유지

---

## File Structure

**Modify:**
- `sites/marketing/src/pages/index.astro` — Hero 보강(eyebrow + Pilot CTA + trust microline) · DEMO PLACEHOLDER 섹션 제거 · TESTIMONIAL → Pilot lead 영역 전환 · /security 카드 추가
- `sites/marketing/src/layouts/BaseLayout.astro` — Pretendard preload
- `sites/marketing/src/components/Header.astro` — 메뉴 tap target 44px (py-2 → py-3)
- `sites/marketing/src/styles/global.css` — body line-height 1.6, h1 letter-spacing

**Create:** 없음

**범위 밖 (PR 2로):**
- 사장 대시보드 스크린샷
- 5종 워크플로 카드 실제 결과 캡처
- 페르소나 페이지(/sumu /solo /executive) hero 우측 시각
- signed URL 모바일 mockup
- Pilot form 추가
- Lighthouse 실측 + 페르소나 페이지 hero 보강

---

## Task 0: 사전 검증 + 브랜치

**Files:** 검증만

- [ ] **Step 1: main 클린 확인**

```powershell
git status
git branch --show-current
```
Expected: main branch, clean working tree (PR #13 머지된 상태).

- [ ] **Step 2: baseline build**

```powershell
Set-Location C:\flowagent\sites\marketing
pnpm build
```
Expected: `14 page(s) built`.

- [ ] **Step 3: 브랜치 생성**

```powershell
Set-Location C:\flowagent
git checkout -b feat/design-refresh-pr1
```

---

## Task 1: 빈 데모 placeholder 섹션 제거

**Files:**
- Modify: `sites/marketing/src/pages/index.astro`

근거: `index.astro:210-237` "60초 데모 영상 · 곧 공개" placeholder가 빈 약속으로 신뢰도 깎음. PR 2에서 사장 대시보드 스크린샷으로 대체 예정.

- [ ] **Step 1: 섹션 제거**

`sites/marketing/src/pages/index.astro`에서 다음 주석 라인 포함 `<section>` 통째 삭제:

```html
  <!-- ──────────────────────────────────────────────  DEMO PLACEHOLDER  ─── -->
  <section
    class="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
  >
    ... (section 내용 전체)
  </section>
```

(시작 marker `<!-- ──────────────────────────────────────────────  DEMO PLACEHOLDER  ─── -->` 부터 `</section>` 까지 통째 삭제. 다음 섹션 `<!-- ────────────────────────────────────────────────  VALUE PROPS  ─── -->`가 바로 이어지도록.)

- [ ] **Step 2: 빌드 통과**

```powershell
Set-Location C:\flowagent\sites\marketing; pnpm build
```
Expected: `14 page(s) built`.

- [ ] **Step 3: commit**

```powershell
git add sites/marketing/src/pages/index.astro
git -c user.email="wndnjs3865@gmail.com" -c user.name="wndnjs3865" commit -m "fix: 빈 데모 placeholder 제거 (빈 약속 신뢰도 회복)"
```

---

## Task 2: Hero에 eyebrow + Pilot 보조 CTA + trust microline 추가

**Files:**
- Modify: `sites/marketing/src/pages/index.astro`

근거: Chrome Claude rubric 영역 1 (First impression 2점) + 영역 3 (Trust signals 3점) + 영역 12 (Pilot 동선 3점) 동시 개선.

- [ ] **Step 1: hero `<div class="max-w-3xl">` 안 콘텐츠 재구성**

현재 hero(index.astro:13-94)의 `<div class="max-w-3xl">` 안 구조:
1. v0.1.0 배지 (line 14-18)
2. h1 (line 21-29)
3. 본문 p (line 31-38)
4. 다운로드 CTA + GitHub 링크 (line 40-89)
5. ≈12 MB 마이크로카피 (line 91-93)
6. 이전 PR에서 추가한 EmailForm 블록 (line 96-109)

다음과 같이 변경:

**A. h1 위에 eyebrow 추가** — `v0.1.0 배지` 라인 바로 다음(`</div>` 닫는 line 18 직후, h1 line 21 직전)에 다음 블록 삽입:

```astro
        <p class="mt-6 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          사무직 · 1인 자영업 · 사장 — 한국 SMB 사무 자동화 OSS
        </p>
```

기존 `<h1 class="mt-6 ...">`의 `mt-6`을 `mt-3`으로 변경 (eyebrow 뒤에 자연스러운 간격).

**B. 다운로드 CTA 옆에 Pilot 보조 outline CTA 추가** — `<a href="/download" class="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 ...">지금 받아보기 (Windows)</a>` 블록 바로 다음에 추가:

```astro
          <a
            href="mailto:wndnjs3865@naver.com?subject=FlowAgent%20Pilot%20%EB%AF%B8%ED%8C%85%20%EC%8B%A0%EC%B2%AD"
            class="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-6 py-3 text-base font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Pilot 신청 · ₩500만/4주
          </a>
```

(macOS·Linux 링크와 GitHub 링크 블록 `<div class="flex flex-wrap items-center gap-3 ...">` 바로 위에 둠. 즉 두 primary buttons → 보조 텍스트 링크 순서.)

**C. trust microline** — 기존 `≈12 MB · Windows 10/11 · 가입 불필요 · 신용카드 불필요` 라인(line 91-93) 바로 위에 다음 추가:

```astro
        <p class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-500">
          <span>Apache 2.0 OSS</span>
          <span aria-hidden="true">·</span>
          <a href="/security" class="underline-offset-4 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100">보안 정책</a>
          <span aria-hidden="true">·</span>
          <span>사업자등록 607-20-94796</span>
          <span aria-hidden="true">·</span>
          <span>강주원</span>
        </p>
```

(기존 `≈12 MB...` 라인은 그대로 둠 — 다른 정보)

- [ ] **Step 2: 빌드 통과**

```powershell
Set-Location C:\flowagent\sites\marketing; pnpm build
```

- [ ] **Step 3: commit**

```powershell
git add sites/marketing/src/pages/index.astro
git -c user.email="wndnjs3865@gmail.com" -c user.name="wndnjs3865" commit -m "feat: hero에 eyebrow + Pilot 보조 CTA + trust microline"
```

---

## Task 3: Testimonial 영역 → Pilot 1호 모집 영역으로 전환

**Files:**
- Modify: `sites/marketing/src/pages/index.astro`

근거: 현재 testimonial(line 358-380)이 익명 + 가상. Chrome Claude 보고 영역 3(Trust signals)에서 감점. 가짜 보강 대신 honest framing으로 전환 + Pilot lead 동선 강화.

- [ ] **Step 1: Testimonial section 전체 교체**

`<!-- ────────────────────────────────────────────────  TESTIMONIAL  ─── -->`로 시작하는 `<section>` 전체(line 358-385 추정)를 다음으로 교체:

```astro
  <!-- ────────────────────────────────────────────  PILOT LEAD  ─── -->
  <section class="border-b border-zinc-200 dark:border-zinc-800">
    <div class="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
      <div
        class="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
      >
        <span class="h-2 w-2 animate-pulse rounded-full bg-amber-500"></span>
        Pilot 1호 자리 모집 중 · 3사 한정
      </div>
      <h2
        class="mt-6 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100"
      >
        귀사 데이터로 워크플로 1개,<br />
        4주 동안 같이 만듭니다
      </h2>
      <p class="mt-4 max-w-2xl mx-auto text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400">
        30분 미팅으로 귀사의 반복 사무 1개를 짚어내고, 4주 안에 working YAML
        워크플로 + 사장 대시보드 셋업까지. 데이터는 노트북 밖으로 나가지 않습니다.
      </p>
      <div class="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <a
          href="mailto:wndnjs3865@naver.com?subject=FlowAgent%20Pilot%20%EB%AF%B8%ED%8C%85%20%EC%8B%A0%EC%B2%AD"
          class="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          Pilot 미팅 신청하기 · ₩500만/4주
        </a>
        <a
          href="/pricing"
          class="inline-flex items-center justify-center rounded-md px-4 py-3 text-base font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Pilot 상세 보기 →
        </a>
      </div>
      <p class="mt-6 text-xs text-zinc-500 dark:text-zinc-500">
        솔로 founder가 직접 1대1로 셋업합니다 · 강주원 (사업자등록 607-20-94796)
      </p>
    </div>
  </section>
```

- [ ] **Step 2: 빌드 통과**

```powershell
Set-Location C:\flowagent\sites\marketing; pnpm build
```

- [ ] **Step 3: commit**

```powershell
git add sites/marketing/src/pages/index.astro
git -c user.email="wndnjs3865@gmail.com" -c user.name="wndnjs3865" commit -m "feat: testimonial → Pilot 1호 모집 영역으로 전환 (가짜 데이터 회피 + lead 동선)"
```

---

## Task 4: /security 메인 카드 추가

**Files:**
- Modify: `sites/marketing/src/pages/index.astro`

근거: `/security` 페이지 자체는 매우 강하지만 메인에서 0% 노출. WHY CHOOSE 섹션(Zapier vs FlowAgent 비교) 다음 또는 적절한 위치에 보안 강조 카드 1개 추가.

- [ ] **Step 1: 위치 결정 + 카드 추가**

`<!-- ────────────────────────────────────────  4 PLAN TRIGGER TEASER  ─── -->` 섹션 바로 앞(즉 가격 trigger 섹션 직전)에 새 섹션 삽입:

```astro
  <!-- ────────────────────────────────────────────  SECURITY CARD  ─── -->
  <section class="border-b border-zinc-200 dark:border-zinc-800">
    <div class="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
      <a
        href="/security"
        class="group flex flex-col gap-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-10 dark:border-emerald-900 dark:bg-emerald-950"
      >
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="h-7 w-7"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
            ></path>
          </svg>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-semibold text-emerald-900 sm:text-2xl dark:text-emerald-100">
            데이터가 어디로 가는가 — 코드로 약속
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-emerald-800 sm:text-base dark:text-emerald-200">
            워크플로 입출력, LLM 호출, API 키, 실행 결과 — 모두 사용자 노트북
            안에서만 움직입니다. shell step은 YAML에 명시한 명령만 실행 (LLM이
            동적 명령 생성 안 함). Apache 2.0 OSS라 직접 검증 가능합니다.
          </p>
        </div>
        <span class="inline-flex items-center text-sm font-semibold text-emerald-700 group-hover:underline dark:text-emerald-300">
          보안 정책 →
        </span>
      </a>
    </div>
  </section>
```

- [ ] **Step 2: 빌드 통과**

```powershell
Set-Location C:\flowagent\sites\marketing; pnpm build
```

- [ ] **Step 3: commit**

```powershell
git add sites/marketing/src/pages/index.astro
git -c user.email="wndnjs3865@gmail.com" -c user.name="wndnjs3865" commit -m "feat: /security 메인 카드 추가 (보안 자산 노출)"
```

---

## Task 5: Typography 보강

**Files:**
- Modify: `sites/marketing/src/styles/global.css`

근거: Chrome Claude 영역 2(Typography 3.5점). 한국어 가독성 + 미세한 letter-spacing 조정.

- [ ] **Step 1: global.css 수정**

`sites/marketing/src/styles/global.css` 의 `body` 블록(line 38-42)을 다음으로 교체:

```css
body {
  font-family: var(--font-sans);
  font-feature-settings: "tnum" on;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  line-height: 1.6;
}
```

또한 파일 끝(`::selection` 블록 다음)에 다음 추가:

```css
/* Korean readability: slightly looser tracking on large headings */
h1 {
  letter-spacing: -0.025em;
}

/* Tabular numerals for price/stats areas */
.tabular-nums,
[class*="font-mono"] {
  font-variant-numeric: tabular-nums;
}
```

(Tailwind의 `font-mono` 유틸리티가 자동으로 tabular-nums 받도록 + 명시적 `.tabular-nums` 클래스도 지원)

- [ ] **Step 2: 빌드 통과**

```powershell
Set-Location C:\flowagent\sites\marketing; pnpm build
```

- [ ] **Step 3: commit**

```powershell
git add sites/marketing/src/styles/global.css
git -c user.email="wndnjs3865@gmail.com" -c user.name="wndnjs3865" commit -m "fix: 한국어 가독성 — body line-height 1.6 + h1 letter-spacing + tabular-nums"
```

---

## Task 6: Pretendard preload

**Files:**
- Modify: `sites/marketing/src/layouts/BaseLayout.astro`

근거: 현재 Pretendard Variable이 jsdelivr CDN에서 로드되지만 `<link rel="preload">` 없음. 한국어 FOIT/FOUT 가시화 risk. preload로 LCP 개선.

- [ ] **Step 1: BaseLayout head에 preload 추가**

`sites/marketing/src/layouts/BaseLayout.astro` 의 `<head>` 안 `<link rel="icon" ...>`(line 67) 다음에 추가:

```astro
    <!-- Preload Pretendard Variable for Korean text LCP -->
    <link
      rel="preconnect"
      href="https://cdn.jsdelivr.net"
      crossorigin
    />
    <link
      rel="preload"
      as="font"
      type="font/woff2"
      href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/PretendardVariable.woff2"
      crossorigin
    />
```

- [ ] **Step 2: 빌드 통과**

```powershell
Set-Location C:\flowagent\sites\marketing; pnpm build
```

- [ ] **Step 3: commit**

```powershell
git add sites/marketing/src/layouts/BaseLayout.astro
git -c user.email="wndnjs3865@gmail.com" -c user.name="wndnjs3865" commit -m "perf: Pretendard preconnect + preload (한국어 FOIT 차단)"
```

---

## Task 7: 상단 메뉴 tap target 44px

**Files:**
- Modify: `sites/marketing/src/components/Header.astro`

근거: Chrome Claude 영역 8(Accessibility) + 영역 9(Responsive mobile). 현재 메뉴 `py-2` = 약 36px height. WCAG/Fitts's law 권고 44px.

- [ ] **Step 1: Header 데스크탑 메뉴 padding 변경**

`sites/marketing/src/components/Header.astro` 의 메뉴 아이템 클래스(line 51 영역):

```typescript
'rounded-md px-3 py-2 text-sm font-medium transition-colors',
```

를 다음으로 변경:

```typescript
'rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
```

(py-2 → py-2.5; sm+ 메뉴는 약 40px → WCAG 44px에 근접하면서 헤더 디자인 큰 깨짐 없음. py-3은 헤더 부피 너무 커짐 — 절충)

또한 모바일 메뉴 부분(line 133 영역):

```typescript
'block rounded-md px-3 py-2 text-sm font-medium text-zinc-700 ...'
```

를 다음으로:

```typescript
'block rounded-md px-3 py-3 text-sm font-medium text-zinc-700 ...'
```

(모바일은 py-3 = 44px 충분히 권고치)

- [ ] **Step 2: 빌드 통과**

```powershell
Set-Location C:\flowagent\sites\marketing; pnpm build
```

- [ ] **Step 3: commit**

```powershell
git add sites/marketing/src/components/Header.astro
git -c user.email="wndnjs3865@gmail.com" -c user.name="wndnjs3865" commit -m "fix: 메뉴 tap target — 데스크탑 py-2.5, 모바일 py-3 (WCAG/Fitts)"
```

---

## Task 8: 최종 통합 검증 + push + PR + 머지

**Files:** 검증만

- [ ] **Step 1: 최종 빌드**

```powershell
Set-Location C:\flowagent\sites\marketing; pnpm build
```
Expected: `14 page(s) built`. 모든 페이지 정상.

- [ ] **Step 2: 로컬 preview smoke test**

```powershell
pnpm preview
```

브라우저 `http://localhost:4321/`에서:
- ✅ hero 위 eyebrow ("사무직 · 1인 자영업 · 사장 ...")
- ✅ hero에 다운로드 CTA + Pilot 보조 outline CTA 공존
- ✅ trust microline (Apache 2.0 · 보안 정책 · 사업자등록 · 강주원)
- ✅ 빈 데모 placeholder 사라짐 — VALUE PROPS 섹션이 바로 이어짐
- ✅ Pilot 1호 모집 영역 (예전 testimonial 위치)
- ✅ /security 메인 카드 emerald 배경
- ✅ 다크모드 토글 정상 + 다크 variant 모두 적용
- ✅ 메뉴 tap target 적절
- ✅ 모바일 viewport (DevTools 375px) 정상

- [ ] **Step 3: push + PR 생성**

```powershell
git push -u origin feat/design-refresh-pr1
```

```bash
gh pr create --title "Design refresh PR 1 — 스크린샷 무관 fix 묶음" --body "$(cat <<'EOF'
Chrome Claude rubric 평가(61.4%) 결과 중 스크린샷 의존 없이 즉시 가능한 8 fix를 한 PR로 묶음.

## 변경 사항

1. 빈 "60초 데모 영상 · 곧 공개" placeholder 제거 (빈 약속 신뢰도 회복)
2. Hero eyebrow 추가 — "사무직 · 1인 자영업 · 사장" 페르소나 즉시 매핑
3. Hero Pilot 보조 outline CTA — mailto, ₩500만/4주 가격 hero에 노출
4. Hero trust microline — Apache 2.0 · /security · 사업자등록 · 강주원
5. Testimonial → Pilot 1호 모집 영역 전환 (가짜 데이터 회피 + lead 동선)
6. /security 메인 emerald 카드 추가 (보안 자산 노출)
7. Typography — body line-height 1.6, h1 letter-spacing -0.025em, tabular-nums
8. Pretendard preconnect + preload (한국어 FOIT 차단)
9. 메뉴 tap target — 데스크탑 py-2.5, 모바일 py-3 (WCAG/Fitts)

## 의도 외 범위 (PR 2 예정)
- 사장 대시보드 스크린샷 + 5종 워크플로 카드 실제 캡처 (스크린샷 7장 확보 의존)
- 페르소나 페이지(/sumu /solo /executive) hero 우측 시각 보강
- signed URL 모바일 mockup
- 별도 Pilot form

## 검증
- pnpm build: 14 page(s) built ✅
- 로컬 preview smoke test ✅
- 각 task spec review + code quality review 통과 ✅

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 4: 머지**

PR 검토 후:
```powershell
gh pr merge --squash --delete-branch
```

- [ ] **Step 5: prod 배포 polling + 검증**

```powershell
# Vercel 배포 대기
$sha = git rev-parse main
until (gh api repos/wndnjs3865/flowagent/commits/$sha/status | Select-String '"state":"success"') { Start-Sleep 10 }
```

WebFetch로 prod 검증:
- `https://taskflow.kr/` — hero eyebrow + Pilot CTA + trust microline + Pilot 모집 영역 + security 카드 모두 라이브
- `https://taskflow.kr/security` — 정상 유지

---

## Self-Review

**1. Spec 커버리지 (Chrome Claude rubric 영역별):**
- 영역 1 (First impression): 2 → ~4 (eyebrow + Pilot CTA + trust microline)
- 영역 2 (Typography): 3.5 → ~4.5 (line-height + letter-spacing + tabular)
- 영역 3 (Trust signals): 3 → ~4 (trust microline + security 카드 + Pilot honest framing)
- 영역 5 (Product evidence): 1 → ~2 (빈 placeholder 제거로 점수 손실 차단; 실제 상승은 PR 2)
- 영역 8 (Accessibility): 3 → ~4 (tap target)
- 영역 9 (Mobile): 3 → ~4 (tap target 모바일 py-3)
- 영역 10 (Performance): 3 → ~4 (preconnect + preload)
- 영역 12 (Pilot 동선): 3 → ~4.5 (hero CTA + Pilot 모집 영역)

스크린샷 의존 영역(5 최대치, 11 페르소나 시각)은 PR 2.

**2. Placeholder 스캔**: TBD/TODO 0건. 모든 step에 실제 코드 박힘.

**3. 의존성**:
- Task 1·2·3·4 모두 `index.astro` 수정 — 순차적으로 진행 (parallel X)
- Task 5·6·7 다른 파일이라 독립
- Task 8(검증)은 모든 이전 task 완료 의존
