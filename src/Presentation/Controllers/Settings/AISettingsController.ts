import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../../Infrastructure/Database/Drizzle/client";
import { settings } from "../../../Infrastructure/Database/Schemas/settings";
import { env } from "../../../Shared/Env";

const AI_KEYS = [
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
] as const;

function maskKey(key: string): string {
  if (!key || key.length < 12) return key ? "****" : "";
  return key.slice(0, 7) + "..." + key.slice(-4);
}

export class AISettingsController {
  getSettings = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // Read from DB first, fallback to env
      const rows = await db.select().from(settings);
      const dbMap = new Map(rows.map((r) => [r.key, r.value]));

      const result: Record<string, { configured: boolean; masked: string; source: string }> = {};

      for (const key of AI_KEYS) {
        const dbValue = dbMap.get(key);
        const envValue = (env as any)[key];
        const value = dbValue || envValue || "";

        result[key] = {
          configured: !!value,
          masked: maskKey(value),
          source: dbValue ? "database" : envValue ? "env" : "none",
        };
      }

      // Check if services are active
      const anthropicKey = dbMap.get("ANTHROPIC_API_KEY") || env.ANTHROPIC_API_KEY;
      const openaiKey = dbMap.get("OPENAI_API_KEY") || env.OPENAI_API_KEY;

      res.json({
        keys: result,
        services: {
          claude: { active: !!anthropicKey, model: "Claude Haiku 4.5" },
          whisper: { active: !!openaiKey, model: "Whisper-1" },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  saveSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = z.object({
        ANTHROPIC_API_KEY: z.string().optional(),
        OPENAI_API_KEY: z.string().optional(),
      });

      const data = schema.parse(req.body);

      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== "") {
          await db
            .insert(settings)
            .values({ key, value, updatedAt: new Date() })
            .onConflictDoUpdate({
              target: settings.key,
              set: { value, updatedAt: new Date() },
            });

          // Update runtime env
          (env as any)[key] = value;
        }
      }

      // Re-initialize AI services with new keys
      try {
        const anthropicKey =
          data.ANTHROPIC_API_KEY ||
          (await db.select().from(settings).where(eq(settings.key, "ANTHROPIC_API_KEY")).then((r) => r[0]?.value)) ||
          env.ANTHROPIC_API_KEY;

        const openaiKey =
          data.OPENAI_API_KEY ||
          (await db.select().from(settings).where(eq(settings.key, "OPENAI_API_KEY")).then((r) => r[0]?.value)) ||
          env.OPENAI_API_KEY;

        if (anthropicKey) {
          (env as any).ANTHROPIC_API_KEY = anthropicKey;
          const { AIService } = await import("../../../Infrastructure/AI/AIService");
          const { botEngine } = await import("../../../Main/Dependencies/BotFlow/composition");
          botEngine.setAIService(new AIService());
          console.log("[Settings] AI Service (Claude) reconfigured");
        }

        if (openaiKey) {
          (env as any).OPENAI_API_KEY = openaiKey;
          const { AudioTranscriber } = await import("../../../Infrastructure/AI/AudioTranscriber");
          const { botEngine } = await import("../../../Main/Dependencies/BotFlow/composition");
          botEngine.setAudioTranscriber(new AudioTranscriber());
          console.log("[Settings] Audio Transcriber (Whisper) reconfigured");
        }
      } catch (err) {
        console.error("[Settings] Error reconfiguring AI services:", err);
      }

      res.json({ success: true, message: "API keys salvas e servicos reconfigurados" });
    } catch (error) {
      next(error);
    }
  };
}
