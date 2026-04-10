import { BotLog } from "../../../Domain/BotFlow/Models/BotLog";
import { IRepository } from "./IRepository";

export interface IBotLogRepository extends IRepository<BotLog> {
  save(entity: BotLog, tenantId: string): Promise<void>;
  findById(id: string, tenantId: string): Promise<BotLog | null>;
  delete(id: string, tenantId: string): Promise<void>;
  findBySessionId(sessionId: string, tenantId: string): Promise<BotLog[]>;
}
