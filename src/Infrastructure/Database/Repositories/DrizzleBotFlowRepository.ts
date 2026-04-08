import { eq, and, or, isNull } from "drizzle-orm";
import { BotFlow } from "../../../Domain/BotFlow/Models/BotFlow";
import { IBotFlowRepository } from "../../../Application/Contracts/Repositories/IBotFlowRepository";
import { db } from "../Drizzle/client";
import { botFlows, BotFlowRow } from "../Schemas/botFlows";

function toDomain(row: BotFlowRow): BotFlow {
  return new BotFlow({
    id: row.id,
    name: row.name,
    description: row.description,
    isActive: row.isActive,
    triggerType: row.triggerType,
    triggerConfig: row.triggerConfig,
    pipelineId: row.pipelineId,
    stageId: row.stageId,
    firstStepId: row.firstStepId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class DrizzleBotFlowRepository implements IBotFlowRepository {
  async save(flow: BotFlow): Promise<void> {
    await db
      .insert(botFlows)
      .values({
        id: flow.id,
        name: flow.name,
        description: flow.description,
        isActive: flow.isActive,
        triggerType: flow.triggerType,
        triggerConfig: flow.triggerConfig,
        pipelineId: flow.pipelineId,
        stageId: flow.stageId,
        firstStepId: flow.firstStepId,
        createdAt: flow.createdAt,
        updatedAt: flow.updatedAt,
      })
      .onConflictDoUpdate({
        target: botFlows.id,
        set: {
          name: flow.name,
          description: flow.description,
          isActive: flow.isActive,
          triggerType: flow.triggerType,
          triggerConfig: flow.triggerConfig,
          pipelineId: flow.pipelineId,
          stageId: flow.stageId,
          firstStepId: flow.firstStepId,
          updatedAt: new Date(),
        },
      });
  }

  async findById(id: string): Promise<BotFlow | null> {
    const rows = await db
      .select()
      .from(botFlows)
      .where(eq(botFlows.id, id))
      .limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findAll(): Promise<BotFlow[]> {
    const rows = await db.select().from(botFlows);
    return rows.map(toDomain);
  }

  async findActive(): Promise<BotFlow[]> {
    const rows = await db
      .select()
      .from(botFlows)
      .where(eq(botFlows.isActive, true));
    return rows.map(toDomain);
  }

  async findActiveByTrigger(triggerType: string, pipelineId?: string): Promise<BotFlow[]> {
    const conditions = [
      eq(botFlows.isActive, true),
      eq(botFlows.triggerType, triggerType),
    ];

    if (pipelineId) {
      conditions.push(
        or(
          eq(botFlows.pipelineId, pipelineId),
          isNull(botFlows.pipelineId)
        )!
      );
    }

    const rows = await db
      .select()
      .from(botFlows)
      .where(and(...conditions));
    return rows.map(toDomain);
  }

  async delete(id: string): Promise<void> {
    await db.delete(botFlows).where(eq(botFlows.id, id));
  }
}
