import { BotLog } from "../../../Domain/BotFlow/Models/BotLog";
import { IRepository } from "./IRepository";

export interface IBotLogRepository extends IRepository<BotLog> {
  findBySessionId(sessionId: string): Promise<BotLog[]>;
}
