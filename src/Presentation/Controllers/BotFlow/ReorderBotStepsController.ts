import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ReorderBotSteps } from "../../../Application/Modules/BotFlow/UseCases/ReorderBotSteps";

const schema = z.object({
  stepIds: z.array(z.string()).min(1),
});

export class ReorderBotStepsController {
  constructor(private readonly reorderBotSteps: ReorderBotSteps) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      const result = await this.reorderBotSteps.execute({
        flowId: req.params.flowId,
        stepIds: data.stepIds,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
