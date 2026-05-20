# Result 도메인 격상 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** "Run" 개념이 `runner.ts`/`runs/*.jsonl`/`views/dashboard.tsx`/`views/share.tsx` 4군데에 흩어져 있는 문제를 해결. 도메인 용어 "결과(Result)" 를 `src/results.ts` 단일 모듈로 격상하고, reader가 뷰에서 타입을 역방향 import하는 seam violation 제거. `routes/workflows.ts` 의 동일 디렉터리 중복 스캔도 자연스럽게 해소.

**Architecture:** TDD red-green-refactor로 새 모듈 `src/results.ts` 를 먼저 키운 뒤, 호출 측(라우트·뷰)을 한 번에 갈아끼우고 옛 모듈 삭제. 새 모듈은 jsonl 파일 포맷 invariant(첫 줄 = run-start, ISO 시간 lexicographic 정렬, 실패/in-flight 필터)를 캡슐화해 호출자가 알 필요 없게 만든다. **한 PR로 묶되 task 단위 commit으로 리뷰 가능하게 분해.**

**Tech Stack:** TypeScript, Node.js stdlib (`node:fs`), Vitest, Hono.

**관련 문서:**
- `CONTEXT.md` — "결과(Result)" 도메인 용어 정의 (이 리팩터의 첫 항목)
- ADR-0001 — CONTEXT.md 채택 결정
- MEMORY.md `feedback_src_changes_workflow.md` — src/ 변경 시 writing-plans + code-review 필수 규칙

---

## File Structure

**Create:**
- `src/results.ts` — `Result` 타입 + `getLatest(dir, workflow)` + `getById(dir, runId)` (+ 내부 헬퍼). jsonl 포맷 invariant 모두 캡슐화.
- `src/results.test.ts` — Vitest 테스트. 기존 `runs-reader.test.ts` 케이스 + 새 invariant 테스트(실패/in-flight 거르기).

**Modify:**
- `src/views/dashboard.tsx` — `DashboardRun` 타입 삭제. 내부에서 `DASHBOARD_SLUGS` 상수 export. prop을 `runsBySlug: Record<string, Result | null>` 로 변경. `pickLatestRun` 호출 삭제 (이미 라우트가 슬롯별로 미리 해결).
- `src/views/share.tsx` — `ShareRun` 타입 삭제. prop을 `run: Result, expiresAt: number, shareUrl: string` 로 분리.
- `src/routes/workflows.ts` — `runs-reader` import 제거, `results` import 추가. `/executive` 핸들러는 슬롯별 `getLatest` 4회 호출로 `runsBySlug` 빌드. `/share/new` 는 `getLatest`, `/share/:token` 은 `getById`.
- `src/routes/workflows.test.ts` — 라우트 동작 변화 없음. 테스트 본문 그대로 통과해야 함 (DOM 출력은 동일). 변경 발생 시 import 정리만.

**Delete:**
- `src/runs-reader.ts`
- `src/runs-reader.test.ts`

**범위 밖 (별도 PR로 미룸):**
- `runner.ts` 의 `RunResult` → `RunOutcome` 리네임 — 도메인 `Result` 와 영어 이름 충돌. 같은 PR에 묶으면 변경 범위 커짐. 다른 PR.
- `ResultDetail`(step별 출력 포함) 타입 — grilling에서 "둘 다 제공" 합의했지만 **현재 caller가 없음 = YAGNI**. 첫 caller(예: 결과 상세 페이지) 등장 시 추가. CONTEXT.md에 "deferred" 표기.

---

## Task 0: 사전 검증 + 브랜치 준비

**Files:** (검증만, 수정 없음)

- [ ] **Step 1: 현재 main에서 테스트 통과 확인**

Run:
```bash
pnpm test
```
Expected: 모든 테스트 PASS. 만약 실패하면 이 plan 시작 전에 원인 파악.

- [ ] **Step 2: 새 브랜치 생성**

Run:
```bash
git checkout -b feat/result-domain
```
Expected: `Switched to a new branch 'feat/result-domain'`.

- [ ] **Step 3: 영향 받는 파일에 outstanding change 없음 확인**

Run:
```bash
git status
```
Expected: `working tree clean` (CONTEXT.md 는 이미 직전 turn 에서 main에 commit 되어 있을 것 — main 기준으로 깨끗).

만약 CONTEXT.md 가 아직 staged 안 되어 있다면 별도 commit으로 먼저 main에 올린 뒤 이 브랜치를 끊는다.

---

## Task 1: `results.ts` 스켈레톤 + `Result` 타입

**Files:**
- Create: `src/results.ts`
- Test: `src/results.test.ts`

- [ ] **Step 1: 첫 실패 테스트 작성**

`src/results.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getLatest } from "./results";

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), "flowagent-results-"));
}

describe("getLatest", () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("returns null when runsDir does not exist", () => {
    rmSync(dir, { recursive: true, force: true });
    expect(getLatest(dir, "sales-summary")).toBeNull();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run:
```bash
pnpm test -- src/results.test.ts
```
Expected: FAIL with "Cannot find module './results'" or 비슷한 import 오류.

- [ ] **Step 3: 최소 구현 — 타입 + stub**

`src/results.ts`:
```typescript
export type Result = {
  workflowName: string;
  runId: string;
  /** ISO-8601 UTC string. Lexicographically comparable. */
  startedAt: string;
  lastOutput: string;
};

export function getLatest(_runsDir: string, _workflow: string): Result | null {
  return null;
}
```

- [ ] **Step 4: 테스트 재실행 — 통과 확인**

Run:
```bash
pnpm test -- src/results.test.ts
```
Expected: PASS — 1 test, "returns null when runsDir does not exist".

- [ ] **Step 5: Commit**

```bash
git add src/results.ts src/results.test.ts
git commit -m "feat(results): skeleton module + Result type"
```

---

## Task 2: `getLatest` happy path — 워크플로별 최신 run 찾기

**Files:**
- Modify: `src/results.ts`
- Test: `src/results.test.ts`

- [ ] **Step 1: 실패 테스트 추가**

`src/results.test.ts` 의 `describe("getLatest", () => { ... })` 블록 안에 추가:
```typescript
function writeJsonl(dir: string, file: string, events: object[]) {
  const lines = events.map((e) => JSON.stringify(e)).join("\n") + "\n";
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("node:fs").writeFileSync(join(dir, file), lines);
}

it("returns the latest completed run for the given workflow", () => {
  writeJsonl(dir, "older.jsonl", [
    {
      kind: "run-start",
      workflowName: "sales-summary",
      runId: "sales-summary-2026-05-19T08-00-00-000Z-a",
      startedAt: "2026-05-19T08:00:00.000Z",
    },
    { kind: "step-output", index: 0, output: "OLD" },
    { kind: "step-end", index: 0, ok: true },
    { kind: "done", runId: "sales-summary-2026-05-19T08-00-00-000Z-a" },
  ]);
  writeJsonl(dir, "newer.jsonl", [
    {
      kind: "run-start",
      workflowName: "sales-summary",
      runId: "sales-summary-2026-05-20T08-00-00-000Z-b",
      startedAt: "2026-05-20T08:00:00.000Z",
    },
    { kind: "step-output", index: 0, output: "NEW" },
    { kind: "step-end", index: 0, ok: true },
    { kind: "done", runId: "sales-summary-2026-05-20T08-00-00-000Z-b" },
  ]);

  const result = getLatest(dir, "sales-summary");
  expect(result).toEqual({
    workflowName: "sales-summary",
    runId: "sales-summary-2026-05-20T08-00-00-000Z-b",
    startedAt: "2026-05-20T08:00:00.000Z",
    lastOutput: "NEW",
  });
});

it("ignores runs from other workflows", () => {
  writeJsonl(dir, "other.jsonl", [
    {
      kind: "run-start",
      workflowName: "weekly-report",
      runId: "weekly-report-2026-05-20T09-00-00-000Z-c",
      startedAt: "2026-05-20T09:00:00.000Z",
    },
    { kind: "step-output", index: 0, output: "OTHER" },
    { kind: "step-end", index: 0, ok: true },
    { kind: "done", runId: "weekly-report-2026-05-20T09-00-00-000Z-c" },
  ]);

  expect(getLatest(dir, "sales-summary")).toBeNull();
});
```

또 `writeJsonl` 헬퍼는 require 대신 정식 import로 위쪽에 옮기는 게 깔끔. 파일 상단의 import 라인을 다음으로 교체:
```typescript
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
```

`writeJsonl` 본문도 정리:
```typescript
function writeJsonl(dir: string, file: string, events: object[]): void {
  writeFileSync(join(dir, file), events.map((e) => JSON.stringify(e)).join("\n") + "\n");
}
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run:
```bash
pnpm test -- src/results.test.ts
```
Expected: FAIL — 새 2개 케이스가 expected vs `null` 불일치로 실패.

- [ ] **Step 3: 구현 — 스캔 + 필터 + lexicographic max**

`src/results.ts` 의 `getLatest` 를 다음으로 교체:
```typescript
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type Result = {
  workflowName: string;
  runId: string;
  /** ISO-8601 UTC string. Lexicographically comparable across runs because
   * runner.ts emits new Date().toISOString() with millisecond precision. */
  startedAt: string;
  lastOutput: string;
};

type RunStartEvent = {
  kind: "run-start";
  workflowName: string;
  runId: string;
  startedAt: string;
};

type StepOutputEvent = { kind: "step-output"; output: string };

function isRunStart(value: unknown): value is RunStartEvent {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.kind === "run-start" &&
    typeof v.workflowName === "string" &&
    typeof v.runId === "string" &&
    typeof v.startedAt === "string"
  );
}

function isStepOutput(value: unknown): value is StepOutputEvent {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return v.kind === "step-output" && typeof v.output === "string";
}

type ParsedJsonl = {
  start: RunStartEvent;
  lastOutput: string;
};

/**
 * Parse one jsonl file into a Result-ready shape. Returns null if the file
 * doesn't have a run-start as its first line (pre-2026-05-20 format) or
 * is otherwise malformed.
 *
 * Does NOT enforce the "completed + successful" filter — callers do that.
 */
function parseJsonl(filePath: string): ParsedJsonl | null {
  let content: string;
  try {
    content = readFileSync(filePath, "utf8");
  } catch {
    return null;
  }

  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return null;

  let firstEvent: unknown;
  try {
    firstEvent = JSON.parse(lines[0] as string);
  } catch {
    return null;
  }
  if (!isRunStart(firstEvent)) return null;

  let lastOutput = "";
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const event = JSON.parse(lines[i] as string);
      if (isStepOutput(event)) {
        lastOutput = event.output;
        break;
      }
    } catch {
      // Skip malformed lines but keep scanning earlier ones.
    }
  }

  return { start: firstEvent, lastOutput };
}

function listJsonlFiles(runsDir: string): string[] {
  try {
    return readdirSync(runsDir).filter((f) => f.endsWith(".jsonl"));
  } catch {
    return [];
  }
}

export function getLatest(runsDir: string, workflow: string): Result | null {
  let best: Result | null = null;
  for (const file of listJsonlFiles(runsDir)) {
    const parsed = parseJsonl(join(runsDir, file));
    if (!parsed) continue;
    if (parsed.start.workflowName !== workflow) continue;
    const candidate: Result = {
      workflowName: parsed.start.workflowName,
      runId: parsed.start.runId,
      startedAt: parsed.start.startedAt,
      lastOutput: parsed.lastOutput,
    };
    if (!best || candidate.startedAt > best.startedAt) {
      best = candidate;
    }
  }
  return best;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run:
```bash
pnpm test -- src/results.test.ts
```
Expected: PASS — 3 tests (empty dir, latest match, other workflow ignored).

- [ ] **Step 5: Commit**

```bash
git add src/results.ts src/results.test.ts
git commit -m "feat(results): getLatest with lexicographic startedAt sort"
```

---

## Task 3: `getLatest` 실패한 run 거르기

**Files:**
- Modify: `src/results.ts`
- Test: `src/results.test.ts`

- [ ] **Step 1: 실패 테스트 추가**

`src/results.test.ts` 안에:
```typescript
it("excludes runs that have a failed step (step-end ok:false)", () => {
  writeJsonl(dir, "failed.jsonl", [
    {
      kind: "run-start",
      workflowName: "sales-summary",
      runId: "sales-summary-2026-05-20T08-00-00-000Z-fail",
      startedAt: "2026-05-20T08:00:00.000Z",
    },
    { kind: "step-output", index: 0, output: "first ok" },
    { kind: "step-end", index: 0, ok: true },
    { kind: "step-end", index: 1, ok: false, error: "boom" },
    { kind: "done", runId: "sales-summary-2026-05-20T08-00-00-000Z-fail" },
  ]);

  expect(getLatest(dir, "sales-summary")).toBeNull();
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run:
```bash
pnpm test -- src/results.test.ts
```
Expected: FAIL — failed run이 그대로 반환됨.

- [ ] **Step 3: 구현 — step-end ok:false 검사 추가**

`src/results.ts` 의 `parseJsonl` 시그니처 + 본문 수정:
```typescript
type ParsedJsonl = {
  start: RunStartEvent;
  lastOutput: string;
  hasFailedStep: boolean;
  hasDone: boolean;
};

type StepEndEvent = { kind: "step-end"; ok: boolean };
type DoneEvent = { kind: "done" };

function isStepEnd(value: unknown): value is StepEndEvent {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return v.kind === "step-end" && typeof v.ok === "boolean";
}

function isDone(value: unknown): value is DoneEvent {
  if (typeof value !== "object" || value === null) return false;
  return (value as Record<string, unknown>).kind === "done";
}

function parseJsonl(filePath: string): ParsedJsonl | null {
  let content: string;
  try {
    content = readFileSync(filePath, "utf8");
  } catch {
    return null;
  }

  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return null;

  let firstEvent: unknown;
  try {
    firstEvent = JSON.parse(lines[0] as string);
  } catch {
    return null;
  }
  if (!isRunStart(firstEvent)) return null;

  let lastOutput = "";
  let lastOutputFound = false;
  let hasFailedStep = false;
  let hasDone = false;
  for (let i = 0; i < lines.length; i++) {
    let event: unknown;
    try {
      event = JSON.parse(lines[i] as string);
    } catch {
      continue;
    }
    if (isStepEnd(event) && !event.ok) hasFailedStep = true;
    if (isDone(event)) hasDone = true;
  }
  // Scan backward separately to find the latest step-output.
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lastOutputFound) break;
    try {
      const event = JSON.parse(lines[i] as string);
      if (isStepOutput(event)) {
        lastOutput = event.output;
        lastOutputFound = true;
      }
    } catch {
      // Skip malformed lines but keep scanning earlier ones.
    }
  }

  return { start: firstEvent, lastOutput, hasFailedStep, hasDone };
}
```

그리고 `getLatest` 의 candidate 후보 조건에 필터 추가:
```typescript
export function getLatest(runsDir: string, workflow: string): Result | null {
  let best: Result | null = null;
  for (const file of listJsonlFiles(runsDir)) {
    const parsed = parseJsonl(join(runsDir, file));
    if (!parsed) continue;
    if (parsed.start.workflowName !== workflow) continue;
    if (parsed.hasFailedStep) continue;
    if (!parsed.hasDone) continue;
    const candidate: Result = {
      workflowName: parsed.start.workflowName,
      runId: parsed.start.runId,
      startedAt: parsed.start.startedAt,
      lastOutput: parsed.lastOutput,
    };
    if (!best || candidate.startedAt > best.startedAt) {
      best = candidate;
    }
  }
  return best;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run:
```bash
pnpm test -- src/results.test.ts
```
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/results.ts src/results.test.ts
git commit -m "feat(results): exclude runs with failed steps"
```

---

## Task 4: `getLatest` in-flight run 거르기

**Files:**
- Modify: `src/results.test.ts`

- [ ] **Step 1: 실패 테스트 추가**

이미 `parseJsonl` 이 `hasDone` 을 추적하고 `getLatest` 가 `!parsed.hasDone` 시 skip하도록 Task 3에서 추가됨. 이번 task는 그 동작을 **명시적으로 테스트로 잠그는 것**.

`src/results.test.ts` 안에:
```typescript
it("excludes runs that have not completed (no done event)", () => {
  writeJsonl(dir, "in-flight.jsonl", [
    {
      kind: "run-start",
      workflowName: "sales-summary",
      runId: "sales-summary-2026-05-20T08-00-00-000Z-flying",
      startedAt: "2026-05-20T08:00:00.000Z",
    },
    { kind: "step-output", index: 0, output: "still running" },
    // No step-end, no done — run is in-flight.
  ]);

  expect(getLatest(dir, "sales-summary")).toBeNull();
});
```

- [ ] **Step 2: 테스트 실행 — 통과 확인**

Run:
```bash
pnpm test -- src/results.test.ts
```
Expected: PASS — Task 3의 구현이 이미 이 케이스를 커버. 5 tests.

> 만약 FAIL이면 Task 3 구현에서 `!parsed.hasDone` 가드가 누락된 것 — 추가 후 다시 실행.

- [ ] **Step 3: Commit**

```bash
git add src/results.test.ts
git commit -m "test(results): lock in-flight-run exclusion"
```

---

## Task 5: `getById` 추가

**Files:**
- Modify: `src/results.ts`
- Test: `src/results.test.ts`

- [ ] **Step 1: 실패 테스트 추가**

`src/results.test.ts` 안에 새 `describe` 블록:
```typescript
describe("getById", () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("returns the run with the matching runId", () => {
    writeJsonl(dir, "a.jsonl", [
      {
        kind: "run-start",
        workflowName: "sales-summary",
        runId: "sales-summary-A",
        startedAt: "2026-05-20T08:00:00.000Z",
      },
      { kind: "step-output", index: 0, output: "OUTPUT-A" },
      { kind: "step-end", index: 0, ok: true },
      { kind: "done", runId: "sales-summary-A" },
    ]);
    writeJsonl(dir, "b.jsonl", [
      {
        kind: "run-start",
        workflowName: "sales-summary",
        runId: "sales-summary-B",
        startedAt: "2026-05-20T09:00:00.000Z",
      },
      { kind: "step-output", index: 0, output: "OUTPUT-B" },
      { kind: "step-end", index: 0, ok: true },
      { kind: "done", runId: "sales-summary-B" },
    ]);

    const result = getById(dir, "sales-summary-A");
    expect(result?.runId).toBe("sales-summary-A");
    expect(result?.lastOutput).toBe("OUTPUT-A");
  });

  it("returns null when no jsonl has the runId", () => {
    expect(getById(dir, "nonexistent")).toBeNull();
  });

  it("returns null for a runId whose run failed", () => {
    writeJsonl(dir, "failed.jsonl", [
      {
        kind: "run-start",
        workflowName: "sales-summary",
        runId: "sales-summary-X",
        startedAt: "2026-05-20T08:00:00.000Z",
      },
      { kind: "step-end", index: 0, ok: false, error: "boom" },
      { kind: "done", runId: "sales-summary-X" },
    ]);

    expect(getById(dir, "sales-summary-X")).toBeNull();
  });
});
```

또 파일 상단의 import에 `getById` 추가:
```typescript
import { getById, getLatest } from "./results";
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run:
```bash
pnpm test -- src/results.test.ts
```
Expected: FAIL — "getById is not exported" 또는 비슷.

- [ ] **Step 3: 구현**

`src/results.ts` 끝에 추가:
```typescript
export function getById(runsDir: string, runId: string): Result | null {
  for (const file of listJsonlFiles(runsDir)) {
    const parsed = parseJsonl(join(runsDir, file));
    if (!parsed) continue;
    if (parsed.start.runId !== runId) continue;
    if (parsed.hasFailedStep) return null;
    if (!parsed.hasDone) return null;
    return {
      workflowName: parsed.start.workflowName,
      runId: parsed.start.runId,
      startedAt: parsed.start.startedAt,
      lastOutput: parsed.lastOutput,
    };
  }
  return null;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run:
```bash
pnpm test -- src/results.test.ts
```
Expected: PASS — 8 tests total (`getLatest` 5 + `getById` 3).

- [ ] **Step 5: Commit**

```bash
git add src/results.ts src/results.test.ts
git commit -m "feat(results): getById with same completion/success filter"
```

---

## Task 6: 기존 `runs-reader` 의 추가 invariant 테스트 포팅

기존 `runs-reader.test.ts` 의 케이스 중 새 모듈에서 아직 커버 안 된 것:
- 잘못된 첫 줄 json (malformed first line) → skip
- step-output 없을 때 lastOutput = ""
- multi step-output 중 마지막 것 선택
- 중간 라인이 망가져도 그 전 step-output 살림

이미 `parseJsonl` 구현이 이 동작을 다 갖고 있지만, 명시적 테스트로 잠근다.

**Files:**
- Modify: `src/results.test.ts`

- [ ] **Step 1: 테스트 4개 추가**

`describe("getLatest", ...)` 블록 안에:
```typescript
it("skips jsonl files with malformed first line", () => {
  writeFileSync(join(dir, "bad.jsonl"), "not valid json\n");
  expect(getLatest(dir, "sales-summary")).toBeNull();
});

it("returns a result with empty lastOutput when no step-output emitted", () => {
  writeJsonl(dir, "no-output.jsonl", [
    {
      kind: "run-start",
      workflowName: "weekly-report",
      runId: "weekly-report-empty",
      startedAt: "2026-05-20T10:00:00.000Z",
    },
    { kind: "step-end", index: 0, ok: true },
    { kind: "done", runId: "weekly-report-empty" },
  ]);

  const result = getLatest(dir, "weekly-report");
  expect(result?.lastOutput).toBe("");
});

it("picks the last step-output when a run has multiple step outputs", () => {
  writeJsonl(dir, "multi.jsonl", [
    {
      kind: "run-start",
      workflowName: "sales-summary",
      runId: "sales-summary-multi",
      startedAt: "2026-05-20T11:00:00.000Z",
    },
    { kind: "step-output", index: 0, output: "FIRST" },
    { kind: "step-end", index: 0, ok: true },
    { kind: "step-output", index: 1, output: "MIDDLE" },
    { kind: "step-end", index: 1, ok: true },
    { kind: "step-output", index: 2, output: "LAST" },
    { kind: "step-end", index: 2, ok: true },
    { kind: "done", runId: "sales-summary-multi" },
  ]);

  expect(getLatest(dir, "sales-summary")?.lastOutput).toBe("LAST");
});

it("ignores malformed lines in the middle but keeps the most recent valid step-output", () => {
  const validRunStart = JSON.stringify({
    kind: "run-start",
    workflowName: "inquiry-triage",
    runId: "inquiry-triage-partial",
    startedAt: "2026-05-20T12:00:00.000Z",
  });
  const validEarlyOutput = JSON.stringify({
    kind: "step-output",
    index: 0,
    output: "VALID OUTPUT",
  });
  const validEnd = JSON.stringify({
    kind: "step-end",
    index: 0,
    ok: true,
  });
  const corrupted = "{ not valid";
  const validDone = JSON.stringify({
    kind: "done",
    runId: "inquiry-triage-partial",
  });
  writeFileSync(
    join(dir, "partial.jsonl"),
    [validRunStart, validEarlyOutput, validEnd, corrupted, validDone].join("\n") + "\n",
  );

  expect(getLatest(dir, "inquiry-triage")?.lastOutput).toBe("VALID OUTPUT");
});
```

- [ ] **Step 2: 테스트 실행**

Run:
```bash
pnpm test -- src/results.test.ts
```
Expected: PASS — 12 tests total.

- [ ] **Step 3: Commit**

```bash
git add src/results.test.ts
git commit -m "test(results): port malformed-jsonl + lastOutput edge cases"
```

---

## Task 7: 대시보드 뷰 → `Result` + 슬롯 맵 prop

**Files:**
- Modify: `src/views/dashboard.tsx`
- Modify: `src/routes/workflows.ts`

- [ ] **Step 1: 대시보드 뷰 수정 — `Result` import + `DASHBOARD_SLUGS` export**

`src/views/dashboard.tsx` 상단의 import + 타입 정의를 다음으로 교체:
```typescript
import type { Result } from "../results";
import { Layout } from "./layout";

// Curated dashboard cards — only the 4 workflows a Korean SMB CEO would
// realistically want as a single-screen daily summary. B-persona workflows
// (quote-email, sales-followup, sns-replies) are NOT on this dashboard —
// they target solo freelancers, not D persona.
type DashboardSlot = {
  slug: string;
  icon: string;
  label: string;
  context: string;
};

const DASHBOARD_SLOTS: DashboardSlot[] = [
  {
    slug: "sales-summary",
    icon: "📊",
    label: "매출",
    context: "월간 매출 → 임원 3-문장 요약",
  },
  {
    slug: "approval-triage",
    icon: "✅",
    label: "결재",
    context: "결재함 → 오늘 처리할 brief",
  },
  {
    slug: "inquiry-triage",
    icon: "💬",
    label: "문의",
    context: "오늘 접수 → 분류 + 답변 초안",
  },
  {
    slug: "weekly-report",
    icon: "📝",
    label: "주간 보고",
    context: "한 주 진행 → Slack 공유 메시지",
  },
];

/** Slugs the executive dashboard cares about. Exported so the route can
 * resolve a `Result | null` per slot via `getLatest(dir, slug)`. */
export const DASHBOARD_SLUGS = DASHBOARD_SLOTS.map((s) => s.slug);
```

- [ ] **Step 2: prop 시그니처 변경 + pickLatestRun 제거**

`ExecutiveDashboardPage` 함수 시그니처를:
```typescript
export function ExecutiveDashboardPage(props: {
  /** Resolved `Result | null` keyed by workflow slug. Route builds this
   * via `getLatest(runsDir, slug)` for each DASHBOARD_SLUGS entry. */
  runsBySlug: Record<string, Result | null>;
  shareEnabled?: boolean;
  generatedAt?: Date;
}) {
```

그리고 `DASHBOARD_SLOTS.map((slot) => { ... })` 내부의:
```typescript
const run = pickLatestRun(props.runs, slot.slug);
```
를 다음으로 교체:
```typescript
const run = props.runsBySlug[slot.slug] ?? null;
```

기존 코멘트 (`// Latest-run-per-slot is computed via the shared pickLatestRun...`) 도 삭제 (이제 해당 안 됨).

`DashboardRun` 타입 정의(`export type DashboardRun = {...}`)와 `import { pickLatestRun } from "../runs-reader";` 도 삭제.

- [ ] **Step 3: 라우트 수정 — `/executive` 핸들러를 새 API 로**

`src/routes/workflows.ts` import 블록에서:
```typescript
import { pickLatestRun, readRecentRuns } from "../runs-reader";
```
삭제. 다음 두 import 추가:
```typescript
import { getById, getLatest } from "../results";
import { DASHBOARD_SLUGS } from "../views/dashboard";
```

`/executive` 핸들러 본문 교체:
```typescript
app.get("/executive", (c) => {
  const runsBySlug: Record<string, ReturnType<typeof getLatest>> = {};
  for (const slug of DASHBOARD_SLUGS) {
    runsBySlug[slug] = getLatest(deps.runsDir, slug);
  }
  return c.html(
    ExecutiveDashboardPage({
      runsBySlug,
      shareEnabled: Boolean(deps.shareSecret),
    }),
  );
});
```

- [ ] **Step 4: 라우트 + 뷰 모두 typecheck 통과 확인**

Run:
```bash
pnpm typecheck
```
Expected: 0 errors. (`/share/*` 핸들러들은 아직 옛 readRecentRuns/pickLatestRun을 안 쓰니까 — 잠깐, 그 핸들러들은 아직 옛 API를 import 안 한 상태로 두면 컴파일 안 됨. Task 8에서 share 핸들러를 갈아끼울 때까지 잠깐 깨질 수 있음.)

> **주의**: 이 시점 typecheck/test는 `/share/*` 핸들러가 아직 옛 API를 참조하므로 실패할 수 있다. Task 8과 함께 묶어서 통과시키는 게 자연스럽다 — 그러나 Task 7만 commit한 상태에서는 빌드가 깨질 수 있으니, **이 task의 commit은 Task 8 끝나고 한 번에 해도 OK**. 또는 임시로 `/share/*` 가 아직 readRecentRuns를 쓰도록 두기 위해 import 라인을 분기적으로 정리한다.
>
> **권장 흐름**: Task 7+8을 하나의 sub-batch로 묶어 작업한 뒤 한 번에 typecheck+test+commit.

- [ ] **Step 5: 라우트 테스트 실행 — 기존 케이스 통과 확인 (Task 8 통과 후)**

Run:
```bash
pnpm test -- src/routes/workflows.test.ts
```
Expected: PASS — DOM 출력이 같으므로 모든 케이스 통과해야 함.

만약 FAIL이면 dashboard 뷰가 `runsBySlug` 를 빈 lookup으로 잘못 처리하고 있을 가능성. props 이름·shape 확인.

- [ ] **Step 6: Commit (Task 8과 합쳐서)**

(Task 8 끝에서 한 번에 commit)

---

## Task 8: 공유 뷰 + 공유 라우트 → `Result`

**Files:**
- Modify: `src/views/share.tsx`
- Modify: `src/routes/workflows.ts`

- [ ] **Step 1: share 뷰 수정 — `ShareRun` 삭제, prop 분리**

`src/views/share.tsx` 상단을 다음으로 교체:
```typescript
import type { Result } from "../results";
import { Layout } from "./layout";

const SLOT_META: Record<string, { icon: string; label: string }> = {
  "sales-summary": { icon: "📊", label: "매출 요약" },
  "approval-triage": { icon: "✅", label: "결재 분류" },
  "inquiry-triage": { icon: "💬", label: "문의 분류" },
  "weekly-report": { icon: "📝", label: "주간 보고" },
  "meeting-actions": { icon: "📋", label: "회의 액션" },
  "quote-email": { icon: "📨", label: "견적 메일" },
  "sales-followup": { icon: "🤝", label: "영업 후처리" },
  "sns-replies": { icon: "📱", label: "SNS 답글" },
};

function expiryLabel(expiresAt: number, now: number): string {
  const diffMs = expiresAt - now;
  if (diffMs <= 0) return "만료됨";
  const min = Math.ceil(diffMs / 60_000);
  if (min < 60) return `${min}분 후 만료`;
  const hr = Math.floor(min / 60);
  const remMin = min % 60;
  return remMin === 0 ? `${hr}시간 후 만료` : `${hr}시간 ${remMin}분 후 만료`;
}
```

기존 `export type ShareRun = {...}` 블록 삭제.

`ShareResultPage` 함수 시그니처:
```typescript
export function ShareResultPage(props: {
  run: Result;
  /** Epoch ms — UI shows "X분 후 만료" relative to current time. Comes from
   * the verified share token, not the Result itself. */
  expiresAt: number;
  /** Full token URL — shown in a copy box at the bottom. */
  shareUrl: string;
  generatedAt?: Date;
}) {
  const now = (props.generatedAt ?? new Date()).getTime();
  const meta = SLOT_META[props.run.workflowName] ?? {
    icon: "📄",
    label: props.run.workflowName,
  };
```

그리고 함수 안에서 만료 라벨 호출부:
```typescript
{expiryLabel(props.run.expiresAt, now)}
```
를:
```typescript
{expiryLabel(props.expiresAt, now)}
```
로 교체.

- [ ] **Step 2: 라우트 수정 — `/share/new` 핸들러**

`src/routes/workflows.ts` 의 `/share/new` 핸들러에서:
```typescript
const runs = readRecentRuns(deps.runsDir);
const latest = pickLatestRun(runs, workflow);
```
를 다음으로 교체:
```typescript
const latest = getLatest(deps.runsDir, workflow);
```

(이미 Task 7에서 `getLatest` import는 추가됨.)

- [ ] **Step 3: 라우트 수정 — `/share/:token` 핸들러**

`/share/:token` 핸들러에서:
```typescript
const runs = readRecentRuns(deps.runsDir);
const run = runs.find(
  (r) => r.runId === payload.runId && r.workflowName === payload.workflow,
);
```
를:
```typescript
const run = getById(deps.runsDir, payload.runId);
const matches = run && run.workflowName === payload.workflow;
if (!run || !matches) {
```
이런 식으로 변경. 그리고 `ShareRun` 객체 빌드 + `ShareResultPage({ run: shareRun, ... })` 호출을:
```typescript
const origin = resolvePublicOrigin(c, deps.publicOrigin);
const shareUrl = `${origin}/share/${token}`;
return c.html(
  ShareResultPage({
    run,
    expiresAt: payload.expiresAt,
    shareUrl,
  }),
);
```

`type ShareRun` import도 share.tsx 에서 사라졌으니 라우트 파일 상단 import 정리:
```typescript
import { ShareDisabledPage, ShareResultPage } from "../views/share";
```

전체 share/:token 핸들러 최종 모양:
```typescript
app.get("/share/:token", (c) => {
  if (!deps.shareSecret) {
    return c.html(ShareDisabledPage(), 503);
  }
  const token = c.req.param("token");
  const payload = verifyShareToken(token, deps.shareSecret);
  if (!payload) {
    return c.html(
      ErrorPage({
        status: 404,
        title: "공유 링크가 만료됐거나 잘못됐어요",
        detail: "본사 노트북에서 새 공유 링크를 만들어 받아주세요.",
      }),
      404,
    );
  }
  const run = getById(deps.runsDir, payload.runId);
  if (!run || run.workflowName !== payload.workflow) {
    return c.html(
      ErrorPage({
        status: 404,
        title: "공유 링크의 실행 결과를 찾을 수 없어요",
        detail: "실행 기록이 정리됐을 수 있습니다. 새 링크를 받아주세요.",
      }),
      404,
    );
  }
  const origin = resolvePublicOrigin(c, deps.publicOrigin);
  const shareUrl = `${origin}/share/${token}`;
  return c.html(
    ShareResultPage({
      run,
      expiresAt: payload.expiresAt,
      shareUrl,
    }),
  );
});
```

- [ ] **Step 4: typecheck + 전체 테스트 실행**

Run:
```bash
pnpm typecheck && pnpm test
```
Expected: 모든 테스트 PASS. 가장 우려되는 케이스: `routes/workflows.test.ts` 의 share/:token 테스트들 — `getById` 가 페이로드 workflowName mismatch 시 null을 반환하는 동작이 기존 `runs.find(... && ...)` 의 mismatch 시 undefined 와 동등해야 함.

특히 살펴볼 케이스:
- "GET /share/:token 으로 token whose run was deleted" — 파일이 삭제됐을 때 `getById` 가 null 반환 ✅
- "GET /share/:token returns 404 for an expired token" — 토큰 자체가 verifyShareToken에서 걸러져 `getById` 호출 안 됨 ✅
- "GET /share/:token verifies + renders the share page with the run output" — share 페이지 DOM에 `lastOutput` 이 나타나야 함

만약 share 페이지 DOM 비교 테스트가 깨지면, `expiryLabel(props.run.expiresAt)` 을 `expiryLabel(props.expiresAt)` 로 안 바꾼 실수 의심.

- [ ] **Step 5: Commit (Task 7 + 8 통합 commit)**

```bash
git add src/views/dashboard.tsx src/views/share.tsx src/routes/workflows.ts
git commit -m "refactor: thread Result through dashboard + share views, drop pickLatestRun"
```

---

## Task 9: 옛 `runs-reader` 모듈 + 테스트 삭제

**Files:**
- Delete: `src/runs-reader.ts`
- Delete: `src/runs-reader.test.ts`

- [ ] **Step 1: 잔존 import 확인**

Run:
```bash
git grep "runs-reader" -- src/
```
Expected: 매치 없음 (Task 7·8 끝나면 `routes/workflows.ts` 와 `views/dashboard.tsx` 둘 다 정리됨).

만약 매치 있으면 해당 파일 import 줄을 정리하고 다시 grep.

- [ ] **Step 2: 파일 삭제**

Run:
```bash
git rm src/runs-reader.ts src/runs-reader.test.ts
```
Expected: `rm 'src/runs-reader.ts'`, `rm 'src/runs-reader.test.ts'`.

- [ ] **Step 3: 전체 typecheck + 테스트**

Run:
```bash
pnpm typecheck && pnpm test
```
Expected: 모든 PASS. 새 `results.ts` 와 호출자만 살아있음.

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor: delete runs-reader, superseded by results module"
```

---

## Task 10: 매뉴얼 검증

**Files:** (검증만)

`pnpm dev` 를 띄워 실제 페이지가 잘 렌더되는지 본다. 새 모듈이 jsonl 포맷을 옛 reader와 동일하게 해석하는지를 사용자 눈으로 한 번 확인.

- [ ] **Step 1: dev 서버 시작**

Run (별도 터미널):
```bash
pnpm dev
```
Expected: `[flowagent] listening on http://localhost:<port>` 로그.

- [ ] **Step 2: 빈 runs/ 상태 대시보드 확인**

브라우저로 `http://localhost:<port>/executive` 열기. **Expected**: 4개 카드 모두 "최근 실행 없음 — ..." 빈 상태로 보임. 콘솔 에러 없음.

- [ ] **Step 3: 실행 페이지에서 workflow 1개 돌리기**

`http://localhost:<port>/workflows/sales-summary` 열고 [Run] 버튼 클릭. **Expected**: SSE 로그가 검정 박스에 흘러나오고, 끝나면 `runs/<runId>.jsonl` 파일이 생성됨.

> `sales-summary` workflow YAML이 LLM step을 포함하면 `.env` 의 `ANTHROPIC_API_KEY` 가 설정돼 있어야 한다. 없으면 shell step만 있는 워크플로(예: `weekly-report`)로 대체.

- [ ] **Step 4: 대시보드 새로고침 → 카드에 결과 노출 확인**

`/executive` 새로고침. **Expected**: 방금 실행한 워크플로 카드에 결과 미리보기·시각이 표시됨. 콘솔 에러 없음.

- [ ] **Step 5: 공유 링크 만들기**

`.env` 에 `FLOWAGENT_SHARE_SECRET=<32+ char string>` 설정 후 서버 재시작. `/executive` 카드의 "📱 공유" 버튼 클릭. **Expected**: `/share/<token>` 로 리다이렉트되고 결과 페이지가 렌더됨. 만료 라벨이 "1시간 후 만료" 비슷하게 보임.

- [ ] **Step 6: 실패한 run은 대시보드/공유에 안 보이는지 확인**

수동으로 `runs/` 에 가짜 실패 jsonl 작성:
```bash
cat > runs/fake-fail-2026-05-20T08-00-00-000Z-x.jsonl <<'EOF'
{"kind":"run-start","workflowName":"sales-summary","runId":"fake-fail-2026-05-20T08-00-00-000Z-x","startedAt":"2099-01-01T00:00:00.000Z"}
{"kind":"step-output","index":0,"output":"this is a failed-run preview, must NOT appear"}
{"kind":"step-end","index":0,"ok":false,"error":"intentional"}
{"kind":"done","runId":"fake-fail-2026-05-20T08-00-00-000Z-x"}
EOF
```
`/executive` 새로고침. **Expected**: `sales-summary` 카드에 "this is a failed-run preview" 가 **안 보임** (대신 이전 성공한 run 의 결과 또는 빈 상태). 확인 후 가짜 파일 삭제:
```bash
rm runs/fake-fail-2026-05-20T08-00-00-000Z-x.jsonl
```

- [ ] **Step 7: dev 서버 종료, PR 생성**

dev 서버 Ctrl+C. PR 생성:
```bash
git push -u origin feat/result-domain
gh pr create --title "Result 도메인 격상 — Run 개념 단일 모듈로 통합" --body "$(cat <<'EOF'
## Summary
- "Run" 개념이 4군데 흩어진 문제(runner.ts, jsonl 디스크, views/dashboard.tsx, views/share.tsx) 해결
- 새 `src/results.ts` 모듈로 도메인 용어 "결과(Result)" 격상 — CONTEXT.md 첫 항목
- `src/runs-reader.ts` 삭제 (reader가 view에서 타입 역방향 import 하던 seam violation 제거)
- `routes/workflows.ts` 의 동일 디렉터리 중복 스캔 해소
- **신규 invariant**: 실패한 run + in-flight run 은 결과로 노출되지 않음

## Test plan
- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm test` — 모든 테스트 PASS (results 신규 12케이스 + routes 기존 케이스)
- [ ] `/executive` 빈 상태 / 채워진 상태 / 공유 버튼 동작 매뉴얼 확인
- [ ] 실패한 run 가짜 jsonl이 대시보드에 안 나타나는지 확인

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 8: code-review skill 호출**

PR URL 받은 뒤, MEMORY.md 의 `feedback_src_changes_workflow.md` 규칙대로 `superpowers:requesting-code-review` skill 호출하여 리뷰 단계로 진행.

---

## Self-Review (writer 자체 점검)

이 plan을 spec과 대조해 점검한 결과:

**1. Spec coverage**
- ✅ 도메인 용어 "결과(Result)" 격상 — Task 1, CONTEXT.md (이미 작성됨)
- ✅ `Result` light projection — Task 1
- ⚠️ `ResultDetail` heavy projection — **deferred** (YAGNI: 현재 caller 없음). plan 상단 "범위 밖" 섹션에 명시.
- ✅ 실패/in-flight run 필터 — Task 3·4
- ✅ `getLatest`, `getById` — Task 2·5. `getDetail` 은 deferred.
- ✅ 옛 runs-reader.ts 삭제 — Task 9
- ✅ 뷰 prop 타입 교체 — Task 7·8
- ✅ 라우트 4 핸들러 새 API — Task 7·8
- ✅ 매뉴얼 검증 단계 — Task 10
- ✅ `runner.ts` `RunResult` 리네임은 별도 PR — plan 상단 "범위 밖" 명시

**2. Placeholder scan**
- TBD/TODO 없음
- "Add appropriate error handling" 류 없음
- 코드 단계마다 실제 코드 블록 포함
- 타입·메서드 시그니처 일관성 확인됨

**3. Type consistency**
- `Result` 타입 정의 (Task 1) 와 모든 사용처 (Task 7·8) 필드 이름 일치: `workflowName`, `runId`, `startedAt`, `lastOutput`
- `getLatest(runsDir, workflow)` 시그니처 Task 2·7·8 일관
- `getById(runsDir, runId)` 시그니처 Task 5·8 일관
- `parseJsonl` 반환 타입 `ParsedJsonl` Task 2→3 진화 (필드 추가 OK, 호출자는 안전)
- `DASHBOARD_SLUGS` Task 7 에서 export, Task 7 route에서 import — 일관

**4. ResultDetail deferral 명시 보강**

CONTEXT.md 의 "결과(Result)" 항목에 다음 줄 추가 권장 (Task 1 작업 중 함께):
> **deferred**: `ResultDetail`(step별 출력 포함) 은 첫 caller(예: 결과 상세 페이지) 등장 시 추가. 그 전엔 YAGNI.

이 한 줄은 Task 1 Step 1 직전에 CONTEXT.md 편집으로 처리해도 되고, 이 plan과 별개 commit으로 처리해도 OK.
