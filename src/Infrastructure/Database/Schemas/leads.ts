import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { pipelines } from "./pipelines";
import { pipelineStages } from "./pipelineStages";

export const leads = pgTable("leads", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  company: text("company"),
  tags: text("tags").array(),
  notes: text("notes"),
  assignedTo: text("assigned_to").references(() => users.id),
  stageId: text("stage_id")
    .notNull()
    .references(() => pipelineStages.id),
  pipelineId: text("pipeline_id")
    .notNull()
    .references(() => pipelines.id),
  source: text("source").notNull().default("manual"),
  position: integer("position").notNull().default(0),
  value: numeric("value", { precision: 12, scale: 2 }).default("0"),
  lostReason: text("lost_reason"),
  wonAt: timestamp("won_at"),
  lostAt: timestamp("lost_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type LeadRow = typeof leads.$inferSelect;
