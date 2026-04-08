import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { leads } from "./leads";

export const contacts = pgTable("contacts", {
  id: text("id").primaryKey(),
  whatsappId: text("whatsapp_id").notNull().unique(),
  phone: text("phone").notNull(),
  name: text("name"),
  pushName: text("push_name"),
  profilePicUrl: text("profile_pic_url"),
  leadId: text("lead_id").references(() => leads.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ContactRow = typeof contacts.$inferSelect;
