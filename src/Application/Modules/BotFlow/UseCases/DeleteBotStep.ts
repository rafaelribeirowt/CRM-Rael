import { BotFlow } from "../../../../Domain/BotFlow/Models/BotFlow";
import { BotStep } from "../../../../Domain/BotFlow/Models/BotStep";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IBotFlowRepository } from "../../../Contracts/Repositories/IBotFlowRepository";
import { IBotStepRepository } from "../../../Contracts/Repositories/IBotStepRepository";

interface DeleteBotStepInput {
  flowId: string;
  stepId: string;
}

export class DeleteBotStep {
  constructor(
    private readonly botFlowRepository: IBotFlowRepository,
    private readonly botStepRepository: IBotStepRepository
  ) {}

  async execute(input: DeleteBotStepInput) {
    const step = await this.botStepRepository.findById(input.stepId);
    if (!step) {
      throw new AppError("Bot step not found", 404, "BOT_STEP_NOT_FOUND");
    }

    const flow = await this.botFlowRepository.findById(input.flowId);
    if (!flow) {
      throw new AppError("Bot flow not found", 404, "BOT_FLOW_NOT_FOUND");
    }

    if (flow.firstStepId === step.id) {
      const updatedFlow = new BotFlow({
        ...flow.props,
        firstStepId: step.nextStepId,
        updatedAt: new Date(),
      });
      await this.botFlowRepository.save(updatedFlow);
    }

    const allSteps = await this.botStepRepository.findByFlowId(input.flowId);
    const previousStep = allSteps.find((s) => s.nextStepId === step.id);
    if (previousStep) {
      const updatedPrevious = new BotStep({
        ...previousStep.props,
        nextStepId: step.nextStepId,
      });
      await this.botStepRepository.save(updatedPrevious);
    }

    await this.botStepRepository.delete(input.stepId);

    return { success: true };
  }
}
