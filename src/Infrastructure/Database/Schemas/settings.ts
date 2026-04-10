import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const settings = pgTable(
  "settings",
  {
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    key: text("key").notNull(),
    value: text("value").notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.tenantId, table.key] }),
  })
);

export type SettingRow = typeof settings.$inferSelect;
