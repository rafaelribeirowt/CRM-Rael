import { eq, and } from "drizzle-orm";
import { Pipeline } from "../../../Domain/Pipelines/Models/Pipeline";
import { IPipelineRepository } from "../../../Application/Contracts/Repositories/IPipelineRepository";
import { db } from "../Drizzle/client";
import { pipelines, PipelineRow } from "../Schemas/pipelines";

function toDomain(row: PipelineRow): Pipeline {
  return new Pipeline({
    id: row.id,
    name: row.name,
    description: row.description,
    isDefault: row.isDefault,
    createdBy: row.createdBy,
    position: row.position,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class DrizzlePipelineRepository implements IPipelineRepository {
  async save(pipeline: Pipeline, tenantId: string): Promise<void> {
    await db
      .insert(pipelines)
      .values({
        id: pipeline.id,
        tenantId,
        name: pipeline.name,
        description: pipeline.description,
        isDefault: pipeline.isDefault,
        createdBy: pipeline.createdBy,
        position: pipeline.position,
        createdAt: pipeline.createdAt,
        updatedAt: pipeline.updatedAt,
      })
      .onConflictDoUpdate({
        target: pipelines.id,
        set: {
          name: pipeline.name,
          description: pipeline.description,
          isDefault: pipeline.isDefault,
          position: pipeline.position,
          updatedAt: new Date(),
        },
      });
  }

  async findById(id: string, tenantId: string): Promise<Pipeline | null> {
    const rows = await db
      .select()
      .from(pipelines)
      .where(and(eq(pipelines.id, id), eq(pipelines.tenantId, tenantId)))
      .limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findAll(tenantId: string): Promise<Pipeline[]> {
    const rows = await db
      .select()
      .from(pipelines)
      .where(eq(pipelines.tenantId, tenantId))
      .orderBy(pipelines.position);
    return rows.map(toDomain);
  }

  async findDefault(tenantId: string): Promise<Pipeline | null> {
    const rows = await db
      .select()
      .from(pipelines)
      .where(and(eq(pipelines.isDefault, true), eq(pipelines.tenantId, tenantId)))
      .limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await db.delete(pipelines).where(and(eq(pipelines.id, id), eq(pipelines.tenantId, tenantId)));
  }
}
