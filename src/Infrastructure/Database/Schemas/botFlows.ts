import { pgTable, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { pipelines } from "./pipelines";
import { pipelineStages } from "./pipelineStages";

export const botFlows = pgTable(
  "bot_flows",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    name: text("name").notNull(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(false),
    triggerType: text("trigger_type").notNull(),
    triggerConfig: text("trigger_config"),
    pipelineId: text("pipeline_id").references(() => pipelines.id),
    stageId: text("stage_id").references(() => pipelineStages.id),
    firstStepId: text("first_step_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index("bot_flows_tenant_id_idx").on(table.tenantId),
  })
);

export type BotFlowRow = typeof botFlows.$inferSelect;
