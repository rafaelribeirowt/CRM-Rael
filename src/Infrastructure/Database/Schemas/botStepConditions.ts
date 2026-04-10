import { pgTable, text, integer, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { botSteps } from "./botSteps";

export const botStepConditions = pgTable(
  "bot_step_conditions",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    stepId: text("step_id")
      .notNull()
      .references(() => botSteps.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    operator: text("operator").notNull(),
    value: text("value"),
    nextStepId: text("next_step_id"),
    action: jsonb("action"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index("bot_step_conditions_tenant_id_idx").on(table.tenantId),
  })
);

export type BotStepConditionRow = typeof botStepConditions.$inferSelect;
