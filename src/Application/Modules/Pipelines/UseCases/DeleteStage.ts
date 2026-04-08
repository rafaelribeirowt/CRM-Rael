import { AppError } from "../../../Contracts/Errors/AppError";
import { IPipelineStageRepository } from "../../../Contracts/Repositories/IPipelineStageRepository";

export class DeleteStage {
  constructor(
    private readonly stageRepository: IPipelineStageRepository
  ) {}

  async execute(stageId: string) {
    const stage = await this.stageRepository.findById(stageId);
    if (!stage) {
      throw new AppError("Stage not found", 404, "STAGE_NOT_FOUND");
    }

    await this.stageRepository.delete(stageId);
    return { success: true };
  }
}
