import { pgTable, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const apiKeys = pgTable(
  "api_keys",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    name: text("name").notNull(),
    keyHash: text("key_hash").notNull().unique(),
    prefix: text("prefix").notNull(),
    lastUsedAt: timestamp("last_used_at"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index("api_keys_tenant_id_idx").on(table.tenantId),
    keyHashIdx: index("api_keys_key_hash_idx").on(table.keyHash),
  })
);

export type ApiKeyRow = typeof apiKeys.$inferSelect;
