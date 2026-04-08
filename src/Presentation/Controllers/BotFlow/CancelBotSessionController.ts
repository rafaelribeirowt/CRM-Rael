import { Request, Response, NextFunction } from "express";
import { CancelBotSession } from "../../../Application/Modules/BotFlow/UseCases/CancelBotSession";

export class CancelBotSessionController {
  constructor(private readonly cancelBotSession: CancelBotSession) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.cancelBotSession.execute(req.params.sessionId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
