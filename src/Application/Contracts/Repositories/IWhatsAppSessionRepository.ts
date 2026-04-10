import { WhatsAppSession } from "../../../Domain/WhatsApp/Models/WhatsAppSession";
import { IRepository } from "./IRepository";

export interface IWhatsAppSessionRepository extends IRepository<WhatsAppSession> {
  save(entity: WhatsAppSession, tenantId: string): Promise<void>;
  findById(id: string, tenantId?: string): Promise<WhatsAppSession | null>;
  delete(id: string, tenantId: string): Promise<void>;
  findByUserId(userId: string, tenantId: string): Promise<WhatsAppSession | null>;
  findAllByTenantId(tenantId: string): Promise<WhatsAppSession[]>;
  countByTenantId(tenantId: string): Promise<number>;
  findConnected(): Promise<WhatsAppSession[]>;
  updateStatus(id: string, status: string, phoneNumber?: string): Promise<void>;
  updateAuthState(id: string, authState: unknown): Promise<void>;
}
