import { PipelineStage } from "../../../../Domain/Pipelines/Models/PipelineStage";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IPipelineStageRepository } from "../../../Contracts/Repositories/IPipelineStageRepository";

interface UpdateStageInput {
  stageId: string;
  name?: string;
  color?: string;
  isWon?: boolean;
  isLost?: boolean;
}

export class UpdateStage {
  constructor(
    private readonly stageRepository: IPipelineStageRepository
  ) {}

  async execute(input: UpdateStageInput) {
    const stage = await this.stageRepository.findById(input.stageId);
    if (!stage) {
      throw new AppError("Stage not found", 404, "STAGE_NOT_FOUND");
    }

    const updated = new PipelineStage({
      ...stage.props,
      name: input.name ?? stage.name,
      color: input.color ?? stage.color,
      isWon: input.isWon ?? stage.isWon,
      isLost: input.isLost ?? stage.isLost,
    });

    await this.stageRepository.save(updated);
    return updated.toJSON();
  }
}
