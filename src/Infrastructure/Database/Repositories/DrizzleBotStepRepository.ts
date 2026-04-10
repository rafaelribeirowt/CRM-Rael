import { eq, and, asc } from "drizzle-orm";
import { BotStep } from "../../../Domain/BotFlow/Models/BotStep";
import { IBotStepRepository } from "../../../Application/Contracts/Repositories/IBotStepRepository";
import { db } from "../Drizzle/client";
import { botSteps, BotStepRow } from "../Schemas/botSteps";

function toDomain(row: BotStepRow): BotStep {
  return new BotStep({
    id: row.id,
    flowId: row.flowId,
    type: row.type,
    position: row.position,
    config: row.config,
    nextStepId: row.nextStepId,
    positionX: row.positionX,
    positionY: row.positionY,
    createdAt: row.createdAt,
  });
}

export class DrizzleBotStepRepository implements IBotStepRepository {
  async save(step: BotStep, tenantId: string): Promise<void> {
    await db
      .insert(botSteps)
      .values({
        id: step.id,
        tenantId,
        flowId: step.flowId,
        type: step.type,
        position: step.position,
        config: step.config,
        nextStepId: step.nextStepId,
        positionX: step.positionX,
        positionY: step.positionY,
        createdAt: step.createdAt,
      })
      .onConflictDoUpdate({
        target: botSteps.id,
        set: {
          flowId: step.flowId,
          type: step.type,
          position: step.position,
          config: step.config,
          nextStepId: step.nextStepId,
          positionX: step.positionX,
          positionY: step.positionY,
        },
      });
  }

  async findById(id: string, tenantId: string): Promise<BotStep | null> {
    const rows = await db
      .select()
      .from(botSteps)
      .where(and(eq(botSteps.id, id), eq(botSteps.tenantId, tenantId)))
      .limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findByFlowId(flowId: string, tenantId: string): Promise<BotStep[]> {
    const rows = await db
      .select()
      .from(botSteps)
      .where(and(eq(botSteps.flowId, flowId), eq(botSteps.tenantId, tenantId)));
    return rows.map(toDomain);
  }

  async findByFlowIdOrdered(flowId: string, tenantId: string): Promise<BotStep[]> {
    const rows = await db
      .select()
      .from(botSteps)
      .where(and(eq(botSteps.flowId, flowId), eq(botSteps.tenantId, tenantId)))
      .orderBy(asc(botSteps.position));
    return rows.map(toDomain);
  }

  async updatePositions(steps: { id: string; position: number }[], tenantId: string): Promise<void> {
    for (const step of steps) {
      await db
        .update(botSteps)
        .set({ position: step.position })
        .where(and(eq(botSteps.id, step.id), eq(botSteps.tenantId, tenantId)));
    }
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await db.delete(botSteps).where(and(eq(botSteps.id, id), eq(botSteps.tenantId, tenantId)));
  }
}
