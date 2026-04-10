import { eq } from "drizzle-orm";
import { Subscription } from "../../../Domain/Subscription/Models/Subscription";
import { ISubscriptionRepository } from "../../../Application/Contracts/Repositories/ISubscriptionRepository";
import { db } from "../Drizzle/client";
import { subscriptions, SubscriptionRow } from "../Schemas/subscriptions";

function toDomain(row: SubscriptionRow): Subscription {
  return new Subscription({
    id: row.id,
    tenantId: row.tenantId,
    planId: row.planId,
    status: row.status,
    asaasSubscriptionId: row.asaasSubscriptionId,
    asaasCustomerId: row.asaasCustomerId,
    currentPeriodStart: row.currentPeriodStart,
    currentPeriodEnd: row.currentPeriodEnd,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class DrizzleSubscriptionRepository implements ISubscriptionRepository {
  async save(subscription: Subscription): Promise<void> {
    await db
      .insert(subscriptions)
      .values({
        id: subscription.id,
        tenantId: subscription.tenantId,
        planId: subscription.planId,
        status: subscription.status,
        asaasSubscriptionId: subscription.asaasSubscriptionId,
        asaasCustomerId: subscription.asaasCustomerId,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      })
      .onConflictDoUpdate({
        target: subscriptions.id,
        set: {
          planId: subscription.planId,
          status: subscription.status,
          asaasSubscriptionId: subscription.asaasSubscriptionId,
          asaasCustomerId: subscription.asaasCustomerId,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          updatedAt: new Date(),
        },
      });
  }

  async findByTenantId(tenantId: string): Promise<Subscription | null> {
    const rows = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId));
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findById(id: string): Promise<Subscription | null> {
    const rows = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findAll(): Promise<Subscription[]> {
    const rows = await db.select().from(subscriptions);
    return rows.map(toDomain);
  }

  async delete(id: string): Promise<void> {
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
  }
}
