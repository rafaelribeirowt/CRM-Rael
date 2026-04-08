import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { UpdateBotStep } from "../../../Application/Modules/BotFlow/UseCases/UpdateBotStep";

const schema = z.object({
  type: z.string().optional(),
  config: z.record(z.any()).optional(),
});

export class UpdateBotStepController {
  constructor(private readonly updateBotStep: UpdateBotStep) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.updateBotStep.execute({
        flowId: req.params.flowId,
        stepId: req.params.stepId,
        ...data,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
