import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { botFlows } from "./botFlows";
import { botSteps } from "./botSteps";
import { contacts } from "./contacts";
import { leads } from "./leads";

export const botSessions = pgTable("bot_sessions", {
  id: text("id").primaryKey(),
  flowId: text("flow_id")
    .notNull()
    .references(() => botFlows.id),
  contactId: text("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  leadId: text("lead_id").references(() => leads.id),
  currentStepId: text("current_step_id").references(() => botSteps.id),
  status: text("status").notNull().default("active"),
  variables: jsonb("variables").notNull().default({}),
  retryCount: text("retry_count").notNull().default("0"),
  delayUntil: timestamp("delay_until"),
  lastInteractionAt: timestamp("last_interaction_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type BotSessionRow = typeof botSessions.$inferSelect;
