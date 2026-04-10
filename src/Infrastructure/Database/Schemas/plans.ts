import {
  pgTable,
  text,
  numeric,
  integer,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const plans = pgTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  maxWhatsappSessions: integer("max_whatsapp_sessions").notNull().default(1),
  maxLeads: integer("max_leads").notNull().default(100),
  maxUsers: integer("max_users").notNull().default(2),
  features: jsonb("features").default({}),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type PlanRow = typeof plans.$inferSelect;
export type NewPlanRow = typeof plans.$inferInsert;
