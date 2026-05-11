import { readdirSync } from "node:fs";
import { join } from "node:path";
import { loadWorkflow } from "./spec";

export type WorkflowEntry = {
  name: string;
  path: string;
  description?: string;
  persona?: string;
  stressRelieved?: string;
  stepCount?: number;
};

export function listWorkflows(dir: string): WorkflowEntry[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries
    // `_*.yaml` are private seed/template files (e.g. `_pilot-draft-template.yaml`)
    // intentionally excluded from listing AND routing so customers don't see unfinished placeholders.
    .filter((file) => file.endsWith(".yaml") && !file.startsWith("_"))
    .map((file) => {
      const path = join(dir, file);
      const name = file.slice(0, -".yaml".length);
      // Try to surface metadata for the listing page. If the file is unreadable
      // or fails schema validation, fall back to slug-only so listing stays usable.
      try {
        const wf = loadWorkflow(path);
        return {
          name,
          path,
          description: wf.description,
          persona: wf.persona,
          stressRelieved: wf.stressRelieved,
          stepCount: wf.steps.length,
        };
      } catch {
        return { name, path };
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
