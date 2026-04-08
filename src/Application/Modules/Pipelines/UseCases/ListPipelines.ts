import { IPipelineRepository } from "../../../Contracts/Repositories/IPipelineRepository";

export class ListPipelines {
  constructor(private readonly pipelineRepository: IPipelineRepository) {}

  async execute() {
    const pipelines = await this.pipelineRepository.findAll();
    return pipelines.map((p) => p.toJSON());
  }
}
