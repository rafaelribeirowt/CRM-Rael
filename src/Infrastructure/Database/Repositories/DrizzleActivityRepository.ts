import { eq, and, desc, count } from "drizzle-orm";
import { Activity } from "../../../Domain/Activities/Models/Activity";
import { IActivityRepository } from "../../../Application/Contracts/Repositories/IActivityRepository";
import { db } from "../Drizzle/client";
import { activities, ActivityRow } from "../Schemas/activities";
import {
  PaginationInput,
  PaginationResult,
  getPaginationParams,
  buildPaginationResult,
} from "../Helpers/pagination";

function toDomain(row: ActivityRow): Activity {
  return new Activity({
    id: row.id,
    leadId: row.leadId,
    userId: row.userId,
    type: row.type,
    description: row.description,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: row.createdAt,
  });
}

export class DrizzleActivityRepository implements IActivityRepository {
  async save(activity: Activity, tenantId: string): Promise<void> {
    await db.insert(activities).values({
      id: activity.id,
      tenantId,
      leadId: activity.leadId,
      userId: activity.userId,
      type: activity.type,
      description: activity.description,
      metadata: activity.metadata,
      createdAt: activity.createdAt,
    });
  }

  async findById(id: string, tenantId: string): Promise<Activity | null> {
    const rows = await db
      .select()
      .from(activities)
      .where(and(eq(activities.id, id), eq(activities.tenantId, tenantId)))
      .limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findByLeadId(
    leadId: string,
    pagination: PaginationInput,
    tenantId: string
  ): Promise<PaginationResult<Activity>> {
    const { page, limit, offset } = getPaginationParams(pagination);

    const where = and(eq(activities.leadId, leadId), eq(activities.tenantId, tenantId));

    const [rows, totalResult] = await Promise.all([
      db
        .select()
        .from(activities)
        .where(where)
        .orderBy(desc(activities.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(activities)
        .where(where),
    ]);

    const total = totalResult[0]?.total ?? 0;
    return buildPaginationResult(rows.map(toDomain), total, page, limit);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await db.delete(activities).where(and(eq(activities.id, id), eq(activities.tenantId, tenantId)));
  }
}
