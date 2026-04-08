import { IBotFlowRepository } from "../../../Contracts/Repositories/IBotFlowRepository";

export class ListBotFlows {
  constructor(private readonly botFlowRepository: IBotFlowRepository) {}

  async execute() {
    const flows = await this.botFlowRepository.findAll();
    return flows.map((f) => f.toJSON());
  }
}
