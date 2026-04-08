import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { botSessions } from "./botSessions";
import { botSteps } from "./botSteps";

export const botLogs = pgTable("bot_logs", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => botSessions.id, { onDelete: "cascade" }),
  stepId: text("step_id").references(() => botSteps.id),
  event: text("event").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type BotLogRow = typeof botLogs.$inferSelect;
