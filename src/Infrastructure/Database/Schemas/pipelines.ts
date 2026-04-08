import { pgTable, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const pipelines = pgTable("pipelines", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").notNull().default(false),
  createdBy: text("created_by").references(() => users.id),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type PipelineRow = typeof pipelines.$inferSelect;
