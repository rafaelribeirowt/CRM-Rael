import { Response, NextFunction } from "express";
import { DisconnectSession } from "../../../Application/Modules/WhatsApp/UseCases/DisconnectSession";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class DisconnectSessionController {
  constructor(private readonly disconnectSession: DisconnectSession) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.disconnectSession.execute({
        sessionId: req.params.sessionId,
        tenantId: req.tenantId!,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
