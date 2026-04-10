import { AppError } from "../../../Contracts/Errors/AppError";
import { IPipelineRepository } from "../../../Contracts/Repositories/IPipelineRepository";
import { IPipelineStageRepository } from "../../../Contracts/Repositories/IPipelineStageRepository";
import { ILeadRepository } from "../../../Contracts/Repositories/ILeadRepository";

interface GetPipelineWithStagesInput {
  pipelineId: string;
  tenantId: string;
}

export class GetPipelineWithStages {
  constructor(
    private readonly pipelineRepository: IPipelineRepository,
    private readonly stageRepository: IPipelineStageRepository,
    private readonly leadRepository: ILeadRepository
  ) {}

  async execute(input: GetPipelineWithStagesInput) {
    const pipeline = await this.pipelineRepository.findById(input.pipelineId, input.tenantId);
    if (!pipeline) {
      throw new AppError("Pipeline not found", 404, "PIPELINE_NOT_FOUND");
    }

    const stages = await this.stageRepository.findByPipelineId(input.pipelineId, input.tenantId);
    const leads = await this.leadRepository.findByPipelineId(input.pipelineId, input.tenantId);

    const stagesWithLeads = stages.map((stage) => ({
      ...stage.toJSON(),
      leads: leads
        .filter((l) => l.stageId === stage.id)
        .map((l) => l.toJSON()),
    }));

    return {
      ...pipeline.toJSON(),
      stages: stagesWithLeads,
    };
  }
}
