import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getLatest } from "./results";

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), "flowagent-results-"));
}

describe("getLatest", () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("returns null when runsDir does not exist", () => {
    rmSync(dir, { recursive: true, force: true });
    expect(getLatest(dir, "sales-summary")).toBeNull();
  });
});
