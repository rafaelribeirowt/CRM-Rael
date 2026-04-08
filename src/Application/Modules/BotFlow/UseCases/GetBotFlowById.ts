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

  async execute(flowId: string) {
    const flow = await this.botFlowRepository.findById(flowId);
    if (!flow) {
      throw new AppError("Bot flow not found", 404, "BOT_FLOW_NOT_FOUND");
    }

    const steps = await this.botStepRepository.findByFlowIdOrdered(flowId);

    const stepsWithConditions = await Promise.all(
      steps.map(async (step) => {
        if (step.type === "condition") {
          const conditions =
            await this.botStepConditionRepository.findByStepId(step.id);
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
