import { pgTable, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

export const whatsappSessions = pgTable(
  "whatsapp_sessions",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    sessionName: text("session_name").notNull(),
    phoneNumber: text("phone_number"),
    status: text("status").notNull().default("disconnected"),
    authState: jsonb("auth_state"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index("whatsapp_sessions_tenant_id_idx").on(table.tenantId),
  })
);

export type WhatsAppSessionRow = typeof whatsappSessions.$inferSelect;
