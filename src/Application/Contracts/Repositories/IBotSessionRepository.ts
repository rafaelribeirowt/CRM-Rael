import { BotSession } from "../../../Domain/BotFlow/Models/BotSession";
import { IRepository } from "./IRepository";

export interface IBotSessionRepository extends IRepository<BotSession> {
  findActiveByContactId(contactId: string): Promise<BotSession | null>;
  findDelayedReady(): Promise<BotSession[]>;
  findByFlowId(flowId: string): Promise<BotSession[]>;
  findByContactId(contactId: string): Promise<BotSession[]>;
  findAllSessions(): Promise<BotSession[]>;
}
