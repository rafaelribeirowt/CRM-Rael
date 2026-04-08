import { PipelineStage } from "../../../Domain/Pipelines/Models/PipelineStage";
import { IRepository } from "./IRepository";

export interface IPipelineStageRepository extends IRepository<PipelineStage> {
  findByPipelineId(pipelineId: string): Promise<PipelineStage[]>;
  findFirstByPipelineId(pipelineId: string): Promise<PipelineStage | null>;
  updatePositions(stages: { id: string; position: number }[]): Promise<void>;
}
