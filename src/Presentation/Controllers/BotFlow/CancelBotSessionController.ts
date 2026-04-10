import { Response, NextFunction } from "express";
import { CancelBotSession } from "../../../Application/Modules/BotFlow/UseCases/CancelBotSession";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class CancelBotSessionController {
  constructor(private readonly cancelBotSession: CancelBotSession) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.cancelBotSession.execute({
        sessionId: req.params.sessionId,
        tenantId: req.tenantId!,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
