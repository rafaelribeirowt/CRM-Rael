import { pgTable, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { botSessions } from "./botSessions";
import { botSteps } from "./botSteps";

export const botLogs = pgTable(
  "bot_logs",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    sessionId: text("session_id")
      .notNull()
      .references(() => botSessions.id, { onDelete: "cascade" }),
    stepId: text("step_id").references(() => botSteps.id),
    event: text("event").notNull(),
    details: jsonb("details"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index("bot_logs_tenant_id_idx").on(table.tenantId),
  })
);

export type BotLogRow = typeof botLogs.$inferSelect;
