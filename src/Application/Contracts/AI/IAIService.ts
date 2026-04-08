export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatConfig {
  systemPrompt: string;
  messages: ChatMessage[];
  userMessage: string;
  model?: "haiku" | "sonnet";
  maxTokens?: number;
}

export interface IAIService {
  chat(config: ChatConfig): Promise<string>;
  transcribeAudio(buffer: Buffer, mimeType: string): Promise<string>;
}
