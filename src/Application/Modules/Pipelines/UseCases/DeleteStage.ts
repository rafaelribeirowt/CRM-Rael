import { AppError } from "../../../Contracts/Errors/AppError";
import { IPipelineStageRepository } from "../../../Contracts/Repositories/IPipelineStageRepository";

interface DeleteStageInput {
  stageId: string;
  tenantId: string;
}

export class DeleteStage {
  constructor(
    private readonly stageRepository: IPipelineStageRepository
  ) {}

  async execute(input: DeleteStageInput) {
    const stage = await this.stageRepository.findById(input.stageId, input.tenantId);
    if (!stage) {
      throw new AppError("Stage not found", 404, "STAGE_NOT_FOUND");
    }

    await this.stageRepository.delete(input.stageId, input.tenantId);
    return { success: true };
  }
}
