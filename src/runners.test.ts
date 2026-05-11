import { describe, it, expect, vi } from "vitest";
import { createDefaultRunners } from "./runners";
import type { LlmClient } from "./steps/llm";

describe("createDefaultRunners", () => {
  it("returns an object exposing async llm and shell runners", () => {
    const runners = createDefaultRunners();
    expect(typeof runners.llm).toBe("function");
    expect(typeof runners.shell).toBe("function");
  });

  it("composes the shell runner so it actually executes a command", async () => {
    const runners = createDefaultRunners();
    const out = await runners.shell(
      { type: "shell", command: "echo composed" },
      { prev: "" },
    );
    expect(out.trim()).toBe("composed");
  });

  it("composes the llm runner so it forwards to the injected LlmClient", async () => {
    const create = vi.fn(async () => ({
      content: [{ type: "text", text: "from-mock" }],
    }));
    const client = { messages: { create } } as unknown as LlmClient;

    const runners = createDefaultRunners(client);
    const out = await runners.llm(
      { type: "llm", prompt: "hello" },
      { prev: "" },
    );

    expect(out).toBe("from-mock");
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: "user", content: "hello" }],
      }),
    );
  });
});
