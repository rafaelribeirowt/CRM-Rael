import { Request, Response, NextFunction } from "express";
import { DeleteBotStep } from "../../../Application/Modules/BotFlow/UseCases/DeleteBotStep";

export class DeleteBotStepController {
  constructor(private readonly deleteBotStep: DeleteBotStep) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.deleteBotStep.execute({
        flowId: req.params.flowId,
        stepId: req.params.stepId,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
