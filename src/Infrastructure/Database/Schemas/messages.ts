import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { contacts } from "./contacts";
import { users } from "./users";

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  contactId: text("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  whatsappMsgId: text("whatsapp_msg_id").unique(),
  direction: text("direction").notNull(),
  content: text("content"),
  mediaType: text("media_type"),
  mediaUrl: text("media_url"),
  mediaMimeType: text("media_mime_type"),
  timestamp: timestamp("timestamp").notNull(),
  status: text("status").notNull().default("sent"),
  isFromMe: boolean("is_from_me").notNull().default(false),
  sentBy: text("sent_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type MessageRow = typeof messages.$inferSelect;
