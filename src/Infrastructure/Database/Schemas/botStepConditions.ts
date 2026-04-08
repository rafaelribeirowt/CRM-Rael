import { pgTable, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { botSteps } from "./botSteps";

export const botStepConditions = pgTable("bot_step_conditions", {
  id: text("id").primaryKey(),
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
});

export type BotStepConditionRow = typeof botStepConditions.$inferSelect;
