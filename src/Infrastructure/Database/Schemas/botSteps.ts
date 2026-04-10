import { pgTable, text, integer, real, timestamp, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { botFlows } from "./botFlows";

export const botSteps = pgTable(
  "bot_steps",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    flowId: text("flow_id")
      .notNull()
      .references(() => botFlows.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    position: integer("position").notNull(),
    config: text("config").notNull(),
    nextStepId: text("next_step_id"),
    positionX: real("position_x").notNull().default(0),
    positionY: real("position_y").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index("bot_steps_tenant_id_idx").on(table.tenantId),
  })
);

export type BotStepRow = typeof botSteps.$inferSelect;
