import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const whatsappSessions = pgTable("whatsapp_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  sessionName: text("session_name").notNull(),
  phoneNumber: text("phone_number"),
  status: text("status").notNull().default("disconnected"),
  authState: jsonb("auth_state"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type WhatsAppSessionRow = typeof whatsappSessions.$inferSelect;
