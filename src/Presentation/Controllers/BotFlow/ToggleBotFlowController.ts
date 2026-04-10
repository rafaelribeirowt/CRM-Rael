import { Response, NextFunction } from "express";
import { ToggleBotFlow } from "../../../Application/Modules/BotFlow/UseCases/ToggleBotFlow";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class ToggleBotFlowController {
  constructor(private readonly toggleBotFlow: ToggleBotFlow) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.toggleBotFlow.execute({
        flowId: req.params.flowId,
        tenantId: req.tenantId!,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
