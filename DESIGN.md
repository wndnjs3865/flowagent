---
name: FlowAgent
description: 회사 데이터를 노트북 밖으로 보내지 않는 한국어 사무 자동화 OSS의 디자인 시스템
version: 1.0.0
brand:
  voice: 차분하고 단정함. 과장 없는 한국어. 보안·로컬·신뢰를 강조.
  audience: 한국 SMB 실무자, 보안에 민감한 팀
---

# FlowAgent Design System

회사 데이터가 노트북 밖으로 안 나가는 로컬 사무 자동화 도구. 디자인은 **단정함·신뢰·읽기 편함** 세 가지를 우선한다. 화려한 그라데이션·네온은 쓰지 않는다.

## Colors

OKLCH 기반(Tailwind v4 기본 팔레트). 시맨틱 토큰을 우선 참조하고, 원색은 토큰 정의에서만 사용한다.

### Primitives
- `blue-600` `#2563eb` — 브랜드 프라이머리
- `blue-700` `#1d4ed8` — 프라이머리 hover/active
- `blue-50`  `#eff6ff` — 프라이머리 표면(배지/하이라이트)
- `emerald-500` `#10b981` — 성공·안전(로컬 처리, 다운로드 성공)
- `amber-500`   `#f59e0b` — 주의·하이라이트(신규/베타)
- `red-500`     `#ef4444` — 에러·파괴적 액션
- `zinc-50` ~ `zinc-950` — 텍스트·표면·테두리 뉴트럴 스케일
- `white` `#ffffff`, `black` `#000000`

### Semantic tokens
- `--color-bg`          = `white`
- `--color-bg-subtle`   = `zinc-50`
- `--color-bg-inverse`  = `zinc-950`
- `--color-fg`          = `zinc-900`
- `--color-fg-muted`    = `zinc-600`
- `--color-fg-subtle`   = `zinc-500`
- `--color-fg-inverse`  = `white`
- `--color-border`      = `zinc-200`
- `--color-border-strong` = `zinc-300`
- `--color-primary`        = `blue-600`
- `--color-primary-hover`  = `blue-700`
- `--color-primary-surface`= `blue-50`
- `--color-success` = `emerald-500`
- `--color-warning` = `amber-500`
- `--color-danger`  = `red-500`

## Typography

- **Family**: `"Pretendard Variable", Pretendard, system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
- **Weights**: 400(본문) · 500(메뉴/라벨) · 600(버튼/강조) · 700(헤딩)
- **숫자**: tabular-nums 권장 (가격·통계 영역)

### Scale (desktop / mobile)
- `display`  60/66 · -1.5px · 700 — hero h1 (모바일 40/44 -1.0px)
- `h1`       36/40 · -1.0px · 700
- `h2`       30/36 · -0.75px · 700
- `h3`       24/32 · -0.5px · 700
- `h4`       20/28 · -0.25px · 600
- `body-lg`  18/28 · 0 · 400
- `body`     16/24 · 0 · 400
- `body-sm`  14/20 · 0 · 400
- `caption`  12/16 · 0 · 500

본문 색은 `--color-fg`, 보조 설명은 `--color-fg-muted`. 링크는 `--color-primary` + underline-on-hover.

## Layout

- **Container**: `max-width: 1152px` (Tailwind `max-w-6xl`), 좌우 패딩 `16px` 기본 / `24px` ≥640px
- **섹션 세로 패딩**: `80px` 기본 / `112px` ≥640px / `128px` ≥1024px
- **그리드**: 12컬럼 가정, 카드 그리드는 1 / 2 / 3 컬럼 반응형(`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
- **Gap 스케일**: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 px

### Spacing scale (4px base)
`0 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 112 · 128`

## Shape

- **Radius**: `sm 4px` · `md 6px`(기본 버튼/입력) · `lg 8px` · `xl 12px`(카드) · `2xl 16px` · `full 9999px`(배지/아바타)
- **Border**: 1px solid `--color-border` 기본. 강조 테두리는 `--color-border-strong`.

## Elevation & Depth

레이어는 최소화. 그림자보다 테두리 + 배경 명도차로 깊이를 만든다.

- `elevation-0`: 평면, 배경만 `--color-bg`
- `elevation-1`: `box-shadow: 0 1px 2px rgb(0 0 0 / 0.04), 0 1px 1px rgb(0 0 0 / 0.03)` — 카드
- `elevation-2`: `box-shadow: 0 4px 12px rgb(0 0 0 / 0.06), 0 2px 4px rgb(0 0 0 / 0.04)` — 드롭다운/팝오버
- `elevation-3`: `box-shadow: 0 16px 40px rgb(0 0 0 / 0.10), 0 4px 12px rgb(0 0 0 / 0.06)` — 모달

## Components

### Button
- **Primary**: bg `--color-primary`, fg `white`, hover `--color-primary-hover`, radius `6px`, 패딩 `12px 20px`(md) / `8px 14px`(sm), font 16/600 (sm 14/600).
- **Secondary**: bg `white`, fg `--color-fg`, border 1px `--color-border-strong`, hover bg `zinc-50`.
- **Ghost**: bg transparent, fg `--color-fg-muted`, hover bg `zinc-100`.
- **Destructive**: bg `--color-danger`, fg `white`.
- focus-visible: `outline: 2px solid var(--color-primary); outline-offset: 2px;`

### Input / Textarea
- 높이 40px, padding `8px 12px`, radius `6px`, border 1px `--color-border-strong`.
- focus: border `--color-primary`, ring 2px `blue-100`.

### Card
- bg `white`, border 1px `--color-border`, radius `12px`, padding `24px`, `elevation-1`.
- 헤더 `h3` + 본문 `body` 조합 권장.

### Badge
- radius `full`, padding `2px 8px`, font 12/500.
- 신규: bg `--color-primary-surface`, fg `--color-primary`.
- 안전/로컬: bg `emerald-50`, fg `emerald-700`.
- 베타/주의: bg `amber-50`, fg `amber-700`.

### Navigation
- 상단 고정 헤더, 높이 56px, 좌측 로고(700/18), 우측 메뉴(500/14, fg-muted).
- 배경 `rgba(255,255,255,0.85)` + `backdrop-filter: blur(8px)`, 하단 border 1px `--color-border`.

### Section
- 한 섹션 = 하나의 메시지. 헤딩(h2) + eyebrow(caption, fg-muted, uppercase 가능) + 본문 body-lg max-w-3xl.

## Iconography

- 라이브러리: **lucide-react** 기본. stroke 1.75, 사이즈 16/20/24.
- 아이콘 색은 텍스트 토큰을 따름(`currentColor`).

## Motion

- Duration: `fast 120ms` · `base 200ms` · `slow 320ms`
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)` 기본
- hover/focus 전이는 `base`, 모달/시트는 `slow`. **과한 바운스 금지.**

## Imagery

- 스크린샷이 메인. 일러스트·스톡 사진은 지양.
- 스크린샷 둘레: radius `12px`, border 1px `zinc-200`, `elevation-2`.
- 다크 UI 스크린샷은 zinc-950 배경 위에 얹어 대비를 만든다.

## Accessibility

- 본문 명도 대비 ≥ 4.5:1, 큰 텍스트 ≥ 3:1.
- 모든 인터랙티브 요소는 visible focus(outline 2px primary).
- 아이콘 단독 버튼은 `aria-label` 필수.
- 한국어 우선, 폰트 fallback에 system-ui 포함.

## Do's and Don'ts

- ✅ 단정한 흰 배경 + zinc 뉴트럴 + 파란 강조 한 점.
- ✅ 본문은 검정에 가까운 zinc-900, 보조는 zinc-600.
- ✅ "로컬에서 처리", "노트북 밖으로 안 나간다" 같은 메시지는 emerald 보조색으로 시각화.
- ❌ 그라데이션 배경, 네온 컬러, 두 가지 이상 강조색 동시 사용.
- ❌ 글래스모피즘 카드(헤더 blur 제외).
- ❌ 8px 미만 둥글기, 16px 초과 본문 라인-높이 < 1.4.
- ❌ 영문 전용 폰트 단독 사용(한국어 가독성 우선).
