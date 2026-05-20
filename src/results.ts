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

type StepEndEvent = { kind: "step-end"; ok: boolean };

type DoneEvent = { kind: "done" };

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

function isStepEnd(value: unknown): value is StepEndEvent {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return v.kind === "step-end" && typeof v.ok === "boolean";
}

function isDone(value: unknown): value is DoneEvent {
  if (typeof value !== "object" || value === null) return false;
  return (value as Record<string, unknown>).kind === "done";
}

type ParsedJsonl = {
  start: RunStartEvent;
  lastOutput: string;
  hasFailedStep: boolean;
  hasDone: boolean;
};

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
