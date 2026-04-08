import { eq, and, lte, inArray } from "drizzle-orm";
import { BotSession } from "../../../Domain/BotFlow/Models/BotSession";
import { IBotSessionRepository } from "../../../Application/Contracts/Repositories/IBotSessionRepository";
import { db } from "../Drizzle/client";
import { botSessions, BotSessionRow } from "../Schemas/botSessions";

function toDomain(row: BotSessionRow): BotSession {
  return new BotSession({
    id: row.id,
    flowId: row.flowId,
    contactId: row.contactId,
    leadId: row.leadId,
    currentStepId: row.currentStepId,
    status: row.status,
    variables: (row.variables ?? {}) as Record<string, string>,
    retryCount: row.retryCount,
    delayUntil: row.delayUntil,
    lastInteractionAt: row.lastInteractionAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class DrizzleBotSessionRepository implements IBotSessionRepository {
  async save(session: BotSession): Promise<void> {
    await db
      .insert(botSessions)
      .values({
        id: session.id,
        flowId: session.flowId,
        contactId: session.contactId,
        leadId: session.leadId,
        currentStepId: session.currentStepId,
        status: session.status,
        variables: session.variables,
        retryCount: session.props.retryCount,
        delayUntil: session.delayUntil,
        lastInteractionAt: session.lastInteractionAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      })
      .onConflictDoUpdate({
        target: botSessions.id,
        set: {
          flowId: session.flowId,
          contactId: session.contactId,
          leadId: session.leadId,
          currentStepId: session.currentStepId,
          status: session.status,
          variables: session.variables,
          retryCount: session.props.retryCount,
          delayUntil: session.delayUntil,
          lastInteractionAt: session.lastInteractionAt,
          updatedAt: new Date(),
        },
      });
  }

  async findById(id: string): Promise<BotSession | null> {
    const rows = await db
      .select()
      .from(botSessions)
      .where(eq(botSessions.id, id))
      .limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findActiveByContactId(contactId: string): Promise<BotSession | null> {
    const rows = await db
      .select()
      .from(botSessions)
      .where(
        and(
          eq(botSessions.contactId, contactId),
          inArray(botSessions.status, ["active", "waiting_response", "waiting_delay"])
        )
      )
      .limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findDelayedReady(): Promise<BotSession[]> {
    const rows = await db
      .select()
      .from(botSessions)
      .where(
        and(
          eq(botSessions.status, "waiting_delay"),
          lte(botSessions.delayUntil, new Date())
        )
      );
    return rows.map(toDomain);
  }

  async findByFlowId(flowId: string): Promise<BotSession[]> {
    const rows = await db
      .select()
      .from(botSessions)
      .where(eq(botSessions.flowId, flowId));
    return rows.map(toDomain);
  }

  async findByContactId(contactId: string): Promise<BotSession[]> {
    const rows = await db
      .select()
      .from(botSessions)
      .where(eq(botSessions.contactId, contactId));
    return rows.map(toDomain);
  }

  async findAllSessions(): Promise<BotSession[]> {
    const rows = await db.select().from(botSessions);
    return rows.map(toDomain);
  }

  async delete(id: string): Promise<void> {
    await db.delete(botSessions).where(eq(botSessions.id, id));
  }
}
