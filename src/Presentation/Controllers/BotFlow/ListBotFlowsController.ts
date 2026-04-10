import { Response, NextFunction } from "express";
import { ListBotFlows } from "../../../Application/Modules/BotFlow/UseCases/ListBotFlows";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class ListBotFlowsController {
  constructor(private readonly listBotFlows: ListBotFlows) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.listBotFlows.execute(req.tenantId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
