import { pgTable, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { botFlows } from "./botFlows";

export const botSteps = pgTable("bot_steps", {
  id: text("id").primaryKey(),
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
});

export type BotStepRow = typeof botSteps.$inferSelect;
