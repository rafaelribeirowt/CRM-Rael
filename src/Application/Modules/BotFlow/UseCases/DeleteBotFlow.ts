import { AppError } from "../../../Contracts/Errors/AppError";
import { IBotFlowRepository } from "../../../Contracts/Repositories/IBotFlowRepository";

export class DeleteBotFlow {
  constructor(private readonly botFlowRepository: IBotFlowRepository) {}

  async execute(flowId: string) {
    const flow = await this.botFlowRepository.findById(flowId);
    if (!flow) {
      throw new AppError("Bot flow not found", 404, "BOT_FLOW_NOT_FOUND");
    }

    await this.botFlowRepository.delete(flowId);

    return { success: true };
  }
}
