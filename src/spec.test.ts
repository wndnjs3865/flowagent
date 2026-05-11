import { describe, it, expect } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WorkflowSchema, loadWorkflow } from "./spec";

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), "flowagent-spec-"));
}

describe("WorkflowSchema", () => {
  it("parses a minimal workflow with a single LLM step", () => {
    const parsed = WorkflowSchema.parse({
      name: "hello",
      steps: [{ type: "llm", prompt: "Say hi" }],
    });

    expect(parsed.name).toBe("hello");
    expect(parsed.description).toBeUndefined();
    expect(parsed.steps).toHaveLength(1);
    expect(parsed.steps[0]).toMatchObject({ type: "llm", prompt: "Say hi" });
  });

  it("parses a workflow with mixed llm and shell steps", () => {
    const parsed = WorkflowSchema.parse({
      name: "mixed",
      description: "demo",
      steps: [
        { type: "llm", prompt: "draft a list" },
        { type: "shell", command: "echo done" },
      ],
    });

    expect(parsed.description).toBe("demo");
    expect(parsed.steps).toHaveLength(2);
    expect(parsed.steps[0]?.type).toBe("llm");
    expect(parsed.steps[1]?.type).toBe("shell");
  });

  it("preserves optional step name and model fields when given", () => {
    const parsed = WorkflowSchema.parse({
      name: "with-options",
      steps: [
        { type: "llm", name: "draft", prompt: "x", model: "claude-sonnet-4-6" },
      ],
    });

    const step = parsed.steps[0];
    expect(step?.type).toBe("llm");
    if (step?.type === "llm") {
      expect(step.name).toBe("draft");
      expect(step.model).toBe("claude-sonnet-4-6");
    }
  });

  it("rejects an empty steps array", () => {
    expect(() =>
      WorkflowSchema.parse({ name: "empty", steps: [] }),
    ).toThrow();
  });

  it("rejects a workflow missing the name field", () => {
    expect(() =>
      WorkflowSchema.parse({ steps: [{ type: "llm", prompt: "x" }] }),
    ).toThrow();
  });

  it("rejects a step with an unknown type", () => {
    expect(() =>
      WorkflowSchema.parse({
        name: "bad",
        steps: [{ type: "http", url: "https://example.com" }],
      }),
    ).toThrow();
  });

  it("rejects an llm step missing prompt", () => {
    expect(() =>
      WorkflowSchema.parse({
        name: "bad-llm",
        steps: [{ type: "llm" }],
      }),
    ).toThrow();
  });

  it("rejects a shell step missing command", () => {
    expect(() =>
      WorkflowSchema.parse({
        name: "bad-shell",
        steps: [{ type: "shell" }],
      }),
    ).toThrow();
  });
});

describe("loadWorkflow", () => {
  it("reads, parses, and validates a valid YAML file", () => {
    const dir = makeTempDir();
    try {
      const yamlPath = join(dir, "hello.yaml");
      writeFileSync(
        yamlPath,
        [
          "name: hello",
          "description: a demo",
          "steps:",
          "  - type: llm",
          "    prompt: Say hi",
          "  - type: shell",
          "    command: echo done",
          "",
        ].join("\n"),
      );

      const wf = loadWorkflow(yamlPath);

      expect(wf.name).toBe("hello");
      expect(wf.description).toBe("a demo");
      expect(wf.steps).toHaveLength(2);
      expect(wf.steps[0]?.type).toBe("llm");
      expect(wf.steps[1]?.type).toBe("shell");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("throws an error mentioning the file path when the file does not exist", () => {
    const dir = makeTempDir();
    try {
      const missing = join(dir, "no-such-file.yaml");
      expect(() => loadWorkflow(missing)).toThrow(/no-such-file\.yaml/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("throws an error mentioning the file path when YAML syntax is broken", () => {
    const dir = makeTempDir();
    try {
      const yamlPath = join(dir, "bad-syntax.yaml");
      writeFileSync(yamlPath, 'name: "unclosed string\nsteps: []\n');
      expect(() => loadWorkflow(yamlPath)).toThrow(/bad-syntax\.yaml/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("throws when YAML is valid but fails schema validation", () => {
    const dir = makeTempDir();
    try {
      const yamlPath = join(dir, "empty-steps.yaml");
      writeFileSync(yamlPath, "name: empty\nsteps: []\n");
      expect(() => loadWorkflow(yamlPath)).toThrow(/empty-steps\.yaml/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
