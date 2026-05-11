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

    // Sequence for 2-step workflow: start-out-end × 2 + done = 7 events
    expect(events).toHaveLength(7);
    expect(events[0]).toMatchObject({ kind: "step-start", index: 0 });
    expect(events[1]).toMatchObject({ kind: "step-output", index: 0 });
    expect(events[2]).toMatchObject({ kind: "step-end", index: 0, ok: true });
    expect(events[3]).toMatchObject({ kind: "step-start", index: 1 });
    expect(events[6]).toMatchObject({ kind: "done" });

    // file basename must equal the runId reported by the runner
    expect(events[6].runId).toBe(baseName);
  });
});
