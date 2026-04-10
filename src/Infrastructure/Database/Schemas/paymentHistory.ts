import { pgTable, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { subscriptions } from "./subscriptions";

export const paymentHistory = pgTable("payment_history", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id),
  subscriptionId: text("subscription_id")
    .notNull()
    .references(() => subscriptions.id),
  asaasPaymentId: text("asaas_payment_id"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(),
  paymentMethod: text("payment_method"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type PaymentHistoryRow = typeof paymentHistory.$inferSelect;
export type NewPaymentHistoryRow = typeof paymentHistory.$inferInsert;
