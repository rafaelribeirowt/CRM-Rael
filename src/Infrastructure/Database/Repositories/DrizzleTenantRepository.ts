import { eq } from "drizzle-orm";
import { Tenant } from "../../../Domain/Subscription/Models/Tenant";
import { ITenantRepository } from "../../../Application/Contracts/Repositories/ITenantRepository";
import { db } from "../Drizzle/client";
import { tenants, TenantRow } from "../Schemas/tenants";

function toDomain(row: TenantRow): Tenant {
  return new Tenant({
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logoUrl,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class DrizzleTenantRepository implements ITenantRepository {
  async save(tenant: Tenant): Promise<void> {
    await db
      .insert(tenants)
      .values({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        logoUrl: tenant.logoUrl,
        isActive: tenant.isActive,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      })
      .onConflictDoUpdate({
        target: tenants.id,
        set: {
          name: tenant.name,
          slug: tenant.slug,
          logoUrl: tenant.logoUrl,
          isActive: tenant.isActive,
          updatedAt: new Date(),
        },
      });
  }

  async findById(id: string): Promise<Tenant | null> {
    const rows = await db.select().from(tenants).where(eq(tenants.id, id));
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const rows = await db.select().from(tenants).where(eq(tenants.slug, slug));
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findAll(): Promise<Tenant[]> {
    const rows = await db.select().from(tenants);
    return rows.map(toDomain);
  }

  async delete(id: string): Promise<void> {
    await db.delete(tenants).where(eq(tenants.id, id));
  }
}
