import { pgTable, text, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { leads } from "./leads";

export const contacts = pgTable(
  "contacts",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id),
    whatsappId: text("whatsapp_id").notNull(),
    phone: text("phone").notNull(),
    name: text("name"),
    pushName: text("push_name"),
    profilePicUrl: text("profile_pic_url"),
    leadId: text("lead_id").references(() => leads.id),
    isHidden: boolean("is_hidden").notNull().default(false),
    isIgnored: boolean("is_ignored").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    tenantWhatsappIdx: uniqueIndex("contacts_tenant_whatsapp_idx").on(table.tenantId, table.whatsappId),
  })
);

export type ContactRow = typeof contacts.$inferSelect;
