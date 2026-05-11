import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

const LlmStepSchema = z.object({
  type: z.literal("llm"),
  name: z.string().optional(),
  prompt: z.string(),
  model: z.string().optional(),
});

const ShellStepSchema = z.object({
  type: z.literal("shell"),
  name: z.string().optional(),
  command: z.string(),
});

export const StepSchema = z.discriminatedUnion("type", [
  LlmStepSchema,
  ShellStepSchema,
]);

export const WorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  persona: z.string().optional(),
  stressRelieved: z.string().optional(),
  steps: z.array(StepSchema).min(1),
});

export type LlmStep = z.infer<typeof LlmStepSchema>;
export type ShellStep = z.infer<typeof ShellStepSchema>;
export type Step = z.infer<typeof StepSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;

export function loadWorkflow(filePath: string): Workflow {
  let raw: string;
  try {
    raw = readFileSync(filePath, "utf8");
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read workflow file ${filePath}: ${detail}`);
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(raw);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse YAML in ${filePath}: ${detail}`);
  }

  const result = WorkflowSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `Invalid workflow schema in ${filePath}: ${result.error.message}`,
    );
  }
  return result.data;
}
