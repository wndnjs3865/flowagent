import type { StepRunners } from "./runner";
import { runLlmStep, type LlmClient } from "./steps/llm";
import { runShellStep } from "./steps/shell";

export function createDefaultRunners(llmClient?: LlmClient): StepRunners {
  return {
    llm: (step, ctx) => runLlmStep(step, ctx, llmClient),
    shell: (step, ctx) => runShellStep(step, ctx),
  };
}
