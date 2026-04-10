import { PipelineStage } from "../../../Domain/Pipelines/Models/PipelineStage";
import { IRepository } from "./IRepository";

export interface IPipelineStageRepository extends IRepository<PipelineStage> {
  save(entity: PipelineStage, tenantId: string): Promise<void>;
  findById(id: string, tenantId: string): Promise<PipelineStage | null>;
  delete(id: string, tenantId: string): Promise<void>;
  findByPipelineId(pipelineId: string, tenantId: string): Promise<PipelineStage[]>;
  findFirstByPipelineId(pipelineId: string, tenantId: string): Promise<PipelineStage | null>;
  updatePositions(stages: { id: string; position: number }[], tenantId: string): Promise<void>;
}
