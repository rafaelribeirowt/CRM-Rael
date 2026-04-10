import { BotFlow } from "../../../../Domain/BotFlow/Models/BotFlow";
import { BotStep } from "../../../../Domain/BotFlow/Models/BotStep";
import type { StepType } from "../../../../Domain/BotFlow/Types/StepConfig";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IBotFlowRepository } from "../../../Contracts/Repositories/IBotFlowRepository";
import { IBotStepRepository } from "../../../Contracts/Repositories/IBotStepRepository";

interface AddBotStepInput {
  flowId: string;
  type: StepType;
  config: object;
  position?: number;
  tenantId: string;
}

export class AddBotStep {
  constructor(
    private readonly botFlowRepository: IBotFlowRepository,
    private readonly botStepRepository: IBotStepRepository
  ) {}

  async execute(input: AddBotStepInput) {
    const flow = await this.botFlowRepository.findById(input.flowId, input.tenantId);
    if (!flow) {
      throw new AppError("Bot flow not found", 404, "BOT_FLOW_NOT_FOUND");
    }

    const existingSteps = await this.botStepRepository.findByFlowIdOrdered(
      input.flowId,
      input.tenantId
    );

    const position = input.position ?? existingSteps.length;

    const step = BotStep.create({
      flowId: input.flowId,
      type: input.type,
      position,
      config: input.config,
    });

    if (existingSteps.length === 0) {
      const updatedFlow = new BotFlow({
        ...flow.props,
        firstStepId: step.id,
        updatedAt: new Date(),
      });
      await this.botFlowRepository.save(updatedFlow, input.tenantId);
    } else {
      const lastStep = existingSteps[existingSteps.length - 1];
      const linkedLastStep = new BotStep({
        ...lastStep.props,
        nextStepId: step.id,
      });
      await this.botStepRepository.save(linkedLastStep, input.tenantId);
    }

    await this.botStepRepository.save(step, input.tenantId);

    return step.toJSON();
  }
}
