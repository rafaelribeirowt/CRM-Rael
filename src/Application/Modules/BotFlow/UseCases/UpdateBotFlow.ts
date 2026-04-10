import { BotFlow } from "../../../../Domain/BotFlow/Models/BotFlow";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IBotFlowRepository } from "../../../Contracts/Repositories/IBotFlowRepository";

interface UpdateBotFlowInput {
  flowId: string;
  name?: string;
  description?: string;
  triggerType?: string;
  triggerConfig?: string;
  pipelineId?: string;
  stageId?: string;
  tenantId: string;
}

export class UpdateBotFlow {
  constructor(private readonly botFlowRepository: IBotFlowRepository) {}

  async execute(input: UpdateBotFlowInput) {
    const flow = await this.botFlowRepository.findById(input.flowId, input.tenantId);
    if (!flow) {
      throw new AppError("Bot flow not found", 404, "BOT_FLOW_NOT_FOUND");
    }

    const updated = new BotFlow({
      ...flow.props,
      name: input.name ?? flow.name,
      description: input.description !== undefined ? input.description : flow.description,
      triggerType: input.triggerType ?? flow.triggerType,
      triggerConfig: input.triggerConfig !== undefined ? input.triggerConfig : flow.triggerConfig,
      pipelineId: input.pipelineId !== undefined ? input.pipelineId : flow.pipelineId,
      stageId: input.stageId !== undefined ? input.stageId : flow.stageId,
      updatedAt: new Date(),
    });

    await this.botFlowRepository.save(updated, input.tenantId);

    return updated.toJSON();
  }
}
