import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Legacy type — mirrored locally since DashboardRun was removed from
// dashboard.tsx in the Result domain uplift. This entire module is deleted
// in Task 9; do not add new callers.
type DashboardRun = {
  workflowName: string;
  runId: string;
  startedAt: string;
  lastOutput: string;
};

/**
 * Scan `runsDir` for `*.jsonl` files written by `runWorkflow`, extract the
 * `run-start` meta from the first line and the last `step-output` event, and
 * return one entry per run.
 *
 * Files without a `run-start` first line (the pre-2026-05-20 format) are
 * silently skipped — they predate this metadata convention and don't
 * carry the workflow name anywhere in the file.
 *
 * TODO (P1, post-Pilot): full-directory scan on every dashboard/share
 * request will not scale past a few thousand runs. Options when this hits:
 *   - sort by mtime and slice to top-N (e.g. 100)
 *   - in-memory cache invalidated by `runsDir` mtime
 *   - maintain a tiny `runs/latest.json` index updated by the run route
 * For the 3-Pilot launch target this O(n) cost is fine.
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

/**
 * Filter `runs` by `workflow` slug and return the latest one by `startedAt`.
 *
 * Comparison is lexicographic on the ISO-8601 startedAt string. This is
 * safe ONLY because `runner.ts` uses `new Date().toISOString()` which
 * produces a fixed-format UTC string with millisecond precision (e.g.
 * `2026-05-20T08:00:00.000Z`) — these compare correctly as strings.
 * If anyone ever switches `runner.ts` to emit a different ISO variant
 * (offset timezones, missing millis), this comparison silently picks
 * wrong; update this helper at the same time.
 *
 * Used by both the executive dashboard (one call per slot) and the
 * /share/new route (one call to find the latest run for a given slug).
 * Centralized here so the comparison invariant lives in one place.
 *
 * NOTE: For the 3-Pilot launch target this O(n) per-call cost is fine.
 * Past a few thousand runs, consider caching the result of `readRecentRuns`
 * or maintaining a `runs/latest.json` index (see TODO in `readRecentRuns`).
 */
export function pickLatestRun(
  runs: DashboardRun[],
  workflow: string,
): DashboardRun | undefined {
  let best: DashboardRun | undefined;
  for (const run of runs) {
    if (run.workflowName !== workflow) continue;
    if (!best || run.startedAt > best.startedAt) best = run;
  }
  return best;
}
