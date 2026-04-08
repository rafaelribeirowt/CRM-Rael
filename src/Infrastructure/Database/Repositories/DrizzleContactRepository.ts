import { eq } from "drizzle-orm";
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
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class DrizzleContactRepository implements IContactRepository {
  async save(contact: Contact): Promise<void> {
    await db
      .insert(contacts)
      .values({
        id: contact.id,
        whatsappId: contact.whatsappId,
        phone: contact.phone,
        name: contact.name,
        pushName: contact.pushName,
        profilePicUrl: contact.profilePicUrl,
        leadId: contact.leadId,
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

  async findById(id: string): Promise<Contact | null> {
    const rows = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findByWhatsAppId(whatsappId: string): Promise<Contact | null> {
    const rows = await db.select().from(contacts).where(eq(contacts.whatsappId, whatsappId)).limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findByLeadId(leadId: string): Promise<Contact | null> {
    const rows = await db.select().from(contacts).where(eq(contacts.leadId, leadId)).limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findAll(): Promise<Contact[]> {
    const rows = await db.select().from(contacts);
    return rows.map(toDomain);
  }

  async delete(id: string): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }
}
