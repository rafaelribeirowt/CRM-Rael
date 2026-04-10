import { BotStepCondition } from "../../../Domain/BotFlow/Models/BotStepCondition";
import { IRepository } from "./IRepository";

export interface IBotStepConditionRepository extends IRepository<BotStepCondition> {
  save(entity: BotStepCondition, tenantId: string): Promise<void>;
  findById(id: string, tenantId: string): Promise<BotStepCondition | null>;
  delete(id: string, tenantId: string): Promise<void>;
  findByStepId(stepId: string, tenantId: string): Promise<BotStepCondition[]>;
  deleteByStepId(stepId: string, tenantId: string): Promise<void>;
}
