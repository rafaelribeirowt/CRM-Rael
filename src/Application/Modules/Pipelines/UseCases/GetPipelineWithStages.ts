import { AppError } from "../../../Contracts/Errors/AppError";
import { IPipelineRepository } from "../../../Contracts/Repositories/IPipelineRepository";
import { IPipelineStageRepository } from "../../../Contracts/Repositories/IPipelineStageRepository";
import { ILeadRepository } from "../../../Contracts/Repositories/ILeadRepository";

export class GetPipelineWithStages {
  constructor(
    private readonly pipelineRepository: IPipelineRepository,
    private readonly stageRepository: IPipelineStageRepository,
    private readonly leadRepository: ILeadRepository
  ) {}

  async execute(pipelineId: string) {
    const pipeline = await this.pipelineRepository.findById(pipelineId);
    if (!pipeline) {
      throw new AppError("Pipeline not found", 404, "PIPELINE_NOT_FOUND");
    }

    const stages = await this.stageRepository.findByPipelineId(pipelineId);
    const leads = await this.leadRepository.findByPipelineId(pipelineId);

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
