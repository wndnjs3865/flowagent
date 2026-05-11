import { describe, it, expect } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { listWorkflows } from "./workflows-dir";

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), "flowagent-wfdir-"));
}

describe("listWorkflows", () => {
  it("lists .yaml files with names stripped of extension and sorted", () => {
    const dir = makeTempDir();
    try {
      writeFileSync(join(dir, "bravo.yaml"), "name: bravo\nsteps: []\n");
      writeFileSync(join(dir, "alpha.yaml"), "name: alpha\nsteps: []\n");
      writeFileSync(join(dir, "charlie.yaml"), "name: charlie\nsteps: []\n");

      const list = listWorkflows(dir);

      expect(list.map((w) => w.name)).toEqual(["alpha", "bravo", "charlie"]);
      expect(list[0]?.path).toBe(join(dir, "alpha.yaml"));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("excludes files that are not .yaml", () => {
    const dir = makeTempDir();
    try {
      writeFileSync(join(dir, "keep.yaml"), "");
      writeFileSync(join(dir, "skip.txt"), "");
      writeFileSync(join(dir, "skip.json"), "");
      writeFileSync(join(dir, "skip.yml"), "");

      const names = listWorkflows(dir).map((w) => w.name);

      expect(names).toEqual(["keep"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("returns an empty array when the directory does not exist", () => {
    expect(listWorkflows("/tmp/flowagent-does-not-exist-xyz-123")).toEqual([]);
  });

  it("returns an empty array when the directory is empty", () => {
    const dir = makeTempDir();
    try {
      expect(listWorkflows(dir)).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("extracts description, persona, stressRelieved, and stepCount from valid workflow YAML", () => {
    const dir = makeTempDir();
    try {
      const yaml = [
        "name: demo",
        "description: 한국어 문의 분류",
        "persona: CS팀 / 운영",
        "stressRelieved: 매일 답변 쓰는 피로",
        "steps:",
        "  - type: shell",
        "    command: echo ok",
        "  - type: llm",
        "    prompt: summarize",
        "  - type: shell",
        "    command: echo done",
      ].join("\n");
      writeFileSync(join(dir, "demo.yaml"), yaml);

      const [entry] = listWorkflows(dir);
      expect(entry).toMatchObject({
        name: "demo",
        description: "한국어 문의 분류",
        persona: "CS팀 / 운영",
        stressRelieved: "매일 답변 쓰는 피로",
        stepCount: 3,
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("still lists a workflow with only name/path when the YAML fails schema validation", () => {
    const dir = makeTempDir();
    try {
      // empty steps array fails WorkflowSchema (.min(1)) — should degrade, not throw
      writeFileSync(join(dir, "broken.yaml"), "name: broken\nsteps: []\n");

      const list = listWorkflows(dir);
      expect(list).toHaveLength(1);
      expect(list[0]?.name).toBe("broken");
      expect(list[0]?.description).toBeUndefined();
      expect(list[0]?.persona).toBeUndefined();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
