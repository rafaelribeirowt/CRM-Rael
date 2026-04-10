import { Contact } from "../../../Domain/WhatsApp/Models/Contact";
import { IRepository } from "./IRepository";

export interface IContactRepository extends IRepository<Contact> {
  save(entity: Contact, tenantId: string): Promise<void>;
  findById(id: string, tenantId: string): Promise<Contact | null>;
  delete(id: string, tenantId: string): Promise<void>;
  findByWhatsAppId(whatsappId: string, tenantId: string): Promise<Contact | null>;
  findByLeadId(leadId: string, tenantId: string): Promise<Contact | null>;
  findAll(tenantId: string): Promise<Contact[]>;
  findAllVisible(tenantId: string): Promise<Contact[]>;
  findAllIgnored(tenantId: string): Promise<Contact[]>;
  updateFlags(id: string, tenantId: string, flags: { isHidden?: boolean; isIgnored?: boolean }): Promise<void>;
}
