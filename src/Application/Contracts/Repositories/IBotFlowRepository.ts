import { BotFlow } from "../../../Domain/BotFlow/Models/BotFlow";
import { IRepository } from "./IRepository";

export interface IBotFlowRepository extends IRepository<BotFlow> {
  save(entity: BotFlow, tenantId: string): Promise<void>;
  findById(id: string, tenantId: string): Promise<BotFlow | null>;
  delete(id: string, tenantId: string): Promise<void>;
  findAll(tenantId: string): Promise<BotFlow[]>;
  findActive(tenantId: string): Promise<BotFlow[]>;
  findActiveByTrigger(triggerType: string, tenantId: string, pipelineId?: string): Promise<BotFlow[]>;
}
