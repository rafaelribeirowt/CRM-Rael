import { BotFlow } from "../../../Domain/BotFlow/Models/BotFlow";
import { IRepository } from "./IRepository";

export interface IBotFlowRepository extends IRepository<BotFlow> {
  findAll(): Promise<BotFlow[]>;
  findActive(): Promise<BotFlow[]>;
  findActiveByTrigger(triggerType: string, pipelineId?: string): Promise<BotFlow[]>;
}
