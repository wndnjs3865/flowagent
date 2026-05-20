import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getById, getLatest } from "./results";

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), "flowagent-results-"));
}

function writeJsonl(dir: string, file: string, events: object[]): void {
  writeFileSync(join(dir, file), events.map((e) => JSON.stringify(e)).join("\n") + "\n");
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
});

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
