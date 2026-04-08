import { Request, Response, NextFunction } from "express";
import { ListBotFlows } from "../../../Application/Modules/BotFlow/UseCases/ListBotFlows";

export class ListBotFlowsController {
  constructor(private readonly listBotFlows: ListBotFlows) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.listBotFlows.execute();
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
