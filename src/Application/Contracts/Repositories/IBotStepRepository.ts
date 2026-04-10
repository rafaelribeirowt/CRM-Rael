import { BotStep } from "../../../Domain/BotFlow/Models/BotStep";
import { IRepository } from "./IRepository";

export interface IBotStepRepository extends IRepository<BotStep> {
  save(entity: BotStep, tenantId: string): Promise<void>;
  findById(id: string, tenantId: string): Promise<BotStep | null>;
  delete(id: string, tenantId: string): Promise<void>;
  findByFlowId(flowId: string, tenantId: string): Promise<BotStep[]>;
  findByFlowIdOrdered(flowId: string, tenantId: string): Promise<BotStep[]>;
  updatePositions(steps: { id: string; position: number }[], tenantId: string): Promise<void>;
}
