import { eq, and, asc } from "drizzle-orm";
import { BotStepCondition } from "../../../Domain/BotFlow/Models/BotStepCondition";
import { IBotStepConditionRepository } from "../../../Application/Contracts/Repositories/IBotStepConditionRepository";
import { db } from "../Drizzle/client";
import { botStepConditions, BotStepConditionRow } from "../Schemas/botStepConditions";
import type { ActionConfig } from "../../../Domain/BotFlow/Types/StepConfig";

function toDomain(row: BotStepConditionRow): BotStepCondition {
  return new BotStepCondition({
    id: row.id,
    stepId: row.stepId,
    label: row.label,
    operator: row.operator,
    value: row.value,
    nextStepId: row.nextStepId,
    action: (row.action as ActionConfig) ?? null,
    position: row.position,
    createdAt: row.createdAt,
  });
}

export class DrizzleBotStepConditionRepository implements IBotStepConditionRepository {
  async save(condition: BotStepCondition, tenantId: string): Promise<void> {
    await db
      .insert(botStepConditions)
      .values({
        id: condition.id,
        tenantId,
        stepId: condition.stepId,
        label: condition.label,
        operator: condition.operator,
        value: condition.value,
        nextStepId: condition.nextStepId,
        action: condition.action,
        position: condition.position,
        createdAt: condition.createdAt,
      })
      .onConflictDoUpdate({
        target: botStepConditions.id,
        set: {
          stepId: condition.stepId,
          label: condition.label,
          operator: condition.operator,
          value: condition.value,
          nextStepId: condition.nextStepId,
          action: condition.action,
          position: condition.position,
        },
      });
  }

  async findById(id: string, tenantId: string): Promise<BotStepCondition | null> {
    const rows = await db
      .select()
      .from(botStepConditions)
      .where(and(eq(botStepConditions.id, id), eq(botStepConditions.tenantId, tenantId)))
      .limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findByStepId(stepId: string, tenantId: string): Promise<BotStepCondition[]> {
    const rows = await db
      .select()
      .from(botStepConditions)
      .where(and(eq(botStepConditions.stepId, stepId), eq(botStepConditions.tenantId, tenantId)))
      .orderBy(asc(botStepConditions.position));
    return rows.map(toDomain);
  }

  async deleteByStepId(stepId: string, tenantId: string): Promise<void> {
    await db.delete(botStepConditions).where(and(eq(botStepConditions.stepId, stepId), eq(botStepConditions.tenantId, tenantId)));
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await db.delete(botStepConditions).where(and(eq(botStepConditions.id, id), eq(botStepConditions.tenantId, tenantId)));
  }
}
