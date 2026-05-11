import { exec, type ExecException } from "node:child_process";
import { promisify } from "node:util";
import type { RunCtx } from "../runner";
import type { ShellStep } from "../spec";

const execAsync = promisify(exec);

// Previous step output is passed to the shell as an env var rather than
// spliced into the command string. This neutralizes backticks, $(), $VAR,
// and command chaining inside untrusted LLM output. Authors should wrap
// {{prev}} in double quotes inside their YAML (e.g. "{{prev}}") to also
// suppress word splitting and globbing.
const PREV_ENV_VAR = "FLOWAGENT_PREV";
const PREV_REFERENCE = `$${PREV_ENV_VAR}`;

function applyContext(template: string): string {
  return template.replaceAll("{{prev}}", PREV_REFERENCE);
}

type ExecError = ExecException & { stderr?: string; stdout?: string };

function isExecError(err: unknown): err is ExecError {
  return err instanceof Error && "stderr" in err;
}

export async function runShellStep(
  step: ShellStep,
  ctx: RunCtx,
): Promise<string> {
  const command = applyContext(step.command);
  try {
    const { stdout } = await execAsync(command, {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env, [PREV_ENV_VAR]: ctx.prev },
    });
    return stdout;
  } catch (err) {
    if (!isExecError(err)) throw err;
    const exitCode = typeof err.code === "number" ? err.code : "?";
    const stderr = (err.stderr ?? "").toString().trim();
    const detail = stderr ? `: ${stderr}` : "";
    throw new Error(`Shell step exited ${exitCode}${detail}`);
  }
}
