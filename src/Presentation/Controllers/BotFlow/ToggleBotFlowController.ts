import { Request, Response, NextFunction } from "express";
import { ToggleBotFlow } from "../../../Application/Modules/BotFlow/UseCases/ToggleBotFlow";

export class ToggleBotFlowController {
  constructor(private readonly toggleBotFlow: ToggleBotFlow) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.toggleBotFlow.execute(req.params.flowId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
