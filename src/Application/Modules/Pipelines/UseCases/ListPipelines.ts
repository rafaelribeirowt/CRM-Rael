import { IPipelineRepository } from "../../../Contracts/Repositories/IPipelineRepository";

export class ListPipelines {
  constructor(private readonly pipelineRepository: IPipelineRepository) {}

  async execute(tenantId: string) {
    const pipelines = await this.pipelineRepository.findAll(tenantId);
    return pipelines.map((p) => p.toJSON());
  }
}
