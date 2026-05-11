import { exec, type ExecException } from "node:child_process";
import { promisify } from "node:util";
import type { RunCtx } from "../runner";
import type { ShellStep } from "../spec";

const execAsync = promisify(exec);

// Previous step output is passed via an environment variable, and `{{prev}}`
// is substituted with the JS expression that reads it inside a Node one-liner
// (`node -e "..."`). This makes commands cross-platform — PowerShell, cmd,
// Git Bash, sh, and bash all execute the same `node -e ...` invocation
// identically. It also neutralizes shell-injection vectors (backticks, $(),
// $VAR, semicolon chains) because the value is read by Node at runtime, not
// parsed by the surrounding shell.
const PREV_ENV_VAR = "FLOWAGENT_PREV";
const PREV_REFERENCE = `process.env.${PREV_ENV_VAR}`;

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
