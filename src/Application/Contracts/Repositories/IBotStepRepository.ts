import { BotStep } from "../../../Domain/BotFlow/Models/BotStep";
import { IRepository } from "./IRepository";

export interface IBotStepRepository extends IRepository<BotStep> {
  findByFlowId(flowId: string): Promise<BotStep[]>;
  findByFlowIdOrdered(flowId: string): Promise<BotStep[]>;
  updatePositions(steps: { id: string; position: number }[]): Promise<void>;
}
