import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readRecentRuns } from "./runs-reader";

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), "flowagent-runs-reader-"));
}

function writeJsonl(dir: string, file: string, events: object[]) {
  writeFileSync(
    join(dir, file),
    events.map((e) => JSON.stringify(e)).join("\n") + "\n",
  );
}

describe("readRecentRuns", () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("returns empty array when runsDir does not exist", () => {
    rmSync(dir, { recursive: true, force: true });
    expect(readRecentRuns(dir)).toEqual([]);
  });

  it("returns empty array when runsDir has no jsonl files", () => {
    writeFileSync(join(dir, "not-a-jsonl.txt"), "ignore me");
    expect(readRecentRuns(dir)).toEqual([]);
  });

  it("parses run-start meta + last step-output from a well-formed jsonl", () => {
    writeJsonl(dir, "run-a.jsonl", [
      {
        kind: "run-start",
        workflowName: "meeting-actions",
        runId: "meeting-actions-2026-05-20T09-00-00-000Z-x1",
        startedAt: "2026-05-20T09:00:00.000Z",
      },
      { kind: "step-start", index: 0, step: { type: "shell", command: "load" } },
      { kind: "step-output", index: 0, output: "raw meeting notes" },
      { kind: "step-end", index: 0, ok: true },
      { kind: "step-start", index: 1, step: { type: "llm", prompt: "extract" } },
      { kind: "step-output", index: 1, output: "이번 주 액션 5건" },
      { kind: "step-end", index: 1, ok: true },
      { kind: "done", runId: "meeting-actions-2026-05-20T09-00-00-000Z-x1" },
    ]);

    const runs = readRecentRuns(dir);
    expect(runs).toHaveLength(1);
    expect(runs[0]).toEqual({
      workflowName: "meeting-actions",
      runId: "meeting-actions-2026-05-20T09-00-00-000Z-x1",
      startedAt: "2026-05-20T09:00:00.000Z",
      lastOutput: "이번 주 액션 5건",
    });
  });

  it("skips jsonl files without a run-start first line (pre-meta format)", () => {
    writeJsonl(dir, "old-format.jsonl", [
      { kind: "step-start", index: 0, step: { type: "llm", prompt: "x" } },
      { kind: "step-output", index: 0, output: "stale" },
      { kind: "done", runId: "old" },
    ]);

    expect(readRecentRuns(dir)).toEqual([]);
  });

  it("skips jsonl with malformed first line", () => {
    writeFileSync(join(dir, "bad.jsonl"), "not valid json\n");
    expect(readRecentRuns(dir)).toEqual([]);
  });

  it("returns lastOutput=\"\" when there is no step-output event after run-start", () => {
    writeJsonl(dir, "no-output.jsonl", [
      {
        kind: "run-start",
        workflowName: "weekly-report",
        runId: "weekly-report-2026-05-20T10-00-00-000Z-y2",
        startedAt: "2026-05-20T10:00:00.000Z",
      },
      { kind: "done", runId: "weekly-report-2026-05-20T10-00-00-000Z-y2" },
    ]);

    const runs = readRecentRuns(dir);
    expect(runs).toHaveLength(1);
    expect(runs[0]?.lastOutput).toBe("");
  });

  it("picks the *last* step-output event when a run has multiple steps with output", () => {
    writeJsonl(dir, "multi-step.jsonl", [
      {
        kind: "run-start",
        workflowName: "sales-summary",
        runId: "sales-summary-2026-05-20T11-00-00-000Z-z3",
        startedAt: "2026-05-20T11:00:00.000Z",
      },
      { kind: "step-output", index: 0, output: "FIRST" },
      { kind: "step-output", index: 1, output: "MIDDLE" },
      { kind: "step-output", index: 2, output: "LAST" },
      { kind: "done", runId: "sales-summary-2026-05-20T11-00-00-000Z-z3" },
    ]);

    const runs = readRecentRuns(dir);
    expect(runs[0]?.lastOutput).toBe("LAST");
  });

  it("returns one entry per jsonl file when the dir contains multiple runs", () => {
    writeJsonl(dir, "run-1.jsonl", [
      {
        kind: "run-start",
        workflowName: "weekly-report",
        runId: "weekly-report-2026-05-19T08-00-00-000Z-a",
        startedAt: "2026-05-19T08:00:00.000Z",
      },
      { kind: "step-output", index: 0, output: "MON" },
    ]);
    writeJsonl(dir, "run-2.jsonl", [
      {
        kind: "run-start",
        workflowName: "weekly-report",
        runId: "weekly-report-2026-05-20T08-00-00-000Z-b",
        startedAt: "2026-05-20T08:00:00.000Z",
      },
      { kind: "step-output", index: 0, output: "TUE" },
    ]);

    const runs = readRecentRuns(dir);
    expect(runs).toHaveLength(2);
    const outputs = runs.map((r) => r.lastOutput).sort();
    expect(outputs).toEqual(["MON", "TUE"]);
  });

  it("ignores malformed step-output lines but keeps scanning earlier ones", () => {
    // Write each line manually so we can inject a broken JSON line in the middle.
    const validRunStart = JSON.stringify({
      kind: "run-start",
      workflowName: "inquiry-triage",
      runId: "inquiry-triage-2026-05-20T12-00-00-000Z-c",
      startedAt: "2026-05-20T12:00:00.000Z",
    });
    const earlyValid = JSON.stringify({
      kind: "step-output",
      index: 0,
      output: "VALID OUTPUT",
    });
    const corrupted = "{ not valid";
    writeFileSync(
      join(dir, "partial.jsonl"),
      [validRunStart, earlyValid, corrupted].join("\n") + "\n",
    );

    const runs = readRecentRuns(dir);
    expect(runs).toHaveLength(1);
    // Reader scans from the end backwards; corrupted line is skipped,
    // earlier valid step-output is picked.
    expect(runs[0]?.lastOutput).toBe("VALID OUTPUT");
  });
});
