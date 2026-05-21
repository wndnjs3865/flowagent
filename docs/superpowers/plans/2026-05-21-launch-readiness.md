# Launch Readiness (M1 첫 게시) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 2026-05-21(목) 09:00 KST 디스콰이엇 첫 게시를 차단하는 critical findings 5건 + 법적 페이지 3개(`/privacy`·`/security`·`/terms`)를 일괄 해결하고 prod 배포까지 완료한다.

**Architecture:** 마케팅 사이트(`sites/marketing/`)는 정적 Astro 5 + Tailwind 4 사이트로 자체 테스트 인프라가 **없다**. 검증은 (1) `pnpm build` (TypeScript + Astro 정적 검사) (2) `pnpm preview` 인코그니토 brower smoke test (3) Vercel prod 배포 후 WebFetch 200 확인 세 단으로 한다. 5개 fix를 한 브랜치에 묶고 task 단위 commit으로 분해해 리뷰 가능하게 한다.

**Tech Stack:** Astro 5, Tailwind 4, TypeScript. Loops.so newsletter API (URL-encoded body, `userGroup` 필드로 채널별 lead 출처 트래킹).

**관련 메모리:**
- `[[project-launch-readiness-2026-05-20]]` — 어제 합의한 톤·source 트래킹·DNS skip·하이브리드 법적 톤
- `[[feedback-src-changes-workflow]]` — `src/` 변경 시 writing-plans + 머지 전 review 필수
- `[[user-kang-juwon]]` — 본명·사업자등록번호 607-20-94796 공개 OK 결정

---

## Decisions (구현 진입 전 사용자 컨펌 필요)

**D1: `index.astro`의 EmailForm 배치 위치**
- 안 A (이 plan 디폴트): **HERO 섹션 다운로드 버튼 아래** — 작은 inline 폼. 가장 먼저 도달하는 영역에 놓아 lead 손실 차단 효과 최대.
- 안 B: FINAL CTA 섹션 (페이지 끝) — 결심 시점에 노출.
- 안 C: 두 곳 모두 — source 분리(`landing-hero` vs `landing-final`)로 어느 위치가 효과 큰지 측정.

**D2: EmailForm의 fallback simulate 분기 제거 여부**
- 안 A (이 plan 디폴트): **제거** — `endpoint` 비면 `showError`로 즉시 실패 표시. Vercel env 누락 시 silent failure 차단. dev에서 env 미설정 시 form이 안 보임이 아닌 명시적 실패.
- 안 B: 유지 — dev에서 UX 흐름 테스트 가능. prod에는 env 셋팅됐으니 영향 없음.

**둘 다 추천 안(A)으로 진행하면 별도 답 불필요. 변경 원하면 말씀.**

---

## File Structure

**Create:**
- `sites/marketing/src/pages/privacy.astro` — 개인정보 처리방침 (PIPA 제30조 의무사항)
- `sites/marketing/src/pages/security.astro` — 보안 정책 (로컬 실행 사실 + 데이터 흐름)
- `sites/marketing/src/pages/terms.astro` — 이용약관 (Apache 2.0 + TRADEMARK.md 참조)

**Modify:**
- `sites/marketing/src/components/EmailForm.astro` — Finding #1 (simulate 분기 제거) + Finding #2 (Loops `userGroup` body 추가)
- `sites/marketing/src/pages/index.astro` — Finding #4 (HERO EmailForm 추가) + Finding #5 (GitHub link `target="_blank"`)

**Touch 안 함:**
- `Footer.astro` — `/privacy`·`/security`·`/terms` 링크가 line 111·154·158에 이미 박혀 있음. 새 페이지 라이브 시 자동 동작.
- Loops 본문 — 사용자가 별도 Chrome Claude에 위임, 본 plan 외부.

**범위 밖 (별도 PR로 미룸):**
- 영문 share copy A/B angle 추가 (재게시용)
- DNS 7개 레코드(SPF/DKIM/MX) 보강 — 게시 후 monitoring 짬에
- M1 KPI 트래킹 대시보드

---

## Task 0: 사전 검증 + 브랜치 준비

**Files:** 검증만, 수정 없음

- [ ] **Step 1: 작업 디렉토리 clean 확인**

Run:
```powershell
git status
```
Expected: `nothing to commit, working tree clean`. main branch.

- [ ] **Step 2: baseline build 통과 확인**

Run:
```powershell
cd sites/marketing; pnpm build
```
Expected: `11 page(s) built` (index, sumu, solo, executive, templates, docs, blog, blog/2026-05-20-launch, pricing, download, 404). 빌드 실패면 plan 중단 + 원인 파악.

- [ ] **Step 3: 브랜치 생성**

Run:
```powershell
git checkout -b feat/launch-readiness
```
Expected: `Switched to a new branch 'feat/launch-readiness'`.

---

## Task 1: EmailForm.astro fix (Finding #1 + #2)

**Files:**
- Modify: `sites/marketing/src/components/EmailForm.astro`

근거:
- Finding #1: `PUBLIC_LOOPS_FORM_ID` 비면 클라이언트가 가짜 success 반환 → silent failure 차단 필요
- Finding #2: `body`에 `email`만 보냄 → Loops `userGroup` 필드 추가해 채널별 출처 트래킹

- [ ] **Step 1: simulate 분기 제거 + userGroup body 추가**

`sites/marketing/src/components/EmailForm.astro` 라인 107-127 부분을 다음으로 교체:

```typescript
      try {
        if (!endpoint) {
          // Production should have PUBLIC_LOOPS_FORM_ID set in Vercel env.
          // If missing, fail loudly rather than show fake success — this
          // prevents the silent waitlist=0 bug that masked the env-not-set
          // state during 2026-05-20 smoke test.
          throw new Error('Email form is not configured.');
        }

        // Loops newsletter-form endpoint expects URL-encoded body
        // (multipart/form-data returns 400 "Please enter an email address.").
        // userGroup carries the channel source (e.g. "solo-updates",
        // "landing-hero") so leads can be attributed per channel without
        // setting up custom Loops properties.
        const body = new URLSearchParams();
        body.append('email', input.value);
        body.append('userGroup', form.dataset.source || 'unknown');

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        showSuccess();
      } catch (err) {
```

또한 라인 16-21의 주석 블록 갱신 — Phase 0 simulate 언급 제거:

```typescript
// Loops form ID is read from PUBLIC_LOOPS_FORM_ID env var.
// To enable submission: set this in Vercel Project Settings →
// Environment Variables (Production + Preview + Development).
//   Key:   PUBLIC_LOOPS_FORM_ID
//   Value: <Loops newsletter form ID> (e.g. cmp2ei3ut1xbj0i02rct8hrht)
// If unset, the form shows an error on submit. The form's source prop
// is sent to Loops as `userGroup` for per-channel lead attribution.
```

- [ ] **Step 2: 빌드 통과 확인**

Run:
```powershell
cd sites/marketing; pnpm build
```
Expected: `11 page(s) built`. TypeScript 에러 없음.

- [ ] **Step 3: commit**

Run:
```powershell
git add sites/marketing/src/components/EmailForm.astro
git -c user.email="wndnjs3865@gmail.com" -c user.name="wndnjs3865" commit -m "fix: EmailForm fail-fast + userGroup body for channel attribution"
```

---

## Task 2: index.astro — HERO EmailForm 추가 (Finding #4) + GitHub target=_blank (Finding #5)

**Files:**
- Modify: `sites/marketing/src/pages/index.astro`

근거:
- Finding #4: landing에 EmailForm 없어 모든 lead 경로가 `/download`→`/solo`→`/blog` click-through. ~70% 손실 위험.
- Finding #5: HERO의 GitHub 링크가 `target="_blank"` 없어 사용자가 사이트 떠남.

- [ ] **Step 1: EmailForm import 추가**

`sites/marketing/src/pages/index.astro` 라인 1-3을 다음으로 교체:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import EmailForm from '../components/EmailForm.astro';
---
```

- [ ] **Step 2: GitHub 링크에 target=_blank 추가**

라인 72-87의 `<a href="https://github.com/wndnjs3865/flowagent"` 태그에 `target="_blank"` 추가. 기존 `rel="noopener"` 유지. 최종 형태:

```astro
            <a
              href="https://github.com/wndnjs3865/flowagent"
              class="inline-flex items-center gap-1 underline-offset-4 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
              target="_blank"
              rel="noopener"
            >
```

- [ ] **Step 3: HERO 섹션에 EmailForm 추가**

라인 91-93 (`≈12 MB · Windows 10/11 · 가입 불필요 · 신용카드 불필요` 마이크로카피)의 `</p>` 직후, `</div>`(라인 94) 직전에 다음 블록 삽입:

```astro
        <div class="mt-8 max-w-md border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <p class="text-xs text-zinc-500 dark:text-zinc-500">
            지금 받기 어려우면, 새 소식 있을 때만 알려드릴게요 (스팸 없음).
          </p>
          <div class="mt-2">
            <EmailForm
              variant="inline"
              source="landing-hero"
              buttonText="알림 받을게요"
              placeholder="이메일을 알려주세요"
            />
          </div>
        </div>
```

- [ ] **Step 4: 빌드 통과 확인**

Run:
```powershell
cd sites/marketing; pnpm build
```
Expected: `11 page(s) built`. EmailForm 컴포넌트 import 정상 해석.

- [ ] **Step 5: commit**

Run:
```powershell
git add sites/marketing/src/pages/index.astro
git -c user.email="wndnjs3865@gmail.com" -c user.name="wndnjs3865" commit -m "feat: landing hero EmailForm + GitHub target=_blank"
```

---

## Task 3: /privacy 페이지 신규 (PIPA 의무)

**Files:**
- Create: `sites/marketing/src/pages/privacy.astro`

근거: 한국 PIPA 제30조에 따라 개인정보 처리방침 공개 의무. EmailForm으로 이메일 수집하는 사이트는 의무 적용. Loops confirmation email에서도 이 페이지 링크 박음. 게시 전 라이브 필수.

톤: 도입 친근체 + 조항 격식체 (어제 합의 — `[[project-launch-readiness-2026-05-20]]`).

- [ ] **Step 1: 페이지 생성**

Create `sites/marketing/src/pages/privacy.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';

const lastUpdated = '2026-05-21';
---

<BaseLayout
  title="개인정보 처리방침 — FlowAgent"
  description="FlowAgent가 어떤 개인정보를 수집하고 어떻게 다루는지 안내합니다. 이메일 주소 외 정보는 수집하지 않습니다."
>
  <article class="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
    <h1 class="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
      개인정보 처리방침
    </h1>
    <p class="mt-3 text-sm text-zinc-500 dark:text-zinc-500">
      최종 수정일: {lastUpdated}
    </p>

    <div class="mt-10 space-y-8 text-zinc-700 dark:text-zinc-300">
      <section>
        <p class="leading-relaxed">
          FlowAgent는 회사 데이터가 노트북 밖으로 나가지 않는 사무 자동화 도구입니다.
          소프트웨어 자체는 사용자 본인 컴퓨터에서만 실행되며, 어떤 사용 데이터도
          외부로 전송하지 않습니다. 다만 <strong>taskflow.kr 웹사이트</strong>에서
          새 소식 알림을 신청하신 경우에 한해 이메일 주소를 수집합니다. 이 방침은
          그 한 가지 경우에 한해 어떻게 정보를 다루는지 안내합니다.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          제1조 (수집하는 개인정보 항목)
        </h2>
        <ul class="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
          <li>이메일 주소 (필수)</li>
          <li>신청 채널 식별값 (자동 수집, 예: "landing-hero", "blog-waitlist")</li>
          <li>신청 시각 (자동 수집)</li>
        </ul>
        <p class="mt-3 leading-relaxed">
          이름·연락처·주소 등 이메일 외 식별 정보는 수집하지 않습니다. 쿠키를 통한
          행동 추적도 하지 않습니다.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          제2조 (개인정보의 처리 목적)
        </h2>
        <p class="mt-3 leading-relaxed">
          수집한 이메일 주소는 다음 목적으로만 처리됩니다.
        </p>
        <ul class="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
          <li>FlowAgent의 새 글·신규 워크플로·주요 업데이트 안내 메일 발송</li>
          <li>신청 채널별 통계 집계 (개인 식별이 아닌 채널 단위 통계)</li>
        </ul>
        <p class="mt-3 leading-relaxed">
          마케팅 외 목적(영업·광고 위탁·제3자 제공)에 사용하지 않습니다.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          제3조 (개인정보의 보유 및 이용 기간)
        </h2>
        <p class="mt-3 leading-relaxed">
          이용자가 직접 수신 거부(메일 하단의 unsubscribe 링크 클릭)하거나
          별도의 삭제 요청을 하기 전까지 보유합니다. 수신 거부 시 30일 이내에
          이메일 주소를 파기합니다.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          제4조 (개인정보의 제3자 제공)
        </h2>
        <p class="mt-3 leading-relaxed">
          FlowAgent는 이용자의 개인정보를 어떤 제3자에게도 제공·판매·임대하지
          않습니다. 단 다음의 처리 위탁이 있습니다.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          제5조 (개인정보 처리 위탁)
        </h2>
        <p class="mt-3 leading-relaxed">
          원활한 메일 발송을 위해 아래 업체에 개인정보 처리를 위탁합니다.
        </p>
        <div class="mt-3 overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr class="border-b border-zinc-300 dark:border-zinc-700">
                <th class="py-2 text-left font-semibold">수탁자</th>
                <th class="py-2 text-left font-semibold">위탁 업무</th>
                <th class="py-2 text-left font-semibold">개인정보 이전</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-zinc-200 dark:border-zinc-800">
                <td class="py-2 align-top">Loops, Inc. (미국)</td>
                <td class="py-2 align-top">뉴스레터 발송 및 구독자 관리</td>
                <td class="py-2 align-top">이메일 주소, 신청 채널, 신청 시각 — 미국 소재 서버</td>
              </tr>
              <tr class="border-b border-zinc-200 dark:border-zinc-800">
                <td class="py-2 align-top">Vercel, Inc. (미국)</td>
                <td class="py-2 align-top">웹사이트 호스팅 (taskflow.kr)</td>
                <td class="py-2 align-top">웹 요청 IP·User-Agent (개인 식별 미보관, 로그 24시간 이내 폐기)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          제6조 (이용자의 권리)
        </h2>
        <p class="mt-3 leading-relaxed">
          이용자는 언제든지 다음 권리를 행사할 수 있습니다.
        </p>
        <ul class="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
          <li>개인정보 열람 요구</li>
          <li>오류 등이 있는 경우 정정 요구</li>
          <li>삭제 요구</li>
          <li>처리 정지 요구</li>
        </ul>
        <p class="mt-3 leading-relaxed">
          모든 메일 하단의 unsubscribe 링크로 즉시 수신 거부 가능합니다. 그 외의
          요구는 아래 문의처로 알려주시면 7영업일 이내에 처리합니다.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          제7조 (개인정보 보호책임자 및 문의)
        </h2>
        <ul class="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
          <li>책임자: 강주원 (FlowAgent 운영자)</li>
          <li>사업자등록번호: 607-20-94796</li>
          <li>문의 이메일: <a href="mailto:wndnjs3865@naver.com" class="underline">wndnjs3865@naver.com</a></li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          제8조 (방침의 변경)
        </h2>
        <p class="mt-3 leading-relaxed">
          본 방침이 변경되는 경우, 변경 사항은 본 페이지에 게시되며 중요한 변경은
          기존 구독자에게 이메일로 사전 안내합니다.
        </p>
      </section>

      <section class="rounded-lg border border-zinc-200 bg-zinc-50 p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p class="leading-relaxed text-zinc-600 dark:text-zinc-400">
          개인정보 침해 신고·상담: 개인정보보호위원회 (
          <a href="https://www.privacy.go.kr" target="_blank" rel="noopener" class="underline">privacy.go.kr</a>
          · 국번없이 182). 본 방침은 한국 「개인정보 보호법」을 기준으로 작성되었습니다.
        </p>
      </section>
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 2: 빌드 통과 확인**

Run:
```powershell
cd sites/marketing; pnpm build
```
Expected: `12 page(s) built` (이전 11 + privacy).

- [ ] **Step 3: 로컬 preview에서 페이지 노출 확인**

Run (별도 터미널, background OK):
```powershell
cd sites/marketing; pnpm preview
```
Browser: `http://localhost:4321/privacy` — 페이지 정상 표시, Footer에 다른 페이지 링크 정상, 다크모드 토글 작동.

- [ ] **Step 4: commit**

Run:
```powershell
git add sites/marketing/src/pages/privacy.astro
git -c user.email="wndnjs3865@gmail.com" -c user.name="wndnjs3865" commit -m "feat: /privacy 페이지 — PIPA 의무 처리방침"
```

---

## Task 4: /security 페이지 신규

**Files:**
- Create: `sites/marketing/src/pages/security.astro`

근거: Footer 링크 dead 차단 + FlowAgent의 핵심 가치(로컬 실행 = 보안)를 명문화. Pilot 대상 SMB가 "보안 정책 페이지 있나?" 묻는 시나리오 대비.

- [ ] **Step 1: 페이지 생성**

Create `sites/marketing/src/pages/security.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';

const lastUpdated = '2026-05-21';
---

<BaseLayout
  title="보안 정책 — FlowAgent"
  description="FlowAgent의 데이터 흐름과 보안 설계. 회사 데이터·API 키·실행 결과 모두 사용자 노트북 안에서만 움직입니다."
>
  <article class="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
    <h1 class="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
      보안 정책
    </h1>
    <p class="mt-3 text-sm text-zinc-500 dark:text-zinc-500">
      최종 수정일: {lastUpdated}
    </p>

    <div class="mt-10 space-y-8 text-zinc-700 dark:text-zinc-300">
      <section>
        <p class="leading-relaxed">
          FlowAgent를 만든 첫 이유는 "회사 데이터가 노트북 밖으로 안 나가는 사무
          자동화"였습니다. 이 페이지는 그 약속이 구체적으로 어떻게 지켜지는지
          기술적으로 설명합니다.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          데이터가 어디로 가는가
        </h2>
        <ul class="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
          <li>
            <strong>워크플로 입력·출력</strong>: 사용자 노트북의 디스크에만 저장.
            FlowAgent 서버로 전송되지 않으며, FlowAgent는 외부 수신 서버 자체가
            없습니다.
          </li>
          <li>
            <strong>LLM 호출</strong>: 사용자가 입력한 Anthropic API 키로 직접
            호출됩니다. FlowAgent를 거치지 않습니다. 즉 입력 텍스트는 사용자의
            노트북 → Anthropic 서버로 직접 갑니다.
          </li>
          <li>
            <strong>API 키</strong>: 사용자 노트북의 환경변수 또는 로컬 설정 파일에만
            저장. FlowAgent의 어떤 코드도 키를 외부로 전송하지 않습니다.
          </li>
          <li>
            <strong>실행 결과 (runs/*.jsonl)</strong>: 사용자 작업 디렉토리에만
            기록됩니다. signed URL로 공유한 경우에만 사용자가 명시한 한 건이
            URL fragment를 통해 모바일 브라우저에서 접근 가능합니다.
          </li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          셸 실행 sandboxing
        </h2>
        <p class="mt-3 leading-relaxed">
          워크플로의 <code class="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">shell</code>
          step은 YAML에 명시된 명령만 실행합니다. LLM이 동적으로 명령을 생성하지
          않으며, 사용자가 보지 못한 명령이 백그라운드에서 도는 일은 구조적으로
          불가능합니다.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          오픈소스 검증
        </h2>
        <p class="mt-3 leading-relaxed">
          FlowAgent는 Apache 2.0 라이선스 오픈소스입니다. 위 약속을 직접 확인하려면
          <a href="https://github.com/wndnjs3865/flowagent" target="_blank" rel="noopener" class="underline">GitHub 저장소</a>에서
          소스코드를 검토하실 수 있습니다. 보안 우려·취약점은 아래 문의처로
          제보 부탁드립니다.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          웹사이트(taskflow.kr) 수집 정보
        </h2>
        <p class="mt-3 leading-relaxed">
          본 웹사이트는 새 소식 알림 신청 시 이메일 주소만 수집합니다. 자세한
          처리 방식은
          <a href="/privacy" class="underline">개인정보 처리방침</a>을
          참고하세요.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          취약점 제보
        </h2>
        <p class="mt-3 leading-relaxed">
          보안 취약점을 발견하셨다면 공개 issue 대신
          <a href="mailto:wndnjs3865@naver.com" class="underline">wndnjs3865@naver.com</a>
          으로 알려주세요. 7영업일 이내에 회신드립니다.
        </p>
      </section>
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 2: 빌드 통과 확인**

Run:
```powershell
cd sites/marketing; pnpm build
```
Expected: `13 page(s) built`.

- [ ] **Step 3: commit**

Run:
```powershell
git add sites/marketing/src/pages/security.astro
git -c user.email="wndnjs3865@gmail.com" -c user.name="wndnjs3865" commit -m "feat: /security 페이지 — 데이터 흐름 + sandboxing 명문화"
```

---

## Task 5: /terms 페이지 신규

**Files:**
- Create: `sites/marketing/src/pages/terms.astro`

근거: Footer dead link 차단 + Apache 2.0 + TRADEMARK.md 정책을 사용자가 사이트 안에서도 확인 가능하게.

- [ ] **Step 1: 페이지 생성**

Create `sites/marketing/src/pages/terms.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';

const lastUpdated = '2026-05-21';
---

<BaseLayout
  title="이용약관 — FlowAgent"
  description="FlowAgent 소프트웨어 및 taskflow.kr 웹사이트 이용약관."
>
  <article class="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
    <h1 class="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
      이용약관
    </h1>
    <p class="mt-3 text-sm text-zinc-500 dark:text-zinc-500">
      최종 수정일: {lastUpdated}
    </p>

    <div class="mt-10 space-y-8 text-zinc-700 dark:text-zinc-300">
      <section>
        <p class="leading-relaxed">
          FlowAgent를 사용해 주셔서 감사합니다. 이 약관은 FlowAgent 소프트웨어와
          taskflow.kr 웹사이트를 이용하실 때 어떤 권리와 책임이 있는지 정리한
          문서입니다.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          제1조 (서비스 정의)
        </h2>
        <p class="mt-3 leading-relaxed">
          "FlowAgent"는 사용자 본인의 컴퓨터에서 실행되는 오픈소스 사무 자동화
          소프트웨어를 의미합니다. "taskflow.kr"는 그 소프트웨어를 소개하고
          다운로드하는 공식 웹사이트입니다. 본 약관은 두 가지 모두에 적용됩니다.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          제2조 (라이선스)
        </h2>
        <p class="mt-3 leading-relaxed">
          FlowAgent 소프트웨어는 Apache 라이선스 2.0 하에 배포됩니다. 사용·복제·
          수정·배포·상업적 이용이 모두 허용되며, 자세한 조건은
          <a href="https://github.com/wndnjs3865/flowagent/blob/main/LICENSE" target="_blank" rel="noopener" class="underline">LICENSE 파일</a>을
          참고하세요.
        </p>
        <p class="mt-3 leading-relaxed">
          단 "FlowAgent" 명칭·로고·관련 상표는 Apache 2.0 라이선스의 부여 범위에
          포함되지 않으며 별도의
          <a href="https://github.com/wndnjs3865/flowagent/blob/main/TRADEMARK.md" target="_blank" rel="noopener" class="underline">TRADEMARK 정책</a>을
          따릅니다. fork된 코드를 "FlowAgent" 이름·로고로 SaaS로 운영하는 행위는
          금지되며, 다른 이름을 사용해야 합니다.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          제3조 (책임 제한)
        </h2>
        <p class="mt-3 leading-relaxed">
          FlowAgent는 Apache 2.0 라이선스 제7조에 따라 "있는 그대로(AS IS)" 제공
          되며, 명시적이든 묵시적이든 어떠한 보증도 하지 않습니다. 소프트웨어 사용
          중 발생한 데이터 손실·업무 중단·금전적 손해에 대해 운영자는 한국
          민법·상법의 강행 규정이 정하는 범위를 넘어 책임을 지지 않습니다.
        </p>
        <p class="mt-3 leading-relaxed">
          LLM(예: Anthropic Claude) 호출 결과는 사용자가 직접 검토 후 활용해야
          합니다. 운영자는 LLM이 생성한 내용의 정확성·적법성·적합성을 보증하지
          않습니다.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          제4조 (사용자의 의무)
        </h2>
        <p class="mt-3 leading-relaxed">
          이용자는 다음 행위를 하지 않을 의무가 있습니다.
        </p>
        <ul class="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
          <li>한국 법령 또는 제3자의 권리를 침해하는 목적으로 FlowAgent를 사용하는 행위</li>
          <li>FlowAgent의 명칭·로고를 무단으로 사용하거나 공식 서비스인 것처럼 오해를 일으키는 행위 (TRADEMARK.md 제5조)</li>
          <li>웹사이트 운영을 방해하는 자동화된 대량 요청·취약점 악용</li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          제5조 (Pilot·유료 기능)
        </h2>
        <p class="mt-3 leading-relaxed">
          본 약관 기준일 현재 FlowAgent는 Pro·Team·Pilot 유료 옵션을 모집 중이며
          정식 제공은 시작되지 않았습니다. 유료 기능이 출시되면 별도의 유료
          서비스 약관이 본 약관에 추가됩니다.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          제6조 (개인정보 처리)
        </h2>
        <p class="mt-3 leading-relaxed">
          본 웹사이트의 개인정보 수집·이용·위탁에 관한 사항은
          <a href="/privacy" class="underline">개인정보 처리방침</a>에 따릅니다.
          보안에 관한 사항은 <a href="/security" class="underline">보안 정책</a>을
          참고하세요.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          제7조 (약관의 변경 및 준거법)
        </h2>
        <p class="mt-3 leading-relaxed">
          본 약관이 변경되는 경우 본 페이지에 게시하며, 중요한 변경은 기존
          구독자에게 이메일로 사전 안내합니다. 본 약관에 명시되지 않은 사항과
          분쟁은 대한민국 법령에 따라 처리하며 운영자 소재지 관할 법원을
          전속 합의 관할로 합니다.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          제8조 (운영자 정보 및 문의)
        </h2>
        <ul class="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
          <li>운영자: 강주원</li>
          <li>사업자등록번호: 607-20-94796</li>
          <li>문의: <a href="mailto:wndnjs3865@naver.com" class="underline">wndnjs3865@naver.com</a></li>
        </ul>
      </section>
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 2: 빌드 통과 확인**

Run:
```powershell
cd sites/marketing; pnpm build
```
Expected: `14 page(s) built` (11 + privacy + security + terms).

- [ ] **Step 3: commit**

Run:
```powershell
git add sites/marketing/src/pages/terms.astro
git -c user.email="wndnjs3865@gmail.com" -c user.name="wndnjs3865" commit -m "feat: /terms 페이지 — Apache 2.0 + TRADEMARK 참조 이용약관"
```

---

## Task 6: Final 통합 검증 + 배포

**Files:** 검증만, 수정 없음

- [ ] **Step 1: 최종 빌드 통과 확인**

Run:
```powershell
cd sites/marketing; pnpm build
```
Expected: `14 page(s) built`. 모든 페이지 정상 생성.

- [ ] **Step 2: 로컬 preview에서 smoke test (인코그니토 권장)**

Run (background):
```powershell
cd sites/marketing; pnpm preview
```

브라우저 (`http://localhost:4321/`):
- ✅ `/` HERO에 EmailForm 노출
- ✅ HERO GitHub 링크 클릭 시 새 탭 열림
- ✅ Footer의 `/privacy`·`/security`·`/terms` 3 링크 모두 200
- ✅ `/privacy` 모든 섹션 렌더링, Loops/Vercel 위탁 테이블 표시
- ✅ `/security` 데이터 흐름 4 항목 표시
- ✅ `/terms` Apache 2.0 + TRADEMARK 링크 클릭 가능
- ✅ EmailForm 제출 시 (env 미설정 dev 환경에서) "Email form is not configured." error 표시 — silent simulate 안 함

- [ ] **Step 3: push + Vercel prod 자동 배포 대기**

Run:
```powershell
git push -u origin feat/launch-readiness
```

Vercel이 push 감지 → preview 빌드 시작. 60–90초 후 preview URL 노출.

- [ ] **Step 4: PR 생성 + main으로 squash merge**

Run:
```powershell
gh pr create --title "Launch readiness — EmailForm fix + 법적 페이지 3개" --body "@(cat <<'EOF'
2026-05-21(목) 09:00 디스콰이엇 첫 게시 차단하는 critical findings 5건 fix + Footer dead link 해결.

## 변경 사항

- **EmailForm**: simulate 분기 제거(silent failure 차단), userGroup body 추가(채널별 lead 출처 트래킹)
- **index.astro**: HERO에 EmailForm 추가(landing-hero source), GitHub 링크 target=_blank
- **신규 페이지**: /privacy (PIPA 처리방침), /security (데이터 흐름), /terms (Apache 2.0 + TRADEMARK)

## 검증
- pnpm build: 14 page(s) built ✅
- 로컬 preview smoke test ✅
- Footer 3 링크 모두 라이브 ✅

## 게시 의존성
- Vercel env var PUBLIC_LOOPS_FORM_ID=cmp2ei3ut1xbj0i02rct8hrht (사용자가 별도 완료)
- Loops confirmation email 본문 (Chrome Claude 위임)
EOF
)"
```

PR 생성 후 사용자 컨펌:
```powershell
gh pr merge --squash --delete-branch
```

- [ ] **Step 5: prod 배포 완료 polling**

Run:
```powershell
until (gh api repos/wndnjs3865/flowagent/commits/main/status | Select-String '"state":"success"') { Start-Sleep 5 }
```
Expected: 60–90초 내 SUCCESS.

- [ ] **Step 6: prod WebFetch 최종 검증**

각 URL이 200 + 예상 콘텐츠:
- `https://taskflow.kr/privacy` — "개인정보 처리방침" 제목, Loops/Vercel 위탁 표
- `https://taskflow.kr/security` — "보안 정책" 제목, 데이터 흐름 4 항목
- `https://taskflow.kr/terms` — "이용약관" 제목, Apache 2.0 링크
- `https://taskflow.kr/` HERO에 EmailForm 노출
- cache-buster query string 필요 시 `?cb=20260521`

- [ ] **Step 7: 사용자에게 게시 GO 신호**

09:00 게시 직전 사용자가 디스콰이엇 글에서 (`docs/sales/launch-share-copy.md`) 채널 1 카피 사용. 첫 1시간 댓글 즉시 응답 대기.

---

## Self-Review (작성자 셀프 체크)

**1. Spec 커버리지** (어제 메모리의 critical findings 5건):
- #1 가짜 success → Task 1 (simulate 제거) ✅
- #2 source 미전송 → Task 1 (userGroup body) ✅
- #3 Footer dead links → Task 3·4·5 (페이지 3개) ✅
- #4 Landing EmailForm 없음 → Task 2 ✅
- #5 GitHub target=_blank → Task 2 ✅

**2. Placeholder 스캔**: TBD/TODO 0건. 모든 step에 실제 코드 또는 명령 박힘.

**3. Type/Path 일관성**:
- `userGroup` 필드명 Task 1과 본문 설명 일치 ✅
- 페이지 수 baseline 11 → +1 → +2 → +3 → 14 일관 ✅
- 브랜치명 `feat/launch-readiness` 모든 step 일관 ✅
- Footer 링크 path `/privacy`·`/security`·`/terms`와 새 페이지 path 일관 ✅

**4. 의존성**:
- Task 1·2 → src 수정 후 build 통과 (TS 검사)
- Task 3 → Loops confirmation email의 처리방침 링크가 라이브되어야 게시 가능
- Task 6 → 모든 이전 task 완료 가정
