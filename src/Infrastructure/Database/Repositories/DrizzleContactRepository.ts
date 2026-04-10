import { eq, and } from "drizzle-orm";
import { Contact } from "../../../Domain/WhatsApp/Models/Contact";
import { IContactRepository } from "../../../Application/Contracts/Repositories/IContactRepository";
import { db } from "../Drizzle/client";
import { contacts, ContactRow } from "../Schemas/contacts";

function toDomain(row: ContactRow): Contact {
  return new Contact({
    id: row.id,
    whatsappId: row.whatsappId,
    phone: row.phone,
    name: row.name,
    pushName: row.pushName,
    profilePicUrl: row.profilePicUrl,
    leadId: row.leadId,
    isHidden: row.isHidden,
    isIgnored: row.isIgnored,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class DrizzleContactRepository implements IContactRepository {
  async save(contact: Contact, tenantId: string): Promise<void> {
    await db
      .insert(contacts)
      .values({
        id: contact.id,
        tenantId,
        whatsappId: contact.whatsappId,
        phone: contact.phone,
        name: contact.name,
        pushName: contact.pushName,
        profilePicUrl: contact.profilePicUrl,
        leadId: contact.leadId,
        isHidden: contact.isHidden,
        isIgnored: contact.isIgnored,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      })
      .onConflictDoUpdate({
        target: contacts.id,
        set: {
          name: contact.name,
          pushName: contact.pushName,
          profilePicUrl: contact.profilePicUrl,
          leadId: contact.leadId,
          updatedAt: new Date(),
        },
      });
  }

  async findById(id: string, tenantId: string): Promise<Contact | null> {
    const rows = await db.select().from(contacts).where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId))).limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findByWhatsAppId(whatsappId: string, tenantId: string): Promise<Contact | null> {
    const rows = await db.select().from(contacts).where(and(eq(contacts.whatsappId, whatsappId), eq(contacts.tenantId, tenantId))).limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findByLeadId(leadId: string, tenantId: string): Promise<Contact | null> {
    const rows = await db.select().from(contacts).where(and(eq(contacts.leadId, leadId), eq(contacts.tenantId, tenantId))).limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findAll(tenantId: string): Promise<Contact[]> {
    const rows = await db.select().from(contacts).where(eq(contacts.tenantId, tenantId));
    return rows.map(toDomain);
  }

  async findAllVisible(tenantId: string): Promise<Contact[]> {
    const rows = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.tenantId, tenantId), eq(contacts.isHidden, false)));
    return rows.map(toDomain);
  }

  async findAllIgnored(tenantId: string): Promise<Contact[]> {
    const rows = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.tenantId, tenantId), eq(contacts.isIgnored, true)));
    return rows.map(toDomain);
  }

  async updateFlags(
    id: string,
    tenantId: string,
    flags: { isHidden?: boolean; isIgnored?: boolean }
  ): Promise<void> {
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (flags.isHidden !== undefined) set.isHidden = flags.isHidden;
    if (flags.isIgnored !== undefined) set.isIgnored = flags.isIgnored;
    await db
      .update(contacts)
      .set(set)
      .where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId)));
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await db.delete(contacts).where(and(eq(contacts.id, id), eq(contacts.tenantId, tenantId)));
  }
}
