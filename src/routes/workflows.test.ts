import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createWorkflowRoutes, type WorkflowRoutesDeps } from "./workflows";
import type { StepRunners } from "../runner";

function makeTempDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

function fakeRunners(): StepRunners {
  return {
    llm: vi.fn(async () => "llm-out"),
    shell: vi.fn(async () => "shell-out"),
  };
}

const SAMPLE_YAML =
  [
    "name: demo",
    "description: A demo workflow",
    "persona: CS팀",
    "stressRelieved: 매일 답변 쓰는 피로",
    "steps:",
    "  - type: llm",
    "    prompt: First",
    "  - type: shell",
    "    command: echo second",
  ].join("\n") + "\n";

describe("workflow routes", () => {
  let dir: string;
  let runsDir: string;

  beforeEach(() => {
    dir = makeTempDir("flowagent-routes-");
    runsDir = makeTempDir("flowagent-runs-");
    writeFileSync(join(dir, "demo.yaml"), SAMPLE_YAML);
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    rmSync(runsDir, { recursive: true, force: true });
  });

  function makeDeps(): WorkflowRoutesDeps {
    return { workflowsDir: dir, runsDir, runners: fakeRunners() };
  }

  it("GET / returns 200 HTML listing workflow names", async () => {
    const app = createWorkflowRoutes(makeDeps());

    const res = await app.request("/");

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/html/);
    const body = await res.text();
    expect(body).toContain("demo");
  });

  it("GET / renders persona, description, and stressRelieved for each workflow", async () => {
    const app = createWorkflowRoutes(makeDeps());

    const res = await app.request("/");
    const body = await res.text();

    expect(body).toContain("A demo workflow");
    expect(body).toContain("CS팀");
    expect(body).toContain("덜어주는 부담");
    expect(body).toContain("매일 답변 쓰는 피로");
  });

  it("GET / renders step count badge and the motto in the hero", async () => {
    const app = createWorkflowRoutes(makeDeps());

    const res = await app.request("/");
    const body = await res.text();

    // step count surfaced on the card (sample yaml has 2 steps)
    expect(body).toContain("2단계");
    // motto from project plan
    expect(body).toContain("지루한 반복 업무");
  });

  it("GET / renders the Pilot CTA banner with a mailto link built from the configured contact email", async () => {
    const deps = makeDeps();
    deps.pilotContactEmail = "pilot@example.com";
    const app = createWorkflowRoutes(deps);

    const res = await app.request("/");
    const body = await res.text();

    expect(body).toContain("Pilot 미팅 신청");
    expect(body).toContain("30분");
    // Server must construct the mailto URL with a Pilot-themed subject
    expect(body).toContain("mailto:pilot@example.com");
    expect(body).toMatch(/href="mailto:pilot@example\.com\?subject=/);
  });

  it("GET / renders persona filter chips and tags each card with its category", async () => {
    const app = createWorkflowRoutes(makeDeps());

    const res = await app.request("/");
    const body = await res.text();

    // Filter chip labels — short Korean category names
    expect(body).toContain("전체");
    expect(body).toContain("CS·운영");
    expect(body).toContain("영업·대표보고");
    expect(body).toContain("총무·결재");
    expect(body).toContain("매니저·리드");

    // Sample yaml persona = "CS팀" → category "cs"
    expect(body).toMatch(/data-persona-category="cs"/);
  });

  it("GET /workflows/:name returns 200 with workflow name and a Run button when the workflow exists", async () => {
    const app = createWorkflowRoutes(makeDeps());

    const res = await app.request("/workflows/demo");

    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("demo");
    expect(body).toContain("Run");
  });

  it("GET /workflows/:name returns 404 when the workflow does not exist", async () => {
    const app = createWorkflowRoutes(makeDeps());

    const res = await app.request("/workflows/nonexistent");
    expect(res.status).toBe(404);
  });

  it("GET /workflows/:name 404 renders an HTML error page with a back link to /", async () => {
    const app = createWorkflowRoutes(makeDeps());

    const res = await app.request("/workflows/nonexistent");
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toMatch(/text\/html/);
    const body = await res.text();
    expect(body).toContain("Workflow not found");
    expect(body).toContain("nonexistent");
    expect(body).toMatch(/href="\/"/);
  });

  it("GET /workflows/:name 500 renders an HTML error page when the YAML is invalid", async () => {
    writeFileSync(join(dir, "broken.yaml"), "name: broken\nsteps: not-a-list\n");
    const app = createWorkflowRoutes(makeDeps());

    const res = await app.request("/workflows/broken");
    expect(res.status).toBe(500);
    expect(res.headers.get("content-type")).toMatch(/text\/html/);
    const body = await res.text();
    expect(body).toContain("Workflow load error");
  });

  it("POST /workflows/:name/run returns 404 when the workflow does not exist", async () => {
    const app = createWorkflowRoutes(makeDeps());

    const res = await app.request("/workflows/nonexistent/run", {
      method: "POST",
    });
    expect(res.status).toBe(404);
  });

  it("POST /workflows/:name/run returns text/event-stream and emits step + done SSE events", async () => {
    const app = createWorkflowRoutes(makeDeps());

    const res = await app.request("/workflows/demo/run", { method: "POST" });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/event-stream/);
    const body = await res.text();
    expect(body).toContain('"kind":"step-start"');
    expect(body).toContain('"kind":"step-output"');
    expect(body).toContain('"kind":"step-end"');
    expect(body).toContain('"kind":"done"');
  });

  it("POST /workflows/:name/run appends every event to runs/<runId>.jsonl on disk", async () => {
    const app = createWorkflowRoutes(makeDeps());

    const res = await app.request("/workflows/demo/run", { method: "POST" });
    expect(res.status).toBe(200);
    await res.text(); // drain stream so all onEvent callbacks complete

    const files = readdirSync(runsDir).filter((f) => f.endsWith(".jsonl"));
    expect(files).toHaveLength(1);
    const [file] = files;
    if (!file) throw new Error("expected one jsonl file");

    const baseName = file.replace(/\.jsonl$/, "");
    const lines = readFileSync(join(runsDir, file), "utf8")
      .trim()
      .split("\n");
    const events = lines.map((l) => JSON.parse(l));

    // Sequence for 2-step workflow: run-start meta + (start-out-end × 2) + done = 8 events
    expect(events).toHaveLength(8);
    expect(events[0]).toMatchObject({
      kind: "run-start",
      workflowName: "demo",
    });
    expect(events[1]).toMatchObject({ kind: "step-start", index: 0 });
    expect(events[2]).toMatchObject({ kind: "step-output", index: 0 });
    expect(events[3]).toMatchObject({ kind: "step-end", index: 0, ok: true });
    expect(events[4]).toMatchObject({ kind: "step-start", index: 1 });
    expect(events[7]).toMatchObject({ kind: "done" });

    // file basename must equal the runId reported by the runner
    expect(events[7].runId).toBe(baseName);
    // run-start meta must also carry the same runId so dashboard scans match.
    expect(events[0].runId).toBe(baseName);
  });

  it("GET /executive renders empty-state cards when runs/ is empty", async () => {
    const app = createWorkflowRoutes(makeDeps());

    const res = await app.request("/executive");

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/html/);
    const body = await res.text();
    expect(body).toContain("사장 대시보드");
    // All 4 dashboard slots present
    expect(body).toContain("sales-summary");
    expect(body).toContain("approval-triage");
    expect(body).toContain("inquiry-triage");
    expect(body).toContain("weekly-report");
    // Empty state copy
    expect(body).toContain("최근 실행 없음");
    expect(body).toContain("지금 실행 →");
  });

  it("GET /executive shows the latest run output for each dashboard workflow", async () => {
    // Seed runs/ with a sales-summary jsonl that the dashboard should pick up.
    const runId = "sales-summary-2026-05-20T00-00-00-000Z-abc123";
    const lines = [
      JSON.stringify({
        kind: "run-start",
        workflowName: "sales-summary",
        runId,
        startedAt: "2026-05-20T00:00:00.000Z",
      }),
      JSON.stringify({ kind: "step-start", index: 0, step: { type: "shell", command: "load" } }),
      JSON.stringify({ kind: "step-output", index: 0, output: "raw csv" }),
      JSON.stringify({ kind: "step-end", index: 0, ok: true }),
      JSON.stringify({ kind: "step-start", index: 1, step: { type: "llm", prompt: "summarize" } }),
      JSON.stringify({
        kind: "step-output",
        index: 1,
        output: "전월 대비 매출 12% 감소했습니다.",
      }),
      JSON.stringify({ kind: "step-end", index: 1, ok: true }),
      JSON.stringify({ kind: "done", runId }),
    ];
    writeFileSync(join(runsDir, `${runId}.jsonl`), lines.join("\n") + "\n");

    const app = createWorkflowRoutes(makeDeps());
    const res = await app.request("/executive");
    const body = await res.text();

    expect(body).toContain("전월 대비 매출 12% 감소했습니다.");
    // Other 3 cards still show empty state
    expect(body).toContain("최근 실행 없음");
  });

  it("GET /executive picks the latest run per workflow when multiple runs exist for the same slug", async () => {
    function writeRun(runId: string, startedAt: string, output: string) {
      const lines = [
        JSON.stringify({
          kind: "run-start",
          workflowName: "approval-triage",
          runId,
          startedAt,
        }),
        JSON.stringify({ kind: "step-output", index: 0, output }),
        JSON.stringify({ kind: "done", runId }),
      ];
      writeFileSync(join(runsDir, `${runId}.jsonl`), lines.join("\n") + "\n");
    }
    writeRun(
      "approval-triage-2026-05-19T10-00-00-000Z-aaa",
      "2026-05-19T10:00:00.000Z",
      "OLDER OUTPUT",
    );
    writeRun(
      "approval-triage-2026-05-20T11-00-00-000Z-bbb",
      "2026-05-20T11:00:00.000Z",
      "LATEST OUTPUT",
    );

    const app = createWorkflowRoutes(makeDeps());
    const res = await app.request("/executive");
    const body = await res.text();

    expect(body).toContain("LATEST OUTPUT");
    expect(body).not.toContain("OLDER OUTPUT");
  });

  it("GET /executive ignores pre-meta-format jsonl files (no run-start first line)", async () => {
    // Old-format file — first line is a step-start, no run-start meta.
    const oldFormat = [
      JSON.stringify({ kind: "step-start", index: 0, step: { type: "llm", prompt: "x" } }),
      JSON.stringify({ kind: "step-output", index: 0, output: "DO NOT SHOW" }),
      JSON.stringify({ kind: "done", runId: "old-format" }),
    ];
    writeFileSync(join(runsDir, "old-format.jsonl"), oldFormat.join("\n") + "\n");

    const app = createWorkflowRoutes(makeDeps());
    const res = await app.request("/executive");
    const body = await res.text();

    expect(body).not.toContain("DO NOT SHOW");
    // Dashboard still loads cleanly with empty cards
    expect(body).toContain("최근 실행 없음");
  });

  it("GET /executive shows the 📱 공유 button on filled cards when shareSecret is set", async () => {
    const runId = "sales-summary-2026-05-20T00-00-00-000Z-share1";
    writeFileSync(
      join(runsDir, `${runId}.jsonl`),
      [
        JSON.stringify({
          kind: "run-start",
          workflowName: "sales-summary",
          runId,
          startedAt: "2026-05-20T00:00:00.000Z",
        }),
        JSON.stringify({ kind: "step-output", index: 0, output: "share-me" }),
      ].join("\n") + "\n",
    );
    const deps = makeDeps();
    deps.shareSecret = "test-secret-not-for-prod";
    const app = createWorkflowRoutes(deps);

    const res = await app.request("/executive");
    const body = await res.text();
    expect(body).toContain("📱 공유");
    expect(body).toContain("/share/new?workflow=sales-summary");
  });

  it("GET /executive hides the share button when shareSecret is missing", async () => {
    const runId = "sales-summary-2026-05-20T00-00-00-000Z-share2";
    writeFileSync(
      join(runsDir, `${runId}.jsonl`),
      [
        JSON.stringify({
          kind: "run-start",
          workflowName: "sales-summary",
          runId,
          startedAt: "2026-05-20T00:00:00.000Z",
        }),
        JSON.stringify({ kind: "step-output", index: 0, output: "share-me" }),
      ].join("\n") + "\n",
    );
    const app = createWorkflowRoutes(makeDeps());

    const res = await app.request("/executive");
    const body = await res.text();
    expect(body).not.toContain("📱 공유");
  });

  it("GET /share/new without shareSecret returns 503 with the disabled-page copy", async () => {
    const app = createWorkflowRoutes(makeDeps());
    const res = await app.request("/share/new?workflow=sales-summary");
    expect(res.status).toBe(503);
    const body = await res.text();
    expect(body).toContain("FLOWAGENT_SHARE_SECRET");
  });

  it("GET /share/new without workflow query returns 400 with a helpful detail", async () => {
    const deps = makeDeps();
    deps.shareSecret = "test-secret";
    const app = createWorkflowRoutes(deps);

    const res = await app.request("/share/new");
    expect(res.status).toBe(400);
    const body = await res.text();
    expect(body).toContain("workflow 누락");
  });

  it("GET /share/new for a workflow with no runs returns 404", async () => {
    const deps = makeDeps();
    deps.shareSecret = "test-secret";
    const app = createWorkflowRoutes(deps);

    const res = await app.request("/share/new?workflow=sales-summary");
    expect(res.status).toBe(404);
    const body = await res.text();
    expect(body).toContain("공유할 실행 결과 없음");
  });

  it("GET /share/new for a workflow with a run redirects to /share/<token>", async () => {
    const runId = "sales-summary-2026-05-20T00-00-00-000Z-new";
    writeFileSync(
      join(runsDir, `${runId}.jsonl`),
      [
        JSON.stringify({
          kind: "run-start",
          workflowName: "sales-summary",
          runId,
          startedAt: "2026-05-20T00:00:00.000Z",
        }),
        JSON.stringify({ kind: "step-output", index: 0, output: "shared" }),
      ].join("\n") + "\n",
    );
    const deps = makeDeps();
    deps.shareSecret = "test-secret";
    const app = createWorkflowRoutes(deps);

    const res = await app.request("/share/new?workflow=sales-summary");
    expect(res.status).toBe(302);
    const location = res.headers.get("location");
    expect(location).toBeTruthy();
    expect(location).toMatch(/^\/share\/v1\./);
  });

  it("GET /share/:token verifies + renders the share page with the run output", async () => {
    const runId = "weekly-report-2026-05-20T08-00-00-000Z-tok";
    writeFileSync(
      join(runsDir, `${runId}.jsonl`),
      [
        JSON.stringify({
          kind: "run-start",
          workflowName: "weekly-report",
          runId,
          startedAt: "2026-05-20T08:00:00.000Z",
        }),
        JSON.stringify({
          kind: "step-output",
          index: 0,
          output: "EXEC SHARE PAYLOAD",
        }),
      ].join("\n") + "\n",
    );
    const deps = makeDeps();
    deps.shareSecret = "test-secret";
    const app = createWorkflowRoutes(deps);

    // Generate a token by going through /share/new and following the redirect.
    const newRes = await app.request("/share/new?workflow=weekly-report");
    const location = newRes.headers.get("location");
    if (!location) throw new Error("expected /share/new to redirect");

    const tokenRes = await app.request(location);
    expect(tokenRes.status).toBe(200);
    const body = await tokenRes.text();
    expect(body).toContain("EXEC SHARE PAYLOAD");
    expect(body).toContain("주간 보고");
    expect(body).toContain("공유 URL");
  });

  it("GET /share/:token returns 404 for a tampered token", async () => {
    const deps = makeDeps();
    deps.shareSecret = "test-secret";
    const app = createWorkflowRoutes(deps);

    const res = await app.request("/share/v1.bogusbody.bogussig");
    expect(res.status).toBe(404);
    const body = await res.text();
    expect(body).toContain("만료됐거나 잘못됐어요");
  });

  it("GET /share/:token returns 503 when shareSecret is missing", async () => {
    const app = createWorkflowRoutes(makeDeps());
    const res = await app.request("/share/v1.something.something");
    expect(res.status).toBe(503);
  });
});
