import { Response, NextFunction } from "express";
import { DeleteBotFlow } from "../../../Application/Modules/BotFlow/UseCases/DeleteBotFlow";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class DeleteBotFlowController {
  constructor(private readonly deleteBotFlow: DeleteBotFlow) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.deleteBotFlow.execute({
        flowId: req.params.flowId,
        tenantId: req.tenantId!,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
