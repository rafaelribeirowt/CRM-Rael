import { Response, NextFunction } from "express";
import { DeleteBotStep } from "../../../Application/Modules/BotFlow/UseCases/DeleteBotStep";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class DeleteBotStepController {
  constructor(private readonly deleteBotStep: DeleteBotStep) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.deleteBotStep.execute({
        flowId: req.params.flowId,
        stepId: req.params.stepId,
        tenantId: req.tenantId!,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
