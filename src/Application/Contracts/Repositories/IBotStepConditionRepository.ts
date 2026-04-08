import { BotStepCondition } from "../../../Domain/BotFlow/Models/BotStepCondition";
import { IRepository } from "./IRepository";

export interface IBotStepConditionRepository extends IRepository<BotStepCondition> {
  findByStepId(stepId: string): Promise<BotStepCondition[]>;
  deleteByStepId(stepId: string): Promise<void>;
}
