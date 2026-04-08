import { eq, asc, sql } from "drizzle-orm";
import { PipelineStage } from "../../../Domain/Pipelines/Models/PipelineStage";
import { IPipelineStageRepository } from "../../../Application/Contracts/Repositories/IPipelineStageRepository";
import { db } from "../Drizzle/client";
import { pipelineStages, PipelineStageRow } from "../Schemas/pipelineStages";

function toDomain(row: PipelineStageRow): PipelineStage {
  return new PipelineStage({
    id: row.id,
    pipelineId: row.pipelineId,
    name: row.name,
    color: row.color,
    position: row.position,
    isWon: row.isWon,
    isLost: row.isLost,
    createdAt: row.createdAt,
  });
}

export class DrizzlePipelineStageRepository
  implements IPipelineStageRepository
{
  async save(stage: PipelineStage): Promise<void> {
    await db
      .insert(pipelineStages)
      .values({
        id: stage.id,
        pipelineId: stage.pipelineId,
        name: stage.name,
        color: stage.color,
        position: stage.position,
        isWon: stage.isWon,
        isLost: stage.isLost,
        createdAt: stage.createdAt,
      })
      .onConflictDoUpdate({
        target: pipelineStages.id,
        set: {
          name: stage.name,
          color: stage.color,
          position: stage.position,
          isWon: stage.isWon,
          isLost: stage.isLost,
        },
      });
  }

  async findById(id: string): Promise<PipelineStage | null> {
    const rows = await db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.id, id))
      .limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findByPipelineId(pipelineId: string): Promise<PipelineStage[]> {
    const rows = await db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.pipelineId, pipelineId))
      .orderBy(asc(pipelineStages.position));
    return rows.map(toDomain);
  }

  async findFirstByPipelineId(
    pipelineId: string
  ): Promise<PipelineStage | null> {
    const rows = await db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.pipelineId, pipelineId))
      .orderBy(asc(pipelineStages.position))
      .limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async updatePositions(
    stages: { id: string; position: number }[]
  ): Promise<void> {
    for (const stage of stages) {
      await db
        .update(pipelineStages)
        .set({ position: stage.position })
        .where(eq(pipelineStages.id, stage.id));
    }
  }

  async delete(id: string): Promise<void> {
    await db.delete(pipelineStages).where(eq(pipelineStages.id, id));
  }
}
