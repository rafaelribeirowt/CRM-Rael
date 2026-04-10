import { Response, NextFunction } from "express";
import { GetBotFlowById } from "../../../Application/Modules/BotFlow/UseCases/GetBotFlowById";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class GetBotFlowByIdController {
  constructor(private readonly getBotFlowById: GetBotFlowById) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.getBotFlowById.execute({
        flowId: req.params.flowId,
        tenantId: req.tenantId!,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
