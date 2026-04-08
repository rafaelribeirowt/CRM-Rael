import { BotFlow } from "../../../../Domain/BotFlow/Models/BotFlow";
import { BotStep } from "../../../../Domain/BotFlow/Models/BotStep";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IBotFlowRepository } from "../../../Contracts/Repositories/IBotFlowRepository";
import { IBotStepRepository } from "../../../Contracts/Repositories/IBotStepRepository";

interface ReorderBotStepsInput {
  flowId: string;
  stepIds: string[];
}

export class ReorderBotSteps {
  constructor(
    private readonly botFlowRepository: IBotFlowRepository,
    private readonly botStepRepository: IBotStepRepository
  ) {}

  async execute(input: ReorderBotStepsInput) {
    const flow = await this.botFlowRepository.findById(input.flowId);
    if (!flow) {
      throw new AppError("Bot flow not found", 404, "BOT_FLOW_NOT_FOUND");
    }

    const updates = input.stepIds.map((id, index) => ({
      id,
      position: index,
    }));

    await this.botStepRepository.updatePositions(updates);

    const updatedFlow = new BotFlow({
      ...flow.props,
      firstStepId: input.stepIds[0] ?? null,
      updatedAt: new Date(),
    });
    await this.botFlowRepository.save(updatedFlow);

    const steps = await this.botStepRepository.findByFlowIdOrdered(
      input.flowId
    );

    for (let i = 0; i < steps.length; i++) {
      const nextStepId = i < steps.length - 1 ? steps[i + 1].id : null;
      if (steps[i].nextStepId !== nextStepId) {
        const linked = new BotStep({
          ...steps[i].props,
          nextStepId,
        });
        await this.botStepRepository.save(linked);
      }
    }

    const reorderedSteps = await this.botStepRepository.findByFlowIdOrdered(
      input.flowId
    );
    return reorderedSteps.map((s) => s.toJSON());
  }
}
