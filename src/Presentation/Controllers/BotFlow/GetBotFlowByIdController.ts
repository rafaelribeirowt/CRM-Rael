import { Request, Response, NextFunction } from "express";
import { GetBotFlowById } from "../../../Application/Modules/BotFlow/UseCases/GetBotFlowById";

export class GetBotFlowByIdController {
  constructor(private readonly getBotFlowById: GetBotFlowById) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.getBotFlowById.execute(req.params.flowId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
