import { IBotFlowRepository } from "../../../Contracts/Repositories/IBotFlowRepository";

export class ListBotFlows {
  constructor(private readonly botFlowRepository: IBotFlowRepository) {}

  async execute(tenantId: string) {
    const flows = await this.botFlowRepository.findAll(tenantId);
    return flows.map((f) => f.toJSON());
  }
}
