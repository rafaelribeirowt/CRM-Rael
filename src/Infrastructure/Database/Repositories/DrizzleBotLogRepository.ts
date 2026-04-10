import { eq, and, asc } from "drizzle-orm";
import { BotLog } from "../../../Domain/BotFlow/Models/BotLog";
import { IBotLogRepository } from "../../../Application/Contracts/Repositories/IBotLogRepository";
import { db } from "../Drizzle/client";
import { botLogs, BotLogRow } from "../Schemas/botLogs";

function toDomain(row: BotLogRow): BotLog {
  return new BotLog({
    id: row.id,
    sessionId: row.sessionId,
    stepId: row.stepId,
    event: row.event,
    details: (row.details ?? null) as Record<string, unknown> | null,
    createdAt: row.createdAt,
  });
}

export class DrizzleBotLogRepository implements IBotLogRepository {
  async save(log: BotLog, tenantId: string): Promise<void> {
    await db
      .insert(botLogs)
      .values({
        id: log.id,
        tenantId,
        sessionId: log.sessionId,
        stepId: log.stepId,
        event: log.event,
        details: log.details,
        createdAt: log.createdAt,
      })
      .onConflictDoUpdate({
        target: botLogs.id,
        set: {
          sessionId: log.sessionId,
          stepId: log.stepId,
          event: log.event,
          details: log.details,
        },
      });
  }

  async findById(id: string, tenantId: string): Promise<BotLog | null> {
    const rows = await db
      .select()
      .from(botLogs)
      .where(and(eq(botLogs.id, id), eq(botLogs.tenantId, tenantId)))
      .limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findBySessionId(sessionId: string, tenantId: string): Promise<BotLog[]> {
    const rows = await db
      .select()
      .from(botLogs)
      .where(and(eq(botLogs.sessionId, sessionId), eq(botLogs.tenantId, tenantId)))
      .orderBy(asc(botLogs.createdAt));
    return rows.map(toDomain);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await db.delete(botLogs).where(and(eq(botLogs.id, id), eq(botLogs.tenantId, tenantId)));
  }
}
