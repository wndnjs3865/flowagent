import type { RunCtx } from "../runner";
import type { LlmStep } from "../spec";

const DEFAULT_MODEL = "claude-sonnet-4-6";
const DEFAULT_MAX_TOKENS = 4096;

type ContentBlock = { type: string; text?: string };
type MessagesCreateParams = {
  model: string;
  max_tokens: number;
  messages: { role: "user"; content: string }[];
};
type MessagesResponse = { content: ContentBlock[] };

export interface LlmClient {
  messages: {
    create(params: MessagesCreateParams): Promise<MessagesResponse>;
  };
}

function applyContext(template: string, ctx: RunCtx): string {
  return template.replaceAll("{{prev}}", ctx.prev);
}

function extractText(response: MessagesResponse): string {
  return response.content
    .filter(
      (block): block is { type: "text"; text: string } =>
        block.type === "text" && typeof block.text === "string",
    )
    .map((block) => block.text)
    .join("");
}

async function getDefaultClient(): Promise<LlmClient> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "ANTHROPIC_API_KEY environment variable is not set; LLM step cannot run.",
    );
  }
  const mod = await import("@anthropic-ai/sdk");
  const Anthropic = mod.default;
  return new Anthropic({ apiKey: key }) as unknown as LlmClient;
}

export async function runLlmStep(
  step: LlmStep,
  ctx: RunCtx,
  client?: LlmClient,
): Promise<string> {
  const effectiveClient = client ?? (await getDefaultClient());
  const prompt = applyContext(step.prompt, ctx);
  const response = await effectiveClient.messages.create({
    model: step.model ?? DEFAULT_MODEL,
    max_tokens: DEFAULT_MAX_TOKENS,
    messages: [{ role: "user", content: prompt }],
  });
  return extractText(response);
}
