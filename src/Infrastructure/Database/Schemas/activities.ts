import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { leads } from "./leads";
import { users } from "./users";

export const activities = pgTable("activities", {
  id: text("id").primaryKey(),
  leadId: text("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id),
  type: text("type").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ActivityRow = typeof activities.$inferSelect;
