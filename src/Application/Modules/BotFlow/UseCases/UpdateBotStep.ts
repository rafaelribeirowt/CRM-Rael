import { BotStep } from "../../../../Domain/BotFlow/Models/BotStep";
import type { StepType } from "../../../../Domain/BotFlow/Types/StepConfig";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IBotStepRepository } from "../../../Contracts/Repositories/IBotStepRepository";

interface UpdateBotStepInput {
  flowId: string;
  stepId: string;
  type?: StepType;
  config?: object;
  tenantId: string;
}

export class UpdateBotStep {
  constructor(private readonly botStepRepository: IBotStepRepository) {}

  async execute(input: UpdateBotStepInput) {
    const step = await this.botStepRepository.findById(input.stepId, input.tenantId);
    if (!step) {
      throw new AppError("Bot step not found", 404, "BOT_STEP_NOT_FOUND");
    }

    const updated = new BotStep({
      ...step.props,
      type: input.type ?? step.type,
      config: input.config ? JSON.stringify(input.config) : step.config,
    });

    await this.botStepRepository.save(updated, input.tenantId);

    return updated.toJSON();
  }
}
