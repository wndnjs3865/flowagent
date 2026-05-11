import { describe, it, expect } from "vitest";
import { existsSync, unlinkSync } from "node:fs";
import { runShellStep } from "./shell";

// `runShellStep` now executes Node one-liners (`node -e "..."`) instead of
// shell built-ins so workflows work identically on PowerShell, cmd, Git Bash,
// sh, and bash. `{{prev}}` is replaced with `process.env.FLOWAGENT_PREV`,
// which Node reads at runtime — the surrounding shell never parses the LLM
// output, so backticks/$()/$VAR/semicolons inside it are inert.

describe("runShellStep", () => {
  it("runs a simple command and returns its stdout", async () => {
    const out = await runShellStep(
      { type: "shell", command: 'node -e "process.stdout.write(\'hello\')"' },
      { prev: "" },
    );
    expect(out).toBe("hello");
  });

  it("substitutes {{prev}} with ctx.prev before execution", async () => {
    const out = await runShellStep(
      { type: "shell", command: 'node -e "process.stdout.write({{prev}})"' },
      { prev: "world" },
    );
    expect(out).toBe("world");
  });

  it("replaces every occurrence of {{prev}} in the command", async () => {
    const out = await runShellStep(
      {
        type: "shell",
        command: 'node -e "process.stdout.write({{prev}} + \'-\' + {{prev}})"',
      },
      { prev: "x" },
    );
    expect(out).toBe("x-x");
  });

  it("leaves the command unchanged when {{prev}} is absent", async () => {
    const out = await runShellStep(
      { type: "shell", command: 'node -e "process.stdout.write(\'static\')"' },
      { prev: "should-not-appear" },
    );
    expect(out).toBe("static");
  });

  it("throws an error containing stderr when the command exits non-zero", async () => {
    await expect(
      runShellStep(
        {
          type: "shell",
          command:
            'node -e "process.stderr.write(\'nope\'); process.exit(3)"',
        },
        { prev: "" },
      ),
    ).rejects.toThrow(/nope/);
  });

  it("throws an error when the command cannot be found", async () => {
    await expect(
      runShellStep(
        { type: "shell", command: "definitely_not_a_real_command_xyz" },
        { prev: "" },
      ),
    ).rejects.toThrow();
  });
});

describe("runShellStep — prev injection safety", () => {
  // Because {{prev}} expands to `process.env.FLOWAGENT_PREV` (a JS expression
  // evaluated *inside* the Node child), the surrounding shell never tokenizes
  // the LLM output. Backticks/$()/$VAR/semicolons all become inert literals.

  it("treats backticks inside prev as literal characters (no command substitution)", async () => {
    const out = await runShellStep(
      { type: "shell", command: 'node -e "process.stdout.write({{prev}})"' },
      { prev: "alpha `whoami` omega" },
    );
    expect(out).toBe("alpha `whoami` omega");
  });

  it("treats $() inside prev as literal characters", async () => {
    const out = await runShellStep(
      { type: "shell", command: 'node -e "process.stdout.write({{prev}})"' },
      { prev: "value $(echo pwned)" },
    );
    expect(out).toBe("value $(echo pwned)");
  });

  it("does not expand $VAR sequences embedded in prev", async () => {
    const out = await runShellStep(
      { type: "shell", command: 'node -e "process.stdout.write({{prev}})"' },
      { prev: "home=$HOME" },
    );
    expect(out).toBe("home=$HOME");
  });

  it("does not execute commands chained via semicolons in prev", async () => {
    const marker = `/tmp/flowagent-injection-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.txt`;
    try {
      const out = await runShellStep(
        { type: "shell", command: 'node -e "process.stdout.write({{prev}})"' },
        { prev: `safe; touch ${marker}` },
      );
      expect(out).toBe(`safe; touch ${marker}`);
      expect(existsSync(marker)).toBe(false);
    } finally {
      if (existsSync(marker)) unlinkSync(marker);
    }
  });
});
