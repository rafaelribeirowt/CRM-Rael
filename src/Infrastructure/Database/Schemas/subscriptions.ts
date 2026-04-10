import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { plans } from "./plans";

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id),
  status: text("status").notNull().default("active"),
  asaasSubscriptionId: text("asaas_subscription_id"),
  asaasCustomerId: text("asaas_customer_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type SubscriptionRow = typeof subscriptions.$inferSelect;
export type NewSubscriptionRow = typeof subscriptions.$inferInsert;
