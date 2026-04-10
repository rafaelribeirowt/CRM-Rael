import { BotStepCondition } from "../../../../Domain/BotFlow/Models/BotStepCondition";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IBotStepRepository } from "../../../Contracts/Repositories/IBotStepRepository";
import { IBotStepConditionRepository } from "../../../Contracts/Repositories/IBotStepConditionRepository";
import type { ActionConfig } from "../../../../Domain/BotFlow/Types/StepConfig";

interface ConditionInput {
  label: string;
  operator: string;
  value?: string;
  nextStepId?: string;
  action?: ActionConfig;
}

interface SetStepConditionsInput {
  flowId: string;
  stepId: string;
  conditions: ConditionInput[];
  tenantId: string;
}

export class SetStepConditions {
  constructor(
    private readonly botStepRepository: IBotStepRepository,
    private readonly botStepConditionRepository: IBotStepConditionRepository
  ) {}

  async execute(input: SetStepConditionsInput) {
    const step = await this.botStepRepository.findById(input.stepId, input.tenantId);
    if (!step) {
      throw new AppError("Bot step not found", 404, "BOT_STEP_NOT_FOUND");
    }

    await this.botStepConditionRepository.deleteByStepId(input.stepId, input.tenantId);

    const conditions = input.conditions.map((c, index) =>
      BotStepCondition.create({
        stepId: input.stepId,
        label: c.label,
        operator: c.operator,
        value: c.value,
        nextStepId: c.nextStepId,
        action: c.action,
        position: index,
      })
    );

    for (const condition of conditions) {
      await this.botStepConditionRepository.save(condition, input.tenantId);
    }

    return conditions.map((c) => c.toJSON());
  }
}
