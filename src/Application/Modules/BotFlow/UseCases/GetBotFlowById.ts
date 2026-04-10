import { AppError } from "../../../Contracts/Errors/AppError";
import { IBotFlowRepository } from "../../../Contracts/Repositories/IBotFlowRepository";
import { IBotStepRepository } from "../../../Contracts/Repositories/IBotStepRepository";
import { IBotStepConditionRepository } from "../../../Contracts/Repositories/IBotStepConditionRepository";

export class GetBotFlowById {
  constructor(
    private readonly botFlowRepository: IBotFlowRepository,
    private readonly botStepRepository: IBotStepRepository,
    private readonly botStepConditionRepository: IBotStepConditionRepository
  ) {}

  async execute(input: { flowId: string; tenantId: string }) {
    const flow = await this.botFlowRepository.findById(input.flowId, input.tenantId);
    if (!flow) {
      throw new AppError("Bot flow not found", 404, "BOT_FLOW_NOT_FOUND");
    }

    const steps = await this.botStepRepository.findByFlowIdOrdered(input.flowId, input.tenantId);

    const stepsWithConditions = await Promise.all(
      steps.map(async (step) => {
        if (step.type === "condition") {
          const conditions =
            await this.botStepConditionRepository.findByStepId(step.id, input.tenantId);
          return {
            ...step.toJSON(),
            conditions: conditions.map((c) => c.toJSON()),
          };
        }
        return step.toJSON();
      })
    );

    return {
      ...flow.toJSON(),
      steps: stepsWithConditions,
    };
  }
}
