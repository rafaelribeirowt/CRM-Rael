import { WhatsAppSession } from "../../../Domain/WhatsApp/Models/WhatsAppSession";
import { IRepository } from "./IRepository";

export interface IWhatsAppSessionRepository extends IRepository<WhatsAppSession> {
  findByUserId(userId: string): Promise<WhatsAppSession | null>;
  findConnected(): Promise<WhatsAppSession[]>;
  updateStatus(id: string, status: string, phoneNumber?: string): Promise<void>;
  updateAuthState(id: string, authState: unknown): Promise<void>;
}
