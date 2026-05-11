# flowagent

> 한 번 설정하면, 업무가 알아서 흐른다 — 반복 업무 스트레스를 줄이는 로컬 워크플로우 러너.

Local-first workflow runner. Define a linear sequence of LLM and shell **Steps** in YAML, hit Run in the
browser, watch results stream over SSE. Single-user, single-machine, no DAG, no queue.

Domain terms (`Workflow`, `Step`, `Run`, `Runner`, `Agent`) are defined in [`CONTEXT.md`](./CONTEXT.md). Use
them verbatim in code, commits, and PR titles.

## Quickstart

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
| `FLOWAGENT_PILOT_CONTACT_EMAIL` | Email used by the Listing page "Pilot 미팅 신청" CTA button. The server builds a `mailto:` link with a fixed Korean subject. Defaults to `hello@flowagent.ai`. |

## Demo path — first run in 5 minutes

The fastest path from clone to a result you can show a Pilot stakeholder. Total: 5 minutes including
prereqs, 3 minutes if Node/pnpm are already installed.

### Prereqs (2 minutes)

- Node.js 20.6 or newer (`node --version`) — needed for `tsx --env-file`.
- pnpm (`npm i -g pnpm` if missing).
- Anthropic API key from <https://console.anthropic.com/settings/keys>.

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
| **재무·총무·CFO** | `sales-summary` → `approval-triage` → `weekly-report-demo` | "월말 1-pager 자동화 + 결재 잔량 가시화 + 주간 보고 표준화" |
| **대표·실무 매니저** | `weekly-report-demo` → `meeting-actions` → `sales-summary` | "보고 자동화 3종 세트 — 주간/회의/월간" |
| **잡탕(혼합)** | 위 범용 스크립트 그대로 | 데이터 위치 + 5분 시작 + JSONL 감사 로그 |

### 장애 발생 시 30초 복구 (live 데모 도중)

| 증상 | 한 줄 복구 | 안 되면 |
|---|---|---|
| `step-end ... ok:false` 첫 LLM 단계 실패 | "API 키 한도 초과예요" → `weekly-report-demo` 대신 1단계만인 shell-only 사례로 우회 | `runs/*.jsonl` 미리 캡처해 둔 이전 성공 결과를 화면에 띄움 |
| 브라우저에 한국어 깨짐 | 새로고침 (Ctrl/Cmd+R) — Tailwind CDN 캐시 문제 90% | 다른 워크플로우로 즉시 전환, 깨짐은 미팅 후 처리 |
| SSE가 멈춤 (3초 이상 출력 없음) | "잠시 LLM 응답 대기 중입니다" 한 마디 + 우회로 다른 탭 열어 두 번째 워크플로우 Run | 첫 탭은 그대로 두고 두 번째 탭에서 진행 |
| 서버 자체 죽음 | 터미널 `pnpm dev` 재실행(2초) | "로컬 환경 변수가 꼬여서요" 솔직 + 캡처본으로 마무리 |

### After demo — 30분 안에 보내는 leave-behind

1. 이 README 링크 (`#demo-path-first-run-in-5-minutes`로 anchor)
2. `docs/sales/pilot-onepager.md`를 PDF로 변환해 첨부 — 한국어 폰트 포함: `pandoc docs/sales/pilot-onepager.md -o docs/sales/pilot-onepager.pdf --pdf-engine=weasyprint --metadata title="FlowAgent — Pilot 1-pager"` (사전 설치: `apt-get install -y pandoc weasyprint`)
3. 미팅 중 작성한 귀사 케이스 1건의 YAML 초안 (`workflows/<customer-slug>-draft.yaml` 형태로 첨부)
4. 다음 미팅 후보 일정 3개 (1주차 설치 미팅용)
5. 다음 outreach·설치 미팅 제안 이메일 — 템플릿 `docs/sales/pilot-outreach-email.md` 사용. `{{회사명}}/{{담당자명}}/{{후보1·2·3}}/{{발신자명}}` 자리표시자만 치환하고 PDF 첨부 후 발송. Follow-up·Warm intro·설치 미팅 3가지 변형이 같은 파일 하단에 있음.

## Bundled workflows

The `workflows/` directory ships five end-to-end demos covering the most common Korean SMB office
tasks. All use Korean fixtures under `workflows/fixtures/` and English LLM prompts that emit Korean
output (see [`feedback_demo_fixture_language`](./CLAUDE.md) rule for why).

| Workflow | What it does | Persona | 없애주는 반복 업무 스트레스 |
|---|---|---|---|
| `weekly-report-demo` | 3-bullet weekly status → Slack rewrite | 팀 리드 / 매니저 | 매주 같은 보고서를 처음부터 다시 쓰는 30분 |
| `meeting-actions` | 회의록 → 담당자별 액션 표 → Slack 보고 포맷 | 운영팀 / PM | 회의 끝나고 회의록 다시 읽으며 액션을 추리는 인지 부하 |
| `sales-summary` | 월간 매출 CSV → 채널·이상치 분석 → 경영진 3-문장 요약 | 영업관리 / 대표 보고 | 월말마다 이상치 찾고 1-pager 만드는 압박 |
| `inquiry-triage` | 고객 문의 CSV → 카테고리·긴급도 분류 + 카테고리별 답변 초안 | CS팀 / 운영 | 매일 같은 톤으로 답변 쓰고 우선순위 매기는 피로 |
| `approval-triage` | 결재 대기함 → 자동승인·검토·정보부족 분류 + 오늘의 brief | 총무 / 사무관리 | 결재함에 줄선 요청을 하나씩 읽고 판단하는 인지 부하 |

To adapt one for a real Pilot case, edit the file in `workflows/fixtures/` to the customer's own data —
the YAML prompts stay the same. The customer's data never leaves their machine.

## Writing a workflow

Drop a `<name>.yaml` file in `workflows/`. The filename (without extension) becomes the URL slug; the
`name:` field is the human-readable label shown in the UI. See
[`workflows/weekly-report-demo.yaml`](./workflows/weekly-report-demo.yaml) for a working 3-step demo.

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
      printf '=== Output ===\n%s\n' "{{prev}}"
  - type: llm
    prompt: |
      Translate to Korean:
      {{prev}}
```

### `{{prev}}` substitution rules

`{{prev}}` is replaced with the previous Step's output. Different rules per step type:

- **`llm` step** — `{{prev}}` is spliced into the prompt string verbatim. No escaping needed.
- **`shell` step** — `{{prev}}` is replaced with the env reference `$FLOWAGENT_PREV`, and the previous
  output is passed via the child process's environment instead of being spliced into the command. This
  neutralizes backticks, `$()`, `$VAR`, and command chaining inside untrusted LLM output. **Always wrap
  `{{prev}}` in double quotes** (`"{{prev}}"`) to also suppress word splitting and globbing:

  ```yaml
  command: printf '%s' "{{prev}}"   # safe
  command: echo {{prev}}            # works, but unquoted — avoid for multi-line prev
  ```

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

## Limits (intentional, MVP scope)

- No DAG, no branching, no parallel steps. Linear only.
- No retry, no resume, no checkpointing.
- No auth — bind to localhost only.
- Run logs are not rotated or pruned — clean `runs/` manually if it grows.
