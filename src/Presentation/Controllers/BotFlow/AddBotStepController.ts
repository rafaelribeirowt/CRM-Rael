import { Response, NextFunction } from "express";
import { z } from "zod";
import { AddBotStep } from "../../../Application/Modules/BotFlow/UseCases/AddBotStep";
import type { StepType } from "../../../Domain/BotFlow/Types/StepConfig";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const schema = z.object({
  type: z.string().min(1),
  config: z.record(z.any()),
  position: z.number().optional(),
});

export class AddBotStepController {
  constructor(private readonly addBotStep: AddBotStep) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.addBotStep.execute({
        flowId: req.params.flowId,
        ...data,
        type: data.type as StepType,
        tenantId: req.tenantId!,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
