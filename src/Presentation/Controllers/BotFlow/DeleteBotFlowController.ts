import { Request, Response, NextFunction } from "express";
import { DeleteBotFlow } from "../../../Application/Modules/BotFlow/UseCases/DeleteBotFlow";

export class DeleteBotFlowController {
  constructor(private readonly deleteBotFlow: DeleteBotFlow) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.deleteBotFlow.execute(req.params.flowId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
