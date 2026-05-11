import { describe, it, expect } from "vitest";
import { existsSync, unlinkSync } from "node:fs";
import { runShellStep } from "./shell";

describe("runShellStep", () => {
  it("runs a simple command and returns its stdout", async () => {
    const out = await runShellStep(
      { type: "shell", command: "echo hello" },
      { prev: "" },
    );
    expect(out.trim()).toBe("hello");
  });

  it("substitutes {{prev}} with ctx.prev before execution", async () => {
    const out = await runShellStep(
      { type: "shell", command: "echo {{prev}}" },
      { prev: "world" },
    );
    expect(out.trim()).toBe("world");
  });

  it("replaces every occurrence of {{prev}} in the command", async () => {
    const out = await runShellStep(
      { type: "shell", command: "echo {{prev}}-{{prev}}" },
      { prev: "x" },
    );
    expect(out.trim()).toBe("x-x");
  });

  it("leaves the command unchanged when {{prev}} is absent", async () => {
    const out = await runShellStep(
      { type: "shell", command: "echo static" },
      { prev: "should-not-appear" },
    );
    expect(out.trim()).toBe("static");
  });

  it("throws an error containing stderr when the command exits non-zero", async () => {
    await expect(
      runShellStep(
        { type: "shell", command: "sh -c 'echo nope >&2; exit 3'" },
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
  it("treats backticks inside prev as literal characters (no command substitution)", async () => {
    const out = await runShellStep(
      { type: "shell", command: 'printf %s "{{prev}}"' },
      { prev: "alpha `whoami` omega" },
    );
    expect(out).toBe("alpha `whoami` omega");
  });

  it("treats $() inside prev as literal characters", async () => {
    const out = await runShellStep(
      { type: "shell", command: 'printf %s "{{prev}}"' },
      { prev: "value $(echo pwned)" },
    );
    expect(out).toBe("value $(echo pwned)");
  });

  it("does not expand $VAR sequences embedded in prev", async () => {
    const out = await runShellStep(
      { type: "shell", command: 'printf %s "{{prev}}"' },
      { prev: "home=$HOME" },
    );
    expect(out).toBe("home=$HOME");
  });

  it("does not execute commands chained via semicolons in prev, even when {{prev}} is unquoted", async () => {
    const marker = `/tmp/flowagent-injection-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.txt`;
    try {
      await runShellStep(
        { type: "shell", command: "echo {{prev}}" },
        { prev: `safe; touch ${marker}` },
      );
      expect(existsSync(marker)).toBe(false);
    } finally {
      if (existsSync(marker)) unlinkSync(marker);
    }
  });
});
