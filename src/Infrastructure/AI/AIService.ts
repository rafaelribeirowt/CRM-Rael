import Anthropic from "@anthropic-ai/sdk";
import type { IAIService, ChatConfig } from "../../Application/Contracts/AI/IAIService";
import { env } from "../../Shared/Env";

const MODEL_MAP = {
  haiku: "claude-haiku-4-5-20241022",
  sonnet: "claude-sonnet-4-20250514",
} as const;

export class AIService implements IAIService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });
  }

  async chat(config: ChatConfig): Promise<string> {
    const model = MODEL_MAP[config.model ?? "haiku"];

    // Build messages array with history + new message
    const messages = [
      ...config.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: config.userMessage },
    ];

    const response = await this.client.messages.create({
      model,
      max_tokens: config.maxTokens ?? 512,
      system: config.systemPrompt,
      messages,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock?.type === "text" ? textBlock.text : "";
  }

  async transcribeAudio(_buffer: Buffer, _mimeType: string): Promise<string> {
    // Delegated to AudioTranscriber - this is a pass-through
    throw new Error("Use AudioTranscriber directly");
  }
}
