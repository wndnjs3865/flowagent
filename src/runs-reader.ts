import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { DashboardRun } from "./views/dashboard";

/**
 * Scan `runsDir` for `*.jsonl` files written by `runWorkflow`, extract the
 * `run-start` meta from the first line and the last `step-output` event, and
 * return one entry per run.
 *
 * Files without a `run-start` first line (the pre-2026-05-20 format) are
 * silently skipped — they predate this metadata convention and don't
 * carry the workflow name anywhere in the file.
 */
export function readRecentRuns(runsDir: string): DashboardRun[] {
  let files: string[];
  try {
    files = readdirSync(runsDir).filter((f) => f.endsWith(".jsonl"));
  } catch {
    return [];
  }

  const runs: DashboardRun[] = [];
  for (const file of files) {
    let content: string;
    try {
      content = readFileSync(join(runsDir, file), "utf8");
    } catch {
      continue;
    }

    const lines = content.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length === 0) continue;

    let firstEvent: unknown;
    try {
      firstEvent = JSON.parse(lines[0] as string);
    } catch {
      continue;
    }

    if (!isRunStartEvent(firstEvent)) continue;

    // Find the last step-output event — the workflow's final visible result.
    let lastOutput = "";
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const event = JSON.parse(lines[i] as string);
        if (isStepOutputEvent(event)) {
          lastOutput = event.output;
          break;
        }
      } catch {
        // Skip malformed lines but keep scanning earlier ones.
      }
    }

    runs.push({
      workflowName: firstEvent.workflowName,
      runId: firstEvent.runId,
      startedAt: firstEvent.startedAt,
      lastOutput,
    });
  }

  return runs;
}

type RunStartEvent = {
  kind: "run-start";
  workflowName: string;
  runId: string;
  startedAt: string;
};

function isRunStartEvent(value: unknown): value is RunStartEvent {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.kind === "run-start" &&
    typeof v.workflowName === "string" &&
    typeof v.runId === "string" &&
    typeof v.startedAt === "string"
  );
}

type StepOutputEvent = { kind: "step-output"; output: string };

function isStepOutputEvent(value: unknown): value is StepOutputEvent {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return v.kind === "step-output" && typeof v.output === "string";
}
