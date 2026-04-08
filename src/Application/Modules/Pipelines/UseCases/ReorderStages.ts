import { AppError } from "../../../Contracts/Errors/AppError";
import { IPipelineRepository } from "../../../Contracts/Repositories/IPipelineRepository";
import { IPipelineStageRepository } from "../../../Contracts/Repositories/IPipelineStageRepository";

interface ReorderStagesInput {
  pipelineId: string;
  stageIds: string[];
}

export class ReorderStages {
  constructor(
    private readonly pipelineRepository: IPipelineRepository,
    private readonly stageRepository: IPipelineStageRepository
  ) {}

  async execute(input: ReorderStagesInput) {
    const pipeline = await this.pipelineRepository.findById(input.pipelineId);
    if (!pipeline) {
      throw new AppError("Pipeline not found", 404, "PIPELINE_NOT_FOUND");
    }

    const updates = input.stageIds.map((id, index) => ({
      id,
      position: index,
    }));

    await this.stageRepository.updatePositions(updates);

    const stages = await this.stageRepository.findByPipelineId(
      input.pipelineId
    );
    return stages.map((s) => s.toJSON());
  }
}
