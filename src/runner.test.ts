import { describe, it, expect, vi } from "vitest";
import { runWorkflow, type RunEvent, type StepRunners } from "./runner";
import type { Workflow } from "./spec";

function makeRunners(overrides?: Partial<StepRunners>): StepRunners {
  return {
    llm: vi.fn(async (step) => `llm:${step.prompt}`),
    shell: vi.fn(async (step) => `shell:${step.command}`),
    ...overrides,
  };
}

describe("runWorkflow", () => {
  it("runs a single LLM step and emits start → output → end → done in order", async () => {
    const wf: Workflow = {
      name: "single",
      steps: [{ type: "llm", prompt: "hi" }],
    };
    const events: RunEvent[] = [];

    const result = await runWorkflow(wf, (e) => {
        events.push(e);
      }, makeRunners());

    expect(result.ok).toBe(true);
    expect(result.runId.length).toBeGreaterThan(0);
    expect(events.map((e) => e.kind)).toEqual([
      "run-start",
      "step-start",
      "step-output",
      "step-end",
      "done",
    ]);
  });

  it("emits run-start as the first event with workflowName, runId, and ISO startedAt", async () => {
    const wf: Workflow = {
      name: "metadata-emitter",
      steps: [{ type: "llm", prompt: "x" }],
    };
    const events: RunEvent[] = [];

    const result = await runWorkflow(wf, (e) => {
      events.push(e);
    }, makeRunners());

    const first = events[0];
    expect(first?.kind).toBe("run-start");
    if (first?.kind === "run-start") {
      expect(first.workflowName).toBe("metadata-emitter");
      expect(first.runId).toBe(result.runId);
      // ISO timestamp shape — full precision (yyyy-mm-ddThh:mm:ss.sssZ)
      expect(first.startedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    }
  });

  it("runs multi-step workflow with ascending indices and terminates with done", async () => {
    const wf: Workflow = {
      name: "multi",
      steps: [
        { type: "llm", prompt: "first" },
        { type: "shell", command: "second" },
      ],
    };
    const events: RunEvent[] = [];

    await runWorkflow(wf, (e) => {
        events.push(e);
      }, makeRunners());

    const starts = events.filter((e) => e.kind === "step-start");
    expect(starts.map((e) => (e.kind === "step-start" ? e.index : -1))).toEqual(
      [0, 1],
    );
    expect(events.at(-1)?.kind).toBe("done");
  });

  it("passes previous step's output as ctx.prev to the next step's runner", async () => {
    const wf: Workflow = {
      name: "chain",
      steps: [
        { type: "llm", prompt: "first" },
        { type: "shell", command: "second" },
      ],
    };
    const llmSpy = vi.fn(async () => "from-llm");
    const shellSpy = vi.fn(async () => "from-shell");

    await runWorkflow(
      wf,
      () => {},
      { llm: llmSpy, shell: shellSpy },
    );

    expect(llmSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "llm" }),
      { prev: "" },
    );
    expect(shellSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "shell" }),
      { prev: "from-llm" },
    );
  });

  it("emits step-output event carrying the runner's return value", async () => {
    const wf: Workflow = {
      name: "out",
      steps: [{ type: "llm", prompt: "x" }],
    };
    const events: RunEvent[] = [];

    await runWorkflow(
      wf,
      (e) => {
        events.push(e);
      },
      makeRunners({ llm: vi.fn(async () => "the-output") }),
    );

    const output = events.find((e) => e.kind === "step-output");
    expect(output?.kind).toBe("step-output");
    if (output?.kind === "step-output") {
      expect(output.output).toBe("the-output");
    }
  });

  it("stops on step failure, emits step-end ok:false + error, and done ok:false", async () => {
    const wf: Workflow = {
      name: "fail",
      steps: [
        { type: "llm", prompt: "explodes" },
        { type: "shell", command: "must-not-run" },
      ],
    };
    const events: RunEvent[] = [];
    const shellSpy = vi.fn(async () => "shell-out");
    const runners: StepRunners = {
      llm: async () => {
        throw new Error("boom");
      },
      shell: shellSpy,
    };

    const result = await runWorkflow(wf, (e) => {
        events.push(e);
      }, runners);

    expect(result.ok).toBe(false);
    expect(shellSpy).not.toHaveBeenCalled();

    const ends = events.filter((e) => e.kind === "step-end");
    expect(ends).toHaveLength(1);
    if (ends[0]?.kind === "step-end") {
      expect(ends[0].ok).toBe(false);
      expect(ends[0].error).toContain("boom");
    }
    expect(events.at(-1)?.kind).toBe("done");
  });

  it("generates a runId that appears on the done event and matches the return value", async () => {
    const wf: Workflow = {
      name: "id",
      steps: [{ type: "llm", prompt: "x" }],
    };
    const events: RunEvent[] = [];

    const result = await runWorkflow(wf, (e) => {
        events.push(e);
      }, makeRunners());

    const done = events.find((e) => e.kind === "done");
    expect(done?.kind).toBe("done");
    if (done?.kind === "done") {
      expect(done.runId).toBe(result.runId);
    }
  });
});
