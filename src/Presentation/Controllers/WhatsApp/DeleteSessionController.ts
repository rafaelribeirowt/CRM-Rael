import { Response, NextFunction } from "express";
import { DeleteSession } from "../../../Application/Modules/WhatsApp/UseCases/DeleteSession";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class DeleteSessionController {
  constructor(private readonly deleteSession: DeleteSession) {}

  handle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.deleteSession.execute({
        sessionId: req.params.sessionId,
        tenantId: req.tenantId!,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
