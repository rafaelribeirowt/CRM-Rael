import { eq, and } from "drizzle-orm";
import { Plan } from "../../../Domain/Subscription/Models/Plan";
import { IPlanRepository } from "../../../Application/Contracts/Repositories/IPlanRepository";
import { db } from "../Drizzle/client";
import { plans, PlanRow } from "../Schemas/plans";

function toDomain(row: PlanRow): Plan {
  return new Plan({
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: row.price,
    maxWhatsappSessions: row.maxWhatsappSessions,
    maxLeads: row.maxLeads,
    maxUsers: row.maxUsers,
    features: (row.features as Record<string, unknown>) ?? {},
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class DrizzlePlanRepository implements IPlanRepository {
  async findById(id: string): Promise<Plan | null> {
    const rows = await db.select().from(plans).where(eq(plans.id, id));
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findBySlug(slug: string): Promise<Plan | null> {
    const rows = await db.select().from(plans).where(eq(plans.slug, slug));
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findAllActive(): Promise<Plan[]> {
    const rows = await db.select().from(plans).where(eq(plans.isActive, true));
    return rows.map(toDomain);
  }
}
