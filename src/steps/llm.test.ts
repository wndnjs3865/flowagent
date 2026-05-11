import { describe, it, expect, vi } from "vitest";
import { runLlmStep, type LlmClient } from "./llm";

function makeClient(text = "ok") {
  const create = vi.fn(async () => ({
    content: [{ type: "text", text }],
  }));
  const client = { messages: { create } } as unknown as LlmClient;
  return { client, create };
}

describe("runLlmStep", () => {
  it("calls client.messages.create with the prompt as a user message", async () => {
    const { client, create } = makeClient();

    await runLlmStep(
      { type: "llm", prompt: "Hello there" },
      { prev: "" },
      client,
    );

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: "user", content: "Hello there" }],
      }),
    );
  });

  it("substitutes {{prev}} in the prompt before sending", async () => {
    const { client, create } = makeClient();

    await runLlmStep(
      { type: "llm", prompt: "Summarize: {{prev}}" },
      { prev: "the quick brown fox" },
      client,
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          { role: "user", content: "Summarize: the quick brown fox" },
        ],
      }),
    );
  });

  it("uses the default model when step.model is undefined", async () => {
    const { client, create } = makeClient();

    await runLlmStep(
      { type: "llm", prompt: "x" },
      { prev: "" },
      client,
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ model: "claude-sonnet-4-6" }),
    );
  });

  it("uses step.model when provided", async () => {
    const { client, create } = makeClient();

    await runLlmStep(
      { type: "llm", prompt: "x", model: "claude-opus-4-7" },
      { prev: "" },
      client,
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ model: "claude-opus-4-7" }),
    );
  });

  it("returns the concatenated text from all text blocks in the response", async () => {
    const create = vi.fn(async () => ({
      content: [
        { type: "text", text: "hello " },
        { type: "text", text: "world" },
      ],
    }));
    const client = { messages: { create } } as unknown as LlmClient;

    const out = await runLlmStep(
      { type: "llm", prompt: "x" },
      { prev: "" },
      client,
    );

    expect(out).toBe("hello world");
  });

  it("ignores non-text content blocks when extracting the result", async () => {
    const create = vi.fn(async () => ({
      content: [
        { type: "text", text: "real" },
        { type: "tool_use", id: "x", name: "y", input: {} },
      ],
    }));
    const client = { messages: { create } } as unknown as LlmClient;

    const out = await runLlmStep(
      { type: "llm", prompt: "x" },
      { prev: "" },
      client,
    );

    expect(out).toBe("real");
  });

  it("throws an error mentioning ANTHROPIC_API_KEY when no client is injected and env is unset", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    try {
      await expect(
        runLlmStep({ type: "llm", prompt: "x" }, { prev: "" }),
      ).rejects.toThrow(/ANTHROPIC_API_KEY/);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
