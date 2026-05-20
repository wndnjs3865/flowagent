# Spec — Local Workflow Runner (MVP)

> Status: **DRAFT — awaiting user approval before code.**
> Date: 2026-05-11

## Objective

Solo 개발자가 로컬에서 워크플로우를 YAML로 정의하고, 브라우저에서 "Run" 버튼을 눌러 단계별 LLM 호출
결과를 실시간으로 확인할 수 있다.

## User / caller

프로젝트 저자 본인(=solo). 인증·다중 사용자·외부 노출 없음. 브라우저에서 `localhost:3000` 접근.

## In scope

- 단일 YAML 파일로 정의된 Workflow 1개 로드 및 실행
- 선형(linear) Step 실행 — 각 Step은 (a) LLM 호출(`type: llm`) 또는 (b) 셸 명령(`type: shell`)
- Hono 기반 로컬 HTTP 서버 (단일 포트, 기본 3000)
- 단일 페이지 UI: Workflow 목록 → 상세 → Run → 스트리밍 로그
- 실행 로그를 `runs/<timestamp>.jsonl`에 step별 입출력으로 기록
- Step 간 컨텍스트 전달: 직전 Step 출력이 다음 Step의 `{{prev}}` 변수로 치환됨

## Out of scope (non-goals)

명시적으로 제외 — "비슷해서 끼워 넣고 싶어질" 후보들:

- 분기 / 병렬 / 조건 / 루프 Step
- DAG / 시각적 노드 에디터
- Workflow 편집 UI (YAML은 외부 에디터로 직접 수정)
- 인증 / 멀티 유저 / 권한
- 데이터베이스 (파일 기반만)
- 도구 호출(tool use) / MCP / 외부 API 통합
- OpenAI / 로컬 모델 / 멀티 LLM 라우팅
- Docker / CI / 배포 / 패키지 발행
- E2E 테스트 / Playwright
- 다국어 / i18n / 테마

## Structure

### Files added

```
package.json                          # deps: hono, @anthropic-ai/sdk, yaml, zod, tsx, vitest
tsconfig.json                         # strict, ESM, JSX = hono/jsx
.env.example                          # ANTHROPIC_API_KEY=
.gitignore                            # node_modules, .env, runs/*.jsonl
README.md                             # quickstart only (4-6 lines)

src/main.ts                           # entry: load env, start server on :3000
src/server.ts                         # Hono 앱 구성, 라우트 마운트
src/spec.ts                           # zod Workflow schema + loadWorkflow(path)
src/runner.ts                         # runWorkflow(spec, onEvent) — 선형 실행 + 이벤트 발행
src/steps/llm.ts                      # runLlmStep(step, ctx) — Anthropic SDK 호출
src/steps/shell.ts                    # runShellStep(step, ctx) — execFile, stdout 캡처
src/routes/workflows.ts               # GET /, GET /workflows/:name, POST /workflows/:name/run (SSE)
src/views/layout.tsx                  # Hono JSX 레이아웃 (Tailwind CDN)
src/views/index.tsx                   # Workflow 목록
src/views/run.tsx                     # Run 페이지 (SSE 소비 클라이언트 스크립트 포함)

workflows/weekly-report.yaml     # 샘플: shell → LLM → shell → LLM (4 step)
runs/.gitkeep

src/spec.test.ts                      # zod 거절 케이스 + happy parse
src/runner.test.ts                    # 모의 LLM/shell로 happy path + 에러 전파
```

### Key signatures

```ts
// src/spec.ts
export const WorkflowSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  steps: z.array(StepSchema).min(1),
});
export type Workflow = z.infer<typeof WorkflowSchema>;
export function loadWorkflow(filePath: string): Workflow;

// src/runner.ts
export type RunEvent =
  | { kind: "step-start"; index: number; step: Step }
  | { kind: "step-output"; index: number; output: string }
  | { kind: "step-end"; index: number; ok: boolean; error?: string }
  | { kind: "done"; runId: string };
export function runWorkflow(
  spec: Workflow,
  onEvent: (e: RunEvent) => void,
): Promise<{ runId: string; ok: boolean }>;

// src/steps/llm.ts
export function runLlmStep(step: LlmStep, ctx: RunCtx): Promise<string>;

// src/steps/shell.ts
export function runShellStep(step: ShellStep, ctx: RunCtx): Promise<string>;
```

### Routes

| Method | Path | Returns |
|---|---|---|
| GET | `/` | HTML: Workflow 목록 |
| GET | `/workflows/:name` | HTML: 상세 + Run 버튼 |
| POST | `/workflows/:name/run` | `text/event-stream` (SSE: `RunEvent` JSON 라인) |

## Verification

- [ ] `pnpm install && pnpm dev` 실행 시 `http://localhost:3000` 에서 workflow 목록 페이지 렌더링
- [ ] `workflows/weekly-report.yaml` 상세 페이지에서 "Run" 클릭 시 각 step 결과가 SSE로 스트리밍되며 화면에 누적 표시
- [ ] 실행 완료 후 `runs/<ts>.jsonl`에 step별 입출력 1라인씩 기록 (line-delimited JSON)
- [ ] `pnpm test` — `runner.test.ts` + `spec.test.ts` 통과 (모의 LLM 사용, 실제 Anthropic 호출 없음)
- [ ] 잘못된 YAML(예: 필수 필드 누락)이면 UI에 zod 에러 메시지가 표시되고 서버는 죽지 않음
- [ ] `ANTHROPIC_API_KEY` 미설정 시 LLM step만 명시적 에러로 실패, shell step은 정상 동작

## Open questions / Assumptions to confirm

다음 가정 7개에 모두 동의하면 코드 작성 진입. 하나라도 No면 그 항목만 답해 주세요.

- **A1 (stack)**: **Node.js + TypeScript + Hono + Anthropic SDK + Vitest**. Python(FastAPI)가 더 편하면 알려주세요.
- **A2 (LLM 백엔드)**: **Anthropic Claude API**, 기본 모델 `claude-sonnet-4-6`. `ANTHROPIC_API_KEY` env 사용. OpenAI/로컬 모델 미포함.
- **A3 (workflow 포맷)**: **YAML**, step 배열. `{ type: "llm" | "shell", ... }`. JSON/TOML/DSL 아님.
- **A4 (UI)**: **Hono JSX 서버사이드 렌더 + Tailwind CDN + SSE**. React/Vite/번들러 없음.
- **A5 (패키지 매니저)**: **pnpm**. npm/yarn/bun 선호 시 알려주세요.
- **A6 (테스트 범위)**: **Vitest 단위 테스트만**. e2e/Playwright는 out-of-scope.
- **A7 (Step 간 데이터 전달)**: **직전 Step 출력만 `{{prev}}`로 치환**. 명시적 변수 바인딩(`${steps.step1.output}`)은 v2 이후.

## 승인 시 다음 작업

1. `/build` (test-driven-development) 진입
2. 첫 슬라이스: `src/spec.ts` + `src/spec.test.ts` (zod 스키마부터, red-green)
3. 둘째 슬라이스: `src/runner.ts` + `src/runner.test.ts` (모의 step으로 실행 순서·이벤트 검증)
4. 셋째 슬라이스: `src/steps/shell.ts` (LLM보다 결정적이라 먼저)
5. 넷째 슬라이스: `src/steps/llm.ts` (Anthropic SDK 래퍼, 모의 SDK로 테스트)
6. 다섯째 슬라이스: 라우트 + JSX 뷰 + SSE
