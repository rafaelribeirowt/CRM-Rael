import { BotSession } from "../../../Domain/BotFlow/Models/BotSession";
import { IRepository } from "./IRepository";

export interface IBotSessionRepository extends IRepository<BotSession> {
  save(entity: BotSession, tenantId: string): Promise<void>;
  findById(id: string, tenantId: string): Promise<BotSession | null>;
  delete(id: string, tenantId: string): Promise<void>;
  findActiveByContactId(contactId: string, tenantId: string): Promise<BotSession | null>;
  findDelayedReady(): Promise<BotSession[]>;
  findByFlowId(flowId: string, tenantId: string): Promise<BotSession[]>;
  findByContactId(contactId: string, tenantId: string): Promise<BotSession[]>;
  findAllSessions(tenantId: string): Promise<BotSession[]>;
}
