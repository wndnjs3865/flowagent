import type { LlmStep, ShellStep, Step, Workflow } from "./spec";

export type RunCtx = {
  prev: string;
};

export type StepRunners = {
  llm: (step: LlmStep, ctx: RunCtx) => Promise<string>;
  shell: (step: ShellStep, ctx: RunCtx) => Promise<string>;
};

export type RunEvent =
  | { kind: "run-start"; workflowName: string; runId: string; startedAt: string }
  | { kind: "step-start"; index: number; step: Step }
  | { kind: "step-output"; index: number; output: string }
  | { kind: "step-end"; index: number; ok: boolean; error?: string }
  | { kind: "done"; runId: string };

export type RunResult = {
  runId: string;
  ok: boolean;
};

export function generateRunId(): string {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}`;
}

async function dispatchStep(
  step: Step,
  ctx: RunCtx,
  runners: StepRunners,
): Promise<string> {
  if (step.type === "llm") return runners.llm(step, ctx);
  if (step.type === "shell") return runners.shell(step, ctx);
  const exhaustive: never = step;
  throw new Error(`Unknown step type: ${JSON.stringify(exhaustive)}`);
}

export async function runWorkflow(
  spec: Workflow,
  onEvent: (event: RunEvent) => void | Promise<void>,
  runners: StepRunners,
  options: { runId?: string } = {},
): Promise<RunResult> {
  const runId = options.runId ?? generateRunId();
  let prev = "";
  let ok = true;

  // First event: write run metadata to the JSONL log so /executive dashboard
  // can map jsonl files → workflows without parsing step contents (which can
  // collide across workflows, e.g. meeting-actions + sales-followup both have
  // a "load-notes" first step).
  await onEvent({
    kind: "run-start",
    workflowName: spec.name,
    runId,
    startedAt: new Date().toISOString(),
  });

  for (const [index, step] of spec.steps.entries()) {
    await onEvent({ kind: "step-start", index, step });
    try {
      const output = await dispatchStep(step, { prev }, runners);
      await onEvent({ kind: "step-output", index, output });
      await onEvent({ kind: "step-end", index, ok: true });
      prev = output;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await onEvent({ kind: "step-end", index, ok: false, error: message });
      ok = false;
      break;
    }
  }

  await onEvent({ kind: "done", runId });
  return { runId, ok };
}
