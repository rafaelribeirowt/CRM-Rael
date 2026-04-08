import OpenAI, { toFile } from "openai";
import { env } from "../../Shared/Env";

export class AudioTranscriber {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async transcribe(buffer: Buffer, mimeType: string): Promise<string> {
    const ext = this.getExtension(mimeType);
    const fileName = `audio.${ext}`;

    const file = await toFile(buffer, fileName, { type: mimeType });

    const transcription = await this.client.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "pt",
    });

    return transcription.text;
  }

  private getExtension(mimeType: string): string {
    const map: Record<string, string> = {
      "audio/ogg": "ogg",
      "audio/ogg; codecs=opus": "ogg",
      "audio/mpeg": "mp3",
      "audio/mp4": "m4a",
      "audio/webm": "webm",
      "audio/wav": "wav",
      "audio/x-wav": "wav",
    };
    return map[mimeType] ?? "ogg";
  }
}
