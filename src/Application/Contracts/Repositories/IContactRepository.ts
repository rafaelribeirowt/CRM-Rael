import { Contact } from "../../../Domain/WhatsApp/Models/Contact";
import { IRepository } from "./IRepository";

export interface IContactRepository extends IRepository<Contact> {
  findByWhatsAppId(whatsappId: string): Promise<Contact | null>;
  findByLeadId(leadId: string): Promise<Contact | null>;
  findAll(): Promise<Contact[]>;
}
