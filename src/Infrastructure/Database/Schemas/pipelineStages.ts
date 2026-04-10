import { pgTable, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { pipelines } from "./pipelines";

export const pipelineStages = pgTable(
  "pipeline_stages",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    pipelineId: text("pipeline_id")
      .notNull()
      .references(() => pipelines.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull().default("#6366f1"),
    position: integer("position").notNull(),
    isWon: boolean("is_won").notNull().default(false),
    isLost: boolean("is_lost").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index("pipeline_stages_tenant_id_idx").on(table.tenantId),
  })
);

export type PipelineStageRow = typeof pipelineStages.$inferSelect;
