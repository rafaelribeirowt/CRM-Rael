import { eq } from "drizzle-orm";
import { WhatsAppSession } from "../../../Domain/WhatsApp/Models/WhatsAppSession";
import { IWhatsAppSessionRepository } from "../../../Application/Contracts/Repositories/IWhatsAppSessionRepository";
import { db } from "../Drizzle/client";
import { whatsappSessions, WhatsAppSessionRow } from "../Schemas/whatsappSessions";

function toDomain(row: WhatsAppSessionRow): WhatsAppSession {
  return new WhatsAppSession({
    id: row.id,
    userId: row.userId,
    sessionName: row.sessionName,
    phoneNumber: row.phoneNumber,
    status: row.status,
    authState: row.authState,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class DrizzleWhatsAppSessionRepository implements IWhatsAppSessionRepository {
  async save(session: WhatsAppSession): Promise<void> {
    await db
      .insert(whatsappSessions)
      .values({
        id: session.id,
        userId: session.userId,
        sessionName: session.sessionName,
        phoneNumber: session.phoneNumber,
        status: session.status,
        authState: session.authState as Record<string, unknown>,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      })
      .onConflictDoUpdate({
        target: whatsappSessions.id,
        set: {
          sessionName: session.sessionName,
          phoneNumber: session.phoneNumber,
          status: session.status,
          updatedAt: new Date(),
        },
      });
  }

  async findById(id: string): Promise<WhatsAppSession | null> {
    const rows = await db.select().from(whatsappSessions).where(eq(whatsappSessions.id, id)).limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findByUserId(userId: string): Promise<WhatsAppSession | null> {
    const rows = await db.select().from(whatsappSessions).where(eq(whatsappSessions.userId, userId)).limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findConnected(): Promise<WhatsAppSession[]> {
    const rows = await db.select().from(whatsappSessions).where(eq(whatsappSessions.status, "connected"));
    return rows.map(toDomain);
  }

  async updateStatus(id: string, status: string, phoneNumber?: string): Promise<void> {
    const set: Record<string, unknown> = { status, updatedAt: new Date() };
    if (phoneNumber) set.phoneNumber = phoneNumber;
    await db.update(whatsappSessions).set(set).where(eq(whatsappSessions.id, id));
  }

  async updateAuthState(id: string, authState: unknown): Promise<void> {
    await db
      .update(whatsappSessions)
      .set({ authState: authState as Record<string, unknown>, updatedAt: new Date() })
      .where(eq(whatsappSessions.id, id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(whatsappSessions).where(eq(whatsappSessions.id, id));
  }
}
