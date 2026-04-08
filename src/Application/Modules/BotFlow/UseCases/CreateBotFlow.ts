import { BotFlow } from "../../../../Domain/BotFlow/Models/BotFlow";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IBotFlowRepository } from "../../../Contracts/Repositories/IBotFlowRepository";

interface CreateBotFlowInput {
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig?: string;
  pipelineId?: string;
  stageId?: string;
}

export class CreateBotFlow {
  constructor(private readonly botFlowRepository: IBotFlowRepository) {}

  async execute(input: CreateBotFlowInput) {
    const flow = BotFlow.create({
      name: input.name,
      description: input.description,
      triggerType: input.triggerType,
      triggerConfig: input.triggerConfig,
      pipelineId: input.pipelineId,
      stageId: input.stageId,
    });

    await this.botFlowRepository.save(flow);

    return flow.toJSON();
  }
}
