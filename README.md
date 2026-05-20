# FlowAgent

> 🌐 **[https://taskflow.kr](https://taskflow.kr)** — 다운로드 · 가격 · 문서 · 템플릿

> **회사 데이터는 노트북 안에만.**
> **한국어 사무 자동화, 5종 워크플로 바로 시작.**

[⬇ 다운로드](https://taskflow.kr/download) · [📖 문서](https://taskflow.kr/docs) · [💰 가격](https://taskflow.kr/pricing) · [🎯 템플릿](https://taskflow.kr/templates)

반복 업무 스트레스를 줄이는 로컬 워크플로우 러너. LLM 호출과 셸 명령을 YAML 한 파일로 엮어 브라우저에서 실행하고, 결과를 SSE로 실시간 스트리밍합니다. 단일 사용자·단일 머신·DAG 없음·큐 없음.

## 빠른 시작

**권장**: [taskflow.kr/download](https://taskflow.kr/download)에서 zip 받기 → 압축 풀고 `start.bat` 더블클릭. Anthropic API 키만 입력하면 끝.

**개발자**: `git clone https://github.com/wndnjs3865/flowagent.git && pnpm install && pnpm dev`

도메인 용어 (`Workflow`, `Step`, `Run`, `Runner`, `Agent`) 는 [`CONTEXT.md`](./CONTEXT.md) 에 정의돼 있어요. 코드, 커밋, PR 제목에서 그대로 사용하세요.

---

## 어디부터 읽어야 하나요?

이 README는 두 종류의 독자를 위해 분리돼 있습니다. 본인 경로만 따라가시면 됩니다.

| 누구 | 시작 위치 | 목표 |
|---|---|---|
| **일반 사용자 (비개발자, 사무·총무·영업지원)** — 노트북에서 5종 데모를 직접 돌려보고 싶음 | 바로 아래 [일반 사용자용 5분 시작 가이드](#general-user-guide) | 설치 → 5종 데모 실행. customize는 미팅 신청으로 |
| **개발자 / Pilot 운영자** — 코드 수정, 새 워크플로우 작성, 미팅 시연·customize 진행 | [Developer quickstart](#developer-quickstart) → [Demo path (Pilot 운영자용)](#demo-path-operator) → [Writing a workflow](#writing-a-workflow) | 5종 외 사례를 yaml로, 4주 Pilot 진행, 코드 기여 |

위 두 경로 모두에 공통으로 유용한 섹션: [1분 데모 영상](#demo-video-1min), [Bundled workflows](#bundled-workflows), [Run logs](#run-logs), [Limits](#limits).

---

<a id="general-user-guide"></a>

## 일반 사용자 — 더블클릭 2번이면 끝

> 비개발자도 GitHub·PowerShell·터미널을 모르고 노트북에서 5종 데모를 직접 실행할 수 있게 만든 흐름.

### 1️⃣ [📦 flowagent ZIP 다운로드](https://github.com/wndnjs3865/flowagent/archive/refs/heads/main.zip)

위 큰 링크를 클릭하면 `flowagent-main.zip` 이 자동으로 받아집니다.
다운로드 폴더로 가서 zip 파일을 **우클릭 → "모든 파일 압축 풀기"** → 위치는 `C:\flowagent` 같이 한글·공백 없는 폴더 권장.

### 2️⃣ 압축 푼 폴더 안의 **`start.bat`** 더블클릭

다음 4단계가 자동으로 진행됩니다. **표 오른쪽 "본인이 할 일"만 해주시면 됩니다.**

| 자동 진행 | 본인이 할 일 |
|---|---|
| Node.js 설치 여부 확인 | 없으면 [nodejs.org](https://nodejs.org/)가 자동으로 열림 → **LTS** 초록 버튼으로 설치한 뒤 `start.bat` 다시 더블클릭 |
| pnpm 자동 설치 (corepack 또는 npm) | (없음) |
| 메모장 자동 실행 → `.env` 파일 열림 | **`ANTHROPIC_API_KEY=` 뒤에 본인 키 붙여넣고 `Ctrl+S` → 메모장 닫기** ([키 발급 1분](https://console.anthropic.com/settings/keys) — Create Key → `sk-ant-…` 복사) |
| 의존성 설치 + 서버 시작 + 브라우저 자동 열기 | 브라우저에 5장 카드 보이면 카드 1개 → **Run** |

**검은 창은 닫지 마세요** — 서버가 꺼집니다.
*(SmartScreen이 `start.bat` 실행 경고를 띄우면 **추가 정보 → 실행**.)*

---

### 내 데이터 1개 넣어보기 (선택, 3분)

5종 중 4개는 노트북 안 파일을 LLM 입력으로 씁니다. **그 파일을 본인 데이터로 같은 이름·같은 형식으로 덮어쓰면** 본인 데이터 결과가 즉시 나옵니다.

| 워크플로우 | 바꿀 파일 | 형식 |
|---|---|---|
| `meeting-actions` | `workflows\fixtures\meeting-notes-2026-w19.md` | 한국어 회의록 (.md) |
| `sales-summary` | `workflows\fixtures\sales-2026-04.csv` | CSV (Excel 저장 시 **"CSV UTF-8"**) |
| `inquiry-triage` | `workflows\fixtures\inquiries-2026-05.csv` | CSV — `id,접수일시,고객명,문의내용` |
| `approval-triage` | `workflows\fixtures\inbox-approvals-2026-05.md` | 결재 요청 (.md, `## REQ-001` 형식) |

1. 위 표에서 1개 선택 → Explorer에서 해당 파일 **더블클릭**해 열기
2. 본인 데이터로 내용 바꾸고 저장
3. 브라우저 새로고침 → 같은 카드 → **Run**

### 더 깊은 customize · 4주 Pilot

미팅 신청 → **wndnjs3865@naver.com** (또는 페이지 상단 **Pilot 미팅 신청** 배너).
30분 안에 귀사 데이터로 YAML 하나 함께 만들어 드립니다 — 회사 데이터는 노트북을 벗어나지 않습니다.

### 막힐 때

- **"Node.js가 설치되지 않았습니다"** → nodejs.org가 자동으로 열림. LTS 설치 후 `start.bat` 다시 더블클릭.
- **검은 창에 "API 키" 오류** → 폴더의 `.env` 파일을 메모장으로 다시 열어 `ANTHROPIC_API_KEY=` 뒤 키 (앞뒤 공백·따옴표 없이) 확인 후 저장 → `start.bat` 다시.
- **브라우저 "사이트 연결 불가"** → 검은 창에 `FlowAgent listening on …` 줄 있는지 확인. 없으면 `start.bat` 다시 더블클릭.
- **검은 창 닫혀버림** → 서버가 꺼졌습니다. `start.bat` 다시 더블클릭.
- **한국어 깨짐** → 브라우저 `Ctrl+R` 새로고침.

---

<a id="developer-quickstart"></a>

## Developer quickstart

```bash
pnpm install
cp .env.example .env
# edit .env and put your Anthropic API key in ANTHROPIC_API_KEY=
pnpm dev
# open http://localhost:3000
```

`.env` is loaded automatically via `tsx --env-file=.env` — no `dotenv` dependency needed.

Required env:

| Var | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Used by `llm` steps. Without it, runs fail at the first `llm` step. |
| `PORT` | HTTP port (default `3000`). |
| `FLOWAGENT_WORKFLOWS_DIR` | Directory scanned for `*.yaml` workflows (default `workflows`). |
| `FLOWAGENT_RUNS_DIR` | Directory where per-run JSONL audit logs are written (default `runs`). Created on demand. |
| `FLOWAGENT_PILOT_CONTACT_EMAIL` | Email used by the Listing page "Pilot 미팅 신청" CTA button. The server builds a `mailto:` link with a fixed Korean subject. Defaults to the FlowAgent official sales channel `wndnjs3865@naver.com` — override only if you fork for your own sales. |

<a id="demo-video-1min"></a>

## 1분 데모 영상

> 5종 워크플로우 순회 데모. 노트북에서 5분 시작 → 실제 결과까지 한 화면.

<!-- 영상 업로드 후 아래 PLACEHOLDER 두 줄을 교체:
     1. video src — GitHub Release asset URL (`gh release view v0.1.0-demo --json assets --jq '.assets[0].browser_download_url'`)
     2. thumbnail fallback — assets/pilot-demo-thumb.png (선택) -->

<video src="https://github.com/wndnjs3865/flowagent/releases/download/v0.1.0-demo/pilot-demo-1min.mp4" controls width="720" poster="assets/pilot-demo-thumb.png">
  영상 재생이 안 보이면 <a href="https://github.com/wndnjs3865/flowagent/releases/tag/v0.1.0-demo">v0.1.0-demo Release</a>에서 직접 다운로드 (mp4, 약 10–20MB).
</video>

### 영상 제작 가이드

영상은 직접 녹화·편집·업로드합니다. 절차는 다음 두 문서 따라가면 30분:

1. **Storyboard** — [`docs/sales/pilot-demo-storyboard.md`](docs/sales/pilot-demo-storyboard.md) — 초 단위 컷·내레이션·녹화 도구·편집 가이드·fallback. 사전 점검 60초 + 1분 분할 8단계.
2. **Asset 호스팅** — [`assets/README.md`](assets/README.md) — GitHub Release 업로드 절차, 파일명 규약(`pilot-demo-<용도>-<duration>.<ext>`), 1MB 이상 바이너리는 repo commit 금지.

요약 흐름:

```bash
# 1. 사전 점검 (60초) — storyboard "사전 점검" 섹션 그대로
rm -f runs/*.jsonl && pnpm dev > /dev/null 2>&1 &
sleep 3 && curl -sf http://localhost:3000/ > /dev/null && echo OK

# 2. OBS / QuickTime으로 1920×1080 30fps 녹화 (storyboard 따라 75초 → 60초 컷 편집)

# 3. GitHub Release에 업로드
gh release create v0.1.0-demo --title "Pilot demo assets v0.1" \
  --notes "1분 데모 영상" ./pilot-demo-1min.mp4

# 4. README 위 <video src="..."> 의 URL을 새 asset URL로 교체
gh release view v0.1.0-demo --json assets --jq '.assets[0].browser_download_url'
```

5종 워크플로우 실시간 실행 검증 결과 (이 README와 동시 발행): weekly-report 9초 / meeting-actions 10초 / sales-summary 15초 / inquiry-triage 24초 / approval-triage 17초 — 총 75초. 컷 편집으로 60초 압축.

<a id="demo-path-operator"></a>

## Demo path (Pilot 운영자용) — first run in 5 minutes

The fastest path from clone to a result you can show a Pilot stakeholder. Total: 5 minutes including
prereqs, 3 minutes if Node/pnpm are already installed.

### Prereqs (2 minutes)

- Node.js 20.6 or newer (`node --version`) — needed for `tsx --env-file`.
- pnpm (`npm i -g pnpm` if missing).
- Anthropic API key from <https://console.anthropic.com/settings/keys>.

### Windows 사용자 안내 (PowerShell · cmd · Git Bash 모두 동일 동작)

이 프로젝트의 shell step은 OS-중립 `node -e "..."` 한 줄로 통일돼 있어 **추가로 Git Bash·WSL 설치가 필요 없습니다.** Windows 표준 PowerShell·cmd 어느 쪽에서도 5종 워크플로우가 그대로 동작합니다.

| 단계 | 명령 (PowerShell 또는 cmd) |
|---|---|
| 1. Node.js 설치 | <https://nodejs.org/> "LTS" installer 또는 `winget install OpenJS.NodeJS.LTS` |
| 2. pnpm 설치 | `npm i -g pnpm` |
| 3. 프로젝트 받기 | `git clone https://github.com/wndnjs3865/flowagent && cd flowagent` |
| 4. 의존성 설치 | `pnpm install` |
| 5. `.env` 생성 | `copy .env.example .env` (cmd) 또는 `Copy-Item .env.example .env` (PowerShell) — 그 후 `.env` 열어 `ANTHROPIC_API_KEY=sk-ant-...` 붙여넣기 |
| 6. 서버 실행 | `pnpm dev` |
| 7. 브라우저 | <http://localhost:3000> |

**PowerShell 실행정책 이슈 시** — `pnpm.ps1`이 차단되면 한 번만:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

이후 `pnpm dev` 정상. cmd에서는 이 문제 없음.

### Steps (3 minutes)

1. `git clone <this repo> && cd flowagent`
2. `pnpm install`
3. `cp .env.example .env`, then open `.env` and paste your key into `ANTHROPIC_API_KEY=sk-ant-...`
4. `pnpm dev` — you should see `FlowAgent listening on http://localhost:3000`. Leave it running.
5. Open <http://localhost:3000> in a browser. You'll see 5 bundled workflows in the list.
6. Click **`meeting-actions`** → **Run**. Each step streams into the log box live (`step-start` →
   `step-output` → `step-end`). The full run takes ~20 seconds.
7. After the run finishes, open `runs/<runId>.jsonl` in your editor. The exact events you just saw are
   on disk, one JSON object per line, ready to replay or share.

Try `sales-summary` for an executive-summary demo, `inquiry-triage` for a CS-desk demo, or
`approval-triage` for an office-manager demo. Each finishes in under 30 seconds.

What you should see at the end of step 6 (the Slack-format step of `meeting-actions`), in Korean,
ready to paste:

```
이번 주 액션 아이템 정리해드릴게요 👇

*이팀장*
• [5/16] 단골 고객 사은품 제공 방안 초안 작성
• [5/18] 쿠팡 광고비 재편성 안 회의 전 보고
*박매니저*
• [5/15] 마케팅 주니어 채용공고 초안 작성
...
```

### Pilot meeting — pre-flight (30초 사전 점검)

미팅 30분 전, 화면 공유 시작 직전에 아래 4가지를 확인합니다. 라이브 시연이 끊기지 않게 하는 최소 가드.

```bash
# 1. API 키 동작 확인 — 빈 결과면 .env의 ANTHROPIC_API_KEY를 다시 확인
curl -s -o /dev/null -w "key=%{http_code}\n" -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" https://api.anthropic.com/v1/models | grep -E "200|key="

# 2. 서버 살아있는지 — 200이어야 함
curl -s -o /dev/null -w "server=%{http_code}\n" http://localhost:3000/

# 3. runs/ 비어있는지 — 새 출력이 한눈에 보이게
ls runs/*.jsonl 2>/dev/null | wc -l   # 0이면 OK, 아니면 mv runs runs.bak && mkdir runs

# 4. 브라우저 zoom 125%+ — 화면 공유 시 가독성
```

### Pilot meeting — 3-minute live demo script (범용)

화면 공유하면서 아래 멘트를 순서대로 따라 읽으세요. 총 3분, 시연 3건.

> **(0:00, 인트로 — 20초)** "FlowAgent는 노트북 한 대에서 도는 워크플로우 도우미예요. 회사 데이터를 외부 SaaS에 올리지 않습니다. 반복되는 사무 업무를 매일 같은 손으로 다시 하지 않게 만드는 게 목표예요."

> **(0:20, 시연 1 · meeting-actions — 50초)** Run 누르며: "어제 회의록을 그대로 넣어 본 거예요. 단 몇 초 만에 담당자별 액션 아이템이 한국어로 정리되고, Slack에 그대로 붙여넣을 수 있는 형식까지 나옵니다."

> **(1:10, 시연 2 · sales-summary — 50초)** Run 누르며: "이번엔 4월 매출 CSV예요. 채널별 이상치를 짚어주고, 경영진 보고용 3문장 요약이 자동으로 만들어집니다."

> **(2:00, 시연 3 · inquiry-triage — 50초)** Run 누르며: "고객 문의 6건이에요. 카테고리·긴급도로 분류된 표가 먼저 나오고, 카테고리별 답변 초안까지 한 번에 만들어집니다. CS 담당자가 톤만 다듬으면 끝이에요."

> **(2:50, 클로징 — 30초)** `runs/` 폴더 열며: "보시다시피 출력은 모두 자동으로 디스크에 저장됩니다. 한 달 뒤에 '이 자동화가 시간을 얼마나 아꼈는지' 리포트도 명령 한 줄로 뽑을 수 있어요. 다음 주에 귀사 데이터 1건으로 같이 만들어 보면 어떠세요?"

### Persona-specific demo paths (시연 순서 갈아끼우기)

상대 회사가 어느 부서를 데려오는지 미리 알면 시연을 바꿔서 첫 임팩트를 최대화합니다.

| 상대 | 추천 시연 순서 (3분) | 클로징 강조점 |
|---|---|---|
| **CS팀장 / 운영팀장** | `inquiry-triage` → `meeting-actions` → `approval-triage` | "매일 답변 톤 통일 + 우선순위 분류 + 결재 누락 방지" |
| **재무·총무·CFO** | `sales-summary` → `approval-triage` → `weekly-report` | "월말 1-pager 자동화 + 결재 잔량 가시화 + 주간 보고 표준화" |
| **대표·실무 매니저** | `weekly-report` → `meeting-actions` → `sales-summary` | "보고 자동화 3종 세트 — 주간/회의/월간" |
| **잡탕(혼합)** | 위 범용 스크립트 그대로 | 데이터 위치 + 5분 시작 + JSONL 감사 로그 |

### 장애 발생 시 30초 복구 (live 데모 도중)

| 증상 | 한 줄 복구 | 안 되면 |
|---|---|---|
| `step-end ... ok:false` 첫 LLM 단계 실패 | "API 키 한도 초과예요" → `weekly-report` 대신 1단계만인 shell-only 사례로 우회 | `runs/*.jsonl` 미리 캡처해 둔 이전 성공 결과를 화면에 띄움 |
| 브라우저에 한국어 깨짐 | 새로고침 (Ctrl/Cmd+R) — Tailwind CDN 캐시 문제 90% | 다른 워크플로우로 즉시 전환, 깨짐은 미팅 후 처리 |
| SSE가 멈춤 (3초 이상 출력 없음) | "잠시 LLM 응답 대기 중입니다" 한 마디 + 우회로 다른 탭 열어 두 번째 워크플로우 Run | 첫 탭은 그대로 두고 두 번째 탭에서 진행 |
| 서버 자체 죽음 | 터미널 `pnpm dev` 재실행(2초) | "로컬 환경 변수가 꼬여서요" 솔직 + 캡처본으로 마무리 |

### After demo — 30분 안에 보내는 leave-behind

1. 이 README 링크 (`#demo-path-first-run-in-5-minutes`로 anchor)
2. `docs/sales/pilot-onepager.md`를 PDF로 변환해 첨부 — 한국어 폰트 포함: `pandoc docs/sales/pilot-onepager.md -o docs/sales/pilot-onepager.pdf --pdf-engine=weasyprint --metadata title="FlowAgent — Pilot 1-pager"` (사전 설치: `apt-get install -y pandoc weasyprint`)
3. 미팅 중 작성한 귀사 케이스 1건의 YAML 초안 (`workflows/<customer-slug>-draft.yaml` 형태로 첨부)
4. 다음 미팅 후보 일정 3개 (1주차 설치 미팅용)
5. 다음 outreach·설치 미팅 제안 이메일 — 템플릿 `docs/sales/pilot-outreach-email.md` 사용. `{{회사명}}/{{담당자명}}/{{후보1·2·3}}/{{발신자명}}` 자리표시자만 치환하고 PDF 첨부 후 발송. Follow-up·Warm intro·설치 미팅 3가지 변형이 같은 파일 하단에 있음.

<a id="bundled-workflows"></a>

## Bundled workflows

The `workflows/` directory ships five end-to-end demos covering the most common Korean SMB office
tasks. All use Korean fixtures under `workflows/fixtures/` and English LLM prompts that emit Korean
output (see [`feedback_demo_fixture_language`](./CLAUDE.md) rule for why).

| Workflow | What it does | Persona (spec § 3) | 없애주는 반복 업무 스트레스 |
|---|---|---|---|
| `weekly-report` | 한 주 진행 노트 → 4-section 구조화 → Slack 공유용 메시지 | 사무직 A ★★★ · 사장 D ★★ | 매주 같은 보고서를 처음부터 다시 쓰는 30분 |
| `meeting-actions` | 회의록 → 담당자별 액션 표 → Slack 보고 포맷 | 사무직 A ★★★ · 사장 D ★★ | 회의 끝나고 회의록 다시 읽으며 액션을 추리는 인지 부하 |
| `sales-summary` | 월간 매출 CSV → 채널·이상치 분석 → 경영진 3-문장 요약 | 사장 D ★★★ · 사무직 A ★★ · 자영업 B ★★ | 월말마다 이상치 찾고 1-pager 만드는 압박 |
| `inquiry-triage` | 고객 문의 CSV → 카테고리·긴급도 분류 + 카테고리별 답변 초안 | 자영업 B ★★★ · 사무직 A ★★ | 매일 같은 톤으로 답변 쓰고 우선순위 매기는 피로 |
| `approval-triage` | 결재 대기함 → 자동승인·검토·정보부족 분류 + 오늘의 brief | 사무직 A ★★★ · 사장 D ★★ | 결재함에 줄선 요청을 하나씩 읽고 판단하는 인지 부하 |

To adapt one for a real Pilot case, edit the file in `workflows/fixtures/` to the customer's own data —
the YAML prompts stay the same. The customer's data never leaves their machine.

### Pilot 미팅 자리 customize 시드 (`_pilot-draft-template.yaml`) — 3분 가이드

귀사 사례 1건을 미팅 자리에서 같이 워크플로우로 만드는 시드. **비개발자도 운영자와 함께 3단계로 따라옵니다.** 본인이 채우는 칸은 5개(한국어), 영문 LLM 프롬프트 4개는 운영자가 같이 채워줍니다.

**1단계 — 복사** (PowerShell·터미널 한 줄, `<회사>` 자리에 본인 회사 영문 약어)

```bash
cp workflows/_pilot-draft-template.yaml workflows/acme-draft.yaml
```

**2단계 — fixture 1건 두기**

본인 데이터 파일(회의록 .md / 매출 .csv / 문의 .csv / 결재 .md 중 하나)을 아래 위치에 같은 이름으로 저장:

```
workflows/fixtures/acme-sample.md
```

**3단계 — 자리표시자 채우기** (아래 표 참조)

| 채우는 사람 | placeholder | 예시 | 어디에 쓰임 |
|---|---|---|---|
| 본인 | `{{customer-slug}}` | `acme` | rename·fixture 파일명과 일치 (영문 소문자) |
| 본인 | `{{확장자}}` | `md` / `csv` | 위 fixture 확장자 |
| 본인 | `{{담당자_페르소나}}` | `운영 / 사무관리` | 카드 페르소나 필터 |
| 본인 | `{{귀사가_겪는_반복_업무_한_줄}}` | `매주 동일한 양식 보고서 다시 쓰기` | 카드 stressRelieved |
| 본인 | `{{회사명}}` | `Acme` | 결과 wrap 헤더 |
| 본인 | `{{워크플로우_제목}}` | `주간 액션 정리` | 결과 wrap 헤더 |
| 운영자 | `{{입력_종류_영문}}` | `a Korean weekly meeting note` | 2단계 LLM prompt |
| 운영자 | `{{추출_목표_영문}}` | `every action item with owner and deadline` | 2단계 LLM prompt |
| 운영자 | `{{출력_형식_영문}}` | `Korean Markdown table` | 2단계 LLM prompt |
| 운영자 | `{{전달_채널_영문}}` | `Slack-ready Korean message` | 4단계 LLM prompt |

**완료 후** — 브라우저 listing(`/`) 새로고침 → 새 카드 자동 등장 → **Run**.

**`_` prefix 파일은 listing/route에서 자동 제외** (`src/workflows-dir.ts`). 시드 자체는 listing에 안 보이고 `/workflows/_pilot-draft-template`·`/run` 모두 404. 데모 중 미완성 placeholder가 고객에게 노출될 위험 없음. 별도 비공개 시드를 더 두려면 동일하게 `_` prefix로 시작하는 파일명을 사용.

<a id="writing-a-workflow"></a>

## Writing a workflow

Drop a `<name>.yaml` file in `workflows/`. The filename (without extension) becomes the URL slug; the
`name:` field is the human-readable label shown in the UI. See
[`workflows/weekly-report.yaml`](./workflows/weekly-report.yaml) for a working 3-step demo.

```yaml
name: my-workflow
description: One-line summary shown on the list page.
steps:
  - type: llm
    name: draft               # optional, used in event logs
    prompt: |
      Write a haiku about workflows.
  - type: shell
    name: wrap
    command: |
      node -e "process.stdout.write('=== Output ===\n' + {{prev}} + '\n')"
  - type: llm
    prompt: |
      Translate to Korean:
      {{prev}}
```

### `{{prev}}` substitution rules

`{{prev}}` is replaced with the previous Step's output. Different rules per step type:

- **`llm` step** — `{{prev}}` is spliced into the prompt string verbatim. No escaping needed.
- **`shell` step** — `{{prev}}` is replaced with the JS expression `process.env.FLOWAGENT_PREV`, and the previous output is passed via the child process's environment. **The shell command must be a `node -e "..."` one-liner** — this makes commands cross-platform (PowerShell, cmd, Git Bash, sh, bash all execute identically) and neutralizes backticks, `$()`, `$VAR`, and semicolon chains inside untrusted LLM output because Node reads the value at runtime instead of the shell tokenizing it.

  ```yaml
  # ✅ Recommended — Node one-liner reads prev as a JS expression
  command: |
    node -e "process.stdout.write({{prev}})"

  # ✅ Wrap with a banner
  command: |
    node -e "process.stdout.write('=== Header ===\n' + {{prev}} + '\n=== End ===\n')"

  # ✅ Load a fixture file (replaces `cat <path>` from sh-only workflows)
  command: |
    node -e "process.stdout.write(require('fs').readFileSync('workflows/fixtures/data.csv','utf8'))"

  # ❌ Avoid — sh-specific, fails on Windows PowerShell/cmd
  command: printf '%s' "{{prev}}"
  command: cat workflows/fixtures/data.csv
  ```

  Place `{{prev}}` unquoted as a bare token inside the Node expression — it expands to a JS variable, not a string literal.

## Project layout

```
src/
  spec.ts              # Zod schema + loadWorkflow(filePath) — YAML → typed Workflow
  runner.ts            # runWorkflow() — sequential execution + SSE-style event callback
  runners.ts           # createDefaultRunners() — wires llm + shell step runners
  workflows-dir.ts     # listWorkflows(dir) — file scanner
  server.ts            # Hono app factory (env-driven)
  main.ts              # HTTP entry — @hono/node-server bind
  routes/
    workflows.ts       # GET /, GET /workflows/:name, POST /workflows/:name/run (SSE)
  steps/
    llm.ts             # Anthropic SDK call
    shell.ts           # child_process.exec with FLOWAGENT_PREV env-var injection
  views/
    layout.tsx         # Tailwind CDN shell
    index.tsx          # workflow list page
    run.tsx            # workflow detail page + SSE client
    error.tsx          # 404 / 500 page
workflows/             # *.yaml — your workflows live here
runs/                  # <runId>.jsonl — one line per SSE event, written live
docs/adr/              # architecture decisions
.claude/               # project skills, agents, commands (Claude Code config)
```

<a id="run-logs"></a>

## Run logs

Every workflow run streams its events live to `runs/<runId>.jsonl` as well as over SSE. One JSON object
per line, in event order: `step-start`, `step-output`, `step-end` (× number of steps), then `done`. The
file basename equals the `runId` reported in the `done` event.

```bash
# Replay the most recent run
tail -n +1 "$(ls -t runs/*.jsonl | head -1)" | jq .

# Show just the outputs for a given run
jq -r 'select(.kind=="step-output") | .output' runs/<runId>.jsonl
```

Disk writes happen before SSE writes, so the log stays complete even if the client disconnects mid-run.

### Pilot use — turning run logs into a monthly automation report

Pilot customers often want proof that automation actually saved time. The JSONL format makes this a
one-liner:

```bash
# How many runs this month, and which workflows?
ls runs/2026-05-*.jsonl | wc -l
jq -r '.step.name // empty' runs/*.jsonl | sort | uniq -c | sort -rn

# Pull every Slack-ready output from this month for archival
jq -r 'select(.kind=="step-output" and .index==3) | .output' runs/2026-05-*.jsonl
```

Pair this with a calendar reminder ("매월 1일 자동화 효과 리포트") and the customer has a recurring
business-value artifact without touching the runner.

## Development

```bash
pnpm test         # vitest, one shot
pnpm test:watch   # vitest watch
pnpm typecheck    # tsc --noEmit
pnpm dev          # tsx watch with .env autoload
pnpm start        # production-ish single shot
```

Test layout mirrors source (`*.test.ts` next to the file). All step runners and routes have unit coverage;
the SSE route test exercises the full event sequence with fake runners.

## Operating philosophy

See [`CLAUDE.md`](./CLAUDE.md) for the full agent-facing config. The short version:

1. **Align before you code** — `/grill` for non-trivial requests.
2. **Spec → Build → Review** — one skill per lifecycle phase, see `.claude/skills/`.
3. **Maintainability first** — code should be readable by a developer who lands on this repo cold. Prefer
   editing existing files; surface assumptions; sanitize at every trust boundary.

<a id="limits"></a>

## Limits (intentional, MVP scope)

- No DAG, no branching, no parallel steps. Linear only.
- No retry, no resume, no checkpointing.
- No auth — bind to localhost only.
- Run logs are not rotated or pruned — clean `runs/` manually if it grows.
