import { BotFlow } from "../../../../Domain/BotFlow/Models/BotFlow";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IBotFlowRepository } from "../../../Contracts/Repositories/IBotFlowRepository";

export class ToggleBotFlow {
  constructor(private readonly botFlowRepository: IBotFlowRepository) {}

  async execute(input: { flowId: string; tenantId: string }) {
    const flow = await this.botFlowRepository.findById(input.flowId, input.tenantId);
    if (!flow) {
      throw new AppError("Bot flow not found", 404, "BOT_FLOW_NOT_FOUND");
    }

    const updated = new BotFlow({
      ...flow.props,
      isActive: !flow.isActive,
      updatedAt: new Date(),
    });

    await this.botFlowRepository.save(updated, input.tenantId);

    return updated.toJSON();
  }
}
