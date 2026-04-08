import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { pipelines } from "./pipelines";

export const pipelineStages = pgTable("pipeline_stages", {
  id: text("id").primaryKey(),
  pipelineId: text("pipeline_id")
    .notNull()
    .references(() => pipelines.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6366f1"),
  position: integer("position").notNull(),
  isWon: boolean("is_won").notNull().default(false),
  isLost: boolean("is_lost").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type PipelineStageRow = typeof pipelineStages.$inferSelect;
