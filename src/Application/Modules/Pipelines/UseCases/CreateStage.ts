import { PipelineStage } from "../../../../Domain/Pipelines/Models/PipelineStage";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IPipelineRepository } from "../../../Contracts/Repositories/IPipelineRepository";
import { IPipelineStageRepository } from "../../../Contracts/Repositories/IPipelineStageRepository";

interface CreateStageInput {
  pipelineId: string;
  name: string;
  color?: string;
  isWon?: boolean;
  isLost?: boolean;
  tenantId: string;
}

export class CreateStage {
  constructor(
    private readonly pipelineRepository: IPipelineRepository,
    private readonly stageRepository: IPipelineStageRepository
  ) {}

  async execute(input: CreateStageInput) {
    const pipeline = await this.pipelineRepository.findById(input.pipelineId, input.tenantId);
    if (!pipeline) {
      throw new AppError("Pipeline not found", 404, "PIPELINE_NOT_FOUND");
    }

    const existingStages = await this.stageRepository.findByPipelineId(
      input.pipelineId,
      input.tenantId
    );

    const stage = PipelineStage.create({
      pipelineId: input.pipelineId,
      name: input.name,
      color: input.color,
      position: existingStages.length,
      isWon: input.isWon,
      isLost: input.isLost,
    });

    await this.stageRepository.save(stage, input.tenantId);

    return stage.toJSON();
  }
}
